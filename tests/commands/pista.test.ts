import { describe, expect, it } from "vitest";
import type { CommandContext, Contract } from "@/lib/types";
import pista from "@/terminal/commands/pista";
import { acmeContract, makeContext } from "./fixtures";

function context(contract: Contract, storyFlags: Record<string, boolean> = {}): CommandContext {
  const base = makeContext();
  return { ...base, gameState: { ...base.gameState, activeContract: contract, storyFlags } };
}

describe("pista", () => {
  it("acepta el campo hint de los contratos anteriores", () => {
    const ctx = context(acmeContract);
    const result = pista([], ctx);
    expect(result).toMatchObject({
      output: ["Pista: Compra el visor con buy nmap y escribe nmap acme.example."],
      stateChanges: { storyFlags: { "hint:01-first-hack:acme-01:1": true } },
    });
    expect(pista([], ctx)).toEqual(result);
  });

  it("pasa de suave a media y solución, y conserva el resultado al repetir", () => {
    const [first, second] = acmeContract.objectives;
    if (!first || !second) throw new Error("Faltan objetivos de la misión de prueba.");
    const current = { ...second, hints: ["Primera ayuda", "Segunda ayuda", "Respuesta final"] };
    const contract = { ...acmeContract, objectives: [{ ...first, completed: true }, current] };
    const outputs = [
      "Pista suave: Primera ayuda",
      "Pista media: Segunda ayuda",
      "Solución: Respuesta final",
    ];

    let flags: Record<string, boolean> = {};
    for (const output of outputs) {
      const result = pista([], context(contract, flags));
      expect(result.output).toEqual([output]);
      flags = { ...flags, ...result.stateChanges?.storyFlags };
    }

    expect(flags).toEqual({
      "hint:01-first-hack:acme-02:1": true,
      "hint:01-first-hack:acme-02:2": true,
      "hint:01-first-hack:acme-02:3": true,
    });
    expect(pista([], context(contract, flags))).toEqual({
      output: ["Solución: Respuesta final"],
      outputType: "hint",
    });
  });

  it("rechaza argumentos y avisa cuando no hay objetivo o pistas", () => {
    expect(pista(["extra"], context(acmeContract))).toMatchObject({ error: "Uso: pista" });
    expect(pista([], makeContext())).toHaveProperty("error");
    const objectives = acmeContract.objectives.map((objective) => ({
      ...objective,
      hint: undefined,
    }));
    expect(pista([], context({ ...acmeContract, objectives }))).toMatchObject({
      error: "El objetivo actual no tiene pistas.",
    });
  });
});
