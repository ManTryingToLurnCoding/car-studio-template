// Signed, expiring reference so a browser can read only its own lead's messages.
const crypto = require("node:crypto");

const TTL_MS = 30 * 60 * 1000;
const sign = (payload, secret) => crypto.createHmac("sha256", secret).update(payload).digest("base64url");

function createRef(dealId, secret, now = Date.now()) {
  const payload = `${dealId}.${now + TTL_MS}`;
  return `${payload}.${sign(payload, secret)}`;
}

function readRef(ref, secret, now = Date.now()) {
  const match = /^(\d{1,20})\.(\d{13})\.([\w-]{43})$/.exec(typeof ref === "string" ? ref : "");
  if (!match || !secret || Number(match[2]) < now) return null;
  const expected = Buffer.from(sign(`${match[1]}.${match[2]}`, secret));
  const actual = Buffer.from(match[3]);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual) ? match[1] : null;
}

module.exports = { createRef, readRef };
