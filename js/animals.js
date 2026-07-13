const SOUND_BASE = '../../assets/audio/animals/';

const ALL_ANIMALS = [
  { en: 'Cat',      id: 'Kucing',    emoji: '🐱', sound: 'cat.mp3' },
  { en: 'Dog',      id: 'Anjing',    emoji: '🐶', sound: 'dog.mp3' },
  { en: 'Cow',      id: 'Sapi',      emoji: '🐄', sound: 'cow.mp3' },
  { en: 'Chicken',  id: 'Ayam',      emoji: '🐔', sound: 'chicken.mp3' },
  { en: 'Horse',    id: 'Kuda',      emoji: '🐴', sound: 'horse.mp3' },
  { en: 'Pig',      id: 'Babi',      emoji: '🐷', sound: 'pig.mp3' },
  { en: 'Monkey',   id: 'Monyet',    emoji: '🐵', sound: 'monkey.mp3' },
  { en: 'Lion',     id: 'Singa',     emoji: '🦁', sound: 'lion.mp3' },
  { en: 'Wolf',     id: 'Serigala',  emoji: '🐺', sound: 'wolf.mp3' },
  { en: 'Bird',     id: 'Burung',    emoji: '🐦', sound: 'bird.mp3' },
  { en: 'Duck',     id: 'Bebek',     emoji: '🐤', sound: 'chicken.mp3' },
  { en: 'Rabbit',   id: 'Kelinci',   emoji: '🐰', sound: 'cat.mp3' },
  { en: 'Sheep',    id: 'Domba',     emoji: '🐑', sound: 'cow.mp3' },
  { en: 'Frog',     id: 'Katak',     emoji: '🐸', sound: 'bird.mp3' },
  { en: 'Bear',     id: 'Beruang',   emoji: '🐻', sound: 'lion.mp3' },
  { en: 'Elephant', id: 'Gajah',     emoji: '🐘', sound: 'horse.mp3' },
  { en: 'Owl',      id: 'Burung Hantu', emoji: '🦉', sound: 'bird.mp3' },
  { en: 'Fox',      id: 'Rubah',     emoji: '🦊', sound: 'dog.mp3' }
];

export function getAnimalSoundUrl(filename) {
  return SOUND_BASE + filename;
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomAnimals(count = 6) {
  return shuffleArray(ALL_ANIMALS).slice(0, count);
}

export function getAllAnimals() {
  return shuffleArray(ALL_ANIMALS);
}

export { ALL_ANIMALS };
