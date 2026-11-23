// Gateway self-check: run `node check-api.js`.
const assert = require("node:assert");
const { validate } = require("./api/events.js");
const { createRef, readRef } = require("./api/_token.js");

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

const secret = "test-secret";
const now = 1795000000000;
const ref = createRef("547712341217", secret, now);
assert.equal(readRef(ref, secret, now), "547712341217");
assert.equal(readRef(ref, "wrong-secret", now), null);
assert.equal(readRef(ref.replace("547712341217", "547712341218"), secret, now), null);
assert.equal(readRef(ref, secret, now + 31 * 60 * 1000), null);
assert.equal(readRef(["x"], secret, now), null);
assert.equal(readRef(ref, "", now), null);

console.log("OK: gateway validation and message refs");
