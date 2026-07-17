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

Cada fitxer té una capçalera amb quatre camps:

- `title` — nom curt, surt al menú i a la pestanya del navegador.
- `heading` — el titular gran de la pàgina.
- `description` — **només** per a Google i per compartir a xarxes. No es veu mai a la
  pàgina.
- `lede` — l'entradeta sota el titular. És opcional: `serveis.md` no en porta perquè el
  seu titular ja ho diu tot, i repetir-ho a sota seria dir dues vegades el mateix.

Els dos últims eren el mateix camp, i això obligava a triar entre un bon text per a Google
i un bon text per a la pàgina.

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

El script passa la foto a monocrom amb un gris **càlid** —`{95, 92, 87}`, una crominància
de ~7 sobre 255— i la retalla a la mida on es veu de debò. El sesgo càlid és a posta: fred,
les fotos xocarien amb el paper; més calent, viraria a sèpia. Si afegeixes una foto nova,
defineix-ne la mida a `TARGETS` dins [`scripts/fotos.mjs`](scripts/fotos.mjs); si no,
l'omet i t'avisa.

Les tres fotos de les missions van a part: duen un **sostre de 116**, que és el gris més
clar sobre el qual el text blanc del titular encara hi dona 4,5:1. El script el comprova a
cada foto i avisa si el passa. Si algun dia se n'hi posa una de nova, cal afegir-la a
`FOSQUES` o el titular s'hi perdrà a sobre. La resta de fotos no en duen: no hi va cap text
al damunt.

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

- **Correu de contacte.** `src/config.ts` ja té `hola@loskaplan.org`, però la bústia encara
  s'ha de crear a IONOS. Fins llavors, el `mailto:` de contacte no arriba enlloc.
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

| #   | Secció            | Fons  | Què és                                                              |
| --- | ----------------- | ----- | ------------------------------------------------------------------- |
| 1   | Hero broadsheet   | paper | Titular en 4 línies, cada una justificada per una foto               |
| 2   | Les tres missions | fosc  | Escena ancorada: tres frases que es teclegen, retrat i bloc de crida |
| 3   | Els tres fins     | paper | El diagrama de Venn de l'article 2                                   |
| 4   | Declaració        | groc  | «La cultura de sempre» en serif, «amb les eines d'ara» en píxels     |
|     | Peu               | fosc  | El correu a cos de titular                                           |

L'ordre alterna paper i fosc a propòsit: és el ritme que fa que les seccions es
llegeixin com a capítols i no com una llista.

La portada n'havia tingut set. Les set línies d'activitat van baixar a
[`/serveis`](src/pages/serveis.astro) —allà **són** el contingut de la pàgina, no un índex
cap a ella— i la cruïlla a [`/qui-som`](src/pages/qui-som.astro), on el titular ja diu
«Una entitat per pensar la cruïlla entre art i tecnologia» i la frase hi és a casa. La
declaració, que anava en negre, s'ha quedat i ara fa de banda d'accent: és la franja groga
que ancora el peu. Hi havia una banda a part amb un botó «Escriu-nos» i sobrava —el correu
a cos de titular del peu, just a sota, ja és la mateixa crida dita millor.

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
- **L'àrea que toca el dit no és la del dibuix.** El botó del menú, compactat, es queda
  amb el vúmetre sol: 15×22px, quan el mínim per a un dit són 44×44. Els creix un
  `padding` i un `margin` negatiu els torna a treure del flux, de manera que la zona
  sensible és més gran però el logo i el vúmetre no es mouen ni un píxel. Si algun dia es
  toca el `padding`, cal tocar el `margin` igual o es descuadra la capçalera.

### El menú

Un `<dialog>` amb `showModal()`: la trampa de focus, l'Escape, el fons inert i el retorn
del focus els fa el navegador. El panell entra per l'esquerra, el fons s'enfosqueix i els
enllaços pugen escalonats.

- **L'animació va amb `allow-discrete` i `@starting-style`.** No és caprici: en tancar un
  `<dialog>` el navegador li treu l'`[open]` i el desenganxa de la capa superior al mateix
  instant, i sense això la sortida no s'arriba a veure mai. Qui no ho entengui el veurà
  aparèixer de cop, que és el que feia abans.
- **El retard de cada enllaç surt d'un `--i` que posa la plantilla**, no d'un
  `:nth-child`. Els enllaços surten de `site.nav`: si algun dia n'hi ha un més, s'escalona
  sol. En tancar, el retard desapareix i marxen tots alhora —un tancament escalonat es
  percep com a lentitud, no com a gràcia.
- **Amb el menú obert, la capçalera de la pàgina s'amaga.** S'hi veia a través del fons, i
  el diàleg ja porta la seva barra: hi havia dos logos a la mateixa coordenada i el «Menú»
  queia damunt del «Tanca». Ho decideix l'`[open]` del diàleg amb `:has()` i no una classe
  posada des del JS, que seria una segona font de veritat i es desincronitzaria el dia que
  es tanqui amb Escape.

### L'escena ancorada de les missions

`src/components/Missions.astro`. Les tres frases surten de l'article 2 dels estatuts: les
dues primeres són els fins, la tercera l'activitat d'experimentació.

**No hi ha cap listener d'scroll ni res que segresti el gest.** L'ancoratge és un
contenidor alt amb una escena `sticky` a dins: el navegador fa la feina i l'scroll segueix
sent el de sempre, de manera que el teclat funciona igual. Quina missió toca ho diu un
sentinella per missió; el que creua el mig de la finestra mana.

