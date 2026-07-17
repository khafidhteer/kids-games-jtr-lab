export const LANG_MAP = {
  en: 'en-US',
  id: 'id-ID'
};

let preferredVoice = null;

function findPreferredVoice(langCode) {
  const voices = speechSynthesis.getVoices();
  const matching = voices.filter(v => v.lang.startsWith(langCode));
  if (matching.length === 0) return null;

  const femaleKeywords = ['female', 'perempuan', 'wanita', 'ida', 'sari', 'dewi', 'rina'];
  return matching.find(v =>
    femaleKeywords.some(k => v.name.toLowerCase().includes(k))
  ) || matching[0];
}

export function speak(text, lang = 'en') {
  if (!window.speechSynthesis) return;

  if (!preferredVoice) {
    preferredVoice = findPreferredVoice(LANG_MAP[lang] || lang);
    speechSynthesis.addEventListener('voiceschanged', () => {
      preferredVoice = findPreferredVoice(LANG_MAP[lang] || lang);
    }, { once: true });
  }

  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[lang] || lang;
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } catch (e) {
      /* speech not supported */
    }
  }, 100);
}
