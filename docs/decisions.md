# Decisiones de arquitectura (ADR)

Registro corto de decisiones importantes. La más reciente va arriba.

---

## ADR-002 — Reglas de capas aplicadas con ESLint

**Fecha:** 2026-11-18

**Contexto.** Tres agentes (Claude Code, Codex y Antigravity) escriben código en paralelo. Una
regla escrita solo en `CLAUDE.md` se rompe sin que nadie lo note.

**Decisión.** `eslint.config.js` prohíbe:

- importar React, Three.js o capas visuales dentro de `src/engine/`;
- importar `src/engine/` dentro de `src/terminal/commands/` (deben usar `CommandContext`).

**Consecuencias.** El CI falla si alguien cruza una frontera. Para permitir una dependencia
nueva entre capas hay que cambiar esta configuración y dejarlo registrado aquí.

---

## ADR-001 — TypeScript 6 en lugar de 7

**Fecha:** 2026-11-18

**Contexto.** TypeScript 7 (el compilador reescrito en Go) ya es estable, pero
`typescript-eslint` 8.73 solo admite `typescript >=4.8.4 <6.1.0`. Con TS 7, `npm install`
falla por conflicto de dependencias y nos quedamos sin linter con tipos.

**Decisión.** Fijar `typescript ~6.0.3`.

**Consecuencias.**

- El typecheck es más lento que con TS 7, algo irrelevante con el tamaño actual del proyecto.
- `baseUrl` se eliminó de `tsconfig.json` porque está obsoleto desde TS 6; `paths` basta.
- Revisar cuando `typescript-eslint` publique soporte para TS 7. Dependabot avisará.
