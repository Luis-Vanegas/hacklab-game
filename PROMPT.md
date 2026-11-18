# Prompt de sesión — HackLab Game

> Copia este prompt al iniciar una nueva sesión de Claude Code en esta carpeta.

---

## Contexto

Este es **HackLab Game**: un juego de terminal hacker en el navegador que enseña
ciberseguridad, scripting y conceptos de ingeniería de software. Es un proyecto
open source independiente (no es parte de VEXILRA, que es otro proyecto mío).

**Inspiración**: juegos tipo Hacknet, pero construido profesionalmente con
React + TypeScript + xterm.js + Three.js. Nada de HTML estático para la terminal.

## Estado actual

El proyecto tiene la base completa:
- **Engine** (`src/engine/`): state machine, filesystem virtual inmutable,
  sistema de contratos, sistema de reputación con 5 tiers.
- **Tipos** (`src/lib/types.ts`): todos los tipos compartidos.
- **Utilidades** (`src/lib/`): event bus, logger, persistencia con localStorage versionado.
- **IA opcional** (`src/ai/`): NoopProvider como default, el juego funciona sin modelos.
- **Contrato tutorial** (`src/data/contracts/00-tutorial.json`): 5 objetivos con
  el personaje CIPHER como guía.
- **Config**: Vite, TypeScript strict, tokens CSS, licencia MIT.

## Qué falta (Fase 1 — MVP)

Revisar **TASKS.md** para el backlog completo. En resumen:

1. `npm install` (aún no se ha corrido)
2. Integrar xterm.js como terminal real (no HTML)
3. Implementar los 16 comandos en `src/terminal/commands/`
4. Implementar la UI: HUD, paneles, tienda, guías progresivas
5. Implementar las escenas Three.js de fondo
6. Integrar todo en App.tsx
7. Tests del engine

## Cómo trabajamos

Lee estos archivos en orden:
1. **CLAUDE.md** — arquitectura, stack, convenciones, patrones obligatorios
2. **AGENTS.md** — roles, modelos y zonas de cada agente
3. **TASKS.md** — backlog y comunicación entre agentes

**3 agentes con zonas separadas:**
- **Claude Code** (Opus): engine, story, ai, lib, integración, review
- **Codex** (OpenAI): terminal/commands, data, tests de comandos
- **Antigravity** (Argon/Gemini Flash): ui, scenes, styles, terminal visual

**Regla de oro**: cada agente trabaja SOLO en su zona. Comunicación por TASKS.md.

## Principios

- **Interactivo > teórico**. El jugador aprende haciendo.
- **Sin IA obligatoria**. Todo funciona sin modelos.
- **Código profesional**: atomicidad, idempotencia, observabilidad, state machines.
- **TypeScript strict, cero `any`**. Comentarios en español (por qué).
- **Conventional Commits** en español. A `main` solo por PR.
- **Diseño original**. No copiar la referencia (Hacknet). Hacer algo propio y mejor.

## Para empezar

```
Lee CLAUDE.md, AGENTS.md y TASKS.md.
Revisa qué tareas están pendientes y continúa desde ahí.
Si es la primera vez que abres el proyecto: npm install primero.
```
