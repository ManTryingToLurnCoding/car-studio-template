// Returns the latest simulated SMS for the lead named by a signed reference.
const { readRef } = require("./_token.js");
const { clientIp, isPollLimited } = require("./_guard.js");

const ORIGIN = "https://fil-rouge-atelier.vercel.app";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }
  if (req.headers.origin !== ORIGIN) return res.status(403).json({ ok: false, error: "Request blocked." });
  if (!String(req.headers["content-type"] || "").includes("application/x-www-form-urlencoded")) {
    return res.status(415).json({ ok: false, error: "Unsupported request." });
  }

  let body;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid request." });
  }
  const dealId = readRef(body && body.ref, process.env.SMS_REF_SECRET);
  if (!dealId) return res.status(403).json({ ok: false, error: "Request blocked." });
  if (await isPollLimited(clientIp(req))) return res.status(429).json({ ok: false, error: "Too many requests." });
  if (!process.env.HUBSPOT_SERVICE_KEY) {
    console.error("HUBSPOT_SERVICE_KEY is not set");
    return res.status(503).json({ ok: false, error: "Service unavailable." });
  }

  try {
    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=last_sms`, {
      headers: { Authorization: `Bearer ${process.env.HUBSPOT_SERVICE_KEY}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`HubSpot returned ${response.status}`);
    const deal = await response.json();
    return res.status(200).json({ ok: true, sms: deal.properties?.last_sms || "" });
  } catch (err) {
    console.error("Message lookup failed:", err.message);
    return res.status(502).json({ ok: false, error: "Couldn't check messages." });
  }
};
