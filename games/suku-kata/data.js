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
  // Vowels (5)
  { syllable: 'a',   emoji: '🔥' },
  { syllable: 'i',   emoji: '🐟' },
  { syllable: 'u',   emoji: '💰' },
  { syllable: 'e',   emoji: '🦅' },
  { syllable: 'o',   emoji: '🧑' },

  // Single consonants (24)
  { syllable: 'b',   emoji: '👕' },
  { syllable: 'c',   emoji: '🌶️' },
  { syllable: 'd',   emoji: '🍃' },
  { syllable: 'f',   emoji: '🌅' },
  { syllable: 'g',   emoji: '🐘' },
  { syllable: 'h',   emoji: '❤️' },
  { syllable: 'j',   emoji: '🛤️' },
  { syllable: 'k',   emoji: '🦶' },
  { syllable: 'l',   emoji: '🌊' },
  { syllable: 'm',   emoji: '👁️' },
  { syllable: 'n',   emoji: '🐉' },
  { syllable: 'p',   emoji: '🌾' },
  { syllable: 'q',   emoji: '📖' },
  { syllable: 'r',   emoji: '💇' },
  { syllable: 's',   emoji: '🐄' },
  { syllable: 't',   emoji: '🤚' },
  { syllable: 'v',   emoji: '💉' },
  { syllable: 'w',   emoji: '🎨' },
  { syllable: 'x',   emoji: '❌' },
  { syllable: 'y',   emoji: '💪' },
  { syllable: 'z',   emoji: '⏳' },
  { syllable: 'ng',  emoji: '🎤' },
  { syllable: 'ny',  emoji: '🦟' },

  // B (10)
  { syllable: 'ba',  emoji: '👕' },
  { syllable: 'be',  emoji: '🐤' },
  { syllable: 'bi',  emoji: '🌱' },
  { syllable: 'bo',  emoji: '⚽' },
  { syllable: 'bu',  emoji: '📖' },
  { syllable: 'bak', emoji: '🌊' },
  { syllable: 'ban', emoji: '🛑' },
  { syllable: 'bang',emoji: '🏗️' },
  { syllable: 'bas', emoji: '🧹' },
  { syllable: 'bat', emoji: '🪨' },

  // C (7)
  { syllable: 'ca',  emoji: '🌶️' },
  { syllable: 'ci',  emoji: '🦎' },
  { syllable: 'cu',  emoji: '🧼' },
  { syllable: 'ce',  emoji: '🐔' },
  { syllable: 'co',  emoji: '🥣' },
  { syllable: 'cam', emoji: '📷' },
  { syllable: 'cap', emoji: '🖨️' },

  // D (7)
  { syllable: 'da',  emoji: '🍃' },
  { syllable: 'di',  emoji: '🧱' },
  { syllable: 'du',  emoji: '🐦' },
  { syllable: 'de',  emoji: '🐴' },
  { syllable: 'do',  emoji: '🐑' },
  { syllable: 'dan', emoji: '➕' },
  { syllable: 'dua', emoji: '2️⃣' },

  // F (5)
  { syllable: 'fa',  emoji: '🌅' },
  { syllable: 'fe',  emoji: '🎪' },
  { syllable: 'fi',  emoji: '🎬' },
  { syllable: 'fo',  emoji: '📷' },
  { syllable: 'fu',  emoji: '🚀' },

  // G (7)
  { syllable: 'ga',  emoji: '🐘' },
  { syllable: 'gi',  emoji: '🎸' },
  { syllable: 'gu',  emoji: '⛰️' },
  { syllable: 'ge',  emoji: '🥛' },
  { syllable: 'go',  emoji: '🍟' },
  { syllable: 'gam', emoji: '🎵' },
  { syllable: 'gar', emoji: '🧂' },

  // H (7)
  { syllable: 'ha',  emoji: '❤️' },
  { syllable: 'hi',  emoji: '🦈' },
  { syllable: 'hu',  emoji: '🌧️' },
  { syllable: 'he',  emoji: '🪖' },
  { syllable: 'ho',  emoji: '🏨' },
  { syllable: 'har', emoji: '🌲' },
  { syllable: 'hit', emoji: '⬛' },

  // J (7)
  { syllable: 'ja',  emoji: '🛤️' },
  { syllable: 'ji',  emoji: '🧕' },
  { syllable: 'ju',  emoji: '🧃' },
  { syllable: 'je',  emoji: '🪟' },
  { syllable: 'jo',  emoji: '💃' },
  { syllable: 'jar', emoji: '📏' },
  { syllable: 'jat', emoji: '🍂' },

  // K (10)
  { syllable: 'ka',  emoji: '🦶' },
  { syllable: 'ke',  emoji: '🚂' },
  { syllable: 'ki',  emoji: '🪟' },
  { syllable: 'ku',  emoji: '🐱' },
  { syllable: 'ko',  emoji: '🍲' },
  { syllable: 'kan', emoji: '🐟' },
  { syllable: 'kas', emoji: '💳' },
  { syllable: 'kat', emoji: '🐸' },
  { syllable: 'kak', emoji: '🦵' },
  { syllable: 'kap', emoji: '✈️' },

  // L (7)
  { syllable: 'la',  emoji: '🌊' },
  { syllable: 'li',  emoji: '🐬' },
  { syllable: 'lu',  emoji: '🪟' },
  { syllable: 'le',  emoji: '🐟' },
  { syllable: 'lo',  emoji: '🏆' },
  { syllable: 'lam', emoji: '💡' },
  { syllable: 'lan', emoji: '🛤️' },

  // M (10)
  { syllable: 'ma',  emoji: '👁️' },
  { syllable: 'me',  emoji: '🔴' },
  { syllable: 'mi',  emoji: '🍜' },
  { syllable: 'mo',  emoji: '🚗' },
  { syllable: 'mu',  emoji: '👄' },
  { syllable: 'man', emoji: '👦' },
  { syllable: 'mas', emoji: '🥇' },
  { syllable: 'mat', emoji: '👁️' },
  { syllable: 'mem', emoji: '📝' },
  { syllable: 'min', emoji: '🥤' },

  // N (7)
  { syllable: 'na',  emoji: '🐉' },
  { syllable: 'ni',  emoji: '💙' },
  { syllable: 'nu',  emoji: '✍️' },
  { syllable: 'ne',  emoji: '👵' },
  { syllable: 'no',  emoji: '🔢' },
  { syllable: 'nam', emoji: '🏷️' },
  { syllable: 'nan', emoji: '🍊' },

  // NG + NY (8)
  { syllable: 'nga', emoji: '🎤' },
  { syllable: 'ngi', emoji: '😴' },
  { syllable: 'ngu', emoji: '🎵' },
  { syllable: 'nge', emoji: '🎨' },
  { syllable: 'ngo', emoji: '🗣️' },
  { syllable: 'nya', emoji: '🦟' },
  { syllable: 'nye', emoji: '🔧' },
  { syllable: 'nyo', emoji: '👩' },

  // P (10)
  { syllable: 'pa',  emoji: '🌾' },
  { syllable: 'pe',  emoji: '✒️' },
  { syllable: 'pi',  emoji: '🍌' },
  { syllable: 'po',  emoji: '🌳' },
  { syllable: 'pu',  emoji: '🖊️' },
  { syllable: 'pan', emoji: '🍞' },
  { syllable: 'pas', emoji: '🏖️' },
  { syllable: 'pat', emoji: '🪁' },
  { syllable: 'pak', emoji: '👨' },
  { syllable: 'pam', emoji: '🚰' },

  // Q (5)
  { syllable: 'qa',  emoji: '📖' },
  { syllable: 'qe',  emoji: '🕌' },
  { syllable: 'qi',  emoji: '🤲' },
  { syllable: 'qo',  emoji: '🕋' },
  { syllable: 'qu',  emoji: '⏰' },

  // R (7)
  { syllable: 'ra',  emoji: '💇' },
  { syllable: 'ri',  emoji: '🌳' },
  { syllable: 'ru',  emoji: '🏠' },
  { syllable: 're',  emoji: '🍲' },
  { syllable: 'ro',  emoji: '🛞' },
  { syllable: 'ram', emoji: '🎒' },
  { syllable: 'rum', emoji: '🏠' },

  // S (10)
  { syllable: 'sa',  emoji: '🐄' },
  { syllable: 'se',  emoji: '😊' },
  { syllable: 'si',  emoji: '🚨' },
  { syllable: 'so',  emoji: '🛋️' },
  { syllable: 'su',  emoji: '🥛' },
  { syllable: 'sam', emoji: '🌉' },
  { syllable: 'san', emoji: '😇' },
  { syllable: 'sar', emoji: '🧣' },
  { syllable: 'sem', emoji: '🐜' },
  { syllable: 'sun', emoji: '☀️' },

  // T (10)
  { syllable: 'ta',  emoji: '🤚' },
  { syllable: 'te',  emoji: '🥚' },
  { syllable: 'ti',  emoji: '🐭' },
  { syllable: 'to',  emoji: '🍅' },
  { syllable: 'tu',  emoji: '🦴' },
  { syllable: 'tang',emoji: '🎶' },
  { syllable: 'teng',emoji: '🧘' },
  { syllable: 'ting',emoji: '📗' },
  { syllable: 'tong',emoji: '🗑️' },
  { syllable: 'tung',emoji: '⏳' },

  // V (5)
  { syllable: 'va',  emoji: '💉' },
  { syllable: 've',  emoji: '🚫' },
  { syllable: 'vi',  emoji: '💊' },
  { syllable: 'vo',  emoji: '🔊' },
  { syllable: 'vu',  emoji: '🌋' },

  // W + X + Y + Z (20)
  { syllable: 'wa',  emoji: '🎨' },
  { syllable: 'wi',  emoji: '📚' },
  { syllable: 'we',  emoji: '🌸' },
  { syllable: 'wo',  emoji: '🧶' },
  { syllable: 'wu',  emoji: '🚿' },
  { syllable: 'xa',  emoji: '❌' },
  { syllable: 'xe',  emoji: '🧬' },
  { syllable: 'xi',  emoji: '🎷' },
  { syllable: 'xo',  emoji: '⭕' },
  { syllable: 'xu',  emoji: '🈲' },
  { syllable: 'ya',  emoji: '💪' },
  { syllable: 'ye',  emoji: '🪪' },
  { syllable: 'yi',  emoji: '🆔' },
  { syllable: 'yo',  emoji: '🧘' },
  { syllable: 'yu',  emoji: '⚖️' },
  { syllable: 'za',  emoji: '⏳' },
  { syllable: 'ze',  emoji: '🦓' },
  { syllable: 'zi',  emoji: '🈸' },
  { syllable: 'zo',  emoji: '🌍' },
  { syllable: 'zu',  emoji: '🕌' },
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
    .map(s => lookup.get(s) || { syllable: s, emoji: null })
    .filter(s => s);
}
