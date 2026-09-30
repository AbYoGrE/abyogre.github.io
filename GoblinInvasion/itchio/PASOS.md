# Goblin Invasion en itch.io: pasos para que la página se parezca al portfolio

Archivos de esta carpeta:

| Archivo | Para qué sirve |
|---|---|
| `banner.png` | Logo (Title.png) a 960 px, el ancho máximo de la columna de itch |
| `fondo.png` | preview.png ya oscurecido, desenfocado y con viñeta verde (itch no aplica filtros por sí mismo) |
| `fondo_con_sprites.png` | Igual, pero con la bandera, el goblin y la caja en los laterales, como las decoraciones de la web |
| `descripcion.html` | Todo el texto de la página, ya adaptado al editor de itch |
| `itch.css` | CSS personalizado (ventanas pixel, títulos, botones...) |

---

## 1. Editar el tema: Edit game → Edit theme

Abre tu página del juego y pulsa **Edit theme** en la barra superior.

**Layout**
- Columna centrada (el portfolio tiene el contenido centrado).
- Deja activada la columna de capturas a la derecha: sustituye a la galería.

**Banner**
- Sube `banner.png`. Reemplaza al título de texto, igual que el logo del hero.

**Background**
- Sube `fondo_con_sprites.png` (o `fondo.png` si prefieres un fondo más limpio).
- Position: **Top / Center**. Repeat: **No repeat**.

**Colores** (los mismos valores que en `<body style="...">` de GoblinInvasion/index.html)

| Campo de itch | Valor | Equivalente en la web |
|---|---|---|
| BG (fondo) | `#07140B` | `--bg` |
| BG2 (columna) | `#0A1D10` | `--panel` (sin transparencia) |
| Text | `#E4F5E7` | `--text` |
| Link | `#7DFF8A` | `--accent` |
| Button | `#7DFF8A` | `--accent` (botón Descargar) |

Si el editor tiene un control de opacidad para BG2, bájala a 80–85 % para que se vea el fondo detrás, como en `.pixel-window`.

**Fuentes**
- Header font: **Chakra Petch** si aparece en la lista. Si no, elige una sans cuadrada/técnica (Rajdhani, Oxanium, Exo 2...).
- Body font: **Inter** si aparece. Si no, Lato, Open Sans o parecida.
- Con acceso a CSS (paso 4) no hace falta: el CSS carga Chakra Petch, Inter y Press Start 2P directamente.

Guarda el tema.

## 2. Contenido: Edit game

**Descripción**
1. En el editor de *Description*, pulsa el botón de ver código HTML (`<>` / "Source").
2. Pega el contenido de `descripcion.html`.
3. Vuelve al modo visual y comprueba que se ven los títulos, la lista y las negritas.

Cómo se ha adaptado lo que itch no permite (no hay JavaScript ni clases propias):
- El **slider de pestañas** (Ficha técnica / Estilo de juego / Narrativa / Diseño de niveles) pasa a ser secciones una debajo de otra, cada una con su `<h2>`.
- Las palabras resaltadas (`.hl`) son `<strong>`, y el CSS las pinta verdes.
- Las etiquetas (Solo Dev, Endless Runner 2D, Pixel Art) son `<em>` en el primer párrafo, y el CSS las convierte en chapas negras.
- La cadena de roles es texto con ◆. Sin CSS se lee igual de bien.

**Galería → Screenshots**
- Sube en este orden: `TituloGIF.gif`, `JugarGIF.gif`, `AtacarGIF.gif`, `EmpujarGIF.gif`, `TiendaPNG.png`.
- ⚠️ `JugarGIF.gif` (61 MB) y `TituloGIF.gif` (48 MB) son muy pesados para itch. Si el uploader los rechaza o van lentos, recórtalos o bájales resolución/fps (por ejemplo, con ezgif.com → Optimize / Resize) hasta dejarlos en unos pocos MB.

**Vídeo → Gameplay video or trailer**
- itch solo acepta enlaces de YouTube o Vimeo. Sube `GoblinInvasion_Gameplay.mp4` a YouTube (puede ser *Oculto / Unlisted*) y pega el enlace.

**Cover image**
- Usa `img/preview.png` (itch recomienda 630×500; recórtalo si quieres que la miniatura quede exacta).

**Metadatos (tabla "More information")**, a partir de la Ficha técnica:
- Genre: *Platformer* · Tags: `endless-runner`, `pixel-art`, `2d`, `goblins`, `procedural-generation`, `singleplayer`
- Made with: *Unity* · Platforms: *Windows*
- Inputs: *Keyboard, Mouse, Xbox controller / Gamepad*
- Average session: *A few minutes* · Languages: *Spanish*
- Release status: *Released*

**Enlaces**: en la descripción o en *Links*, añade un enlace de vuelta a tu portfolio (el equivalente al botón "← Portfolio").

## 3. Botón de descarga

El `.zip` que subas en *Uploads* es el que usa el botón **Download** de itch. Una vez esté publicado, puedes poner la URL de la página de itch en el botón "Descargar juego" del portfolio (ahora mismo tiene `href="#"`).

## 4. CSS personalizado (opcional, pero es lo que da el aspecto "pixel window")

itch no da acceso a CSS por defecto:
1. Escribe a **support@itch.io** (o usa itch.io/support) pidiendo *custom CSS* para tu página e indica la URL del juego. Suelen activarlo sin problema.
2. Cuando lo activen, aparecerá una pestaña **CSS** en *Edit theme*. Pega el contenido de `itch.css`.
3. Si algún estilo no se aplica, abre la página con F12 → Inspeccionar y ajusta el selector. Los que usa el CSS son los de la plantilla estándar de itch: `#wrapper`, `.inner_column`, `#header`, `.formatted_description`, `.screenshot_list`, `.button` / `.buy_btn`, `.game_info_panel_widget`.

Lo que añade el CSS:
- Fondo fijo al hacer scroll, como `.game-bg`.
- La columna con borde pixel verde, bisel y sombra, como `.pixel-window`.
- Títulos con cuadrado brillante y línea degradada, como `.section-title`.
- Ficha técnica en dos columnas con etiquetas verdes.
- Botón de descarga con el degradado y la sombra 3D de `.download-btn`.
- Capturas con el borde y el brillo verde al pasar el ratón.

## Lo que no se puede replicar en itch
- Carruseles con autoplay (el slider de info y la galería): no se puede ejecutar JavaScript.
- Animaciones de la bandera y del goblin en los laterales: en `fondo_con_sprites.png` aparecen, pero estáticos.
- Joysticks de navegación y *scroll reveal*.