El contenidor fa **300vh a escriptori i 180vh per sota de 60rem**. A mòbil en feia 300 i
eren 2.436px —mitja portada, tres pantalles de swipe per tres frases.

Els sentinelles enrajolen el **tros enganxat**, no el contenidor sencer, i per això el
càlcul viu en variables (`--track`, `--enganxat`, `--pas`) en comptes d'estar picat a mà.
L'escena s'enganxa des que el contenidor toca el capdamunt fins que la seva vora inferior
arriba a l'escena: `--track` menys l'alçada de l'escena, no `--track`. Repartint els 300vh
sencers, la segona missió durava el doble que les altres dues (1/2/1 mesurat).

Tres coses que val la pena no desfer:

- **Les tres frases són al HTML servit, dins d'un `<ol>`.** Per a un lector de pantalla
  això són tres missions, no una animació.
- **L'ancoratge només s'activa si el script hi posa `.missions--animada`.** Sense JS —o
  amb `prefers-reduced-motion`— les tres missions es veuen apilades i senceres, sense
  contenidor alt ni res enganxat. No es perd res.
- **El tecleig parteix la frase en spans, un per lletra, amb la lletra de debò a dins.**
  L'opacitat no amaga res de l'arbre d'accessibilitat: la frase se segueix llegint
  sencera. Si es reescrivís el text amb JS lletra a lletra, sí que el trencaria.
- **Els salts de línia són escrits, no calculats.** Les tres línies de cada frase són
  dades a `Missions.astro`, un element per línia. Abans sortien de posar una mesura de
  19ch i confiar que el text hi caigués just: a Chrome sí, a Safari no —resol el `ch`
  (l'amplada del glif «0») amb una mètrica diferent, la caixa li surt més ampla i dues
  frases es quedaven en dues línies. Tres línies han de ser tres elements. Per sota de
  60rem tornen a ser `inline` i la frase es refon sola.
- **La primera missió no s'encén fins que el bloc entra a pantalla.** Abans s'encenia en
  carregar, amb la secció mil píxels més avall: el tecleig es gastava sencer abans que
  ningú el veiés. La seva foto sí que es posa de seguida —és el primer que entra i, si no,
  es veuria pujar un marc buit.
- **Les tres missions comparteixen cel·la de graella.** Abans només la primera era en flux
  i marcava l'alçada del bloc; la que creixés vessava per sota i es menjava el botó.
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

Avís, perquè la regla enganya: **a la portada no hi ha cap de les tres classes en un lloc
que s'hi pugui arribar.** L'única que hi surt és `.declaration`, i per encaixar-la caldria
un scroll de 4.149px quan el màxim de la pàgina és 4.022 —el seu punt cau més enllà del
final. O sigui que a la portada l'snap no fa res; qui l'utilitza de debò són `/serveis` i
`/qui-som`.

### Què s'ha agafat de New Form i què no

Agafat: els titulars monumentals partits per bandes de foto, les microetiquetes en
versaletes, la banda d'accent abans del peu, l'arc que fa el pas del paper al negre, el
correu a cos de titular al peu i el joc serif/píxel de la frase de tancament.

Agafat, però **una sola vegada**: l'scroll ancorat. La seva home fa 13,4 pantalles perquè
gairebé tot són escenes fixades. Aquí n'hi ha una —les tres missions— i la resta de la
portada baixa normal. La diferència no és estètica: allà tenen sis frases i molt
pressupost d'atenció; Los Kaplan té uns estatuts que explicar, i ancorar-ho tot faria la
web més lenta de llegir. Una escena per a les tres frases que valen la pena, i prou.

I ancorat no vol dir segrestat: no hi ha cap listener d'scroll enlloc. La resta de
seccions només es revelen en entrar a pantalla (`.reveal`, a `Base.astro`), i amb
`prefers-reduced-motion` no es mou res. El CSS només amaga una secció si abans un script
en línia ha marcat `.js` a l'arrel, de manera que si el JavaScript no arriba, tot es veu
igual.

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
| [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) | El que és de sempre           | Editorial New (de pagament) |
| [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans)       | El que és d'ara               | PP Mondwest (de pagament)  |

Les dues últimes surten **només a dos llocs**, i el motiu és l'única idea que val la pena
explicar d'aquesta web. A New Form, el titular final diu «Bridging the Old and the New»:
*the Old* va en una serif clàssica i *the New* en una cara pixelada. La tipografia
representa la frase.

| On                          | La frase                                        | Serif    | Píxels     |
| --------------------------- | ----------------------------------------------- | -------- | ---------- |
| Declaració (portada)        | «La cultura de sempre amb les eines d'ara»       | la meitat vella | la nova |
| La cruïlla (`/qui-som`)     | «Pensem la cruïlla entre l'art i la tecnologia» | art      | tecnologia |

La segona és literalment la missió dels estatuts. Si algun dia es canvia un d'aquests dos
textos, o es manté el joc o es treuen les dues cares: soles, sense la frase que les
justifica, són decoració.

Switzer dibuixa el punt volat amb un avanç de 0,572 em —tant com una «o»—, i el webfont
no porta la funció OpenType `locl`, de manera que «col·laboració» es llegiria
«col · laboració». `src/styles/fonts.css` desvia només aquest caràcter a una tipografia
del sistema.

## Fonts documentals

`assets/` conté els originals: els estatuts (`Estatutsv2.pdf`), d'on surten tots els
textos, i el logotip a mida completa. Les versions del logo que fa servir la web són a
`public/`, generades a partir de l'original.
