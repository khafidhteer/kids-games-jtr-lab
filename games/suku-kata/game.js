import { ALL_SYLLABLES, shuffle, parseParentInput, resolveSyllables, nextColor, resetColorIndex } from './data.js';
import { AudioSynth, unlockAudio } from '../../js/audio.js';
import { speak } from '../../js/speech.js';

const STORAGE_KEY = 'suku_kata_settings';

const grid = document.getElementById('grid');
const nav = document.getElementById('nav');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const dotsContainer = document.getElementById('dots');
const soundToggle = document.getElementById('sound-toggle');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const settingsBtn = document.getElementById('settings-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const modeIndicator = document.getElementById('mode-indicator');

const mathModal = document.getElementById('math-modal');
const mathQuestion = document.getElementById('math-question');
const mathAnswer = document.getElementById('math-answer');
const mathSubmit = document.getElementById('math-submit');
const mathCancel = document.getElementById('math-cancel');

const settingsPanel = document.getElementById('settings-panel');
const parentInput = document.getElementById('parent-input');
const settingsApply = document.getElementById('settings-apply');
const settingsCancel = document.getElementById('settings-cancel');

const iosHint = document.getElementById('ios-hint');
const iosHintBtn = document.getElementById('ios-hint-btn');

const celebration = document.getElementById('celebration');

let audioReady = false;
let soundOn = true;
let mode = 'random';
let parentSyllables = [];
let currentCards = [];
let currentPage = 0;
let totalPages = 0;
let cardsPerPage = 4;
let touchStartX = 0;
let touchEndX = 0;

function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { mode: 'random', parentSyllables: [] };
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, parentSyllables }));
}

function getCardsPerPage() {
  const isLandscape = window.matchMedia('(orientation: landscape) and (min-width: 600px)').matches;
  if (isLandscape) return 13;

  const availHeight = window.innerHeight - 160;
  const rowHeight = 140 + 14;
  const rows = Math.floor(availHeight / rowHeight);
  return Math.max(2, Math.min(8, rows * 2));
}

function generateCards() {
  const settings = getSettings();
  mode = settings.mode || 'random';
  parentSyllables = settings.parentSyllables || [];

  let source;
  if (mode === 'parent' && parentSyllables.length > 0) {
    source = resolveSyllables(parentSyllables);
  } else if (mode === 'random') {
    source = shuffle(ALL_SYLLABLES);
  } else {
    source = ALL_SYLLABLES;
  }

  if (source.length === 0) {
    source = shuffle(ALL_SYLLABLES);
    mode = 'random';
  }

  currentCards = source;
  cardsPerPage = getCardsPerPage();
  currentPage = 0;
  totalPages = Math.ceil(currentCards.length / cardsPerPage);

  updateModeIndicator();
  updateShuffleBtn();
  renderPage();
}

function getPageCards() {
  const start = currentPage * cardsPerPage;
  return currentCards.slice(start, start + cardsPerPage);
}

function renderPage() {
  const pageCards = getPageCards();
  resetColorIndex();

  grid.innerHTML = '';
  pageCards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'suku-card float';
    el.style.animationDelay = `${i * 0.06}s`;
    const [c1, c2] = nextColor();
    el.style.setProperty('--card-bg-1', c1);
    el.style.setProperty('--card-bg-2', c2);

    const emoji = card.emoji
      ? `<div class="suku-card__emoji">${card.emoji}</div>`
      : '';

    el.innerHTML = `
      ${emoji}
      <div class="suku-card__text">${card.syllable}</div>
    `;

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onCardTap(el, card);
    });

    grid.appendChild(el);
  });

  renderDots();
  updateArrows();
}

function onCardTap(el, card) {
  if (!audioReady) {
    unlockAudio();
    audioReady = true;
  }

  el.classList.remove('tapped');
  void el.offsetWidth;
  el.classList.add('tapped');

  AudioSynth.pop();

  setTimeout(() => {
    if (soundOn) {
      el.classList.add('speaking');
      speak(card.syllable, 'id');
    }
  }, 200);

  setTimeout(() => {
    el.classList.remove('tapped', 'speaking');
  }, 1200);

  const idx = currentCards.indexOf(card);
  if (idx >= 0) {
    currentCards[idx]._completed = true;
    checkComplete();
  }
}

