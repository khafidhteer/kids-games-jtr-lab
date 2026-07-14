import { getRandomAnimals, getAnimalSoundUrl } from '../../js/animals.js';
import { unlockAudio, playAudio } from '../../js/audio.js';
import { speak } from '../../js/speech.js';

let currentLang = 'en';
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

let mathA = 0, mathB = 0, mathSum = 0;
let pendingLang = null;

function updateLangButtons() {
  btnEn.classList.toggle('active', currentLang === 'en');
  btnId.classList.toggle('active', currentLang === 'id');
}

function applyLanguage(lang) {
  currentLang = lang;
  updateLangButtons();
  nameEls.forEach((el, i) => {
    el.textContent = currentAnimals[i][currentLang];
  });
  speak(lang === 'en' ? 'English' : 'Bahasa Indonesia', lang);
}

function showMathModal(lang) {
  mathA = Math.floor(Math.random() * 8) + 1;
  mathB = Math.floor(Math.random() * 8) + 1;
  mathSum = mathA + mathB;
  pendingLang = lang;
  mathQuestion.textContent = `${mathA} + ${mathB} = ?`;
  mathAnswer.value = '';
  modal.classList.add('visible');
  mathAnswer.focus();
}

function hideMathModal() {
  modal.classList.remove('visible');
  pendingLang = null;
}

mathSubmit.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  const val = parseInt(mathAnswer.value, 10);
  if (val === mathSum && pendingLang) {
    applyLanguage(pendingLang);
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
    if (val === mathSum && pendingLang) {
      applyLanguage(pendingLang);
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

updateLangButtons();

const currentAnimals = getRandomAnimals(15);

const cols = currentAnimals.length <= 4 ? 2 : currentAnimals.length <= 6 ? 3 : currentAnimals.length <= 12 ? 4 : 5;
board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

currentAnimals.forEach((animal) => {
  const card = document.createElement('div');
  card.className = 'animal-card';
  card.innerHTML = `
    <div class="animal-card__emoji">${animal.emoji}</div>
    <div class="animal-card__name">${animal[currentLang]}</div>
  `;

  const nameEl = card.querySelector('.animal-card__name');
  nameEls.push(nameEl);

  card.addEventListener('pointerdown', (e) => {
    e.preventDefault();

    if (!audioReady) {
      unlockAudio();
      audioReady = true;
    }

    card.classList.remove('bounce', 'speaking');
    void card.offsetWidth;
    card.classList.add('bounce');

    playAudio(getAnimalSoundUrl(animal.sound));

    setTimeout(() => {
      card.classList.add('speaking');
      speak(animal[currentLang], currentLang);
    }, 400);

    setTimeout(() => {
      card.classList.remove('bounce', 'speaking');
    }, 2000);
  });

  board.appendChild(card);
});
