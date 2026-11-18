# HackLab Game — Guía para agentes

## Qué es

Juego de terminal hacker en el navegador. Enseña ciberseguridad, Python, scripting
y conceptos de ingeniería de software a través de contratos (misiones) con historia.
100% client-side, sin servidor. Open source, MIT.

## Filosofía

- **Interactivo, no teórico.** El jugador aprende haciendo. Teoría solo cuando sube de nivel.
- **Sin dependencias de IA.** Todo funciona sin modelos. La IA es un módulo opcional.
- **Código profesional.** Atomicidad, idempotencia, observabilidad, trazabilidad.
  State machines explícitas. TypeScript strict, cero `any`.

## Comandos

```powershell
npm run dev          # Dev server (Vite)
npm run build        # Build de producción
npm run test         # Vitest
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run format       # Prettier
npm run check        # Todo lo anterior + tests: lo mismo que corre el CI
```

## Stack

- React 19 + TypeScript strict + Vite
- xterm.js — terminal real en el navegador
- Three.js + React Three Fiber — escenas 3D
- Zustand — estado global
- Vitest + Testing Library — pruebas

## Estructura

```
src/
├── engine/              # Lógica pura del juego (sin UI, sin efectos)
│   ├── state/           # State machines (GameState, ContractState)
│   ├── contracts/       # Sistema de contratos y progresión
│   ├── reputation/      # Niveles, XP, desbloqueos
│   ├── filesystem/      # Filesystem virtual en memoria
│   └── scripting/       # Sandbox para scripts del jugador (Web Workers)
├── terminal/            # Terminal interactiva
│   ├── Terminal.tsx      # Wrapper de xterm.js
│   ├── CommandParser.ts  # Parser y router de comandos
│   ├── commands/         # Un archivo por comando
│   └── themes/           # Colores por nivel de dificultad
├── scenes/              # Three.js (fondos 3D)
│   ├── NetworkGraph.tsx  # Red de nodos animada
│   ├── MatrixRain.tsx    # Efecto lluvia de código
│   └── AttackView.tsx    # Visualización de ataques
├── story/               # Narrativa y diálogos
│   ├── characters/       # Personajes que hablan al jugador
│   ├── dialogues/        # Diálogos por contrato (JSON)
│   └── StoryEngine.ts    # Motor de narrativa
├── ai/                  # MÓDULO OPCIONAL
│   ├── AiProvider.ts     # Interfaz abstracta
│   ├── providers/        # NvidiaProvider, OllamaProvider, NoopProvider
│   ├── HintSystem.ts     # Pistas contextuales
│   └── BotEngine.ts      # Bot atacante para blue team
├── ui/                  # Componentes React
│   ├── hud/              # HUD (reputación, créditos, trace)
│   ├── shop/             # Tienda de herramientas
│   ├── panels/           # Layout (darknet board, status)
│   └── guides/           # Guías visuales progresivas
├── data/                # Datos estáticos (JSON)
│   ├── contracts/        # Misiones
│   ├── tools/            # Herramientas comprables
│   ├── levels/           # Config por nivel
│   └── tutorials/        # Tutoriales integrados
├── lib/                 # Utilidades transversales
│   ├── events.ts         # Event bus (observabilidad)
│   ├── logger.ts         # Trazabilidad de acciones
│   ├── persistence.ts    # localStorage versionado
│   └── types.ts          # Tipos compartidos
├── store/               # Zustand: integra parser, comandos y engine; hooks para la UI
└── App.tsx
```

## Convenciones

- TypeScript strict, cero `any`.
- Funciones puras en `engine/` — sin efectos secundarios.
- Cada comando: un archivo en `terminal/commands/` que exporta
  `(args: string[], ctx: CommandContext) => CommandResult`.
- State machines con transiciones explícitas y documentadas.
- Comentarios en español: el POR QUÉ, no el qué.
- Identificadores en inglés.
- Conventional Commits en español: `feat(terminal): agrega comando nmap`
- Ramas: `feat/*`, `fix/*`, `docs/*`. A `main` solo por PR.
- Sin firmas ni atribución de IA.

## Patrones obligatorios

- **Atomicidad**: acción del jugador se completa o no cambia nada.
- **Idempotencia**: mismo comando dos veces = mismo resultado, sin corrupción.
- **Observabilidad**: event bus para toda acción significativa.
- **Trazabilidad**: cada cambio de estado registra origen y timestamp.
- **State Machine**: estados claros con transiciones explícitas.
- **Persistencia**: localStorage con schema versionado y migración automática.
- **Concurrencia**: Web Workers para sandbox de scripts del jugador.

## Git workflow

### Ramas permanentes

- **`main`** — siempre desplegable. Solo recibe merges desde `develop` vía PR
  revisado. Protegida: nadie hace push directo.
- **`develop`** — rama de integración. Aquí se juntan las features terminadas
  y se prueba que todo funcione junto antes de subir a `main`.

### Ramas de trabajo (efímeras)

Cada tarea vive en su propia rama, creada desde `develop`:

```
feat/<nombre>     # funcionalidad nueva
fix/<nombre>      # corrección de bug
docs/<nombre>     # solo documentación
refactor/<nombre> # reestructuración sin cambio de comportamiento
chore/<nombre>    # tooling, config, dependencias
```

### Flujo de trabajo

```
develop ──┬── feat/terminal-xterm ──→ PR → develop
          ├── feat/commands-ls    ──→ PR → develop
          └── fix/state-machine   ──→ PR → develop

develop (integrado y probado) ──→ PR → main (release)
```

1. **Crear rama** desde `develop`: `git checkout -b feat/mi-feature develop`
2. **Commits pequeños** con Conventional Commits: un cambio lógico por commit.
3. **Push** de la rama: `git push -u origin feat/mi-feature`
4. **Pull Request** a `develop` con descripción: qué, por qué, cómo probar.
5. **Review + merge** a `develop`. Borrar la rama después.
6. **Cuando `develop` está estable**: PR de `develop` → `main` como release.

### Reglas para agentes

- Cada agente trabaja en su propia carpeta (worktree) y rama `feat/<zona>-<tarea>`. Ver "Ramas y carpetas" en AGENTS.md.
- Nunca hacer push directo a `main` ni a `develop`.
- Si hay conflictos: avisar en TASKS.md y esperar instrucciones.
- Antes de crear una rama: `git pull origin develop` para partir del último estado.

### Protección contra errores

- Si algo se rompe en `develop`: se revierte el merge con `git revert`.
- Si algo se rompe en `main`: hotfix desde main (`fix/hotfix-<tema>`), merge
  a `main` Y a `develop`.
- Tags en `main` para cada release: `v0.1.0`, `v0.2.0`, etc. (semver).

## Coordinación entre agentes

Leer **AGENTS.md** para roles, modelos y zonas de cada agente.
Leer **TASKS.md** para el backlog y comunicación entre agentes.
**Regla de oro**: cada agente trabaja SOLO en su zona. Si necesita algo
de otra zona, lo anota en TASKS.md y espera.
