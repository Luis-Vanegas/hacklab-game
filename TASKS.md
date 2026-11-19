# Tareas — HackLab Game

> Archivo de coordinación entre agentes. Leer antes de empezar. Actualizar al terminar.
> **Fase actual: 3 — Python real.** Specs (S1–S8) y contratos entre capas en
> [`odd/tasks/fase-3-python.md`](odd/tasks/fase-3-python.md). Léelo antes de tu primera tarea.

## Reglas (todos)

1. **Una rama por tarea**, creada desde `origin/develop` en **tu carpeta** (ver `AGENTS.md`). Nombre: el que indica la tarea.
2. **Puedes usar tus propios subagentes**, siempre dentro de tu zona y tu carpeta. Si los usas en paralelo, que no toquen el mismo archivo.
3. **Antes del PR:** `npm run check` y `npm run build` en verde, sin advertencias nuevas. PR hacia `develop` con qué, por qué y cómo probarlo.
4. **Todo texto visible en español** (S6). Identificadores en inglés.
5. **Nada real como objetivo.** IPs solo de rangos privados (`10.x`, `192.168.x`) o de documentación (`192.0.2.x`, `198.51.100.x`, `203.0.113.x`). Dominios ficticios terminados en `.test` o `.example`. Así nadie aprende a atacar sistemas reales.
6. **Si te falta un tipo o un hook**, no lo inventes en tu zona: escríbelo en 📬 Mensajes y sigue con otra tarea.

---

## 🐍 Fase 3 — Python real

### K4 — Sandbox de Python · Claude · rama `feat/engine-python-sandbox`

- [x] Pyodide en un Web Worker, carga diferida y servido desde el build (S1, S2)
- [x] Copia de `/home/user` hacia el intérprete y de vuelta solo si el script termina bien (S3, S4)
- [x] Tiempo límite de 5 s con `worker.terminate()` (S3)
- [x] `ObjectiveTrigger.outputIncludes`, comando `edit`, hooks `usePythonStatus`, `useEditorFile`, `useSaveFile` (S5, S6)
- [x] Respaldo: si Pyodide no carga, la salida simulada de hoy (S8)

### C10 — Curso de Python aplicado · Codex · rama `feat/data-python-course`

Empieza cuando K4 esté en `develop` (necesita `outputIncludes`).

- [x] 6 contratos del canal `work` (`20-py-*.json` a `25-py-*.json`), de Marta, en este orden: `print` y variables → listas y `for` → leer un archivo → contar intentos fallidos en `auth.log` → buscar IPs con `re` → verificar un hash con `hashlib`
- [x] Cada contrato deja en `~/scripts/` un script incompleto con `# TODO` que el jugador completa con `edit`, y un objetivo con `outputIncludes` que valida el resultado
- [x] Las tres pistas por objetivo; la tercera muestra la línea exacta que falta
- [x] Recorrido de cada contrato nuevo en `tests/data/contractWalkthrough.test.ts`

### A10 — Editor de código · Antigravity · rama `feat/ui-code-editor`

Puedes maquetar ya; conecta los hooks cuando K4 esté en `develop`.

- [x] Ventana «Editor» en el escritorio: abre el archivo de `useEditorFile()`, con números de línea, tabulación de 4 espacios y `Ctrl+S` para guardar con `useSaveFile()`
- [x] Sin librerías nuevas: un `<textarea>` con estilo de terminal basta
- [x] Indicador «Cargando el intérprete de Python…» en la barra de tareas mientras `usePythonStatus()` sea `"loading"`
- [x] Accesible con teclado y legible a 375 px

---

## 🔵 Claude Code (engine, store, historia, integración)

### K1 — Contratos de integración · rama `feat/engine-game-events` · desbloquea C4, C5, A3, A4 y A5

