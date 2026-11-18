# Decisiones de arquitectura (ADR)

Registro corto de decisiones importantes. La más reciente va arriba.

---

## ADR-003 — Node.js 26 LTS como versión base

**Fecha:** 2026-11-18

**Contexto.** Node 26 es LTS activa desde octubre de 2026. Con Node 22.20, `jsdom` 31 mostraba
advertencias `EBADENGINE` al instalar (pide `^22.22.2 || ^24.15.0 || >=26`).

**Decisión.** `.nvmrc` fija Node 26 y el CI lo usa. `engines` acepta `>=24.15` para no dejar
fuera a quien siga en la LTS anterior. Se usa el npm que trae Node, que es el que se prueba
junto con cada versión.

**Consecuencias.** `npm install` corre sin advertencias. Política: usar siempre la LTS activa
más reciente y las versiones estables más nuevas de cada dependencia, salvo que rompan la
compatibilidad entre herramientas (ver ADR-001).

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
