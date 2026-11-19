// @vitest-environment node
import { loadPyodide } from "pyodide";
import type { PyodideAPI } from "pyodide";
import { beforeAll, describe, expect, it } from "vitest";
import { MAX_OUTPUT_LINES, runScript } from "@/store/python/runScript";

// Pyodide real en Node: prueba el arnés tal como corre en el worker del navegador
let py: PyodideAPI;
beforeAll(async () => {
  py = await loadPyodide();
}, 120_000);

const HOME = "/home/user";
const run = (code: string, extra: Record<string, string> = {}) =>
  runScript(py, {
    files: { [HOME + "/scripts/main.py"]: code, ...extra },
    script: HOME + "/scripts/main.py",
    cwd: HOME,
  });

describe("ejecución de scripts en Pyodide", () => {
  it("devuelve lo que imprime el script", () => {
    const result = run("for i in range(3):\n    print('linea', i)\n");
    expect(result.ok).toBe(true);
    expect(result.output).toEqual(["linea 0", "linea 1", "linea 2"]);
  });

  it("lee archivos del jugador y devuelve los que crea", () => {
    const result = run(
      "fallos = [l for l in open('/home/user/auth.log') if 'Failed' in l]\n" +
        "open('/home/user/reporte.txt', 'w').write(str(len(fallos)))\n" +
        "print(len(fallos))\n",
      { [HOME + "/auth.log"]: "Failed a\nok\nFailed b\n" },
    );
    expect(result.output).toEqual(["2"]);
    expect(result.files[HOME + "/reporte.txt"]).toBe("2");
  });

  it("un error muestra el traceback del jugador, sin frames internos", () => {
    const result = run("x = 1\nprint(x / 0)\n");
    expect(result.ok).toBe(false);
    const text = result.output.join("\n");
    expect(text).toContain('File "/home/user/scripts/main.py", line 2');
    expect(text).toContain("ZeroDivisionError");
    expect(text).not.toContain("runpy");
  });

  it("cada ejecución empieza limpia: no quedan archivos ni módulos de la anterior", () => {
    run("open('/home/user/basura.txt', 'w').write('x')\n");
    const second = run("import os\nprint(os.path.exists('/home/user/basura.txt'))\n");
    expect(second.output).toEqual(["False"]);

    run("import ayuda\nprint(ayuda.N)\n", { [HOME + "/scripts/ayuda.py"]: "N = 1\n" });
    const edited = run("import ayuda\nprint(ayuda.N)\n", {
      [HOME + "/scripts/ayuda.py"]: "N = 2\n",
    });
    expect(edited.output).toEqual(["2"]);
  });

  it("input() no cuelga el sandbox", () => {
    const result = run("input('nombre: ')\n");
    expect(result.ok).toBe(false);
    expect(result.output.join("\n")).toContain("EOFError");
  });

  it("recorta la salida enorme", () => {
    const result = run("for i in range(10000):\n    print(i)\n");
    expect(result.output).toHaveLength(MAX_OUTPUT_LINES + 1);
    expect(result.output.at(-1)).toBe("… salida recortada");
  });
});