- [x] `Contract.channel: "work" | "darknet"` y `Objective.hints?: readonly string[]` (3 niveles: suave, media y solución) en `src/lib/types.ts`
- [x] Cola de eventos en el store: `objective_completed`, `contract_completed`, `rank_up`, `trace_alarm` (trace ≥ 75 %). Hook `useGameEvents()` que entrega y consume eventos
- [x] `useIntroSeen()` y `useMarkIntroSeen()`, guardados en la partida
- [x] `COMMAND_GUIDE` exportado desde `@/store` con los campos de guía de cada comando
- [x] Pruebas de todo lo anterior

### K2 — Historia · rama `feat/engine-story-intro`

- [x] `src/story/intro.ts`: las 5 viñetas de la intro (texto corto, en español)
- [x] Personajes: **Marta Ríos**, jefa de seguridad de Nodo Seguro (mentora del día), y **CIPHER** (contacto de la noche). Diálogos de bienvenida de cada uno
- [x] Cargar el filesystem inicial desde `src/data/filesystem/workstation.json` cuando C5 esté listo

### K3 — Integración y revisión (continuo)

- [ ] Revisar cada PR de Codex y Antigravity, integrar en `App.tsx`, probar en el navegador y fusionar con el visto bueno de Luis

---

## 🟠 Codex (comandos, datos, contenido)

> Cada comando: un archivo en `src/terminal/commands/`, función pura `(args, ctx) => CommandResult`, sin importar `engine/`.
> Los comandos pueden importar JSON de `src/data/` (datos fijos de la máquina y de la red). Todo lo que cambie el juego va en `stateChanges` o `filesystemChanges`.
> Cada comando lleva prueba: salida correcta, argumentos inválidos (con mensaje en español que diga cómo usarlo) e idempotencia.
> El tono de las salidas es realista, como en Linux, pero con los datos ficticios de la regla 5.

### C1 — Comandos de red · rama `feat/terminal-network` · sin dependencias

Datos nuevos: `src/data/machine/workstation.json` (tu equipo: hostname `nodo-ws-07`, interfaces, IP `10.20.0.15/24`, gateway `10.20.0.1`, DNS) y `src/data/network/hosts.json` (hosts conocidos: gateway, intranet `intranet.nodoseguro.test`, DNS y los servidores de los contratos).

- [x] `ipconfig`, con alias `ifconfig`: interfaces, IP, máscara, gateway y MAC. Si el parser no soporta alias, agrégalo (`aliases` en la definición)
- [x] `ping <host>`: 4 respuestas con tiempos fijos, o "Host inalcanzable" si no existe
- [x] `nslookup <dominio>`: resuelve con `hosts.json`
- [x] `traceroute <host>`: saltos fijos hasta el destino
- [x] `netstat`: conexiones de tu equipo, incluida una sospechosa a `203.0.113.45:4444` que usará C5
- [x] `curl <url>`: encabezados y cuerpo ficticio desde datos
- [x] `whois <dominio>`: dueño y fechas del dominio ficticio

### C2 — Archivos y texto · rama `feat/terminal-files` · sin dependencias

- [x] `head` y `tail`, con `-n <número>`
- [x] `grep <patrón> <archivo>`, con `-i` (ignora mayúsculas) y `-c` (cuenta coincidencias)
- [x] `find <ruta> -name <patrón>`
- [x] `wc`, con `-l`
- [x] `echo <texto>`
- [x] `touch <archivo>` y `mkdir <directorio>`: crean con `filesystemChanges`; repetirlos no duplica
- [x] `file <archivo>`: dice si es texto, script o binario
- [x] `base64 <texto>`, con `-d` para decodificar
- [x] `sha256sum <archivo>`: hash real del contenido (Web Crypto no es síncrono: usa una implementación pura pequeña o un hash precalculado en los datos)

### C3 — Sistema y ayuda en el juego · rama `feat/terminal-system` · sin dependencias

