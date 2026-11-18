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
- [ ] Implementar `src/ai/AiProvider.ts` + `src/ai/providers/NoopProvider.ts` — stub de IA
- [ ] Crear `src/App.tsx` — integración de todo
- [ ] Crear store Zustand con hooks para UI
- [ ] Tests de engine completo
- [ ] Integrar terminal (xterm.js) con engine
- [ ] Code review de Codex y Antigravity
- [ ] Crear primer contrato tutorial `src/data/contracts/00-tutorial.json`

## 🟠 Codex (comandos, datos, lógica de juego)

> **ESPERAR** a que Claude Code termine `src/lib/types.ts` antes de empezar.
> Los tipos `CommandContext` y `CommandResult` están ahí.

### Comandos de terminal (un commit por comando + test)
- [ ] `src/terminal/commands/help.ts` — lista comandos disponibles
- [ ] `src/terminal/commands/ls.ts` — lista archivos del directorio actual
- [ ] `src/terminal/commands/cd.ts` — cambia de directorio
- [ ] `src/terminal/commands/cat.ts` — muestra contenido de archivo
- [ ] `src/terminal/commands/pwd.ts` — muestra directorio actual
- [ ] `src/terminal/commands/clear.ts` — limpia terminal
- [ ] `src/terminal/commands/whoami.ts` — muestra usuario actual
- [ ] `src/terminal/commands/nmap.ts` — escanea puertos (simulado, con delay)
- [ ] `src/terminal/commands/ssh.ts` — conecta a servidor objetivo
- [ ] `src/terminal/commands/download.ts` — descarga archivo del servidor
- [ ] `src/terminal/commands/crack.ts` — intenta crackear contraseña (simulado)
- [ ] `src/terminal/commands/trace.ts` — muestra nivel de rastreo
- [ ] `src/terminal/commands/buy.ts` — compra herramienta de la tienda
- [ ] `src/terminal/commands/history.ts` — historial de comandos
- [ ] `src/terminal/commands/man.ts` — manual de un comando (con ejemplos)
- [ ] `src/terminal/CommandParser.ts` — router que despacha comandos

### Datos del juego
- [ ] `src/data/contracts/01-first-hack.json` — primer contrato real (hackear servidor Acme)
- [ ] `src/data/contracts/02-data-heist.json` — segundo contrato (robo de datos)
- [ ] `src/data/tools/shop.json` — catálogo de herramientas (nombre, precio, efecto)
- [ ] `src/data/levels/progression.json` — XP por nivel, desbloqueos, nombres de tier
- [ ] `src/data/tutorials/beginner.json` — tooltips y pistas para niveles 1-3

### Tests
- [ ] Un test por comando que verifique: output correcto, args inválidos, idempotencia
- [ ] Test de validación de JSONs (contratos con schema correcto)

## 🟢 Antigravity (UI, diseño, 3D)

> **ESPERAR** a que Claude Code termine el store Zustand y los types antes de empezar.
> Los hooks estarán en `src/engine/` o `src/lib/`.

### Componentes UI
- [ ] `src/styles/tokens.css` — variables CSS (colores, fuentes, espaciado)
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
- [ ] `README.md` — qué es, screenshots, instalación, cómo contribuir, licencia
- [ ] `CONTRIBUTING.md` — guía para contribuidores

## 📬 Mensajes entre agentes

> Escribir aquí lo que necesitas de otro agente. Formato:
> `[FECHA] DE → PARA: mensaje`

_Ejemplo:_
_[2026-11-18] CODEX → CLAUDE: necesito el tipo `ToolDefinition` en types.ts para el comando buy_

---

## 📋 Estado general

| Fase | Estado | Fecha inicio |
|------|--------|-------------|
| Fase 1 — MVP | 🟡 En progreso | 2026-11-18 |
| Fase 2 — Blue/Red Team | ⬜ Pendiente | — |
| Fase 3 — Scripting + IA | ⬜ Pendiente | — |
| Fase 4 — Comunidad | ⬜ Pendiente | — |
