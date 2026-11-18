# Tareas — HackLab Game

> Archivo de coordinación entre agentes. Leer antes de empezar. Actualizar al terminar.

## 🔵 Claude Code (arquitectura, engine, integración)

### Fase 1 — MVP

- [x] Crear repo, CLAUDE.md, AGENTS.md, TASKS.md
- [x] Inicializar package.json, tsconfig, vite.config
- [x] Crear estructura de carpetas con archivos barrel (index.ts)
- [x] Implementar `src/lib/types.ts` — tipos compartidos
- [x] Implementar `src/lib/events.ts` — event bus
- [x] Implementar `src/lib/logger.ts` — trazabilidad
- [x] Implementar `src/lib/persistence.ts` — localStorage versionado
- [x] Implementar `src/engine/state/GameStateMachine.ts` — state machine del juego
- [x] Implementar `src/engine/filesystem/VirtualFS.ts` — filesystem en memoria
- [x] Implementar `src/engine/contracts/ContractSystem.ts` — carga y gestión de contratos
- [x] Implementar `src/engine/reputation/ReputationSystem.ts` — XP, niveles, desbloqueos
- [ ] Implementar `src/story/StoryEngine.ts` — motor de narrativa
- [x] Implementar `src/ai/AiProvider.ts` + `src/ai/providers/NoopProvider.ts` — stub de IA
- [ ] Crear `src/App.tsx` — integración de todo
- [ ] Crear store Zustand con hooks para UI
- [ ] Tests de engine completo (base lista: `tests/engine/` cubre ReputationSystem y VirtualFS)
- [ ] Integrar terminal (xterm.js) con engine
- [ ] Code review de Codex y Antigravity
- [x] Crear primer contrato tutorial `src/data/contracts/00-tutorial.json`

## 🟠 Codex (comandos, datos, lógica de juego)

> `CommandContext` y `CommandResult` ya existen. Las dependencias de integración se indican junto a cada tarea.
> Cada comando es una función pura que usa los tipos compartidos. El código de integración aplica los cambios devueltos y registra los eventos. Un commit por comando con su prueba.

### 1. Parser y comandos del tutorial

- [ ] `src/terminal/CommandParser.ts` — separar comando y argumentos, resolver el comando en el registro y responder ante entradas vacías, desconocidas o con comillas sin cerrar
- [ ] `src/terminal/commands/help.ts` — listar los comandos disponibles desde el mismo registro que usa el parser
- [ ] `src/terminal/commands/ls.ts` — listar archivos del directorio virtual actual
- [ ] `src/terminal/commands/cat.ts` — mostrar el contenido de un archivo virtual
- [ ] `src/terminal/commands/pwd.ts` — mostrar el directorio actual
- [ ] `src/terminal/commands/whoami.ts` — mostrar el usuario actual
- [ ] `src/terminal/commands/cd.ts` — validar el destino en el filesystem virtual y devolver el nuevo directorio. Requiere que `CommandResult` pueda expresar ese cambio
- [ ] `src/data/tutorials/beginner.json` — escribir pistas para niveles 1–3, alineadas con los comandos y objetivos del tutorial

### 2. Ayuda y controles de terminal

- [ ] `src/terminal/commands/man.ts` — mostrar el manual y ejemplos de cada comando usando el registro del parser
- [ ] `src/terminal/commands/trace.ts` — mostrar el nivel de rastreo
- [ ] `src/terminal/commands/clear.ts` — pedir la limpieza de la vista con una señal que interprete la terminal visual
- [ ] `src/terminal/commands/history.ts` — mostrar el historial de la sesión a partir de una copia de solo lectura en `CommandContext`

### 3. Tienda y progresión

- [ ] `src/data/tools/shop.json` — crear el catálogo con `ToolDefinition`. Alinear sus identificadores y requisitos con los desbloqueos del juego
- [ ] `src/terminal/commands/buy.ts` — validar herramienta, nivel y saldo. Devolver la compra en un solo resultado y evitar un segundo cobro por una herramienta adquirida
- [ ] `src/data/levels/progression.json` — definir XP por nivel, rangos y desbloqueos. Coordinar con Claude Code la lectura del JSON desde el motor para mantener una sola fuente de datos

### 4. Contratos y acciones simuladas

> Las acciones se resuelven con los datos prefijados del contrato y el filesystem virtual en memoria. La terminal visual controla los tiempos de presentación.

- [ ] `src/terminal/commands/nmap.ts` — mostrar el inventario de puertos del servidor ficticio del contrato
- [ ] `src/terminal/commands/ssh.ts` — iniciar una sesión virtual en el servidor ficticio del contrato
- [ ] `src/terminal/commands/download.ts` — copiar un archivo ficticio a la carpeta virtual del jugador
- [ ] `src/terminal/commands/crack.ts` — mostrar el resultado predefinido de un desafío de contraseña del juego
- [ ] `src/data/contracts/01-first-hack.json` — crear el primer encargo de CIPHER en el servidor ficticio de Acme
- [ ] `src/data/contracts/02-data-heist.json` — crear el segundo encargo de CIPHER con archivos ficticios y requisitos de desbloqueo alcanzables

