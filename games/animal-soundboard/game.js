import { getRandomAnimals, getAnimalSoundUrl } from '../../js/animals.js';
import { unlockAudio, playAudio } from '../../js/audio.js';
import { speak } from '../../js/speech.js';

let currentLang = 'en';
let audioReady = false;
const board = document.getElementById('soundboard');
const btnEn = document.getElementById('lang-en');
const btnId = document.getElementById('lang-id');

function updateLangButtons() {
  btnEn.classList.toggle('active', currentLang === 'en');
  btnId.classList.toggle('active', currentLang === 'id');
}

function setLanguage(lang) {
  currentLang = lang;
  updateLangButtons();
  document.querySelectorAll('.animal-card__name').forEach((el, i) => {
    el.textContent = currentAnimals[i][currentLang];
  });
  speak(lang === 'en' ? 'English' : 'Bahasa Indonesia', lang);
}

btnEn.addEventListener('click', (e) => {
  e.stopPropagation();
  setLanguage('en');
});

btnId.addEventListener('click', (e) => {
  e.stopPropagation();
  setLanguage('id');
});

updateLangButtons();

const currentAnimals = getRandomAnimals(6);

const cols = currentAnimals.length <= 4 ? 2 : currentAnimals.length <= 6 ? 3 : 4;
board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

currentAnimals.forEach((animal) => {
  const card = document.createElement('div');
  card.className = 'animal-card';
  card.innerHTML = `
    <div class="animal-card__emoji">${animal.emoji}</div>
    <div class="animal-card__name">${animal[currentLang]}</div>
  `;

  card.addEventListener('pointerdown', async (e) => {
    e.preventDefault();

    if (!audioReady) {
      await unlockAudio();
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
