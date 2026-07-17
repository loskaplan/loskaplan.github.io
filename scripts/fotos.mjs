/* Aplica el tractament fotogràfic de la marca i escriu el resultat a src/assets/.
 *
 *   npm run fotos
 *
 * Per què en temps de build i no amb CSS: fer-ho amb `filter: grayscale()` més capes
 * amb `mix-blend-mode` obliga el navegador a recompondre tres bandes enormes a cada
 * frame, i l’scroll se’n va en orris en equips modestos. Cuit a la imatge, el cost de
 * render és zero i el resultat és idèntic.
 *
 * Per canviar una foto: deixa l’original a photos/ amb el mateix nom i torna a
 * executar l’ordre. Els fitxers de photos/ no es publiquen; els de src/assets/ sí.
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ORIGINALS = 'photos';
const OUT = 'src/assets';

/* Gris càlid. Dona una crominància de ~7 sobre 255: prou perquè les fotos no es vegin
 * fredes damunt del paper càlid, prou poc perquè segueixin llegint-se com a monocromes
 * i el groc continuï sent l’únic color de la pàgina. Pujar d’aquí vira a sèpia.
 *
 * Dos paranys de sharp, tots dos silenciosos:
 *  · NO encadenis .greyscale().tint(): libvips passa la imatge a un espai d’un sol
 *    canal i el tint es perd sense dir res (crominància 0). `tint()` sol ja converteix
 *    a gris internament, i preserva la lluminositat.
 *  · NO ho facis compondo una capa de color amb alfa damunt del gris: sharp premultiplica
 *    l’alfa en compondre, i el resultat no és una mescla sinó un enfosquiment (una foto
 *    de lluminositat 134 en sortia a 53). */
const TINT = { r: 95, g: 92, b: 87 };

/* Les fotos de les missions van sota el titular blanc, i per això tenen un sostre: cap
 * píxel pot passar de 116, que és el gris més clar amb què el text (#fffdf7) hi dona
 * 4,5:1 a sobre. Sense sostre, el pitjor píxel donava 1,27:1 i les primeres lletres
 * desapareixien.
 * L'escala es calcula PER FOTO a partir del seu màxim real, no a ull: una foto que ja
 * arriba just al sostre no es toca, i una de clara baixa el que calgui. Comprimir totes
 * per igual [0,255]→[8,116] enfosquia les que ja eren fosques fins a gairebé negre i les
 * matava.
 * A newformcap no hi ha cap filtre CSS (comprovat: filter: none, opacitat 1): les seves
 * fotos ja venen fosques de fàbrica. Això és el mateix, fet aquí.
 * Les bandes del titular NO hi entren: van damunt del paper i han de conservar la força. */
const FOSQUES = new Set(['cultura', 'reflexio', 'experimentacio']);
const SOSTRE = 116;

/* La trama de punts NO es cou aquí: va al CSS (.photo::after). Coure-la lligava els
 * punts als píxels de la imatge, i com que el navegador la serveix escalada, es
 * desfeien; a més era soroll d’alta freqüència que no comprimeix (una foto passava de
 * 215 kB a 224 kB en WebP). Al CSS els punts van sempre a 3px de pantalla i nets. */

/* Mides finals. La clau és el nom del fitxer sense extensió. Retallat centrat a la
 * proporció on es veu de debò: així el navegador no descodifica 2700px d’alçada per
 * ensenyar-ne 176. */
const TARGETS = {
  /* Les quatre peces del titular de la portada. Cadascuna omple el sobrant de la seva
   * línia, i per tant l'amplada a la qual es veu depèn del text i de la finestra: per
   * això van retallades amples i es re-retallen amb object-fit. */
  exposicio: [2400, 500],
  sintetitzador: [2400, 500],
  festival: [2400, 500],
  escena: [2400, 500],
  // Els tres retrats de les missions.
  cultura: [1080, 1440],
  reflexio: [1080, 1440],
  experimentacio: [1080, 1440],
  // Les tres peces escampades dins de la frase de tancament. Cadascuna té un pes
  // tonal diferent a propòsit —fosca, mitjana, clara— i diuen la frase: l'espai,
  // les persones, la màquina.
  sala: [900, 1200],
  taller: [1600, 900],
  teclat: [1400, 788],
  /* Les bandes d'obertura de /serveis i /qui-som. 2:1 i 2600 d'ample perquè la mesura
   * del text són 1288px (--max menys el padding del .wrap) i cal servir-les a 2x.
   * No tenen sostre: no hi va cap text a sobre. */
  serveis: [2600, 1300],
  quisom: [2600, 1300],
};

/* El tractament ha fallat en silenci més d’una vegada —el tint que no s’aplicava, la
 * composició que enfosquia la foto a la meitat—, i sempre s’ha vist abans al número que
 * a l’ull. Per això cada imatge es mesura en sortir.
 *
 * Important: el «abans» es mesura sobre l’original JA RETALLAT, no sobre el fitxer de
 * photos/. Si es compara el fitxer sencer amb una sortida retallada, es comparen regions
 * diferents de la foto i la lluminositat canvia pel retall, no pel tractament: dona
 * falsa alarma. */
