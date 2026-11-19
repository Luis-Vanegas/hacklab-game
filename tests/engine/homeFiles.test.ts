import { describe, expect, it } from "vitest";
import { applyChanges, createRootFS, resolve } from "@/engine/filesystem";
import { collectFiles, fileChanges } from "@/engine/scripting";

const HOME = "/home/user";

describe("archivos del sandbox de Python", () => {
  it("copia solo los archivos de /home/user, con ruta absoluta", () => {
    const files = collectFiles(createRootFS(), HOME);
    expect(files[HOME + "/notes"]).toBeTypeOf("string");
    expect(Object.keys(files).every((p) => p.startsWith(HOME + "/"))).toBe(true);
  });

  it("sin cambios no produce cambios (idempotente)", () => {
    const root = createRootFS();
    const files = collectFiles(root, HOME);
    expect(fileChanges(root, files, files)).toEqual([]);
  });

  it("aplica archivos creados, modificados y borrados, con carpetas nuevas", () => {
    const root = createRootFS();
    const before = collectFiles(root, HOME);
    const after = Object.fromEntries(
      Object.entries({
        ...before,
        [HOME + "/notes"]: "editado",
        [HOME + "/salida/reporte/fallos.txt"]: "3",
      }).filter(([path]) => path !== HOME + "/bienvenida.txt"),
    );

    const next = applyChanges(root, fileChanges(root, before, after));

    expect(collectFiles(next, HOME)).toEqual(after);
    expect(resolve(next, HOME + "/salida/reporte")?.type).toBe("dir");
  });

  it("no pisa una carpeta con un archivo", () => {
    const root = createRootFS();
    const before = collectFiles(root, HOME);
    const changes = fileChanges(root, before, { ...before, [HOME + "/scripts"]: "x" });
    expect(changes).toEqual([]);
  });
});