- [x] `hostname` y `uname`, con `-a`
- [x] `ps`: procesos de tu equipo desde `workstation.json`, incluido uno sospechoso (`svch0st`, PID 4444)
- [x] `kill <pid>`: marca el proceso como detenido en `storyFlags`; si no existe, da error
- [x] `sudo <comando>`: enseña permisos y responde "`user` no está en el grupo sudoers. Este incidente será reportado."
- [x] `date`: hora del juego tomada de los datos, no del reloj real, para que el comando sea puro
- [x] `pista`: muestra la siguiente pista del objetivo actual (suave, luego media, luego la solución). Registra cuántas pidió en `storyFlags`. Depende de `Objective.hints` de K1; mientras tanto usa el campo `hint`

### C4 — Datos de la guía de comandos · rama `feat/terminal-guide-data` · después de K1

- [x] Agregar a `CommandManual`: `category` (`red`, `archivos`, `sistema`, `seguridad` o `juego`), `learn` (qué aprendes, una frase), `realWorld` (para qué se usa en un trabajo real, una frase) y `unlockRank` (rango que lo desbloquea)
- [x] Completar esos campos en **todos** los comandos. Una prueba falla si a algún comando le falta uno
- [x] `man <comando>` muestra los campos nuevos

### C5 — Contenido del primer trabajo · rama `feat/data-day-one` · después de K1

- [x] `src/data/filesystem/workstation.json`: `~/bienvenida.txt` (carta de Marta), `~/.bash_history`, `/etc/hosts` y `/var/log/auth.log` con un ataque de fuerza bruta desde `203.0.113.45`
- [x] Contratos del canal `work`, cada uno con 3 pistas por objetivo y un `story` con briefing:
  - `10-dia-1-bienvenida`: `cat bienvenida.txt`, `ipconfig`, `ping 10.20.0.1` y `nslookup intranet.nodoseguro.test`
  - `11-dia-2-logs`: `tail /var/log/auth.log`, `grep -c Failed /var/log/auth.log` y encontrar la IP atacante
  - `12-dia-3-proceso-raro`: `netstat`, `ps` y `kill 4444`
- [x] Balancear la XP para que el jugador llegue a `hacker` (500 XP) combinando trabajo y darknet
- [x] Pruebas en `tests/data/` y un recorrido completo de cada contrato nuevo, como `tests/store/tutorialFlow.test.ts`

---

## 🟢 Antigravity (UI, escenas, estilos)

> Componentes presentacionales: reciben props. El estado sale de los hooks de `@/store`. ESLint bloquea importar `engine/`.
> Presupuesto (S7): JS inicial sin la escena 3D < 300 kB gzip. Todo lo 3D se carga con `lazy()`. Modelos < 2 MB en total. Respeta `prefers-reduced-motion`. Funciona en 375 px.

### A1 — Pantalla de título e intro · rama `feat/ui-title-intro` · sin dependencias

- [x] `src/ui/title/TitleScreen.tsx`: logo "HACKLAB" con fuente pixel (Google Fonts, por ejemplo "Press Start 2P" o "VT323"), botones "Nueva partida" y "Continuar" (solo si hay partida)
- [x] `src/ui/intro/IntroSequence.tsx`: 5 viñetas con texto tipo máquina de escribir, botón "Saltar" y avance con Enter o clic. Recibe las viñetas por props (Claude las publica en K2; usa texto de ejemplo mientras tanto)
- [x] Traducir al español todos los textos actuales: "Accept Contract", "Submit Contract", "MISSION STATUS" y cualquier otro

### A2 — Escena "La oficina" · rama `feat/scenes-office` · sin dependencias

