// Multi-step quote form. Leads go through the /api/events gateway.
const form = document.querySelector("#quote-form");
const steps = [...form.querySelectorAll(".step")];
const progress = form.querySelector("progress");
const count = form.querySelector(".step-count");
const back = form.querySelector("[data-back]");
const next = form.querySelector("[data-next]");
const error = form.querySelector(".form-error");
const done = document.querySelector("#quote-done");
const requestId = crypto.randomUUID(); // a retry of this form reuses it, so the server can spot duplicates
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

// Only offer budgets that can cover the combined starting price of the selected services.
function updateBudgets() {
  const startPrice = [...form.querySelectorAll('input[name="service"]:checked')].reduce((total, box) => total + Number(box.dataset.from), 0);
  form.querySelectorAll('input[name="budget"]').forEach((radio) => {
    const fits = Number(radio.dataset.max) >= startPrice;
    radio.disabled = !fits;
    radio.closest("label").hidden = !fits;
    if (!fits) radio.checked = false;
  });
  form.querySelector(".budget-note").textContent = startPrice
    ? `Your selection starts at $${startPrice.toLocaleString("en-US")}. The exact price is confirmed after inspection.`
    : "Your selection is priced by quote after inspection.";
}

function finish(title, text) {
  form.hidden = true;
  done.querySelector("h3").textContent = title;
  done.querySelector("p").textContent = text;
  done.hidden = false;
  done.querySelector("h3").focus();
}

// Checks only while this tab is visible, and immediately when the viewer returns from the CRM.
function watchSms(ref, latest) {
  const stopAt = Date.now() + 25 * 60 * 1000;
  let busy = false;
  let timer;
  const stop = () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", check);
  };
  async function check() {
    if (document.hidden || busy) return;
    if (Date.now() > stopAt) return stop();
    busy = true;
    try {
      const response = await fetch("/api/messages", { method: "POST", body: new URLSearchParams({ ref }), signal: AbortSignal.timeout(9000) });
      if (response.status === 403 || response.status === 503) return stop();
      const reply = await response.json();
      if (reply.ok && reply.sms && reply.sms !== latest) {
        latest = reply.sms;
        const bubble = document.createElement("p");
        bubble.className = "sms-bubble";
        bubble.textContent = latest;
        done.querySelector(".sms-phone").append(bubble);
      }
    } catch {
      // A missed check is harmless; the next one retries.
    } finally {
      busy = false;
    }
  }
  timer = setInterval(check, 4000);
  document.addEventListener("visibilitychange", check);
}

async function send() {
  const data = new FormData(form);
  if (!data.get("cf-turnstile-response")) {
    error.textContent = "The security check is still loading. Please try again in a moment.";
    return;
  }
  const body = new URLSearchParams({ type: "quote", request_id: requestId });
  for (const key of new Set(data.keys())) body.set(key, data.getAll(key).join(", "));
  body.set("sms_consent", data.has("sms_consent") ? "yes" : "no");

  next.disabled = true;
  next.textContent = "Sending...";
  try {
    const response = await fetch("/api/events", { method: "POST", body, signal: AbortSignal.timeout(20000) });
    const reply = await response.json();
    if (!response.ok || !reply.ok) throw new Error(reply.error);
    finish("Request received.", "We'll be in touch within 24 hours.");
    if (reply.sms) {
      done.querySelector(".sms-bubble").textContent = reply.sms;
      done.querySelector(".sms-phone").hidden = false;
      if (reply.ref) watchSms(reply.ref, reply.sms);
    }
  } catch (err) {
    // Keep the answers on screen so the lead isn't lost.
    const detail = err.name === "Error" && err.message ? err.message : "We couldn't send your request.";
    error.textContent = `${detail} Please try again or call (480) 555-0142.`;
    next.textContent = "Try again";
    window.turnstile?.reset(); // tokens are single-use
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
  if (event.target.name !== "service") return;
  form.querySelector('input[name="service"]').setCustomValidity("");
  updateBudgets();
});
back.addEventListener("click", () => show(current - 1));

updateBudgets(); // browsers can restore checked boxes after a refresh
show(0, false);
