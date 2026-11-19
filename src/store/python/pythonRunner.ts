import type { PythonRequest, PythonResponse } from "./runScript";
import type { WorkerMessage, WorkerRequest } from "./python.worker";

export type PythonStatus = "idle" | "loading" | "running" | "error";

export type PythonOutcome =
  | { readonly kind: "done"; readonly response: PythonResponse }
  | { readonly kind: "timeout" }
  | { readonly kind: "unavailable"; readonly message: string };

export interface PythonRunner {
  run(request: PythonRequest, onStatus: (status: PythonStatus) => void): Promise<PythonOutcome>;
}

export const RUN_TIMEOUT_MS = 5_000;
// Descargar el intérprete puede tardar en una red lenta; colgado para siempre, no
const LOAD_TIMEOUT_MS = 60_000;

// Un solo worker vivo: cargar Pyodide cuesta segundos y se reutiliza entre ejecuciones.
// ponytail: cortar con terminate() obliga a recargar tras un tiempo agotado;
// interrumpir sin recargar exige SharedArrayBuffer y cabeceras COOP/COEP (ADR-006).
export function createWorkerRunner(): PythonRunner {
  let worker: Worker | null = null;
  let loaded = false;

  const reset = () => {
    worker?.terminate();
    worker = null;
    loaded = false;
  };

  return {
    run(request, onStatus) {
      if (typeof Worker === "undefined") {
        return Promise.resolve({
          kind: "unavailable",
          message: "Este navegador no tiene Web Workers.",
        });
      }
      if (!worker) {
        worker = new Worker(new URL("./python.worker.ts", import.meta.url), { type: "module" });
      }
      const current = worker;
      onStatus(loaded ? "running" : "loading");

      return new Promise((resolve) => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const finish = (outcome: PythonOutcome) => {
          clearTimeout(timer);
          current.onmessage = null;
          current.onerror = null;
          resolve(outcome);
        };
        const startTimer = (ms: number, outcome: PythonOutcome) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            reset();
            finish(outcome);
          }, ms);
        };

        if (loaded) startTimer(RUN_TIMEOUT_MS, { kind: "timeout" });
        else
          startTimer(LOAD_TIMEOUT_MS, {
            kind: "unavailable",
            message: "La descarga tardó demasiado.",
          });

        current.onmessage = (event: MessageEvent<WorkerMessage>) => {
          const message = event.data;
          if (message.type === "ready") {
            loaded = true;
            onStatus("running");
            startTimer(RUN_TIMEOUT_MS, { kind: "timeout" });
          } else if (message.type === "loadError") {
            reset();
            finish({ kind: "unavailable", message: message.message });
          } else {
            finish({ kind: "done", response: message.response });
          }
        };
        current.onerror = (event) => {
          reset();
          finish({ kind: "unavailable", message: event.message || "El worker de Python falló." });
        };
        current.postMessage({ type: "run", request } satisfies WorkerRequest);
      });
    },
  };
}
