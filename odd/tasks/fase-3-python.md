# Fase 3 — Python real en el navegador

Objetivo: el jugador escribe y ejecuta Python de verdad dentro del juego, sin servidor.
Rama base: `develop`. Entrega: un PR por tarea. Pruebas: Vitest (`npm run check`).

## Specs

- **S1 — Python real.** `python <script>` ejecuta el archivo del filesystem virtual con CPython (Pyodide 314.0.8) y muestra en la terminal lo que imprime el script. Los errores salen como el traceback de Python, en rojo.
- **S2 — Liviano.** Pyodide no entra en la carga inicial: se descarga la primera vez que el jugador usa `python`, se sirve desde el propio juego (sin CDN) y queda en caché del navegador. Mientras carga, la terminal dice «Cargando el intérprete de Python…».
- **S3 — Sandbox.** El script corre en un Web Worker. Solo ve una copia de `/home/user` del filesystem virtual; no tiene red ni acceso a archivos reales. Si tarda más de 5 segundos se detiene con el mensaje «Tiempo agotado: el script tardó más de 5 s y se detuvo.».
- **S4 — Archivos.** Lo que el script crea o modifica dentro de `/home/user` aparece en el filesystem virtual cuando termina bien. Si falla o se detiene, el filesystem queda igual (atomicidad).
- **S5 — Escribir scripts.** El jugador puede crear y editar archivos `.py` desde el juego con `edit <archivo>`, que abre una ventana de editor; al guardar, el archivo queda en el filesystem virtual.
- **S6 — Objetivos con Python.** Un objetivo puede exigir que la salida del comando contenga un texto (`trigger.outputIncludes`), para validar que el script del jugador da el resultado correcto.
- **S7 — Aprender Python.** Contratos nuevos del canal `work` que enseñan Python desde cero aplicado a seguridad: imprimir, variables, listas, ciclos, leer archivos, contar líneas de un log, `re` y `hashlib`.
- **S8 — Sin regresiones.** Los comandos actuales y los contratos 00–16 siguen funcionando. Si Pyodide no carga (sin internet la primera vez, navegador viejo), `python` muestra la salida simulada de hoy para los scripts conocidos y avisa que no pudo cargar el intérprete.

Fuera de alcance: Blue Team (defender contra un atacante), que va después; paquetes externos de Python (`pip`, `micropip`).

## Contratos entre capas

| Quién publica | Qué                                                                                                    | Quién lo usa |
| ------------- | ------------------------------------------------------------------------------------------------------ | ------------ |
| K4 (Claude)   | `ObjectiveTrigger.outputIncludes?: string`                                                             | C10          |
| K4 (Claude)   | `usePythonStatus()` → `"idle" \| "loading" \| "running" \| "error"`                                    | A10          |
| K4 (Claude)   | `useEditorFile()` → `{ path, content } \| null` y `useSaveFile()` → `(path, content) => CommandResult` | A10          |
| K4 (Claude)   | Comando `edit <archivo>`: valida la ruta y abre el editor                                              | C10, A10     |

## Tasks

| ID  | Specs     | Agente      | Ruta                         | Estado      |
| --- | --------- | ----------- | ---------------------------- | ----------- |
| K4  | S1–S6, S8 | Claude      | `feat/engine-python-sandbox` | listo       |
| C10 | S6, S7    | Codex       | `feat/data-python-course`    | listo (#36) |
| A10 | S2, S5    | Antigravity | `feat/ui-code-editor`        | listo (#35) |

## Log

- **L1** (2026-11-19, Luis): "ais ya podemos empezar y ir agregando lo de python ?"
- **L2** (2026-11-19, Luis): eligió Pyodide frente a MicroPython y a seguir simulando ("si").
- **L3** (2026-11-19): Verificado en npm: `pyodide` 314.0.8, 13,9 MB sin comprimir con todos los paquetes. La docs de Pyodide exige un worker de tipo módulo; para cortar código infinito se usa `worker.terminate()` (interrumpir con `SharedArrayBuffer` exigiría cabeceras COOP/COEP). Ver ADR-006.
- **L4** (2026-11-19): K4 probado en el navegador: el script real cuenta 4 fallos, el error muestra solo el traceback del jugador, un `while True` se corta a los 5 s sin congelar el juego y un archivo creado por Python aparece con `cat`. Vite no deja importar módulos de `public/` en dev; por eso Pyodide lo sirve un plugin de `vite.config.ts`.
- **L5** (2026-11-19): A10 y C10 revisados e integrados. Check completo verde (207 pruebas) y recorrido real en el navegador: la plantilla 23 editada imprime `Total de fallos: 4.`. Subí el tiempo de carga de Pyodide en los recorridos de C10 de 15 s a 120 s, como en `runScript.test`.
- **Siguiente paso:** Fase 3 cerrada. Próxima: Fase 4 (IA opcional).
