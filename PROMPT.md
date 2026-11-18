# Prompt de sesión — HackLab Game

> Este archivo da contexto completo a cualquier sesión nueva de Claude Code
> abierta en esta carpeta. Léelo antes de trabajar.

---

## Qué es este proyecto

**HackLab Game** es un juego de terminal hacker que corre 100% en el navegador.
Enseña ciberseguridad, scripting y conceptos de ingeniería de software a través
de contratos (misiones) con historia. Es open source (MIT), independiente, y
pensado para recibir donaciones y contribuciones de la comunidad.

**NO es parte de VEXILRA** (otro proyecto del mismo dueño en `C:\Users\LENOVO\Music\LAB_LARV`).

**Inspiración**: juegos tipo Hacknet, pero con diseño PROPIO. No copiar la
referencia visual ni usar HTML estático para la terminal. La terminal es
xterm.js, el fondo es Three.js, todo profesional.

## Stack

- React 19 + TypeScript strict (cero `any`) + Vite
- **xterm.js** — terminal real en el navegador (NO `<div>` ni `<textarea>`)
- **Three.js** + React Three Fiber — escenas 3D de fondo
- **Zustand** — estado global
- **Vitest** + Testing Library — pruebas
- **IA opcional**: NoopProvider por defecto, funciona sin modelos

## Dónde buscar

| Qué necesitas saber                                        | Archivo             |
| ---------------------------------------------------------- | ------------------- |
| Arquitectura, stack, convenciones, patrones, comandos      | `CLAUDE.md`         |
| Roles de cada agente, modelos, zonas exclusivas            | `AGENTS.md`         |
| Backlog completo, estado de tareas, mensajes entre agentes | `TASKS.md`          |
| Tipos compartidos (el contrato entre agentes)              | `src/lib/types.ts`  |
| Decisiones de arquitectura (ADR)                           | `docs/decisions.md` |

**Orden de lectura**: CLAUDE.md → AGENTS.md → TASKS.md → types.ts

## Estado actual del código

Ya implementado (en `develop`):

- **Engine completo** (`src/engine/`): GameStateMachine, VirtualFS, ContractSystem, ReputationSystem
- **Tipos** (`src/lib/types.ts`): GameState, CommandContext, CommandResult, Contract, etc.
- **Utilidades** (`src/lib/`): event bus, logger, persistencia con localStorage versionado
- **IA** (`src/ai/`): NoopProvider (stub), AiProvider (interfaz)
- **Contrato tutorial** (`src/data/contracts/00-tutorial.json`): 5 objetivos con CIPHER
- **Config**: Vite, tsconfig strict, tokens CSS, licencia MIT, .gitignore, .env.example, ESLint, Prettier, Vitest, CI de GitHub Actions

Aún NO hecho:

- Repo en GitHub (no creado todavía)
- Los 16 comandos de terminal
- La UI (HUD, paneles, tienda, guías)
- Las escenas Three.js
- La integración de xterm.js
- Tests del engine completos (hay una base en `tests/engine/`)
- Store Zustand
- StoryEngine

## Agentes y aislamiento

3 agentes trabajan en paralelo, cada uno en su zona exclusiva:

| Agente                                           | Modelo                               | Zona                                                              |
| ------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------- |
| **Claude Code** (tú si lees esto en Claude Code) | Opus                                 | `engine/`, `story/`, `ai/`, `lib/`, `App.tsx`, configs            |
| **Codex** (OpenAI CLI)                           | Sol 6.2 medio                        | `terminal/commands/`, `CommandParser.ts`, `data/`                 |
| **Antigravity**                                  | Argon (diseño) / Gemini Flash (docs) | `ui/`, `scenes/`, `styles/`, `Terminal.tsx`, `themes/`, `public/` |

**Nadie toca archivos de otra zona.** Comunicación solo vía TASKS.md.
Solo Claude Code modifica `package.json`.

## Git workflow

- **`main`**: siempre desplegable, solo recibe PRs desde `develop`
- **`develop`**: integración, donde se prueban features juntas
- **Ramas de trabajo**: `feat/*`, `fix/*`, `docs/*` creadas desde `develop`
- **Flujo**: rama → PR → develop → PR → main
- **Commits**: Conventional Commits en español (`feat(terminal): agrega comando ls`)
- Sin firmas ni atribución de IA

## Principios de diseño

- **Interactivo > teórico**. El jugador aprende haciendo.
- **Sin IA obligatoria**. Todo funciona sin modelos.
- **Diseño ORIGINAL**. No copiar Hacknet ni ninguna referencia.
- **Código profesional**: atomicidad, idempotencia, observabilidad, trazabilidad.
- **Dificultad progresiva**: 4 tiers (beginner con guías completas → anonymous con terminal raw)
- **Historia**: el personaje CIPHER guía al jugador mediante contratos

## Para empezar una sesión

1. Lee `CLAUDE.md`, `AGENTS.md`, `TASKS.md` en ese orden
2. Revisa `git log --oneline -15` para ver commits recientes de otros agentes
3. Revisa TASKS.md: ítems `[x]` están resueltos, notas sin marcar son dudas
4. Si es la primera vez: `npm install`
5. Busca las tareas pendientes de tu zona y continúa desde ahí
