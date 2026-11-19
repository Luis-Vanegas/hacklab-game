# Cómo contribuir

Gracias por querer mejorar HackLab. Esta guía te lleva de cero a un PR aceptado.
Al participar aceptas el [código de conducta](CODE_OF_CONDUCT.md).

## Ruta rápida

1. Crea tu rama desde `develop`:
   ```bash
   git checkout develop && git pull
   git checkout -b feat/comando-nmap
   ```
2. Haz cambios pequeños, cada uno con su prueba.
3. Verifica antes de subir:
   ```bash
   npm run check
   ```
4. Abre un PR hacia **`develop`**, nunca hacia `main`. La plantilla te guía.

## Ramas

| Prefijo     | Para qué                               |
| ----------- | -------------------------------------- |
| `feat/`     | Funcionalidad nueva                    |
| `fix/`      | Corrección de un bug                   |
| `docs/`     | Solo documentación                     |
| `refactor/` | Reestructurar sin cambiar el resultado |
| `chore/`    | Tooling, configuración, dependencias   |

`main` recibe solo releases desde `develop`.

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/). El tipo va en inglés
y la descripción en español, en imperativo:

```
feat(terminal): agrega comando nmap
fix(engine): evita XP negativa al fallar un contrato
docs: explica el formato de contratos
```

## Reglas de código

| Regla             | Cómo se cumple                                                      |
| ----------------- | ------------------------------------------------------------------- |
| TypeScript strict | Cero `any`. ESLint lo marca como error                              |
| Engine puro       | `src/engine/` no importa React ni UI. ESLint lo bloquea             |
| Comandos aislados | Firma `(args, ctx: CommandContext) => CommandResult`, sin `engine/` |
| Idempotencia      | Ejecutar dos veces la misma acción no corrompe el estado            |
| Comentarios       | En español, explicando el **por qué**                               |
| Identificadores   | En inglés                                                           |

## Recetas comunes

### Agregar un comando de terminal

1. Crea `src/terminal/commands/<nombre>.ts` con la firma `(args, ctx) => CommandResult`.
2. Regístralo en el arreglo `commands` de `src/terminal/commands/index.ts`, con su
   categoría y su `description`, que es lo que muestran `help` y `man`.
3. Agrega su prueba en `tests/commands/<nombre>.test.ts`.

### Agregar un contrato

1. Crea `src/data/contracts/<id>.json`. Se carga solo; copia uno existente del mismo canal
   (`work` o `darknet`) como plantilla.
2. Agrega el `id` a `unlocksContracts` del nivel que corresponda en
   `src/data/levels/progression.json`.
3. Si el jugador necesita archivos, agrégalos a `src/data/filesystem/workstation.json`.
4. Agrega su recorrido en `tests/data/contractWalkthrough.test.ts`: la prueba confirma
   que el contrato se puede completar de punta a punta.

## Pruebas

- Toda funcionalidad nueva lleva su prueba en `tests/` (Vitest).
- Un comando de terminal: prueba la salida correcta, los argumentos inválidos y la idempotencia.
- Un contrato JSON: `tests/data/gameData.test.ts` valida su estructura, sus pistas y su nivel.
- Las pruebas de Python cargan Pyodide real; la primera corrida tarda unos segundos más.

## Reportar bugs o proponer ideas

Abre un [issue](https://github.com/Luis-Vanegas/hacklab-game/issues/new/choose) con la
plantilla de bug o de funcionalidad antes de empezar algo grande.

## Archivos de coordinación

Parte del desarrollo lo hacen agentes de IA en paralelo. `AGENTS.md`, `TASKS.md`,
`PROMPT.md`, `CLAUDE.md` y `odd/` son su tablero de trabajo. No necesitas tocarlos: para
coordinar con el equipo, usa los issues.

## Checklist del PR

- [ ] `npm run check` pasa en local
- [ ] Las pruebas cubren el cambio
- [ ] El PR va hacia `develop`