function checkComplete() {
  const allDone = currentCards.every(c => c._completed);
  if (allDone && currentCards.length > 0) {
    celebration.classList.add('visible');
    setTimeout(() => {
      celebration.classList.remove('visible');
    }, 2000);
  }
}

function renderDots() {
  dotsContainer.innerHTML = '';
  if (totalPages <= 1) return;

  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('button');
    dot.className = `suku-nav__dot ${i === currentPage ? 'active' : ''}`;
    dot.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      goToPage(i);
    });
    dotsContainer.appendChild(dot);
  }
}

function updateArrows() {
  prevBtn.classList.toggle('hidden', currentPage <= 0);
  nextBtn.classList.toggle('hidden', currentPage >= totalPages - 1);
}

function goToPage(page) {
  if (page < 0 || page >= totalPages) return;
  currentPage = page;
  renderPage();
}

function updateModeIndicator() {
  const labels = { random: 'Acak', inorder: 'Urut', parent: 'Aturan Orang Tua' };
  modeIndicator.textContent = labels[mode] || 'Acak';
}

function updateShuffleBtn() {
  shuffleBtn.classList.toggle('hidden', mode !== 'random');
}

prevBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  goToPage(currentPage - 1);
});

nextBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  goToPage(currentPage + 1);
});

grid.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

grid.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) goToPage(currentPage + 1);
    else goToPage(currentPage - 1);
  }
}, { passive: true });

soundToggle.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  soundOn = !soundOn;
  soundToggle.querySelector('.suku-header__icon').textContent = soundOn ? '🔊' : '🔇';
});

shuffleBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  currentCards = shuffle(currentCards);
  currentCards.forEach(c => { c._completed = false; });
  currentPage = 0;
  totalPages = Math.ceil(currentCards.length / cardsPerPage);
  renderPage();
});

fullscreenBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  toggleFullscreen();
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {
      const shown = localStorage.getItem('suku_fullscreen_hint');
      if (!shown) {
        iosHint.classList.add('visible');
      }
    });
  } else {
    document.exitFullscreen?.();
  }
}

iosHintBtn.addEventListener('pointerdown', () => {
  iosHint.classList.remove('visible');
  localStorage.setItem('suku_fullscreen_hint', '1');
});

settingsBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  showMathGate();
});

function showMathGate() {
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 8) + 1;
  mathQuestion.textContent = `${a} + ${b} = ?`;
  mathAnswer.value = '';
  mathAnswer.dataset.sum = a + b;
  mathModal.classList.add('visible');
  setTimeout(() => mathAnswer.focus(), 100);
}

function hideMathGate() {
  mathModal.classList.remove('visible');
}

mathSubmit.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  const val = parseInt(mathAnswer.value, 10);
  if (val === parseInt(mathAnswer.dataset.sum, 10)) {
    hideMathGate();
    showSettings();
  } else {
    hideMathGate();
  }
});

mathCancel.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  hideMathGate();
});

mathAnswer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = parseInt(mathAnswer.value, 10);
    if (val === parseInt(mathAnswer.dataset.sum, 10)) {
      hideMathGate();
      showSettings();
    } else {
      hideMathGate();
    }
  }
});

function showSettings() {
  const settings = getSettings();
  const modeVal = settings.mode || 'random';
  document.querySelector(`input[name="mode"][value="${modeVal}"]`).checked = true;
  parentInput.value = (settings.parentSyllables || []).join(' ');
  settingsPanel.classList.add('visible');
}

function hideSettings() {
  settingsPanel.classList.remove('visible');
}

settingsApply.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  const selected = document.querySelector('input[name="mode"]:checked');
  if (!selected) return;

  mode = selected.value;
  if (mode === 'parent') {
    parentSyllables = parseParentInput(parentInput.value);
    if (parentSyllables.length === 0) {
      mode = 'random';
      parentSyllables = [];
    }
  } else {
    parentSyllables = [];
  }

  saveSettings();
  hideSettings();
  currentCards.forEach(c => { c._completed = false; });
  generateCards();
});

settingsCancel.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  hideSettings();
});

window.addEventListener('resize', () => {
  const newCount = getCardsPerPage();
  if (newCount !== cardsPerPage) {
    cardsPerPage = newCount;
    totalPages = Math.ceil(currentCards.length / cardsPerPage);
    currentPage = Math.min(currentPage, totalPages - 1);
    if (currentPage < 0) currentPage = 0;
    renderPage();
  }
});

generateCards();