/* Es mesura a resolució SENCERA, no sobre la miniatura: en reduir es fa la mitjana dels
 * píxels i el resultat en surt més baix del que és.
 * I es fa servir el percentil 99,9 en comptes del màxim absolut per dues raons: un
 * reflex especular de quatre píxels no fa il·legible res, i sobretot el JPEG hi juga
 * —la compressió sobrepassa valors als contorns de contrast (ringing) i el màxim
 * absolut de la sortida sortia 10 punts per damunt del que s'hi havia posat. */
async function nivell(buf, p = 0.999) {
  const data = await sharp(buf).greyscale().raw().toBuffer();
  const hist = new Uint32Array(256);
  for (const v of data) hist[v]++;
  const limit = data.length * p;
  let acc = 0;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= limit) return v;
  }
  return 255;
}

async function mesura(file) {
  const data = await sharp(file).resize(60, 60, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  let croma = 0,
    lum = 0,
    max = 0,
    n = 0;
  for (let i = 0; i < data.length; i += 3) {
    croma += Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
    const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
    lum += v;
    if (v > max) max = v;
    n++;
  }
  return { croma: croma / n, lum: lum / n, max };
}

await mkdir(OUT, { recursive: true });

const files = (await readdir(ORIGINALS)).filter((f) => /\.(jpe?g|png)$/i.test(f));
if (!files.length) throw new Error(`No hi ha cap imatge a ${ORIGINALS}/`);

let problemes = false;

for (const file of files) {
  const name = path.parse(file).name;
  const target = TARGETS[name];
  if (!target) {
    console.warn(`⚠  ${file}: no té mida definida a TARGETS, s’omet`);
    continue;
  }

  const [w, h] = target;
  const retallat = await sharp(path.join(ORIGINALS, file))
    .resize(w, h, { fit: 'cover', position: 'centre' })
    .toBuffer();

  // Monocrom amb un sesgo càlid mínim: el groc ha de ser l’únic color de la pàgina.
  const fosca = FOSQUES.has(name);
  const abans = await mesura(retallat);

  /* Per a les fosques, l'escala surt del màxim real de la foto: només baixa el que cal
     per posar el píxel més clar al sostre. Si ja hi és per sota, no es toca. */
  const nivellAbans = fosca ? await nivell(retallat) : 0;
  const escala = fosca ? Math.min(1, SOSTRE / Math.max(1, nivellAbans)) : 1.06;

  const out = path.join(OUT, `${name}.jpg`);
  const { size } = await sharp(retallat)
    .linear(escala, fosca ? 0 : -8)
    .tint(TINT)
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toFile(out);
  const despres = await mesura(out);

  const avisos = [];

  /* El llindar del tint és PROPORCIONAL a la lluminositat, no fix: la crominància que
     hi cap depèn de com de clara és la foto. En una de gairebé negra (lum 9) no hi cap
     croma per molt tint que hi posis, i un llindar fix hi cridava «el tint no s'ha
     aplicat» quan sí que hi era. */
  const llindarCroma = Math.max(0.3, despres.lum * 0.025);
  if (despres.croma < llindarCroma) avisos.push('el tint no s’ha aplicat (crominància ~0)');
  if (despres.croma > 16) avisos.push('massa saturada: vira a sèpia');

  if (fosca) {
    // Aquí el que importa no és que la lluminositat es mantingui —de fet ha de baixar—,
    // sinó que cap píxel passi del sostre: si en passa, el text blanc s’hi perd.
    // Es comprova a resolució sencera: un sol píxel clar ja es veu.
    const nivellDespres = await nivell(out);
    if (nivellDespres > SOSTRE + 2) avisos.push(`la foto arriba a ${nivellDespres}, per damunt del sostre de ${SOSTRE}: el text blanc no s’hi llegirà`);
  } else if (Math.abs(despres.lum - abans.lum) > 12) {
    avisos.push('la lluminositat ha canviat massa');
  }

  const marca = avisos.length ? '✗' : '✓';
  console.log(
    `${marca} ${out.padEnd(28)} ${w}×${h}`.padEnd(48) +
      `${(size / 1024).toFixed(0)} KB`.padStart(7) +
      `   croma ${despres.croma.toFixed(1).padStart(4)}   lum ${Math.round(abans.lum)}→${Math.round(despres.lum)}` +
      (fosca ? `   nivell ${await nivell(out)}/${SOSTRE}   escala ${escala.toFixed(2)}` : '')
  );
  for (const a of avisos) console.error(`    ⚠  ${a}`);
  if (avisos.length) problemes = true;
}

if (problemes) {
  console.error('\nAlguna imatge no ha sortit com toca. Reviseu TINT a dalt.');
  process.exitCode = 1;
}
