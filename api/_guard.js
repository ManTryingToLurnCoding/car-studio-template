// Abuse protection shared by every lead route: bot check, rate limits and duplicate detection.
const crypto = require("node:crypto");

const HOSTNAME = "fil-rouge-atelier.vercel.app";
const DAY = 86400;
const LIMITS = {
  ip: { limit: 5, seconds: 600 },
  phone: { limit: 3, seconds: 3600 },
  // Each lead costs about 4 Make credits, so this keeps the free plan's 1,000 monthly credits safe.
  global: { limit: 30, seconds: DAY },
  poll: { limit: 240, seconds: 600 },
};

const clientIp = (req) => String(req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
// Redis stores only keyed hashes, never a phone number or IP address.
const keyFor = (kind, value) => `fr:${kind}:${crypto.createHmac("sha256", process.env.GUARD_HASH_SECRET || "").update(String(value)).digest("base64url")}`;

async function redis(commands) {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token, GUARD_HASH_SECRET: hashSecret } = process.env;
  if (!url || !token || !hashSecret) throw new Error("Guard storage is not configured");
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error(`Guard storage returned ${response.status}`);
  const results = await response.json();
  if (results.some((item) => item.error)) throw new Error("Guard storage command failed");
  return results.map((item) => item.result);
}

async function isOverLimit(rules) {
  const commands = rules.flatMap(({ key, seconds }) => [["INCR", key], ["EXPIRE", key, seconds, "NX"]]);
  const results = await redis(commands);
  return rules.some((rule, index) => results[index * 2] > rule.limit);
}

async function verifyTurnstile(token, ip) {
  if (typeof token !== "string" || !token || token.length > 2048 || !process.env.TURNSTILE_SECRET_KEY) return false;
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(5000) });
    const result = await response.json();
    if (result.success !== true) console.error("Bot check rejected:", (result["error-codes"] || []).join(",") || "unknown");
    else if (result.hostname !== HOSTNAME) console.error("Bot check rejected: wrong hostname");
    return result.success === true && result.hostname === HOSTNAME;
  } catch (err) {
    console.error("Bot check failed:", err.message);
    return false;
  }
}

function leadFingerprint(data) {
  const phone = data.phone.replace(/\D/g, "");
  if (data.type === "missed_call") return `missed:${phone}`;
  const services = data.service.split(", ").sort().join("|");
  return `quote:${phone}:${data.car.toLowerCase().replace(/\s+/g, " ")}:${services}`;
}

// Storage outages fail open: losing a real customer's lead is worse than a brief gap in rate limiting.
async function guardLead(data, ip) {
  let claimed = [];
  const release = async () => {
    if (!claimed.length) return;
    try {
      await redis(claimed.map((key) => ["DEL", key]));
    } catch (err) {
      console.error("Guard release failed:", err.message);
    }
  };

  try {
    const claims = [keyFor("request", data.request_id), keyFor("lead", leadFingerprint(data))];
    const results = await redis(claims.map((key) => ["SET", key, "1", "NX", "EX", DAY]));
    claimed = claims.filter((_, index) => results[index] === "OK");
    if (claimed.length !== claims.length) {
      await release();
      return { status: "duplicate", release: async () => {} };
    }

    const rules = [
      { key: keyFor("phone-limit", data.phone.replace(/\D/g, "")), ...LIMITS.phone },
      { key: "fr:global-limit", ...LIMITS.global },
    ];
    if (ip) rules.push({ key: keyFor("ip-limit", ip), ...LIMITS.ip });
    if (await isOverLimit(rules)) {
      await release();
      return { status: "limited", release: async () => {} };
    }
    return { status: "ok", release };
  } catch (err) {
    console.error("Guard unavailable:", err.message);
    return { status: "ok", release };
  }
}

async function isPollLimited(ip) {
  try {
    return await isOverLimit([{ key: keyFor("poll-limit", ip), ...LIMITS.poll }]);
  } catch (err) {
    console.error("Guard unavailable:", err.message);
    return false;
  }
}

module.exports = { clientIp, guardLead, isPollLimited, verifyTurnstile, LIMITS };
