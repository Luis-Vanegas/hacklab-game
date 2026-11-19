import { describe, expect, it } from "vitest";
import workstation from "@/data/filesystem/workstation.json";
import type { FileSystemNode } from "@/lib/types";
import { executeCommand } from "@/terminal/CommandParser";
import { makeContext } from "./fixtures";

const filesystem = workstation as FileSystemNode;

describe("python", () => {
  it("muestra salidas prefijadas para los tres ejemplos sin modificar la partida", () => {
    const ctx = makeContext({ filesystem });
    const scanner = executeCommand("python ~/scripts/escaner_puertos.py", ctx);
    expect(scanner).toEqual({ output: ["Salida simulada:", "22/tcp ssh", "443/tcp https"] });
    expect(executeCommand("python ~/scripts/escaner_puertos.py", ctx)).toEqual(scanner);
    expect(executeCommand("python scripts/contar_fallidos.py", ctx).output).toEqual([
      "Salida simulada:",
      "Fallos de autenticación: 4",
    ]);
    expect(
      executeCommand("python hash_archivo.py", { ...ctx, currentDir: "/home/user/scripts" })
        .output[1],
    ).toMatch(/^SHA-256 de muestra: [a-f0-9]{64}$/u);
  });

  it("sin intérprete, avisa que no hay salida guardada y rechaza opciones de ejecución", () => {
    const ctx = makeContext({ filesystem });
    expect(executeCommand("python ~/scripts/otro.py", ctx).error).toContain(
      "No hay salida guardada",
    );
    expect(executeCommand("python -c texto", ctx).error).toBe("Uso: python <script>");
    expect(executeCommand("python", ctx).error).toBe("Uso: python <script>");
  });
});
