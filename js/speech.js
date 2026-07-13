export const LANG_MAP = {
  en: 'en-US',
  id: 'id-ID'
};

export function speak(text, lang = 'en') {
  if (!window.speechSynthesis) return;

  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[lang] || lang;
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
