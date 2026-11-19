# Agentes y distribución de trabajo

## Regla de aislamiento (OBLIGATORIA)

Cada agente trabaja SOLO en su zona asignada. No toca archivos de otra zona.
Si necesita algo de otra zona, lo anota en `TASKS.md` bajo `## 📬 Mensajes entre agentes`.

## Ramas y carpetas (OBLIGATORIO)

Cada agente trabaja en **su propia carpeta (git worktree)** y en **su propia rama**.
Nunca dos agentes en la misma carpeta: se pisan los archivos y los commits se mezclan.

| Agente      | Carpeta                                     | Ramas                            |
| ----------- | ------------------------------------------- | -------------------------------- |
| Claude Code | `C:\Users\LENOVO\Music\hacklab-game-engine` | `feat/engine-*`, `docs/*`        |
| Codex       | `C:\Users\LENOVO\Music\hacklab-game-cmd`    | `feat/terminal-*`, `feat/data-*` |
| Antigravity | `C:\Users\LENOVO\Music\hacklab-game-ui`     | `feat/ui-*`, `feat/scenes-*`     |

La carpeta principal `C:\Users\LENOVO\Music\hacklab-game` es solo de Luis. Ningún agente
escribe ahí.

### Al empezar cada tarea

Desde tu carpeta, con el trabajo anterior ya commiteado:

```powershell
git fetch origin
git switch -c feat/<zona>-<tarea> origin/develop
npm ci
```

### Al terminar cada tarea

1. `npm run check` en verde (typecheck, ESLint, Prettier y pruebas).
2. Un commit por cambio lógico, con su prueba, en Conventional Commits.
3. Push de tu rama y PR hacia `develop`. Nunca hacia `main`.

### Si tu entorno no puede escribir en `.git`

Algunos sandboxes (por ejemplo, Codex en modo por defecto) no pueden crear ramas ni commits.
En ese caso: trabaja igual en tu carpeta, corre `npm run check`, y deja en `TASKS.md` el
mensaje `[FECHA] AGENTE → LUIS: listo para commit en <carpeta>, rama <nombre>`.
Luis o Claude Code hacen el commit y el PR.

## Comunicación

Archivo central: **TASKS.md**

- Cada agente marca `[x]` cuando termina una tarea.
- Si tiene dudas, escribe una nota debajo de la tarea.
- Antes de empezar, lee TASKS.md para ver qué han hecho los demás.
- Al terminar una sesión, actualiza TASKS.md con lo que hizo.

---

## 🔵 Claude Code — Orquestador y arquitecto

**Modelo**: Opus (decisiones, arquitectura, integración)
**Rol**: Dirige todo. Diseña la arquitectura, implementa la lógica core,
integra los módulos, hace code review de los otros agentes.

**Zona exclusiva**:

```
src/engine/          # Toda la lógica pura del juego
src/story/           # Narrativa, personajes, diálogos
src/ai/              # Módulo opcional de IA
src/lib/             # Utilidades transversales
src/store/           # Store Zustand y hooks públicos para la UI
src/App.tsx          # Punto de entrada
CLAUDE.md
AGENTS.md
TASKS.md
docs/decisions.md    # ADR
vite.config.ts
tsconfig.json
package.json         # Solo Claude Code modifica dependencias
```

**Responsabilidades**:

- State machines (GameState, ContractState)
- Filesystem virtual
- ContractSystem y ReputationSystem
- StoryEngine y diálogos
- Event bus, logger, persistence
- Integración de xterm.js con el engine
- Code review de TODO lo que suban Codex y Antigravity
- Decisiones de arquitectura → `docs/decisions.md`

---

## 🟠 Codex (OpenAI) — Implementador de lógica

**Modelo**: Sol 6.2 medio
**Para documentación**: Gemini 2.5 Flash (si se necesita generar docs largos)
**Rol**: Implementa comandos, datos, y lógica de juego bien acotada.
Investiga si es necesario antes de implementar.