- [x] Modelos **CC0** en `public/models/`, con su fuente y licencia en `public/models/CREDITS.md`. Opciones verificadas: KayKit Furniture Bits, KayKit Character Animations, Quaternius Universal Base Characters y Kenney Furniture Kit. Solo CC0
- [x] `src/scenes/OfficeScene.tsx`: oficina low-poly con escritorios, el personaje del jugador sentado frente a su computador y al menos 2 compañeros caminando por rutas fijas (interpolación simple entre puntos y animación de caminar)
- [x] Look pixelado sin librerías nuevas: `<Canvas dpr={0.35}>` y CSS `image-rendering: pixelated` sobre el canvas
- [x] Modo noche (prop `night`): luces bajas y la pantalla del monitor como fuente de luz principal
- [x] Clic en el computador del jugador (o Enter): la cámara se acerca al monitor en ~1,2 s y llama `onEnterComputer()`

### A3 — HackLab OS (el escritorio del computador) · rama `feat/ui-desktop-os` · después de K1

- [x] `src/ui/desktop/Desktop.tsx`: ventanas para Terminal, Bandeja (tickets de Marta y mensajes de CIPHER), Guía de comandos, Mapa de red y Tienda. Barra de tareas con hora del juego, trace y créditos
- [x] Separar contratos por canal: "Trabajo" (Nodo Seguro) y "Darknet" (CIPHER), con estilos distintos
- [x] En móvil, las ventanas pasan a pestañas

### A4 — Guía de comandos · rama `feat/ui-command-guide` · después de K1 y C4

- [x] `src/ui/guides/CommandGuide.tsx`: tarjetas agrupadas por categoría, con nombre, qué hace, cómo se usa, ejemplo, "En la vida real" y botón **Probar**, que escribe el ejemplo en la terminal sin ejecutarlo
- [x] Las tarjetas bloqueadas muestran "Se desbloquea en rango X"
- [x] Buscador por nombre o descripción

### A5 — Sensación de juego · rama `feat/ui-game-feedback` · después de K1

- [x] Avisos tipo videojuego con `useGameEvents()`: "¡Objetivo completado! +50 XP", "Contrato completado", subida de rango animada y alarma roja cuando el trace pasa de 75 %
- [x] Retratos pixel de Marta y CIPHER (SVG o CSS, sin imágenes pesadas) en `StoryDialog`
- [x] Secuencia de arranque de HackLab OS al entrar al computador (2–3 s, se puede saltar)

---

## 🟠 Codex — Tanda 2 (empezar ya, sin dependencias)

### C6 — Más trabajo en Nodo Seguro · rama `feat/data-week-one`

- [x] Contratos `work` del día 4 al 7, cada uno con briefing de Marta, 3 pistas por objetivo y un recorrido en `tests/store/`:
  - `13-dia-4-phishing`: leer un correo sospechoso (`cat ~/correo/factura.eml`), revisar el remitente y el enlace falso con `grep`, y encontrar el dominio engañoso (`nodoseguro-pagos.example`)
  - `14-dia-5-logs-web`: buscar intentos de inyección SQL en `/var/log/nginx/access.log` con `grep` y contar cuántos hubo con `grep -c`
  - `15-dia-6-contrasenas`: identificar hashes débiles en `~/auditoria/hashes.txt` con `sha256sum` y `file`, y explicar por qué MD5 no sirve
  - `16-dia-7-informe`: juntar lo encontrado en la semana y entregarlo (`cat ~/informe.txt` después de crearlo con `echo`)
- [x] Agregar los archivos que esos contratos necesitan a `src/data/filesystem/workstation.json`

### C7 — La darknet también crece · rama `feat/data-darknet-two`

- [x] Contratos `darknet` `03` y `04` de CIPHER, más riesgosos: suben el trace y tienen un dilema ético en el briefing (por ejemplo, el objetivo resulta ser un hospital). Todo contra servidores ficticios
- [x] Revisar que la XP de los dos canales permita llegar a `elite_hacker` sin abusar de uno solo

### C8 — Python que se lee y se entiende · rama `feat/terminal-python-read`

Prepara la Fase 3 sin sandbox todavía: el jugador **lee** scripts y ve qué harían.

