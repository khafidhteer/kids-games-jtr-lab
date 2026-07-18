import { getCtx } from './audio.js';

export const LANG_MAP = {
  en: 'en-US',
  id: 'id-ID'
};

let preferredVoice = null;

function findFemaleVoice(langCode) {
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const matching = voices.filter(v => v.lang.startsWith(langCode));
  const femaleKeywords = ['female', 'perempuan', 'wanita', 'ida', 'sari', 'dewi', 'rina'];
  return matching.find(v =>
    femaleKeywords.some(k => v.name.toLowerCase().includes(k))
  ) || null;
}

function ensureVoice(lang) {
  if (preferredVoice) return true;

  const langCode = LANG_MAP[lang] || lang;
  preferredVoice = findFemaleVoice(langCode);

  if (!preferredVoice) {
    speechSynthesis.addEventListener('voiceschanged', () => {
      if (!preferredVoice) {
        preferredVoice = findFemaleVoice(langCode);
      }
    }, { once: true });
    return false;
  }

  return true;
}

export function primeSpeech() {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(' ');
  speechSynthesis.speak(u);
}

export function speak(text, lang = 'en') {
  if (!window.speechSynthesis) return;
  ensureVoice(lang);

  try {
    const ctx = getCtx();
    if (ctx && ctx.state === 'running') {
      ctx.suspend();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[lang] || lang;
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onend = () => {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    utterance.onerror = () => {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    };

    speechSynthesis.cancel();
    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, 50);
  } catch (e) {
    /* speech not supported */
  }
}