**Zona exclusiva**:

```
src/terminal/commands/   # Un archivo por comando + su test
src/terminal/CommandParser.ts
src/data/contracts/      # Misiones en JSON
src/data/tools/          # Herramientas comprables
src/data/levels/         # Configuración de niveles
src/data/tutorials/      # Tutoriales integrados (texto)
tests/commands/          # Tests de comandos
tests/data/              # Tests de validación de datos
```

**Responsabilidades**:

- Implementar cada comando de terminal como función pura
- Diseñar el formato JSON de contratos (con historia, objetivos, recompensas)
- Crear el catálogo de herramientas y niveles
- Escribir tutoriales integrados para cada nivel
- Tests unitarios de cada comando y validación de datos
- Investigar mecánicas de juegos similares si es necesario

**Reglas para Codex**:

- Cada comando es `(args: string[], ctx: CommandContext) => CommandResult`
- NO importar nada de `engine/` directamente — usar solo `CommandContext`
- Un commit por comando con su test
- Si necesita un tipo nuevo, anotarlo en TASKS.md para Claude Code

---

## 🟢 Antigravity — UI, diseño visual y 3D

**Modelo**: Argon (para diseño visual y componentes complejos)
**Para documentación y README**: Gemini 2.5 Flash
**Rol**: Todo lo visual. Componentes UI, escenas 3D, temas, estilos,
animaciones. Investiga referencias visuales si es necesario.

**Zona exclusiva**:

```
src/ui/                  # Todos los componentes de interfaz
src/terminal/Terminal.tsx # Solo el componente visual (no el parser)
src/terminal/themes/     # Temas de colores
src/scenes/              # Escenas Three.js
src/styles/              # CSS, tokens, animaciones
public/                  # Assets estáticos (fuentes, imágenes)
README.md                # Con Gemini Flash para redacción
```

**Responsabilidades**:

- HUD (reputación, créditos, nivel de trace)
- Panel de Darknet Board y Status
- Tienda de herramientas (modal)
- Guías visuales progresivas (tooltips que desaparecen con nivel)
- 3 temas de terminal: beginner (colorido), normal, elite (minimalista)
- Escenas Three.js: NetworkGraph, MatrixRain, AttackView
- Layout responsive
- README.md profesional con screenshots
- CSS tokens y design system

**Reglas para Antigravity**:

- Componentes presentacionales: reciben props, no acceden al store directamente
- Para estado, importar solo los hooks de `@/store` (ESLint bloquea importar `engine/` desde `ui/` y `scenes/`)
- NO tocar `engine/`, `lib/`, ni `data/`
- Si necesita un hook o dato nuevo, anotarlo en TASKS.md
- Los componentes 3D siguen la spec que Claude Code deje en TASKS.md

---

## 📝 Modelo para documentación puntual

**Gemini 2.5 Flash** (3.8 Flash o equivalente):

- Generar README.md largo y profesional
- Documentar APIs internas
- Generar CONTRIBUTING.md
- Escribir descripciones de contratos/tutoriales largos
- NO para código ni decisiones de arquitectura

---

## Flujo de trabajo

```
1. Claude Code crea la base (engine, types, interfaces)
2. Claude Code deja tareas en TASKS.md para Codex y Antigravity
3. Codex implementa comandos y datos en su zona
4. Antigravity implementa UI y 3D en su zona
5. Cada uno marca [x] en TASKS.md al terminar
6. Claude Code revisa, integra, y da feedback
7. Se repite por fase
```

## Resolución de conflictos

- Si dos agentes necesitan el mismo archivo → Claude Code decide quién lo toca.
- Si un agente necesita una interfaz que no existe → la anota en TASKS.md,
  Claude Code la crea, y luego el agente la usa.
- Nadie modifica `package.json` excepto Claude Code.
- Nadie modifica archivos fuera de su zona.