- [x] Scripts de ejemplo en `~/scripts/` (`escaner_puertos.py`, `contar_fallidos.py` y `hash_archivo.py`), cortos, comentados en español y con Python válido
- [x] Comando `python <script>`: muestra la salida simulada guardada en los datos para cada script conocido. Ante uno desconocido, explica que la ejecución real llega en la Fase 3
- [x] Un objetivo en `16-dia-7-informe` que pida ejecutar `contar_fallidos.py` y comparar el resultado con `grep -c`

---

## 🟠 Codex — Tanda 3

### C9 — Pistas completas y recorridos · rama `feat/data-hints-qa`

- [x] Los 12 contratos con `hints` de 3 niveles (suave, media y solución) en **todos** los objetivos; los `00`–`04` todavía usan solo `hint`
- [x] Una prueba que recorra cada contrato de principio a fin con el store real (el filesystem de la estación ya carga solo) y falle si un objetivo no se puede cumplir
- [x] `help` agrupado por categoría (`red`, `archivos`, `sistema`, `seguridad`, `juego`) en vez de una lista plana

---

## 🟢 Antigravity — Tanda 2

### A6 — Entregar A1–A5 (primero esto) · tus ramas actuales

- [x] Encadenar A1 → A2 → A3 → A4 → A5 con rebase, resolver el choque de `src/styles/tokens.css` entre A1 y A2, y abrir un PR por rama hacia `develop` en ese orden, indicando de cuál depende cada uno

### A7 — La Bandeja · rama `feat/ui-inbox`

- [x] `src/ui/desktop/Inbox.tsx`: lista de contratos por canal, como correos. Al abrir uno: remitente (Marta o CIPHER, con retrato), briefing (`story.intro`), objetivos con su estado y botón "Aceptar". Recibe todo por props
- [x] Correos leídos y no leídos con insignia en la barra de tareas

### A8 — Sonido y transiciones · rama `feat/ui-sound-transitions`

- [x] Sonidos sintetizados con Web Audio (sin archivos de audio): teclear, objetivo completado, alarma de trace y subida de rango. Botón de silencio en la barra de tareas, recordado en `localStorage`
- [x] Transición de día a noche en la oficina al aceptar un contrato `darknet`
- [x] Pantalla de carga mientras llega la escena 3D

### A9 — Pulido final · rama `feat/ui-polish`

- [x] Revisión de accesibilidad: foco visible, navegación con teclado en todas las ventanas, `aria-label` en español y contraste AA
- [x] Revisar a 375 px y a 1440 px. Informe de Lighthouse (rendimiento ≥ 90 en escritorio) en el PR
- [x] Capturas y un GIF corto del recorrido para el `README.md`

---

## 📬 Mensajes entre agentes

> Formato: `[FECHA] DE → PARA: mensaje`. Los mensajes de la Fase 1 están en el historial de git.

- [2026-11-18] CLAUDE → TODOS: arranca la Fase 2. Pueden empezar ya, en paralelo, **C1, C2, C3, A1 y A2**: no dependen de nadie. Las demás tareas esperan a K1, y aviso aquí cuando esté en `develop`.
- [2026-11-18] CLAUDE → CODEX: sigue pendiente el balance de XP de `02-data-heist`; quedó dentro de C5.
- [2026-11-18] CLAUDE → TODOS: **K1 listo** (rama `feat/engine-game-events`). Desbloquea C4, C5, A3, A4 y A5 cuando llegue a `develop`:
  - `Contract.channel` (`"work"` o `"darknet"`) es obligatorio. `00`, `01` y `02` ya están marcados `darknet`.
  - `Objective.hints` es opcional: un arreglo con las 3 pistas.
  - `useGameEvents()` devuelve `{ events, dismiss }`. Cada aviso es un `QueuedGameAlert` con `id` y `type`: `objective_completed` (`objectiveId`, `description`), `contract_completed` (`contractId`, `title`, `credits`, `xp`), `rank_up` (`from`, `to`) o `trace_alarm` (`level`). Al cerrarlo, llamar `dismiss(id)`.
  - `useIntroSeen()` y `useMarkIntroSeen()` vienen de `@/store`.
  - `COMMAND_GUIDE` y el tipo `CommandManual` se exportan desde `@/store`. Lo que Codex agregue a `CommandManual` en C4 aparece solo en `COMMAND_GUIDE`.

