import { getRandomItems } from '../../js/categories.js';
import { unlockAudio, AudioSynth } from '../../js/audio.js';
import { speak, primeSpeech } from '../../js/speech.js';

const CATEGORY = 'vehicles';

let currentLang = 'id';
let audioReady = false;
let nameEls = [];
const board = document.getElementById('soundboard');
const btnEn = document.getElementById('lang-en');
const btnId = document.getElementById('lang-id');
const modal = document.getElementById('math-modal');
const mathQuestion = document.getElementById('math-question');
const mathAnswer = document.getElementById('math-answer');
const mathSubmit = document.getElementById('math-submit');
const mathCancel = document.getElementById('math-cancel');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const helpClose = document.getElementById('help-close');
const refreshBtn = document.getElementById('refresh-btn');
const backBtn = document.getElementById('back-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

let mathA = 0, mathB = 0, mathSum = 0;
let pendingLang = null;
let pendingHelp = null;
let pendingRefresh = null;
let pendingBack = null;

function updateLangButtons() {
  btnEn.classList.toggle('active', currentLang === 'en');
  btnId.classList.toggle('active', currentLang === 'id');
}

function applyLanguage(lang) {
  currentLang = lang;
  updateLangButtons();
  nameEls.forEach((el, i) => {
    el.textContent = currentItems[i][currentLang];
  });
  speak(lang === 'en' ? 'English' : 'Bahasa Indonesia', lang);
}

function showMathModal(lang) {
  mathA = Math.floor(Math.random() * 8) + 1;
  mathB = Math.floor(Math.random() * 8) + 1;
  mathSum = mathA + mathB;
  pendingLang = lang;
  pendingHelp = null;
  pendingRefresh = null;
  pendingBack = null;
  mathQuestion.textContent = `${mathA} + ${mathB} = ?`;
  mathAnswer.value = '';
  modal.classList.add('visible');
  mathAnswer.focus();
}

function hideMathModal() {
  modal.classList.remove('visible');
  pendingLang = null;
  pendingHelp = null;
  pendingRefresh = null;
  pendingBack = null;
}

mathSubmit.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  const val = parseInt(mathAnswer.value, 10);
  if (val === mathSum) {
    if (pendingLang) {
      applyLanguage(pendingLang);
    } else if (pendingHelp) {
      pendingHelp();
    } else if (pendingRefresh) {
      pendingRefresh();
    } else if (pendingBack) {
      pendingBack();
    }
  }
  hideMathModal();
});

mathCancel.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  hideMathModal();
});

mathAnswer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = parseInt(mathAnswer.value, 10);
    if (val === mathSum) {
      if (pendingLang) {
        applyLanguage(pendingLang);
      } else if (pendingHelp) {
        pendingHelp();
      } else if (pendingRefresh) {
        pendingRefresh();
      } else if (pendingBack) {
        pendingBack();
      }
    }
    hideMathModal();
  }
});

btnEn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  if (currentLang === 'en') return;
  showMathModal('en');
});

btnId.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  if (currentLang === 'id') return;
  showMathModal('id');
});

helpBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  showMathModal(null);
  pendingHelp = () => {
    helpModal.classList.add('visible');
  };
});

helpClose.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  helpModal.classList.remove('visible');
});

refreshBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  showMathModal(null);
  pendingRefresh = () => {
    currentItems = getRandomItems(CATEGORY, 15);
    renderBoard(currentItems);
  };
});

backBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  showMathModal(null);
  pendingBack = () => {
    window.location.href = '../../index.html';
  };
});

fullscreenBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

updateLangButtons();

let currentItems = getRandomItems(CATEGORY, 15);

function renderBoard(items) {
  board.innerHTML = '';
  nameEls = [];

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.innerHTML = `
      <div class="animal-card__inner">
        <div class="animal-card__emoji">${item.emoji}</div>
        <div class="animal-card__name">${item[currentLang]}</div>
      </div>
    `;

    const nameEl = card.querySelector('.animal-card__name');
    nameEls.push(nameEl);

    card.addEventListener('pointerdown', (e) => {
      e.preventDefault();

      if (!audioReady) {
        unlockAudio();
        primeSpeech(currentLang);
        audioReady = true;
      }

      card.classList.remove('bounce', 'speaking');
      void card.offsetWidth;
      card.classList.add('bounce');

      AudioSynth[item.sound]();

      setTimeout(() => {
        card.classList.add('speaking');
        speak(item[currentLang], currentLang);
      }, 400);

      setTimeout(() => {
        card.classList.remove('bounce', 'speaking');
      }, 2000);
    });

    board.appendChild(card);
  });
}

renderBoard(currentItems);
