export const COLORS = [
  ['#FF9A9E', '#FAD0C4'],
  ['#A18CD1', '#FBC2EB'],
  ['#FCCB90', '#D57EEB'],
  ['#E0C3FC', '#8EC5FC'],
  ['#F5576C', '#F093FB'],
  ['#4FACFE', '#00F2FE'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
  ['#F6D365', '#FDA085'],
  ['#A8EDEA', '#FED6E3'],
  ['#D4FC79', '#96E6A1'],
  ['#84FAB0', '#8FD3F4'],
];

let colorIndex = 0;
export function nextColor() {
  const c = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  return c;
}
export function resetColorIndex() { colorIndex = 0; }

const SYLLABLE_DATA = [
  { syllable: 'a',   emoji: '🔥', cue: 'api' },
  { syllable: 'i',   emoji: '🐟', cue: 'ikan' },
  { syllable: 'u',   emoji: '💰', cue: 'uang' },
  { syllable: 'e',   emoji: '🦅', cue: 'elang' },
  { syllable: 'o',   emoji: '🧑', cue: 'orang' },

  { syllable: 'b',   emoji: '👕', cue: 'baju' },
  { syllable: 'c',   emoji: '🌶️', cue: 'cabai' },
  { syllable: 'd',   emoji: '🍃', cue: 'daun' },
  { syllable: 'f',   emoji: '🌅', cue: 'fajar' },
  { syllable: 'g',   emoji: '🐘', cue: 'gajah' },
  { syllable: 'h',   emoji: '❤️', cue: 'hati' },
  { syllable: 'j',   emoji: '🛤️', cue: 'jalan' },
  { syllable: 'k',   emoji: '🦶', cue: 'kaki' },
  { syllable: 'l',   emoji: '🌊', cue: 'laut' },
  { syllable: 'm',   emoji: '👁️', cue: 'mata' },
  { syllable: 'n',   emoji: '🐉', cue: 'naga' },
  { syllable: 'p',   emoji: '🌾', cue: 'padi' },
  { syllable: 'q',   emoji: '📖', cue: 'quran' },
  { syllable: 'r',   emoji: '🍞', cue: 'roti' },
  { syllable: 's',   emoji: '🐄', cue: 'sapi' },
  { syllable: 't',   emoji: '🤚', cue: 'tangan' },
  { syllable: 'v',   emoji: '💉', cue: 'vaksin' },
  { syllable: 'w',   emoji: '🎨', cue: 'warna' },
  { syllable: 'x',   emoji: '🎷', cue: 'xilofon' },
  { syllable: 'y',   emoji: '🧘', cue: 'yoga' },
  { syllable: 'z',   emoji: '🦓', cue: 'zebra' },
  { syllable: 'ng',  emoji: '🗣️', cue: 'ngomong' },
  { syllable: 'ny',  emoji: '🦟', cue: 'nyamuk' },

  { syllable: 'ba',  emoji: '👕', cue: 'baju' },
  { syllable: 'be',  emoji: '🐤', cue: 'bebek' },
  { syllable: 'bi',  emoji: '🌱', cue: 'biji' },
  { syllable: 'bo',  emoji: '⚽', cue: 'bola' },
  { syllable: 'bu',  emoji: '📖', cue: 'buku' },
  { syllable: 'bak', emoji: '🪣', cue: 'bak' },
  { syllable: 'ban', emoji: '🛑', cue: 'ban' },
  { syllable: 'bang',emoji: '🏗️', cue: 'bangunan' },
  { syllable: 'bas', emoji: '🏀', cue: 'basket' },
  { syllable: 'bat', emoji: '🪨', cue: 'batu' },

  { syllable: 'ca',  emoji: '🌶️', cue: 'cabai' },
  { syllable: 'ci',  emoji: '🦎', cue: 'cicak' },
  { syllable: 'cu',  emoji: '🧼', cue: 'cuci' },
  { syllable: 'ce',  emoji: '🐔', cue: 'ceker' },
  { syllable: 'co',  emoji: '🍫', cue: 'coklat' },
  { syllable: 'cam', emoji: '📷', cue: 'cam' },
  { syllable: 'cap', emoji: '🖨️', cue: 'cap' },

  { syllable: 'da',  emoji: '🍃', cue: 'daun' },
  { syllable: 'di',  emoji: '🧱', cue: 'dinding' },
  { syllable: 'du',  emoji: '🌍', cue: 'dunia' },
  { syllable: 'de',  emoji: '🐴', cue: 'delman' },
  { syllable: 'do',  emoji: '🐑', cue: 'domba' },
  { syllable: 'dan', emoji: '🌊', cue: 'danau' },
  { syllable: 'dua', emoji: '2️⃣', cue: 'dua' },

  { syllable: 'fa',  emoji: '🌅', cue: 'fajar' },
  { syllable: 'fe',  emoji: '🎪', cue: 'festival' },
  { syllable: 'fi',  emoji: '🎬', cue: 'film' },
  { syllable: 'fo',  emoji: '📷', cue: 'foto' },
  { syllable: 'fu',  emoji: '⚽', cue: 'futsal' },

  { syllable: 'ga',  emoji: '🐘', cue: 'gajah' },
  { syllable: 'gi',  emoji: '🎸', cue: 'gitar' },
  { syllable: 'gu',  emoji: '⛰️', cue: 'gunung' },
  { syllable: 'ge',  emoji: '🥛', cue: 'gelas' },
  { syllable: 'go',  emoji: '🍟', cue: 'goreng' },
  { syllable: 'gam', emoji: '🎵', cue: 'gamelan' },
  { syllable: 'gar', emoji: '🧂', cue: 'garam' },

  { syllable: 'ha',  emoji: '❤️', cue: 'hati' },
  { syllable: 'hi',  emoji: '🦈', cue: 'hiu' },
  { syllable: 'hu',  emoji: '🌧️', cue: 'hujan' },
  { syllable: 'he',  emoji: '🪖', cue: 'helm' },
  { syllable: 'ho',  emoji: '🏨', cue: 'hotel' },
  { syllable: 'har', emoji: '🐯', cue: 'harimau' },
  { syllable: 'hit', emoji: '⬛', cue: 'hitam' },

  { syllable: 'ja',  emoji: '🛤️', cue: 'jalan' },
  { syllable: 'ji',  emoji: '🧕', cue: 'jilbab' },
  { syllable: 'ju',  emoji: '🧃', cue: 'jus' },
  { syllable: 'je',  emoji: '🪟', cue: 'jendela' },
  { syllable: 'jo',  emoji: '💃', cue: 'joget' },
  { syllable: 'jar', emoji: '📏', cue: 'jarak' },
  { syllable: 'jat', emoji: '🍂', cue: 'jatuh' },

  { syllable: 'ka',  emoji: '🦶', cue: 'kaki' },
  { syllable: 'ke',  emoji: '🚂', cue: 'kereta' },
  { syllable: 'ki',  emoji: '🦌', cue: 'kijang' },
  { syllable: 'ku',  emoji: '🐱', cue: 'kucing' },
  { syllable: 'ko',  emoji: '👨‍🍳', cue: 'koki' },
  { syllable: 'kan', emoji: '🛍️', cue: 'kantong' },
  { syllable: 'kas', emoji: '🛏️', cue: 'kasur' },
  { syllable: 'kat', emoji: '🐸', cue: 'katak' },
  { syllable: 'kak', emoji: '👫', cue: 'kakak' },
  { syllable: 'kap', emoji: '🪓', cue: 'kapak' },

  { syllable: 'la',  emoji: '🌊', cue: 'laut' },
  { syllable: 'li',  emoji: '🕯️', cue: 'lilin' },
  { syllable: 'lu',  emoji: '🕳️', cue: 'lubang' },
  { syllable: 'le',  emoji: '🍋', cue: 'lemon' },
  { syllable: 'lo',  emoji: '📍', cue: 'lokasi' },
  { syllable: 'lam', emoji: '💡', cue: 'lampu' },
  { syllable: 'lan', emoji: null, cue: 'lantai' },

  { syllable: 'ma',  emoji: '👁️', cue: 'mata' },
  { syllable: 'me',  emoji: '🔴', cue: 'merah' },
  { syllable: 'mi',  emoji: '🍜', cue: 'mie' },
  { syllable: 'mo',  emoji: '🚗', cue: 'mobil' },
  { syllable: 'mu',  emoji: '👄', cue: 'mulut' },
  { syllable: 'man', emoji: '🛁', cue: 'mandi' },
  { syllable: 'mas', emoji: '😷', cue: 'masker' },
  { syllable: 'mat', emoji: '👁️', cue: 'mata' },
  { syllable: 'mem', emoji: '🧠', cue: 'memori' },
  { syllable: 'min', emoji: '🥤', cue: 'minum' },

  { syllable: 'na',  emoji: '🐉', cue: 'naga' },
  { syllable: 'ni',  emoji: '💍', cue: 'nikah' },
  { syllable: 'nu',  emoji: '✍️', cue: 'nulis' },
  { syllable: 'ne',  emoji: '👵', cue: 'nenek' },
  { syllable: 'no',  emoji: '🔢', cue: 'nomor' },
  { syllable: 'nam', emoji: '🏷️', cue: 'nama' },
  { syllable: 'nan', emoji: '🍍', cue: 'nanas' },

  { syllable: 'nga', emoji: '🫢', cue: 'nganga' },
  { syllable: 'ngi', emoji: '🦷', cue: 'ngilu' },
  { syllable: 'ngu', emoji: '🙈', cue: 'ngumpet' },
  { syllable: 'nge', emoji: '🎨', cue: 'ngecat' },
  { syllable: 'ngo', emoji: '🗣️', cue: 'ngomong' },
  { syllable: 'nya', emoji: '🦟', cue: 'nyamuk' },
  { syllable: 'nye', emoji: '💦', cue: 'nyebur' },
  { syllable: 'nyo', emoji: '👩', cue: 'nyokap' },

  { syllable: 'pa',  emoji: '🌾', cue: 'padi' },
  { syllable: 'pe',  emoji: '✒️', cue: 'pena' },
  { syllable: 'pi',  emoji: '🍌', cue: 'pisang' },
  { syllable: 'po',  emoji: '🌳', cue: 'pohon' },
  { syllable: 'pu',  emoji: '🖊️', cue: 'pulpen' },
  { syllable: 'pan', emoji: '🎣', cue: 'pancing' },
  { syllable: 'pas', emoji: '🍝', cue: 'pasta' },
  { syllable: 'pat', emoji: '🦴', cue: 'patah' },
  { syllable: 'pak', emoji: '📌', cue: 'paku' },
  { syllable: 'pam', emoji: '👨', cue: 'paman' },

  { syllable: 'qa',  emoji: null, cue: 'qari' },
  { syllable: 'qe',  emoji: null, cue: 'qen' },
  { syllable: 'qi',  emoji: null, cue: 'qiraah' },
  { syllable: 'qo',  emoji: null, cue: 'qori' },
  { syllable: 'qu',  emoji: null, cue: 'qu' },

  { syllable: 'ra',  emoji: '⛓️', cue: 'rantai' },
  { syllable: 'ri',  emoji: '🌳', cue: 'rimba' },
  { syllable: 'ru',  emoji: '🏠', cue: 'rumah' },
  { syllable: 're',  emoji: '🏆', cue: 'rekor' },
  { syllable: 'ro',  emoji: '🛞', cue: 'roda' },
  { syllable: 'ram', emoji: '💇', cue: 'rambut' },
  { syllable: 'rum', emoji: '🏠', cue: 'rumah' },

  { syllable: 'sa',  emoji: '🐄', cue: 'sapi' },
  { syllable: 'se',  emoji: '😊', cue: 'senyum' },
  { syllable: 'si',  emoji: '🪥', cue: 'sikat' },
  { syllable: 'so',  emoji: '🛋️', cue: 'sofa' },
  { syllable: 'su',  emoji: '🥛', cue: 'susu' },
  { syllable: 'sam', emoji: '🛶', cue: 'sampan' },
  { syllable: 'san', emoji: '🩴', cue: 'sandal' },
  { syllable: 'sar', emoji: '🪺', cue: 'sarang' },
  { syllable: 'sem', emoji: '🐜', cue: 'semut' },
  { syllable: 'sun', emoji: '🧴', cue: 'sunscreen' },

  { syllable: 'ta',  emoji: '🤚', cue: 'tangan' },
  { syllable: 'te',  emoji: '🥚', cue: 'telur' },
  { syllable: 'ti',  emoji: '🐭', cue: 'tikus' },
  { syllable: 'to',  emoji: '🍅', cue: 'tomat' },
  { syllable: 'tu',  emoji: '🦴', cue: 'tulang' },
  { syllable: 'tang',emoji: '🪜', cue: 'tangga' },
  { syllable: 'teng',emoji: '🌊', cue: 'tenggelam' },
  { syllable: 'ting',emoji: '📏', cue: 'tinggi' },
  { syllable: 'tong',emoji: '🦯', cue: 'tongkat' },
  { syllable: 'tung',emoji: '🔥', cue: 'tungku' },

  { syllable: 'va',  emoji: '💉', cue: 'vaksin' },
  { syllable: 've',  emoji: '🩸', cue: 'vena' },
  { syllable: 'vi',  emoji: '🎻', cue: 'violin' },
  { syllable: 'vo',  emoji: '🏐', cue: 'voli' },
  { syllable: 'vu',  emoji: '🌋', cue: 'vulkan' },

  { syllable: 'wa',  emoji: '🎨', cue: 'warna' },
  { syllable: 'wi',  emoji: '👑', cue: 'wibawa' },
  { syllable: 'we',  emoji: '👻', cue: 'wewe' },
  { syllable: 'wo',  emoji: '🥕', cue: 'wortel' },
  { syllable: 'wu',  emoji: '🚿', cue: 'wudhu' },
  { syllable: 'xa',  emoji: null, cue: 'xa' },
  { syllable: 'xe',  emoji: '💡', cue: 'xenon' },
  { syllable: 'xi',  emoji: '🌱', cue: 'xilem' },
  { syllable: 'xo',  emoji: null, cue: 'xo' },
  { syllable: 'xu',  emoji: null, cue: 'xu' },

  { syllable: 'ya',  emoji: '⛵', cue: 'yacht' },
  { syllable: 'ye',  emoji: null, cue: 'yeti' },
  { syllable: 'yi',  emoji: '☯️', cue: 'yin' },
  { syllable: 'yo',  emoji: null, cue: 'yoyo' },
  { syllable: 'yu',  emoji: '🪨', cue: 'yupa' },

  { syllable: 'za',  emoji: null, cue: 'zaitun' },
  { syllable: 'ze',  emoji: '🦓', cue: 'zebra' },
  { syllable: 'zi',  emoji: null, cue: 'zirah' },
  { syllable: 'zo',  emoji: null, cue: 'zombi' },
  { syllable: 'zu',  emoji: null, cue: 'zuriat' },
];

export const ALL_SYLLABLES = SYLLABLE_DATA;

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseParentInput(text) {
  return text
    .split(/[\s,;]+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length >= 1 && s.length <= 4)
    .filter((s, i, a) => a.indexOf(s) === i);
}

export function resolveSyllables(input) {
  const lookup = new Map(ALL_SYLLABLES.map(s => [s.syllable, s]));
  return input
    .map(s => lookup.get(s) || { syllable: s, emoji: null, cue: null })
    .filter(s => s);
}
