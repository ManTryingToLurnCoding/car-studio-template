// Browser call to the ElevenLabs agent. The agent ID is public; the lead secret stays in ElevenLabs and Vercel.
const AGENT_ID = "agent_7701m86mj3xbeqkss115gzhjfzsg";
const CLIENT = "vendor/elevenlabs/client-1.38.0.js";
const SAVED_SMS = "Thanks for calling Fil Rouge Atelier. Your request is in, and the shop will follow up to confirm the details. Reply STOP to opt out.";

const callButton = document.querySelector("#voice-call");
const statusLine = document.querySelector("#voice-status");
const voiceError = document.querySelector("#voice-error");
const voiceSms = document.querySelector("#voice-sms");
let session = null;

const loadClient = () => window.ElevenLabsClient ? Promise.resolve() : new Promise((resolve, reject) => {
  const script = document.createElement("script");
  script.src = CLIENT;
  script.onload = resolve;
  script.onerror = () => reject(new Error("load"));
  document.head.append(script);
});

function showIdle(message = "") {
  session = null;
  callButton.disabled = false;
  callButton.textContent = "Talk to the AI receptionist";
  callButton.classList.remove("ghost");
  statusLine.textContent = message;
}

function showLive() {
  callButton.disabled = false;
  callButton.textContent = "End call";
  callButton.classList.add("ghost");
}

async function startCall() {
  let ended = false;
  voiceError.textContent = "";
  voiceSms.hidden = true;
  callButton.disabled = true;
  callButton.textContent = "Connecting...";
  statusLine.textContent = "Allow your microphone to start the call.";
  try {
    await loadClient();
    session = await window.ElevenLabsClient.Conversation.startSession({
      agentId: AGENT_ID,
      connectionType: "websocket",
      libsampleratePath: "vendor/elevenlabs/libsamplerate.worklet.js",
      workletPaths: {
        rawAudioProcessor: "vendor/elevenlabs/rawAudioProcessor.js",
        audioConcatProcessor: "vendor/elevenlabs/audioConcatProcessor.js",
      },
      onConnect: () => { showLive(); statusLine.textContent = "Connected"; },
      onModeChange: ({ mode }) => { if (session) statusLine.textContent = mode === "speaking" ? "AI receptionist is speaking" : "Listening"; },
      // shortcut: the browser can't see the caller's SMS answer, so this mock shows on any saved lead. Use the real consent value on a live SMS build.
      onAgentToolResponse: ({ tool_name, is_error }) => {
        if (tool_name !== "save_lead" || is_error) return;
        voiceSms.querySelector(".sms-bubble").textContent = SAVED_SMS;
        voiceSms.hidden = false;
      },
      onError: () => { voiceError.textContent = "The call had a problem. Please try again."; },
      onDisconnect: () => {
        ended = true;
        showIdle("Call ended");
        setTimeout(() => { if (statusLine.textContent === "Call ended") statusLine.textContent = ""; }, 4000);
      },
    });
    if (ended) session = null; // the call can drop before startSession returns
    else showLive();
  } catch (err) {
    showIdle();
    voiceError.textContent = err.name === "NotAllowedError" ? "Microphone access is needed for the call."
      : err.closeCode === 4300 ? "The receptionist has reached today's call limit. Please try again tomorrow."
      : "The call couldn't start. Please try again.";
  }
}

callButton.addEventListener("click", () => {
  if (!session) return startCall();
  callButton.disabled = true;
  session.endSession();
});
document.querySelector("#voice-sms-close")?.addEventListener("click", () => { voiceSms.hidden = true; });
addEventListener("pagehide", () => session?.endSession());
