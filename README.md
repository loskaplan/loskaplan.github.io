# Los Kaplan

Web de l'Associació Los Kaplan. Astro estàtic, sense JavaScript de client, desplegat a
GitHub Pages.

## Desenvolupament

```sh
npm install
npm run dev      # http://localhost:4321
npm run fotos    # tracta les fotos de photos/ i les escriu a src/assets/
npm run build    # genera dist/
npm run preview  # serveix dist/ localment
```

## Editar els textos

El contingut de cada pàgina viu en un fitxer Markdown a `src/content/pagines/`:

| Fitxer        | Pàgina      |
| ------------- | ----------- |
| `serveis.md`  | `/serveis`  |
| `qui-som.md`  | `/qui-som`  |
| `contacte.md` | `/contacte` |

Cada fitxer té una capçalera amb tres camps:

- `title` — nom curt, surt al menú i a la pestanya del navegador.
- `heading` — el titular gran de la pàgina.
- `description` — l'entradeta i la descripció per a Google i les xarxes socials.

La resta és Markdown normal: `##` per als apartats i `###` per als subapartats.

Els textos de la portada són a `src/pages/index.astro`. Les dades comunes —correu,
adreça i menú— són a `src/config.ts`.

Escriviu l'apòstrof tipogràfic (`’`, no `'`) i el punt volat de l'ela geminada amb
U+00B7 (`col·laboració`). No feu servir `ŀ` (U+0140): es veu bé, però trenca el Ctrl+F
i el copiar i enganxar.

### Afegir una pàgina nova

1. Crea el Markdown a `src/content/pagines/`.
2. Crea `src/pages/<slug>.astro` copiant `serveis.astro` i canviant-hi el nom.
3. Afegeix l'enllaç a `nav` dins `src/config.ts`.

## Canviar les fotos

1. Deixa l'original —en color, sense tractar— a `photos/`, amb el mateix nom del fitxer
   que vols substituir.
2. `npm run fotos`.

El script passa la foto a monocrom amb l'ombra tenyida de blau i la retalla a la mida on
es veu de debò. Si afegeixes una foto nova, defineix-ne la mida a `TARGETS` dins
[`scripts/fotos.mjs`](scripts/fotos.mjs); si no, l'omet i t'avisa.

Es tracta en temps de build i no amb CSS a propòsit: fer-ho amb `filter: grayscale()` i
capes amb `mix-blend-mode` obliga el navegador a recompondre tres bandes de 2400px a
cada frame, i la pàgina es queda sense pintar. La trama de punts, en canvi, sí que va al
CSS (`.photo::after`), perquè cuita a la imatge se li lligava als píxels i es desfeia en
escalar-la.

## Desplegament a GitHub Pages

Puja el repositori a GitHub i, a **Settings → Pages → Build and deployment**, tria
**GitHub Actions** com a origen. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
fa la resta: cada `push` a `main` construeix i publica. Amb el pla gratuït el repositori
ha de ser públic.

`npm run fotos` no forma part del build: les imatges tractades es pugen al repositori ja
fetes.

### El domini

`loskaplan.org` està registrat a IONOS, i el correu de l'associació també hi viu: hi ha
set registres de `Mail` (dos MX, l'SPF, el DMARC, dos DKIM i l'autodiscover). Per això el
DNS es queda a IONOS —moure els nameservers voldria dir migrar-los tots— i només s'hi
canvien els del web:

| Tipus | Nom   | Valor                                                                              |
| ----- | ----- | ---------------------------------------------------------------------------------- |
| A     | `@`   | `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`             |
| AAAA  | `@`   | `2606:50c0:8000::153` `2606:50c0:8001::153` `2606:50c0:8002::153` `2606:50c0:8003::153` |
| CNAME | `www` | `loskaplan.github.io`                                                              |

Els AAAA no són opcionals: si es deixen apuntant a IONOS, qui navegui per IPv6 continua
veient la web vella.

Abans cal desconnectar el domini de **Click and Build** (el creador de pàgines d'IONOS)
des d'**Ajustar destino**. Mentre hi estigui connectat, els seus quatre registres —`A @`,
`AAAA @`, `A www`, `AAAA www`, tots cap a `217.160.0.176` / `2001:8d8:100f:f000::2e7`—
surten sense icona de paperera i no es deixen esborrar.

Quan els registres ja resolguin, i no abans, posa el domini a **Settings → Pages → Custom
domain**: GitHub el rebutja si encara no apunta cap als seus servidors. Marca **Enforce
HTTPS** quan s'activi (pot trigar fins a 24 h: ha d'emetre el certificat).

[`public/CNAME`](public/CNAME) hi és perquè ho recomana la documentació d'Astro, però amb
desplegaments per Actions no n'hi ha prou: el domini viu als ajustos del repositori, no al
fitxer. Qui sí que surt de `astro.config.mjs` (`site`) és l'URL canònica i les metadades
per compartir a xarxes.

## Pendent

- **Correu de contacte.** `src/config.ts` té `hola@loskaplan.cat` com a valor
  provisional, d'un domini que no és el nostre; als estatuts no consta cap adreça. Cal
  substituir-lo pel real.
- **Fotos.** Les de `photos/` són de Pexels, de mostra. Substituïu-les per fotos de
  l'associació quan n'hi hagi.
- **Bilingüe.** De moment només català.

## El disseny

L'estructura editorial —titulars monumentals que les fotos interrompen en comptes de
flotar-hi al costat, microetiquetes en versaletes, fotografia monocroma i una banda
d'accent a peu de pàgina— està inspirada en [newformcap.com](https://www.newformcap.com).

La paleta és la seva, amb el to rotat **−56,7° en OKLCH**, del seu verd neó (H 144,7°) al
nostre groc (H 88°), preservant lluminositat i croma. La gràcia del sistema és que els
neutres no són grisos purs: porten un sesgo cap a l'accent tan petit que no es veu però
es nota —croma 0,008 al gairebé negre—. Allà és fred i verdós; aquí, càlid. És el que fa
que el groc sembli l'únic color de debò.

| Token       | New Form  | Los Kaplan |
| ----------- | --------- | ---------- |
| `accent`    | `#2bee4b` | `#ffc700`  |
| `ink`       | `#121613` | `#161511`  |
| `ink-2`     | `#232924` | `#292720`  |
| `ink-soft`  | `#516254` | `#635d4a`  |
| `paper-dim` | `#c8d2c8` | `#d3cec2`  |
| `paper`     | `#fafffa` | `#fffdf7`  |