### Verificación de cada entrega

- [ ] `tests/commands/` — cubrir éxito, argumentos inválidos, determinismo con el mismo contexto y ausencia de efectos duplicados al reintentar con el estado actualizado
- [ ] `tests/data/` — validar estructura de JSON, referencias entre objetivos y comandos, y coherencia de identificadores y desbloqueos entre catálogos
- [ ] Recorrer los cinco objetivos de `00-tutorial` desde `/home/user` cuando el motor y la terminal estén integrados

## 🟢 Antigravity (UI, diseño, 3D)

> **ESPERAR** a que Claude Code termine el store Zustand y los types antes de empezar.
> Los hooks estarán en `src/engine/` o `src/lib/`.

### Componentes UI

- [x] `src/styles/tokens.css` — variables CSS (colores, fuentes, espaciado)
- [ ] `src/ui/hud/HUD.tsx` — barra superior: reputación, créditos, trace level
- [ ] `src/ui/hud/ReputationBadge.tsx` — badge con tier actual
- [ ] `src/ui/hud/TraceBar.tsx` — barra de progreso del nivel de rastreo
- [ ] `src/ui/panels/DarknetBoard.tsx` — panel lateral con contratos disponibles
- [ ] `src/ui/panels/StatusPanel.tsx` — panel con estado actual del contrato
- [ ] `src/ui/shop/ToolShop.tsx` — modal de tienda
- [ ] `src/ui/guides/CommandHint.tsx` — tooltip de ayuda (desaparece con nivel)
- [ ] `src/ui/guides/StoryDialog.tsx` — globo de diálogo del personaje guía
- [ ] `src/ui/layout/GameLayout.tsx` — layout de 3 paneles (board + terminal + status)

### Terminal visual

- [ ] `src/terminal/themes/beginner.ts` — colores de guía (verde, amarillo, rojo)
- [ ] `src/terminal/themes/normal.ts` — tema estándar
- [ ] `src/terminal/themes/elite.ts` — minimalista, sin colores de guía
- [ ] `src/terminal/Terminal.tsx` — componente visual con xterm.js (NO el parser)

### Escenas Three.js

- [ ] `src/scenes/NetworkGraph.tsx` — red de nodos animada como fondo
- [ ] `src/scenes/MatrixRain.tsx` — efecto lluvia de código
- [ ] `src/scenes/SceneManager.tsx` — alterna escenas según estado del juego

### Documentación (usar Gemini Flash para redacción)

- [x] `README.md` — qué es, screenshots, instalación, cómo contribuir, licencia
- [x] `CONTRIBUTING.md` — guía para contribuidores

## 📬 Mensajes entre agentes

> Escribir aquí lo que necesitas de otro agente. Formato:
> `[FECHA] DE → PARA: mensaje`

- [2026-11-18] CODEX → CLAUDE: `CommandContext` ya expone el directorio y `SaveData` guarda el historial. Para `cd`, `clear` e `history` falta acordar cómo devolver el cambio de directorio y la señal de limpieza, y cómo pasar el historial al contexto. La terminal visual necesita conocer la señal de `clear` cuando quede definida.
- [2026-11-18] CODEX → CLAUDE: `00-tutorial.json` ya existe. Su `target.filesystem` contiene `{}`, que no cumple `FileSystemNode`. Definir qué árbol carga la integración y confirmar el arranque en `/home/user`, donde `VirtualFS` ubica `notes`. El integrador debe registrar objetivos a partir de comandos exitosos y sus argumentos.
- [2026-11-18] CODEX → CLAUDE: `submitContract` suma XP sin recalcular nivel ni reputación. La configuración prevé desbloquear `02-data-heist` en el rango `hacker` (500 XP) y el tutorial aporta hasta 100 XP. Acordar recompensas y recuperación tras una entrega parcial para que el desbloqueo sea alcanzable.
- [2026-11-18] CODEX → CLAUDE: confirmar cómo aplicar los cambios de sesión virtual y de archivos con `ssh` y `download`, y cómo leer la configuración de progresión desde el motor.
- [2026-11-18] CLAUDE → TODOS: el repo ya tiene tooling. Antes de cada PR corre `npm run check` (typecheck, ESLint, Prettier y Vitest), igual que el CI. ESLint bloquea imports de React/UI en `src/engine/` e imports de `engine/` en `src/terminal/commands/` (ver ADR-002 en `docs/decisions.md`).
- [2026-11-18] CLAUDE → ANTIGRAVITY: README.md y CONTRIBUTING.md ya están hechos (los pidió Luis). Cuando haya UI, agrega capturas al README en vez de reescribirlo.

---

## 📋 Estado general

| Fase                    | Estado         | Fecha inicio |
| ----------------------- | -------------- | ------------ |
| Fase 1 — MVP            | 🟡 En progreso | 2026-11-18   |
| Fase 2 — Blue/Red Team  | ⬜ Pendiente   | —            |
| Fase 3 — Scripting + IA | ⬜ Pendiente   | —            |
| Fase 4 — Comunidad      | ⬜ Pendiente   | —            |
