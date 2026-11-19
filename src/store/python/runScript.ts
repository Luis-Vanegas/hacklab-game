import type { PyodideAPI } from "pyodide";
import type { FileMap } from "@/engine/scripting";

export interface PythonRequest {
  readonly files: FileMap;
  readonly script: string;
  readonly cwd: string;
}

export interface PythonResponse {
  readonly ok: boolean;
  readonly output: readonly string[];
  readonly files: FileMap;
}

// Un print en un ciclo infinito llenaría la memoria antes del tiempo límite
export const MAX_OUTPUT_LINES = 500;

// Todo el trabajo de archivos se hace en Python: así no dependemos de la API interna de Emscripten.
// Cada ejecución arranca con /home/user recién copiado, sin restos de la anterior.
const HARNESS = `
import importlib, json, os, runpy, sys, traceback
HOME = "/home/user"

def _reset_home():
    for base, dirs, names in os.walk(HOME, topdown=False):
        for n in names: os.remove(os.path.join(base, n))
        for d in dirs: os.rmdir(os.path.join(base, d))
    os.makedirs(HOME, exist_ok=True)

_reset_home()
for path, content in json.loads(files_json).items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# Los módulos del jugador quedan en caché entre ejecuciones; tras editarlos hay que releerlos
for name, mod in list(sys.modules.items()):
    if (getattr(mod, "__file__", None) or "").startswith(HOME):
        del sys.modules[name]

os.chdir(cwd if cwd.startswith(HOME) and os.path.isdir(cwd) else HOME)
# Como "python archivo.py": los imports se buscan junto al script
sys.path.insert(0, os.path.dirname(script))
importlib.invalidate_caches()
ok = True
try:
    runpy.run_path(script, run_name="__main__")
except SystemExit as e:
    ok = e.code in (None, 0)
    if not ok and not isinstance(e.code, int):
        print(e.code, file=sys.stderr)
except BaseException as e:
    ok = False
    # Solo los frames del jugador: los de runpy y Pyodide confunden a quien aprende
    tb = traceback.TracebackException.from_exception(e)
    tb.stack = traceback.StackSummary.from_list(
        [f for f in tb.stack if f.filename.startswith(HOME)]
    )
    sys.stderr.write("".join(tb.format()))
finally:
    sys.path.pop(0)
sys.stdout.flush()
sys.stderr.flush()

out = {}
for base, _, names in os.walk(HOME):
    for n in names:
        p = os.path.join(base, n)
        try:
            with open(p, encoding="utf-8") as f:
                out[p] = f.read()
        except (UnicodeDecodeError, OSError):
            pass
json.dumps({"ok": ok, "files": out})
`;

export function runScript(py: PyodideAPI, request: PythonRequest): PythonResponse {
  const output: string[] = [];
  const write = (text: string) => {
    if (output.length < MAX_OUTPUT_LINES) output.push(text.replace(/\n$/, ""));
    else if (output.length === MAX_OUTPUT_LINES) output.push("… salida recortada");
  };
  py.setStdout({ batched: write });
  py.setStderr({ batched: write });
  // Sin teclado en el sandbox: input() recibe fin de archivo en vez de colgarse
  py.setStdin({ stdin: () => null });

  const globals = py.toPy({
    files_json: JSON.stringify(request.files),
    script: request.script,
    cwd: request.cwd,
  });
  try {
    const raw: unknown = py.runPython(HARNESS, { globals });
    const parsed = JSON.parse(String(raw)) as { ok: boolean; files: Record<string, string> };
    return { ok: parsed.ok, output, files: parsed.files };
  } catch (error) {
    // Falla del arnés, no del script del jugador: el filesystem no cambia
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, output: [...output, message], files: request.files };
  } finally {
    globals.destroy();
  }
}
