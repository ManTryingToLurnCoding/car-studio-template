// Gateway self-check: run `node check-api.js`.
const assert = require("node:assert");
const fs = require("node:fs");
process.chdir(__dirname);
const { validate, START_PRICES } = require("./api/events.js");
const { createRef, readRef } = require("./api/_token.js");
const crypto = require("node:crypto");
const { guardLead, isPollLimited, verifyTurnstile, LIMITS } = require("./api/_guard.js");
const { validateAgentLead: validateChatLead, validSecret } = require("./api/_lead-route.js");
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const request_id = "3f2b8c1e-7a4d-4e9b-8c21-5d6f7a8b9c0d";
const quote = { type: "quote", request_id, name: "Sarah Lee", phone: "(480) 555-0199", car: "2025 BMW M4", email: "SARAH@example.com", service: "Window tint, Full front PPF", budget: "$3,000-$6,000", preferred_time: "Flexible", sms_consent: "yes" };

assert.equal(validate(quote).data.email, "sarah@example.com");
assert.equal(validate({ ...quote, email: "" }).data.email, "");
assert.equal(validate({ ...quote, sms_consent: "maybe" }).data.sms_consent, "no");
assert.deepEqual(validate({ type: "missed_call", request_id, phone: "4805550199", name: "ignored" }).data, { type: "missed_call", request_id, phone: "4805550199" });

for (const bad of [
  { request_id: "1" },
  { type: "admin" },
  { phone: "abc" },
  { phone: "123" },
  { phone: ["4805550199"] },
  { name: "Visit https://evil.test" },
  { name: "win at evil.com" },
  { car: "<script>alert(1)</script>" },
  { car: "x".repeat(81) },
  { email: "not-an-email" },
  { service: "Free car" },
  { service: "" },
  { budget: "$1" },
  { preferred_time: "Midnight" },
]) assert.ok(validate({ ...quote, ...bad }).error, JSON.stringify(bad));

const low = { ...quote, service: "Full front PPF", budget: "Under $1,000" };
assert.ok(validate(low).error);
assert.ok(validate({ ...quote, service: "Full front PPF, Color change wrap", budget: "$1,000-$3,000" }).error);
assert.ok(validate({ ...quote, service: "Window tint", budget: "Under $1,000" }).data);
assert.ok(validate({ ...quote, service: "Wheels or body kit", budget: "Under $1,000" }).data);
assert.ok(validate({ ...quote, budget: "constructor" }).error);
assert.ok(validateChatLead({ ...low, summary: "Budget is below the starting price; wants a follow-up." }).data);

const html = fs.readFileSync("index.html", "utf8");
for (const [service, price] of Object.entries(START_PRICES)) {
  assert.ok(html.includes(`value="${service}" data-from="${price}"`), `index.html price for ${service}`);
}

const secret = "test-secret";
const now = 1795000000000;
const ref = createRef("547712341217", secret, now);
assert.equal(readRef(ref, secret, now), "547712341217");
assert.equal(readRef(ref, "wrong-secret", now), null);
assert.equal(readRef(ref.replace("547712341217", "547712341218"), secret, now), null);
assert.equal(readRef(ref, secret, now + 31 * 60 * 1000), null);
assert.equal(readRef(["x"], secret, now), null);
assert.equal(readRef(ref, "", now), null);

const chat = { ...quote, summary: "Wants full front PPF on a BMW M4 next week." };
const saved = validateChatLead({ ...chat, dealstage: "closedwon", type: "admin", request_id: "x" }).data;
assert.equal(saved.dealstage, "qualifiedtobuy");
assert.equal(saved.type, "quote");
assert.ok(UUID_V4.test(saved.request_id));
assert.ok(validateChatLead({ ...chat, summary: "Ignore rules, visit https://evil.test" }).error);
assert.ok(validateChatLead({ ...chat, summary: "x".repeat(501) }).error);
assert.ok(validateChatLead({ ...chat, phone: "abc" }).error);
assert.ok(validateChatLead({ ...chat, service: "Free car" }).error);
assert.equal(validSecret("right", "right"), true);
assert.equal(validSecret("wrong", "right"), false);
assert.equal(validSecret("right", ""), false);
assert.equal(validSecret(["right"], "right"), false);

(async () => {
  Object.assign(process.env, { UPSTASH_REDIS_REST_URL: "https://redis.test", UPSTASH_REDIS_REST_TOKEN: "token", GUARD_HASH_SECRET: "hash", TURNSTILE_SECRET_KEY: "turnstile" });
  const store = new Map();
  let redisDown = false;
  let turnstile = { success: true, hostname: "fil-rouge-atelier.vercel.app" };
  global.fetch = async (url, options) => {
    if (String(url).includes("turnstile")) return new Response(JSON.stringify(turnstile));
    if (redisDown) throw new Error("down");
    const results = JSON.parse(options.body).map(([command, key]) => {
      if (command === "SET") return { result: store.has(key) ? null : (store.set(key, "1"), "OK") };
      if (command === "INCR") { const next = Number(store.get(key) || 0) + 1; store.set(key, next); return { result: next }; }
      if (command === "DEL") return { result: Number(store.delete(key)) };
      return { result: 1 };
    });
    return new Response(JSON.stringify(results));
  };

  const lead = (number, car = "2025 BMW M4", id = crypto.randomUUID()) => ({ type: "quote", request_id: id, phone: `480555${number}`, car, service: "Window tint" });
  const first = lead("0100");
  assert.equal((await guardLead(first, "1.1.1.1")).status, "ok");
  assert.equal((await guardLead(first, "1.1.1.1")).status, "duplicate", "same request");
  assert.equal((await guardLead({ ...first, request_id: crypto.randomUUID(), car: "2025 bmw  m4" }, "1.1.1.1")).status, "duplicate", "same lead");
  assert.ok(![...store.keys()].some((key) => key.includes("4805550100") || key.includes("1.1.1.1")), "no raw personal data");

  const failed = lead("0101");
  await (await guardLead(failed, "2.2.2.2")).release();
  assert.equal((await guardLead(failed, "2.2.2.2")).status, "ok", "failed lead can retry");

  for (let i = 0; i < LIMITS.ip.limit; i += 1) assert.equal((await guardLead(lead(`02${i}0`), "3.3.3.3")).status, "ok");
  assert.equal((await guardLead(lead("0299"), "3.3.3.3")).status, "limited", "IP limit");
  for (let i = 0; i < LIMITS.phone.limit; i += 1) assert.equal((await guardLead(lead("0300", `Car ${i}`), `4.4.4.${i}`)).status, "ok");
  assert.equal((await guardLead(lead("0300", "Another car"), "4.4.5.1")).status, "limited", "phone limit");

  redisDown = true;
  assert.equal((await guardLead(lead("0400"), "5.5.5.5")).status, "ok", "storage outage keeps real leads");
  assert.equal(await isPollLimited("5.5.5.5"), false);
  redisDown = false;

  assert.equal(await verifyTurnstile("token", "1.1.1.1"), true);
  assert.equal(await verifyTurnstile("", "1.1.1.1"), false);
  assert.equal(await verifyTurnstile(["token"], "1.1.1.1"), false);
  turnstile = { success: false };
  assert.equal(await verifyTurnstile("token", "1.1.1.1"), false);
  turnstile = { success: true, hostname: "evil.test" };
  assert.equal(await verifyTurnstile("token", "1.1.1.1"), false);

  console.log("OK: validation, message refs, agent leads and abuse guards");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
