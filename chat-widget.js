// Botpress assistant. These IDs are public identifiers; no secret belongs in this file.
window.botpress?.init({
  botId: 'f35b26ca-f834-4771-ae51-f7214d7d8ae2',
  clientId: '36bfa74a-5988-4041-a039-893c25267033',
  configuration: {
    botName: 'Fil Rouge AI Assistant',
    botDescription: 'AI assistant for this fictional demo studio.',
    color: '#c9221a',
    variant: 'solid',
    themeMode: 'dark',
    radius: 1
  }
});

// The widget renders in a shadow root, so page CSS can't move its button above the phone call bar.
let attempts = 0;
const placeChatButton = setInterval(() => {
  const root = document.querySelector('.bpChatContainer > div')?.shadowRoot;
  if (root?.querySelector('.bpFabWrapper')) {
    const style = document.createElement('style');
    style.textContent = '@media (max-width: 640px) { .bpFabWrapper { right: 16px !important; bottom: 74px !important; } .bpFABMessagePreview { bottom: 146px !important; } }';
    root.append(style);
    clearInterval(placeChatButton);
  } else if (++attempts > 60) {
    clearInterval(placeChatButton);
  }
}, 250);