Dues regles que val la pena mantenir: **el groc és l'únic color de la pàgina** —tota la
fotografia va en monocrom— i **el llenç mai és `#ffffff`**: el to càlid és el que fa que
sembli paper i no pantalla.

### Les seccions de la portada

| #   | Secció              | Fons  | Què és                                                            |
| --- | ------------------- | ----- | ----------------------------------------------------------------- |
| 1   | Hero broadsheet     | paper | Titular en 4 línies, cada una justificada per una foto             |
| 2   | Les tres missions   | fosc  | Escena ancorada: tres frases que es teclegen, retrat i bloc de crida |
| 3   | Set línies          | paper | Les set activitats en caixes, cada una enllaça al seu apartat      |
| 4   | Declaració          | fosc  | Serif clàssica sobre píxels                                       |
| 5   | Els tres fins       | paper | El diagrama de Venn de l'article 2                                 |
| 6   | La cruïlla          | paper | La frase de tancament amb les fotos escampades a dins              |
| 7   | Banda + peu         | groc  | La signatura d'accent i el correu a cos de titular                 |

L'ordre alterna paper i fosc a propòsit: és el ritme que fa que les seccions es
llegeixin com a capítols i no com una llista.

### El titular de la portada

Cada línia del hero és una fila i **la foto s'endú el sobrant** (`flex: 1`). Per això el
bloc queda justificat a banda i banda sigui quina sigui la finestra: el text mai no
arriba igual de lluny —«Cultura, art» i «en totes les» no fan el mateix— i és la foto qui
quadra la caixa. Mesurat a 1100 i a 2200: les quatre línies fan exactament l'amplada útil,
amb folga 0 als dos costats.

Val la pena saber d'on surt, perquè és diferent del referent. A newformcap les línies del
hero queden **desiguals** —723, 910, 796 i 670px— i les fotos només s'hi col·loquen al
damunt per tapar el buit: està composta a mà. Fent-ho amb flex, s'ajusta sola.

