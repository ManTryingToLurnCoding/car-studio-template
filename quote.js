// Multi-step quote form. Set data-webhook on the form to send leads to the CRM automation.
const form = document.querySelector("#quote-form");
const steps = [...form.querySelectorAll(".step")];
const progress = form.querySelector("progress");
const count = form.querySelector(".step-count");
const back = form.querySelector("[data-back]");
const next = form.querySelector("[data-next]");
const error = form.querySelector(".form-error");
const done = document.querySelector("#quote-done");
let current = 0;

form.noValidate = true; // each step is validated on its own, so hidden fields can't block it

function show(index, moveFocus = true) {
  current = index;
  steps.forEach((step, i) => { step.hidden = i !== index; });
  progress.value = index + 1;
  count.textContent = `Step ${index + 1} of ${steps.length}`;
  back.hidden = index === 0;
  next.textContent = index === steps.length - 1 ? "Send my request" : "Continue";
  error.textContent = "";
  if (moveFocus) steps[index].querySelector("h3").focus();
}

function stepIsValid() {
  const step = steps[current];
  const services = [...step.querySelectorAll('input[name="service"]')];
  if (services.length) {
    services[0].setCustomValidity(services.some((box) => box.checked) ? "" : "Choose at least one service.");
  }
  return [...step.querySelectorAll("input")].every((input) => input.reportValidity());
}

function finish(title, text) {
  form.hidden = true;
  done.querySelector("h3").textContent = title;
  done.querySelector("p").textContent = text;
  done.hidden = false;
  done.querySelector("h3").focus();
}

async function send() {
  const data = new FormData(form);
  if (data.get("company")) return finish("Request received.", "We'll be in touch within 24 hours."); // honeypot: bots fill it

  const webhook = form.dataset.webhook;
  if (!webhook) return finish("Demo mode: nothing was sent.", "The form works, but it isn't connected to the CRM yet.");

  const body = new URLSearchParams();
  for (const key of new Set(data.keys())) {
    if (key !== "company") body.set(key, data.getAll(key).join(", "));
  }
  body.set("sms_consent", data.has("sms_consent") ? "yes" : "no");

  next.disabled = true;
  next.textContent = "Sending...";
  try {
    const response = await fetch(webhook, { method: "POST", body, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    // Make replies with the deal ID on line 1 and the SMS text, if the visitor opted in, after it.
    const reply = await response.text();
    if (!/^\d+/.test(reply)) throw new Error("Lead was not created");
    const sms = reply.slice(reply.indexOf("\n") + 1).trim();
    finish("Request received.", "We'll be in touch within 24 hours.");
    if (reply.includes("\n") && sms) {
      done.querySelector(".sms-bubble").textContent = sms;
      done.querySelector(".sms-phone").hidden = false;
    }
  } catch {
    // Keep the answers on screen so the lead isn't lost.
    error.textContent = "We couldn't send your request. Please try again or call (480) 555-0142.";
    next.textContent = "Try again";
  } finally {
    next.disabled = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!stepIsValid()) return;
  if (current < steps.length - 1) show(current + 1);
  else send();
});
form.addEventListener("change", (event) => {
  if (event.target.name === "service") event.target.form.querySelector('input[name="service"]').setCustomValidity("");
});
back.addEventListener("click", () => show(current - 1));

show(0, false);
