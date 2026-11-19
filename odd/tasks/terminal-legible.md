# Terminal legible: nombre, colores de Linux y hallazgos para principiantes

Objetivo: que la terminal se lea como una de Linux, que el jugador ponga su nombre y que los nuevos vean marcadas las pistas importantes.
Rama base: `develop`. Entrega: una rama por tarea, PR a `develop`. Pruebas: Vitest (`npm run check`).

## Specs

- **S1 — Nombre del jugador.** "me gustaría que la persona pueda poner su nombre". Se pide al empezar una partida nueva y reemplaza a `anonymous` en el prompt, la cabecera de la terminal y el escritorio. Se valida como un usuario de Linux: minúsculas, números, `-` y `_`, de 1 a 16 caracteres, empezando por letra. _Supuesto:_ si el campo queda vacío, el juego usa `anonymous`.
- **S2 — Colores de terminal de Linux, siempre.** "la terminal todo sale verde, sería bueno hacer la distinción en la terminal de los comandos y cosas así, para que parezca más a la terminal de linux". "cosas de terminal que van siempre si el color normal que llevan, azul, rojo cuando no es el comando". Texto normal en gris claro, prompt con `usuario@host` en verde, ruta en azul y `$` en blanco, carpetas de `ls` en azul, scripts ejecutables en verde, errores en rojo. Aplica en todas las dificultades: "la regla aquí es que se siga viendo de color, como en una terminal".
- **S3 — Hallazgos marcados para principiantes.** "para los principiantes es mostrarles con un color, cosas que les ayuden a entender que hay un problema, ejemplo, hizo un escaneo pero debe leer y ver, como es nuevo no va entender que encontró una vulnerabilidad, entonces la cosa es como marca esas pistas, y cuando ponga el mouse o ponerlo a un lado que significa". Un color propio (amarillo subrayado) que no use la terminal; al pasar el mouse, un recuadro con la explicación; la misma explicación en un panel lateral «Hallazgos» (accesible sin mouse).
- **S4 — Las marcas se quitan al avanzar.** "ya después se quita cuando avanza". _Supuesto:_ se ven con reputación `script_kiddie` y `hacker`; desde `elite_hacker` no se marcan.
- **S5 — Paneles más transparentes.** "poner el panel con más transparencia para que se vea lo del fondo no tanto", "para que quede una terminal bonita, y agradable". Opacidad de 75–80 % con desenfoque del fondo, sin perder contraste AA.
- **S6 — Explicaciones verificadas.** "te di un ejemplo sobre eso no sé si es verdad, pero sería marcar cosas que le den pistas a los nuevos". Cada explicación se revisa contra una fuente antes de entrar al juego.

## Contrato entre capas (K5)

| Pieza                       | Forma                                                                                                                                                                                | La usan  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `CommandResult.highlights?` | `readonly { text: string; kind: "dir" \| "exec" \| "finding"; note?: string }[]`. La salida (`output`) sigue en texto plano; la terminal pinta cada aparición de `text` según `kind` | C11      |
| Colores por `kind`          | `dir` azul negrita, `exec` verde negrita, `finding` amarillo subrayado con recuadro al pasar el mouse (solo si S4 lo permite)                                                        | Terminal |
| `useFindings()`             | Lista de hallazgos de la partida (`{ text, note, command }`), sin repetidos, los más recientes primero                                                                               | A11      |
| `useShowFindings()`         | `true` mientras S4 permite marcas                                                                                                                                                    | A11      |
| `newGame(name?: string)`    | Valida con `validateUsername`; si falla devuelve el error y no crea partida                                                                                                          | A11      |
| `validateUsername(name)`    | Función pura del engine: `null` si es válido o el mensaje de error                                                                                                                   | A11      |

## Tasks

