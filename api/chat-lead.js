// Server-to-server route for the AI assistant. Its input is untrusted, so it gets the same validation as the form.
const crypto = require("node:crypto");
const { clean, safeText, validate } = require("./events.js");

function validSecret(given, expected) {
  if (typeof given !== "string" || !expected) return false;
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function validateChatLead(body) {
  const summary = clean(body.summary);
  if (!safeText(summary, 500)) return { error: "Summary must be 2-500 characters without links." };
  const { data, error } = validate({ ...body, type: "quote", request_id: crypto.randomUUID() });
  if (error) return { error };
  return { data: { ...data, summary, dealstage: "qualifiedtobuy" } }; // the stage is set here, never by the model
}

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }
  if (!validSecret(req.headers["x-chat-secret"], process.env.CHAT_LEAD_SECRET)) {
    return res.status(401).json({ ok: false, error: "Unauthorized." });
  }
  if (!String(req.headers["content-type"] || "").includes("application/json")) {
    return res.status(415).json({ ok: false, error: "Unsupported request." });
  }

  let body;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid request." });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return res.status(400).json({ ok: false, error: "Invalid request." });

  const { data, error } = validateChatLead(body);
  if (error) return res.status(400).json({ ok: false, error });
  if (!process.env.MAKE_WEBHOOK_URL) {
    console.error("MAKE_WEBHOOK_URL is not set");
    return res.status(503).json({ ok: false, error: "Service unavailable." });
  }

  try {
    const response = await fetch(process.env.MAKE_WEBHOOK_URL, { method: "POST", body: new URLSearchParams(data), signal: AbortSignal.timeout(15000) });
    const reply = await response.text();
    if (!response.ok || !/^\d+(\n|$)/.test(reply)) throw new Error(`Automation returned ${response.status}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Chat lead failed:", err.message); // never log the lead's details
    return res.status(502).json({ ok: false, error: "The lead could not be saved." });
  }
}

module.exports = handler;
module.exports.validateChatLead = validateChatLead;
module.exports.validSecret = validSecret;
