// Gateway: the only route from the browser to the automation. The Make URL stays in a server env var.
const ORIGIN = "https://fil-rouge-atelier.vercel.app";
const SERVICES = new Set(["Full-body PPF", "Full front PPF", "Color change wrap", "Ceramic coating", "Window tint", "Chrome delete", "Wheels or body kit"]);
const BUDGETS = new Set(["Under $1,000", "$1,000-$3,000", "$3,000-$6,000", "$6,000+"]);
const TIMES = new Set(["Flexible", "Weekday morning", "Weekday afternoon"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const clean = (value) => (typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim() : "");
// Names and cars are echoed into SMS text, so they must never carry a link or markup.
const safeText = (value, max) => value.length >= 2 && value.length <= max && !/[<>]|https?:|www\.|:\/\/|\b[a-z0-9-]+\.(com|net|org|io|ly|co|me|info|xyz)\b/i.test(value);
const validPhone = (value) => /^[0-9+() .-]{7,20}$/.test(value) && (value.match(/\d/g) || []).length >= 7 && (value.match(/\d/g) || []).length <= 15;
const validEmail = (value) => value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

function validate(body) {
  const type = clean(body.type);
  const request_id = clean(body.request_id);
  const phone = clean(body.phone);
  if (!UUID.test(request_id)) return { error: "Please refresh the page and try again." };
  if (!validPhone(phone)) return { error: "Please enter a valid phone number." };
  if (type === "missed_call") return { data: { type, request_id, phone } };
  if (type !== "quote") return { error: "Unsupported request." };

  const name = clean(body.name);
  const car = clean(body.car);
  const email = clean(body.email).toLowerCase();
  const services = [...new Set(clean(body.service).split(",").map((item) => item.trim()).filter(Boolean))];
  const budget = clean(body.budget);
  const preferred_time = clean(body.preferred_time) || "Flexible";
  if (!safeText(name, 80)) return { error: "Please enter your name without links." };
  if (!safeText(car, 80)) return { error: "Please enter your car without links." };
  if (email && !validEmail(email)) return { error: "Please enter a valid email." };
  if (!services.length || !services.every((item) => SERVICES.has(item))) return { error: "Please choose a valid service." };
  if (!BUDGETS.has(budget)) return { error: "Please choose a valid budget." };
  if (!TIMES.has(preferred_time)) return { error: "Please choose a valid time." };
  return { data: { type, request_id, name, phone, car, email, service: services.join(", "), budget, preferred_time, sms_consent: clean(body.sms_consent) === "yes" ? "yes" : "no" } };
}

async function handler(req, res) {
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
  if (!body || typeof body !== "object") return res.status(400).json({ ok: false, error: "Invalid request." });
  if (clean(body.company)) return res.status(200).json({ ok: true, sms: "" }); // honeypot: look successful, store nothing

  const { data, error } = validate(body);
  if (error) return res.status(400).json({ ok: false, error });
  if (!process.env.MAKE_WEBHOOK_URL) {
    console.error("MAKE_WEBHOOK_URL is not set");
    return res.status(503).json({ ok: false, error: "Service unavailable." });
  }

  try {
    const response = await fetch(process.env.MAKE_WEBHOOK_URL, { method: "POST", body: new URLSearchParams(data), signal: AbortSignal.timeout(15000) });
    const reply = await response.text();
    if (!response.ok || !/^\d+(\n|$)/.test(reply)) throw new Error(`Automation returned ${response.status}`);
    return res.status(200).json({ ok: true, sms: reply.includes("\n") ? reply.slice(reply.indexOf("\n") + 1).trim() : "" });
  } catch (err) {
    console.error("Automation failed:", err.message); // never log the lead's details
    return res.status(502).json({ ok: false, error: "We couldn't send your request." });
  }
}

module.exports = handler;
module.exports.validate = validate;
