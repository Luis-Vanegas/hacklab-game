// Worker de módulo: Pyodide lo exige (ADR-006). Corre aparte del juego para que
// un ciclo infinito no congele la página; el runner lo termina si se pasa del tiempo.
import type { loadPyodide, PyodideAPI } from "pyodide";
import { runScript, type PythonRequest } from "./runScript";

export type WorkerRequest = { readonly type: "run"; readonly request: PythonRequest };
export type WorkerMessage =
  | { readonly type: "ready" }
  | { readonly type: "loadError"; readonly message: string }
  | { readonly type: "result"; readonly response: ReturnType<typeof runScript> };

// Los archivos de Pyodide los sirve el plugin pyodideAssets de vite.config.ts: vienen
// del propio juego, nada sale a un CDN y nada entra en la carga inicial.
const INDEX_URL = import.meta.env.BASE_URL + "pyodide/";

let pyodide: Promise<PyodideAPI> | null = null;

async function loadInterpreter(): Promise<PyodideAPI> {
  const module = (await import(/* @vite-ignore */ INDEX_URL + "pyodide.mjs")) as {
    loadPyodide: typeof loadPyodide;
  };
  const py = await module.loadPyodide({ indexURL: INDEX_URL });
  // El sandbox no tiene red: se cortan las salidas del worker una vez cargado el intérprete
  const offline = () => {
    throw new Error("Sin red: el sandbox de Python no puede conectarse a internet.");
  };
  Object.assign(globalThis, { fetch: offline, XMLHttpRequest: undefined, WebSocket: undefined });
  return py;
}

const post = (message: WorkerMessage) => self.postMessage(message);

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  void (async () => {
    let py: PyodideAPI;
    try {
      if (!pyodide) {
        pyodide = loadInterpreter();
        py = await pyodide;
        post({ type: "ready" });
      } else {
        py = await pyodide;
      }
    } catch (error) {
      pyodide = null;
      post({ type: "loadError", message: error instanceof Error ? error.message : String(error) });
      return;
    }
    post({ type: "result", response: runScript(py, event.data.request) });
  })();
});