| ID  | Specs                                            | Quién           | Rama                           | Estado          |
| --- | ------------------------------------------------ | --------------- | ------------------------------ | --------------- |
| K5  | S1, S2, S3 (terminal), S4                        | Claude (inline) | `feat/engine-terminal-legible` | en curso        |
| C11 | S2 (`ls`), S3 (`nmap` y datos), S6               | Codex           | `feat/terminal-highlights`     | listo (e5bf7a7) |
| A11 | S1 (campo de nombre), S3 (panel «Hallazgos»), S5 | Antigravity     | `feat/ui-terminal-legible`     | listo (PR #48)  |

## Log

- **L1** (2026-11-19, Luis): "tambien me gustataria que la persona pueda poner su nombre, tambien otra cosita, es que la terminal todo sale verde, seria bueno hacer la disticion en la terminal de los comando y cosas asi, para que parezca mas a la terminal de linux , poner el panel con mas trasparecia para que se ve lo del fondo no tanto"
- **L2** (2026-11-19, Luis): "la regla aqui es que se siga viendo de color, como en una terminal con la diferencia , a lo que yo me refiero para los principiantes es mostrarles con un color, cosas que les ayuden a entender que hay un problema, ejemplo, hizo un escaneo pero debe leer y ver, como es nuevo no va enteder que encontro una vulneridad, entoces la cosa es como marca esas pistas, y cuando ponga el mouse o ponerlo a un lado que signfica, entonces ejmeplo ftp es muy comun en cosas viejas. cosas de terminal que van siempre si el color normal que llevan, azul, rojo cuando no es el comando ect"
- **L3** (2026-11-19, Luis): "sii, pero ojo te di un ejemplo sobre eso no se si e sverdad, pero seria marcas coss que le de pistas a los nuevos, y asi. ya depsues se quita cuando avanza, hacer es distincio de terminal, y bajarle la trasparecnia para que quede una teminal bonita, y agradable."
- **L4** (2026-11-19): mapa del código. Todo sale verde porque el tema `beginner` usa `foreground #00ff41`; el tema `elite` pone todos los colores en gris; `formatOutputLine` no colorea en `elite`/`anonymous`. La dificultad nunca cambia (siempre `beginner`), por eso S4 usa la reputación. `ls` y `nmap` no marcan nada; `PortInfo.vulnerable` existe y no se usa. xterm 6 trae `registerLinkProvider` con `hover`/`leave` (verificado en `xterm.d.ts`), sin dependencias nuevas.
- **L5** (2026-11-19): K5 listo. `src/terminal/format.ts` (puro) pinta prompt, `outputType` y `highlights`; las marcas solo calzan palabras completas (`ftp` no dentro de `sftp`). Paleta de Linux común en `themes/palette.ts`; élite ya tiene colores. Recuadro con `registerLinkProvider` de xterm. Engine: `validateUsername`, `setUsername`, `marksFindings`. Store: `newGame(name?)` devuelve el error, `findings` (máx. 30, no se guardan), `useFindings`, `useShowFindings`. Check: 70 archivos, 225 pruebas. Navegador: texto gris, prompt verde/azul, error rojo.
- **L6** (2026-11-19): C11 listo. `ls` marca carpetas y ejecutables; `nmap` muestra columnas y marca `ftp` (Acme) y `smb` (archivo de turno) con su nota. Fuentes verificadas: RFC 2577 §6, Cisco TSA18-106A, Microsoft Learn SMBv1, CISA #StopRansomware p. 7, NIST SP 800-40r4. Check: 228 pruebas. Navegador: carpetas azules, `ftp` subrayado y recuadro al pasar el mouse.
- **L7** (2026-11-19): A11 listo. Campo de nombre en «Nueva partida», panel «Hallazgos» (escritorio y móvil) y paneles al 78 % con desenfoque. En la revisión: «Nueva partida» creaba la partida tres veces (`TitleScreen` llamaba a `newGame` y `App` también); ahora `App` la crea una vez y `TitleScreen` solo muestra el error. Plurales «1 MARCA» y «1 hallazgo». Check: 236 pruebas. Navegador: nombre en el prompt, error con nombre inválido, panel con `ftp` y su explicación.
- **Siguiente paso:** K6 (vista de ataques).