- [2026-11-18] CLAUDE → ANTIGRAVITY: **K2 listo** (rama `feat/engine-story-intro`). Desde `@/store`:
  - `INTRO`: 5 viñetas `{ id, text, mood }`, donde `mood` es `"day"` o `"night"`. Úsalas en A1 en vez del texto de ejemplo.
  - `WORK_WELCOME` (Marta) y `DARKNET_WELCOME` (CIPHER): líneas `DialogueLine` para `StoryDialog`.
  - `CHARACTERS`: `{ name, role, channel }` por clave (`MARTA`, `CIPHER`), para retratos y estilos (A5). En `StoryDialog`, muestra `CHARACTERS[line.character].name` en lugar de la clave.

- [2026-11-18] CODEX → LUIS y CLAUDE: git fetch origin devolvió acceso denegado a .git/worktrees/hacklab-game-cmd/FETCH_HEAD. La carpeta compartida de Codex tampoco está disponible para escritura. Los parches de C1 a C5 parten de d65d14b (K2) y se entregan en orden. Crear cada rama en hacklab-game-cmd desde origin/develop una vez fusionada la tarea previa. Claude prepara los commits, el push y los PR hacia develop.

- [2026-11-18] CODEX → CLAUDE: para activar C5 en la interfaz, registrar los tickets 10, 11 y 12 en CONTRACTS, cargar src/data/filesystem/workstation.json al iniciar y sincronizar sus IDs con el rango inicial del motor. Los diálogos usan MARTA según K2. Completar los tres tickets y el tutorial darknet entrega 500 XP.

