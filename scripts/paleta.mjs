/* Deriva la paleta de Los Kaplan a partir del sistema de New Form, rotant el to.
 * Es fa en OKLCH perquè preserva la lluminositat i el croma percebuts: així els
 * neutres mantenen exactament la mateixa relació amb l'accent que tenien allà. */

const srgbToLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToOklch(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => srgbToLin(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: (Math.atan2(B, A) * 180) / Math.PI };
}

function oklchToHex({ L, C, H }) {
  const h = (H * Math.PI) / 180;
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.round(Math.min(1, Math.max(0, linToSrgb(v))) * 255));
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
}

const GREEN = '#2bee4b'; // accent de New Form
const YELLOW = '#ffc700'; // el nostre

const gh = hexToOklch(GREEN).H;
const yh = hexToOklch(YELLOW).H;
const SHIFT = yh - gh;

// Sistema de New Form, tal com el descriu Refero.
const SOURCE = [
  ['accent', 'Highlighter Green', '#2bee4b', "Únic color viu: acció, subratllat actiu i banda de peu"],
  ['accent-soft', 'Shadow Moss', '#93b799', 'Accent de suport, detalls decoratius. No ascendir a botó'],
  ['accent-pale', 'Echo Green', '#c4e4c9', 'Accent de suport clar. No ascendir a botó'],
  ['ink', 'Press Black', '#121613', 'Titulars, fons del peu, superfície dominant'],
  ['ink-2', 'Slate Verdant', '#232924', 'Superfície secundària, seccions amb vora'],
  ['ink-soft', 'Newsprint Gray', '#516254', 'Peus de foto, text auxiliar, etiquetes apagades'],
  ['paper-dim', 'Muted Sage', '#c8d2c8', 'Text clar sobre fons foscos, etiquetes inverses'],
  ['paper', 'Bone White', '#fafffa', 'Llenç de la pàgina. Mai #ffffff: el to càlid és el que fa que sembli paper'],
];

console.log(`New Form verd  H=${gh.toFixed(1)}°   Los Kaplan groc H=${yh.toFixed(1)}°   rotació ${SHIFT.toFixed(1)}°\n`);
console.log('token           New Form            ->  Los Kaplan   L      C');
console.log('─'.repeat(78));

const out = {};
for (const [token, name, hex, role] of SOURCE) {
  const c = hexToOklch(hex);
  // L'accent no es rota: ja és el nostre groc exacte, el de la marca.
  const nou = token === 'accent' ? YELLOW : oklchToHex({ ...c, H: c.H + SHIFT });
  out[token] = { hex: nou, role };
  console.log(
    `${token.padEnd(14)} ${name.padEnd(18)} ${hex} -> ${nou}   ${c.L.toFixed(3)}  ${c.C.toFixed(3)}`
  );
}

console.log('\nJSON:\n' + JSON.stringify(out, null, 2));
