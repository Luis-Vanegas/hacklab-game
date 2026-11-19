import { describe, expect, it } from "vitest";
import ls from "@/terminal/commands/ls";
import { directory, file, makeContext } from "./fixtures";

describe("ls", () => {
  it("ordena nombres, señala carpetas y omite archivos ocultos por defecto", () => {
    const ctx = makeContext();
    const result = ls([], ctx);
    expect(result).toEqual({
      output: ["mis notas.txt", "notes", "sub/"],
      highlights: [{ text: "sub/", kind: "dir" }],
    });
    expect(ls([], ctx)).toEqual(result);
    expect(ls(["-a"], ctx).output).toContain(".profile");
  });

  it("marca archivos con permiso de ejecución y respeta los ocultos", () => {
    const ctx = makeContext({
      currentDir: "/",
      filesystem: directory("/", {
        "run.sh": { ...file("run.sh", ""), permissions: "-rwx------" },
        ".hidden": { ...file(".hidden", "", true), permissions: "-rw-r--r-x" },
        "read.sh": file("read.sh", ""),
      }),
    });
    expect(ls([], ctx)).toEqual({
      output: ["read.sh", "run.sh"],
      highlights: [{ text: "run.sh", kind: "exec" }],
    });
    expect(ls(["-a"], ctx).highlights).toContainEqual({ text: ".hidden", kind: "exec" });
  });

  it("acepta rutas virtuales y rechaza archivos, opciones y rutas inválidas", () => {
    const ctx = makeContext();
    expect(ls(["../../etc"], ctx).output).toEqual(["passwd"]);
    expect(ls(["notes"], ctx)).toHaveProperty("error");
    expect(ls(["-x"], ctx)).toHaveProperty("error");
    expect(ls(["/no-existe"], ctx)).toHaveProperty("error");
    expect(ls(["a", "b"], ctx)).toHaveProperty("error");
  });
});