I un mite a desfer: el seu hero **no** manté el padding a qualsevol amplada. A 2200px el
seu bloc fa 1060px —un 48% de la finestra— amb 563px de marge mort a cada costat, perquè
el cos topa a 155px. El nostre topa a 1400px d'amplada útil, i a 2200 ocupa el 58,5%.

Per sota de 48rem no hi ha sobrant per repartir: el text ja omple la línia i la foto
quedaria una tira de dos dits. Allà les línies tornen a ser blocs i les fotos, bandes
senceres.

### La capçalera

Va enganxada (`position: sticky`) i es compacta en baixar: es queda el logo i el vúmetre.
Tres coses que val la pena no desfer:

- **El text no s'esborra en compactar, s'amaga visualment.** Si es tragués del DOM,
  l'enllaç del logo i el botó del menú es quedarien sense nom accessible i serien dues
  icones mudes.
- **S'inverteix sobre les seccions fosques** (`data-fons="fosc"`). Sense això, en creuar
  el gairebé negre la tinta hi desapareixeria. Ho detecta un observador amb una franja de
  4px al mig de la capçalera; de 4 i no d'1 perquè amb un píxel, una secció que comencés
  al píxel del costat no la tocava mai.
- **L'observador espera el DOMContentLoaded.** El `<script>` viu a la capçalera, que va
  abans de `<main>`: si corre de seguida, les seccions encara no existeixen i no vigila
  ningú.

### L'escena ancorada de les missions

`src/components/Missions.astro`. Les tres frases surten de l'article 2 dels estatuts: les
dues primeres són els fins, la tercera l'activitat d'experimentació.

**No hi ha cap listener d'scroll ni res que segresti el gest.** L'ancoratge és un
contenidor de 300vh amb una escena `sticky` a dins: el navegador fa la feina i l'scroll
segueix sent el de sempre, de manera que el teclat funciona igual. Quina missió toca ho
diu un sentinella per missió, repartits per l'alçada del contenidor; el que creua el mig
de la finestra mana.

Tres coses que val la pena no desfer:

- **Les tres frases són al HTML servit, dins d'un `<ol>`.** Per a un lector de pantalla
  això són tres missions, no una animació.
- **L'ancoratge només s'activa si el script hi posa `.missions--animada`.** Sense JS —o
  amb `prefers-reduced-motion`— les tres missions es veuen apilades i senceres, sense
  contenidor alt ni res enganxat. No es perd res.
- **El tecleig parteix la frase en spans, un per lletra, amb la lletra de debò a dins.**
  L'opacitat no amaga res de l'arbre d'accessibilitat: la frase se segueix llegint
  sencera. Si es reescrivís el text amb JS lletra a lletra, sí que el trencaria.
- **L'`aspect-ratio: auto` de les fotos 2 i 3 no és brossa: no el treguis.** Van amb
  `position: absolute; inset: 0`, que ja els fixa amplada i alçada. Deixar-hi també
  l'aspect-ratio és sobre-restringir la caixa, i cada navegador ho resol diferent:
  Chrome ignora la proporció i Safari l'aplica, deixa la caixa més alta que la imatge i
  hi assoma el fons de `.photo` per sota, com un rectangle. Només la primera el conserva
  —via `var(--ratio)`, que ha de seguir sent responsive— perquè és l'única en flux i qui
  marca l'alçada del bloc.
  En Chrome això no es veu: mesurat, hi dona 0px. Cal mirar-ho en Safari.

### Scroll snap

`scroll-snap-type: y proximity`, i **només enganxen `.declaration`, `.editorial` i
`.band`**: les tres que caben en una pantalla.

La regla és aquesta i no és una preferència: **una secció més alta que la finestra no pot
ser punt d'enganxada**. Té els dos punts tan separats que el navegador t'estira des de
gairebé qualsevol lloc del mig. Mesurat en escriptori amb totes les seccions enganxant:
−254px enmig de la secció fosca i +269px enmig de les set activitats —el contingut amb
més text de la web, i no t'hi podies aturar a llegir. Amb `mandatory` passa el mateix,
només que abans (−327px mesurats). Limitant-ho a les tres curtes, la desviació al 25% i
al 50% de les llargues és 0.

