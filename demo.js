const form = document.querySelector("#missed-call-form");
const button = form.querySelector("button");
const error = form.querySelector(".form-error");
const phone = document.querySelector("#missed-call-sms");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  error.textContent = "";
  phone.hidden = true;
  button.disabled = true;
  button.textContent = "Calling...";
  try {
    const body = new URLSearchParams({ type: "missed_call", request_id: crypto.randomUUID(), phone: form.phone.value });
    const response = await fetch("/api/events", { method: "POST", body, signal: AbortSignal.timeout(20000) });
    const reply = await response.json();
    if (!response.ok || !reply.ok) throw new Error(reply.error);
    phone.querySelector(".sms-bubble").textContent = reply.sms;
    phone.hidden = false;
  } catch (err) {
    error.textContent = err.name === "Error" && err.message ? err.message : "The demo couldn't run. Please try again.";
  } finally {
    button.disabled = false;
    button.textContent = "Simulate missed call";
  }
});
