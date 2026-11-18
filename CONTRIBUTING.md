# Cómo contribuir

Gracias por querer mejorar HackLab. Esta guía te lleva de cero a un PR aceptado.

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

## Pruebas

- Toda funcionalidad nueva lleva su prueba en `tests/` (Vitest).
- Un comando de terminal: prueba la salida correcta, los argumentos inválidos y la idempotencia.
- Un contrato JSON: debe pasar la validación de esquema.

## Checklist del PR

- [ ] `npm run check` pasa en local
- [ ] Las pruebas cubren el cambio
- [ ] Actualicé `TASKS.md` si corresponde
- [ ] El PR va hacia `develop`
