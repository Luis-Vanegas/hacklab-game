import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolve } from "@/engine/filesystem";
import { acceptContract } from "@/engine/contracts";
import { applyCommandResult, createSession } from "@/engine/session";
import { CONTRACTS } from "@/store";
import { PYTHON_TIMEOUT_MESSAGE, setPythonRunner, useGameStore } from "@/store/gameStore";
import type { PythonOutcome, PythonRunner } from "@/store/python/pythonRunner";
import type { PythonRequest } from "@/store/python/runScript";

const store = () => useGameStore.getState();
const HOME = "/home/user";
const SCRIPT = HOME + "/scripts/contar_fallidos.py";

// Runner falso: devuelve lo que la prueba decide y guarda lo que recibió
function fakeRunner(reply: (request: PythonRequest) => PythonOutcome) {
  const requests: PythonRequest[] = [];
  const runner: PythonRunner = {
    run(request, onStatus) {
      requests.push(request);
      onStatus("loading");
      onStatus("running");
      return Promise.resolve(reply(request));
    },
  };
  return { runner, requests };
}

const done = (ok: boolean, output: string[], files: Record<string, string>): PythonOutcome => ({
  kind: "done",
  response: { ok, output, files },
});

describe("python real desde el store", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });
  afterEach(() => setPythonRunner(null));

  it("ejecuta el script, muestra su salida y aplica los archivos que creó", async () => {
    const { runner, requests } = fakeRunner((req) =>
      done(true, ["3"], { ...req.files, [HOME + "/reporte.txt"]: "3" }),
    );
    setPythonRunner(runner);
    const notices: string[] = [];

    const result = await store().runCommandAsync("python ~/scripts/contar_fallidos.py", (m) =>
      notices.push(m),
    );

    expect(result.output).toEqual(["3"]);
    expect(requests[0]?.script).toBe(SCRIPT);
    expect(requests[0]?.files[SCRIPT]).toBeTypeOf("string");
    expect(notices[0]).toContain("Cargando el intérprete de Python");
    expect(resolve(store().filesystem, HOME + "/reporte.txt")).toMatchObject({ content: "3" });
    expect(store().pythonStatus).toBe("idle");
    expect(store().history.at(-1)).toBe("python ~/scripts/contar_fallidos.py");
  });

  it("si el script falla, el filesystem queda igual (atomicidad)", async () => {
    const { runner } = fakeRunner((req) =>
      done(false, ["ZeroDivisionError: division by zero"], {
        ...req.files,
        [HOME + "/a-medias.txt"]: "x",
      }),
    );
    setPythonRunner(runner);
    const before = store().filesystem;

    const result = await store().runCommandAsync("python ~/scripts/contar_fallidos.py");

    expect(result.error).toBeDefined();
    expect(result.output).toEqual(["ZeroDivisionError: division by zero"]);
    expect(store().filesystem).toBe(before);
  });

  it("un script que se pasa del tiempo se detiene con un mensaje claro", async () => {
    setPythonRunner(fakeRunner(() => ({ kind: "timeout" })).runner);
    const result = await store().runCommandAsync("python ~/scripts/contar_fallidos.py");
    expect(result.error).toBe(PYTHON_TIMEOUT_MESSAGE);
  });

  it("sin intérprete usa la salida guardada del ejemplo (plan B)", async () => {
    setPythonRunner(fakeRunner(() => ({ kind: "unavailable", message: "sin red" })).runner);
    const result = await store().runCommandAsync("python ~/scripts/contar_fallidos.py");
    expect(result.output[0]).toBe("No se pudo cargar el intérprete de Python.");
    expect(result.output).toContain("Salida simulada:");
    expect(store().pythonStatus).toBe("error");
  });

  it("los demás comandos no pasan por el intérprete", async () => {
    const { runner, requests } = fakeRunner(() => ({ kind: "timeout" }));
    setPythonRunner(runner);
    const result = await store().runCommandAsync("pwd");
    expect(result.output).toEqual([HOME]);
    expect(requests).toHaveLength(0);
  });

  it("un script fuera de /home/user no se ejecuta en el sandbox", async () => {
    const { runner, requests } = fakeRunner(() => ({ kind: "timeout" }));
    setPythonRunner(runner);
    const result = await store().runCommandAsync("python /etc/passwd");
    expect(result.error).toBeDefined();
    expect(requests).toHaveLength(0);
  });
});

describe("edit y guardado", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  it("edit abre el editor y guardar crea el archivo", () => {
    store().runCommand("edit ~/scripts/hola.py");
    expect(store().editorFile).toEqual({ path: HOME + "/scripts/hola.py", content: "" });

    const saved = store().saveFile(HOME + "/scripts/hola.py", "print('hola')\n");
    expect(saved.error).toBeUndefined();
    expect(resolve(store().filesystem, HOME + "/scripts/hola.py")).toMatchObject({
      content: "print('hola')\n",
    });

    store().closeEditor();
    expect(store().editorFile).toBeNull();
  });

  it("edit abre un archivo existente con su contenido", () => {
    store().runCommand("edit ~/notes");
    expect(store().editorFile?.content).toBe(
      (resolve(store().filesystem, HOME + "/notes") as { content: string }).content,
    );
  });

  it("no deja escribir fuera de /home/user ni encima de una carpeta", () => {
    expect(store().runCommand("edit /etc/passwd").error).toContain("/home/user");
    expect(store().runCommand("edit ~/scripts").error).toContain("es una carpeta");
    expect(store().runCommand("edit ~/no-existe/x.py").error).toContain("No existe la carpeta");
    expect(store().saveFile("/etc/passwd", "x").error).toContain("/home/user");
    expect(store().editorFile).toBeNull();
  });
});

describe("objetivos que validan la salida", () => {
  it("outputIncludes solo completa el objetivo si la salida trae el texto", () => {
    const base = CONTRACTS.find((c) => c.id === "00-tutorial");
    if (!base) throw new Error("falta el contrato 00-tutorial");
    const contract = {
      ...base,
      objectives: [
        {
          id: "py",
          description: "Cuenta los fallos",
          trigger: { command: "python", outputIncludes: "Fallos: 3" },
          completed: false,
        },
      ],
    };
    const session = { ...createSession(), game: acceptContract(createSession().game, contract) };
    const executed = { input: "python x.py", command: "python", args: ["x.py"] };

    const wrong = applyCommandResult(session, executed, { output: ["Fallos: 2"] });
    expect(wrong.game.activeContract?.objectives[0]?.completed).toBe(false);

    const right = applyCommandResult(session, executed, { output: ["Inicio", "Fallos: 3"] });
    expect(right.game.activeContract?.objectives[0]?.completed).toBe(true);
  });
});
