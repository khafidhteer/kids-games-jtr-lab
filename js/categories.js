const SOUNDS = ['pop', 'boing', 'ding', 'whoosh', 'squeak', 'chime'];

function assignSounds(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(SOUNDS[i % SOUNDS.length]);
  }
  return result;
}

const FRUITS_DATA = [
  { en: 'Apple', id: 'Apel' },
  { en: 'Banana', id: 'Pisang' },
  { en: 'Orange', id: 'Jeruk' },
  { en: 'Grape', id: 'Anggur' },
  { en: 'Watermelon', id: 'Semangka' },
  { en: 'Strawberry', id: 'Stroberi' },
  { en: 'Mango', id: 'Mangga' },
  { en: 'Cherry', id: 'Ceri' },
  { en: 'Lemon', id: 'Lemon' },
  { en: 'Pineapple', id: 'Nanas' },
  { en: 'Kiwi', id: 'Kiwi' },
  { en: 'Pear', id: 'Pir' },
  { en: 'Carrot', id: 'Wortel' },
  { en: 'Broccoli', id: 'Brokoli' },
  { en: 'Corn', id: 'Jagung' },
  { en: 'Tomato', id: 'Tomat' },
  { en: 'Eggplant', id: 'Terong' },
  { en: 'Cucumber', id: 'Mentimun' },
  { en: 'Potato', id: 'Kentang' },
  { en: 'Mushroom', id: 'Jamur' },
  { en: 'Onion', id: 'Bawang' },
  { en: 'Hot Pepper', id: 'Cabai' },
  { en: 'Lettuce', id: 'Selada' },
  { en: 'Blueberry', id: 'Bluberi' },
  { en: 'Avocado', id: 'Alpukat' },
  { en: 'Coconut', id: 'Kelapa' },
  { en: 'Melon', id: 'Melon' },
  { en: 'Bell Pepper', id: 'Paprika' },
  { en: 'Peach', id: 'Persik' },
  { en: 'Garlic', id: 'Bawang Putih' },
  { en: 'Olive', id: 'Zaitun' },
];
const FRUITS_EMOJI = ['🍎','🍌','🍊','🍇','🍉','🍓','🥭','🍒','🍋','🍍','🥝','🍐','🥕','🥦','🌽','🍅','🍆','🥒','🥔','🍄','🧅','🌶️','🥬','🫐','🥑','🥥','🍈','🫑','🍑','🧄','🫒'];

const VEHICLES_DATA = [
  { en: 'Car', id: 'Mobil' },
  { en: 'Bus', id: 'Bis' },
  { en: 'Bicycle', id: 'Sepeda' },
  { en: 'Airplane', id: 'Pesawat' },
  { en: 'Train', id: 'Kereta' },
  { en: 'Boat', id: 'Perahu' },
  { en: 'Helicopter', id: 'Helikopter' },
  { en: 'Truck', id: 'Truk' },
  { en: 'Motorcycle', id: 'Motor' },
  { en: 'Ambulance', id: 'Ambulans' },
  { en: 'Fire Truck', id: 'Pemadam' },
  { en: 'Police Car', id: 'Polisi' },
  { en: 'Ship', id: 'Kapal' },
  { en: 'Rocket', id: 'Roket' },
  { en: 'Scooter', id: 'Skuter' },
  { en: 'Taxi', id: 'Taksi' },
  { en: 'Minibus', id: 'Minibus' },
  { en: 'Tractor', id: 'Traktor' },
  { en: 'Skateboard', id: 'Papan Luncur' },
  { en: 'Subway', id: 'MRT' },
];
const VEHICLES_EMOJI = ['🚗','🚌','🚲','✈️','🚂','⛵','🚁','🛻','🏍️','🚑','🚒','🚔','🚢','🚀','🛴','🚕','🚐','🚜','🛹','🚇'];

const BUILDINGS_DATA = [
  { en: 'House', id: 'Rumah' },
  { en: 'Office', id: 'Kantor' },
  { en: 'Post Office', id: 'Kantor Pos' },
  { en: 'Hospital', id: 'Rumah Sakit' },
  { en: 'Bank', id: 'Bank' },
  { en: 'Store', id: 'Toko' },
  { en: 'School', id: 'Sekolah' },
  { en: 'Hotel', id: 'Hotel' },
  { en: 'Church', id: 'Gereja' },
  { en: 'Mosque', id: 'Masjid' },
  { en: 'Castle', id: 'Istana' },
  { en: 'Stadium', id: 'Stadion' },
  { en: 'Museum', id: 'Museum' },
  { en: 'Pagoda', id: 'Pagoda' },
  { en: 'Wedding Hall', id: 'Gedung Nikah' },
  { en: 'Temple', id: 'Kuil' },
  { en: 'Villa', id: 'Vila' },
  { en: 'Resort', id: 'Resor' },
  { en: 'Factory', id: 'Pabrik' },
  { en: 'Mall', id: 'Mal' },
];
const BUILDINGS_EMOJI = ['🏠','🏢','🏣','🏥','🏦','🏪','🏫','🏩','⛪','🕌','🏰','🏟️','🏛️','🏯','💒','🕍','🏡','🏨','🏭','🏬'];

const OBJECTS_DATA = [
  { en: 'Book', id: 'Buku' },
  { en: 'Pencil', id: 'Pensil' },
  { en: 'Ball', id: 'Bola' },
  { en: 'Watch', id: 'Jam Tangan' },
  { en: 'Key', id: 'Kunci' },
  { en: 'Phone', id: 'Telepon' },
  { en: 'Shoe', id: 'Sepatu' },
  { en: 'Hat', id: 'Topi' },
  { en: 'Umbrella', id: 'Payung' },
  { en: 'Clock', id: 'Jam' },
  { en: 'Cup', id: 'Gelas' },
  { en: 'Plate', id: 'Piring' },
  { en: 'Spoon', id: 'Sendok' },
  { en: 'Fork', id: 'Garpu' },
  { en: 'Knife', id: 'Pisau' },
  { en: 'Scissors', id: 'Gunting' },
  { en: 'Backpack', id: 'Tas Ransel' },
  { en: 'Lamp', id: 'Lampu' },
  { en: 'Mirror', id: 'Cermin' },
  { en: 'Toothbrush', id: 'Sikat Gigi' },
  { en: 'Comb', id: 'Sisir' },
  { en: 'Glasses', id: 'Kacamata' },
  { en: 'Ring', id: 'Cincin' },
  { en: 'Candle', id: 'Lilin' },
];
const OBJECTS_EMOJI = ['📖','✏️','⚽','⌚','🔑','📱','👟','🧢','☂️','🕐','🥤','🍽️','🥄','🍴','🔪','✂️','🎒','💡','🪞','🪥','🪮','👓','💍','🕯️'];

function buildCategory(data, emojis) {
  const sounds = assignSounds(data.length);
  return data.map((item, i) => ({
    ...item,
    emoji: emojis[i],
    sound: sounds[i],
  }));
}

export const CATEGORIES = {
  fruits: buildCategory(FRUITS_DATA, FRUITS_EMOJI),
  vehicles: buildCategory(VEHICLES_DATA, VEHICLES_EMOJI),
  buildings: buildCategory(BUILDINGS_DATA, BUILDINGS_EMOJI),
  objects: buildCategory(OBJECTS_DATA, OBJECTS_EMOJI),
};

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomItems(categoryName, count = 15) {
  const items = CATEGORIES[categoryName];
  if (!items) return [];
  return shuffleArray(items).slice(0, count);
}