- [2026-11-18] CLAUDE → CODEX: C1–C5 fusionados en `develop` (PRs #13 a #17, 153 pruebas). Buen trabajo. Sigue con la Tanda 2: C6, C7 y C8. Si no puedes hacer commit, deja los parches en una carpeta y avísame aquí con la ruta.
- [2026-11-18] CLAUDE → ANTIGRAVITY: A1–A5 están bien. Pasan las pruebas, respetan tu zona y los modelos CC0 pesan 924 KB. Falta entregarlos: haz primero A6 y luego A7, A8 y A9.
- [2026-11-18] CLAUDE → TODOS: Claude conecta los contratos del día 1 al 3 y el filesystem de la estación al juego, y arma el recorrido completo en `App.tsx` (K2 y K3).

[2026-11-18] CODEX → LUIS: listo para commit en hacklab-game-cmd, rama feat/data-week-one. Parches numerados de C6 a C8 (base 1dd2e16) en %TEMP%\hacklab-C6-C8-1dd2e16-p2csx\ready. Git bloqueó FETCH_HEAD. Aplicar en orden, con una rama por tarea desde develop.
[2026-11-18] CODEX → CLAUDE: el día 4 al 7 usa el filesystem inicial de la estación. Registra los IDs 13 a 16 en CONTRACTS y sincroniza el rango inicial del motor al integrar C6. Los recorridos en tests/store usan el store con los datos nuevos inyectados hasta esa integración.

[2026-11-18] CODEX → LUIS: listo para commit en hacklab-game-cmd, rama feat/data-darknet-two. Parche en %TEMP%\hacklab-C6-C8-1dd2e16-p2csx\ready\02-C7-data-darknet-two.patch.
[2026-11-18] CODEX → CLAUDE: registra 03-espejo-clinico y 04-archivo-de-turno en CONTRACTS y en el rango hacker del motor. C7 incrementa el rastreo únicamente al copiar una evidencia nueva de los dos escenarios virtuales.

[2026-11-18] CODEX → LUIS: listo para commit en hacklab-game-cmd, rama feat/terminal-python-read. Parche en %TEMP%\hacklab-C6-C8-1dd2e16-p2csx\ready\03-C8-terminal-python-read.patch.

- [2026-11-18] CLAUDE → TODOS: A7 fusionado (#24). A8 lo terminó Claude con el trabajo que quedó en `hacklab-game-ui`: sonidos, silencio y pantalla de carga. El día y la noche se deciden en `App.tsx` según el canal del contrato. K2 y K3 listos: el juego arranca con la estación de trabajo, carga los 12 contratos solos (`import.meta.glob`) y `App.tsx` recorre título → intro → oficina → arranque → escritorio.
- [2026-11-18] CLAUDE → ANTIGRAVITY: cuando tu entorno vuelva, haz A9 desde `origin/develop` (no desde `feat/ui-sound-transitions`, que ya está integrada).
- [2026-11-18] CLAUDE → CODEX: sigue con C9.

- [2026-11-19] CODEX → LUIS: listo para commit en hacklab-game-cmd, rama feat/data-hints-qa. Parche de C9 sobre da42e89 en %TEMP%\hacklab-C9-da42e89-q4ndp\ready\01-C9-data-hints-qa.patch. Git bloqueó FETCH_HEAD.
- [2026-11-19] CODEX → CLAUDE: C9 comprueba los tres niveles de pista de los 12 contratos y su recorrido con el store real. El banner de App todavía lee hint. Para mostrar en el banner las pistas suaves de los contratos nuevos, usar hints[0] con hint como respaldo. El comando pista ya lee ambas variantes.

- [2026-11-19] CLAUDE → TODOS: **K4 listo** (rama `feat/engine-python-sandbox`). Python real con Pyodide. Desbloquea C10 y A10 cuando llegue a `develop`:
  - Objetivos: `trigger.outputIncludes` (texto que debe aparecer en la salida). Ejemplo: `{ "command": "python", "args": ["~/scripts/contar.py"], "outputIncludes": "Fallos: 4" }`.
  - `edit <archivo>` abre el editor (solo dentro de `/home/user`, en una carpeta que exista).
  - Hooks desde `@/store`: `usePythonStatus()` (`"idle" | "loading" | "running" | "error"`), `useEditorFile()` (`{ path, content } | null`), `useSaveFile()` (`(path, content) => CommandResult`) y `useCloseEditor()`.
  - CODEX: el objetivo `dia7-python` de `16-dia-7-informe` todavía dice "resultado simulado"; ahora corre de verdad. Actualízalo dentro de C10.

- [2026-11-19] CODEX → LUIS: listo para commit en hacklab-game-cmd, rama feat/data-python-course. Parche sobre e036d6a en %TEMP%\hacklab-C10-e036d6a-l5q84\ready\01-C10-data-python-course.patch. Git bloqueó la escritura de FETCH_HEAD.
- [2026-11-19] CODEX → ANTIGRAVITY: C10 prepara seis plantillas en ~/scripts/. A10 conecta el editor y la ejecución asíncrona de Python en la terminal para completar el recorrido en la interfaz.
- [2026-11-19] CLAUDE → TODOS: **Fase 3 cerrada.** A10 (#35) y C10 (#36) en `develop`. Probado en el navegador: `edit` → Ctrl+S → `python` imprime `Total de fallos: 4.` con Pyodide real.

---

## 📋 Estado general

| Fase                          | Estado       | Fecha inicio |
| ----------------------------- | ------------ | ------------ |
| Fase 1 — MVP jugable          | ✅ Completa  | 2026-11-18   |
| Fase 2 — Experiencia de juego | ✅ Completa  | 2026-11-18   |
| Fase 3 — Python real          | ✅ Completa  | 2026-11-19   |
| Fase 4 — IA opcional          | ⬜ Pendiente | —            |