`scroll-padding-top: var(--header-h)` descompta la capçalera enganxada: sense això, la
secció encaixaria amb la vora amagada sota el logo. També val per als enllaços amb àncora
de les set activitats.

Si algun dia es vol enganxar-ho tot, primer cal que cada secció càpiga en una pantalla.
No n'hi ha prou d'afegir-hi la línia.

Les fletxes de la secció 3 porten a les àncores que Astro genera als encapçalaments de
`serveis.md`. **Si allà es canvia un títol, cal actualitzar l'`href` a
`src/pages/index.astro`**: l'àncora es trencaria en silenci. Una fletxa que no va enlloc
és una mentida, i per això les files enllacen de debò.

### Què s'ha agafat de New Form i què no

Agafat: els titulars monumentals partits per bandes de foto, les microetiquetes en
versaletes, la banda d'accent abans del peu, l'arc que fa el pas del paper al negre, el
rètol vertical d'scroll, el correu a cos de titular al peu i el joc serif/píxel de la
frase de tancament.

No agafat, i a consciència: **l'scroll ancorat**. La seva home fa 13,4 pantalles perquè
són escenes fixades on els titulars es van teclejant i el diagrama es construeix sol
mentre baixes. Els va bé perquè tenen sis frases de contingut i molt pressupost d'atenció;
Los Kaplan té set activitats i uns estatuts que explicar, i segrestar l'scroll per
dosificar-los faria la web més lenta de llegir i pitjor per a qui navega amb teclat. En
lloc d'això, les seccions es revelen en entrar a pantalla (`.reveal`, a `Base.astro`):
sense segrestar res, i amb `prefers-reduced-motion` no es mou res. El CSS només amaga una
secció si abans un script en línia ha marcat `.js` a l'arrel, de manera que si el
JavaScript no arriba, tot es veu igual.

Tampoc no hi són dues seccions seves per una raó més simple: **no en tenim el contingut**.
El seu portafolio necessita empreses participades i la seva banda de xifres necessita
mètriques. Los Kaplan no té projectes —aquella secció es va treure— ni dades. Inventar-les
seria mentir.

Totes les combinacions de text compleixen el contrast WCAG AA; la més justa és el text
auxiliar (`--ink-soft` sobre `--paper`), a 6,46:1.

[`design/tailwind-theme.css`](design/tailwind-theme.css) té el sistema en format Tailwind
v4, per si es fa una altra peça —la landing d'un festival, un panell intern— que hagi de
mantenir la mateixa veu. La web no fa servir Tailwind: va amb CSS pla i variables.

### Les tres tipografies

Totes autoallotjades a `public/fonts/` (136 kB en total): cap petició a un servidor extern
i cap problema de RGPD.

| Cara                                                                   | Ús                            | Substitueix                |
| ---------------------------------------------------------------------- | ----------------------------- | -------------------------- |
| [Switzer](https://www.fontshare.com/fonts/switzer)                     | Tot: nav, cos, titulars       | TWK Lausanne (de pagament) |
| [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) | La paraula «art»              | Editorial New (de pagament) |
| [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans)       | La paraula «tecnologia»       | PP Mondwest (de pagament)  |

Les dues últimes surten **només** a la frase de tancament de la portada, i el motiu és
l'única idea que val la pena explicar d'aquesta web. A New Form, el titular final diu
«Bridging the Old and the New»: *the Old* va en una serif clàssica i *the New* en una
cara pixelada. La tipografia representa la frase.

Aquí la frase és «Pensem la cruïlla entre l'art i la tecnologia», que és literalment la
missió dels estatuts: **art** en serif, **tecnologia** en píxels. Si algun dia es canvia
aquest text, o es manté el joc o es treuen les dues cares: soles, sense la frase que les
justifica, són decoració.

Switzer dibuixa el punt volat amb un avanç de 0,572 em —tant com una «o»—, i el webfont
no porta la funció OpenType `locl`, de manera que «col·laboració» es llegiria
«col · laboració». `src/styles/fonts.css` desvia només aquest caràcter a una tipografia
del sistema.

## Fonts documentals

`assets/` conté els originals: els estatuts (`Estatutsv2.pdf`), d'on surten tots els
textos, i el logotip a mida completa. Les versions del logo que fa servir la web són a
`public/`, generades a partir de l'original.
