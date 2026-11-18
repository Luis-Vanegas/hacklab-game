import { describe, expect, it } from "vitest";
import nmap from "@/terminal/commands/nmap";
import { acmeContract as contract, makeContext } from "./fixtures";

describe("nmap", () => {
  it("presenta los puertos de la misión al usar su nombre o su IP virtual", () => {
    const base = makeContext();
    const ctx = {
      ...base,
      gameState: { ...base.gameState, activeContract: contract, unlockedTools: ["nmap"] },
    };
    const result = nmap(["acme.example"], ctx);
    expect(result.output).toEqual([
      "Inventario virtual de acme.example",
      "22 ssh simulación Acme",
      "443 https simulación Acme",
    ]);
    expect(nmap(["192.0.2.11"], ctx)).toEqual(result);
    expect(nmap(["acme.example"], ctx)).toEqual(result);
    expect(nmap(["otro.example"], ctx)).toHaveProperty("error");
  });

  it("requiere argumento, contrato y herramienta", () => {
    const ctx = makeContext();
    expect(nmap([], ctx)).toHaveProperty("error");
    expect(nmap(["acme.example"], ctx)).toHaveProperty("error");
    expect(
      nmap(["acme.example"], { ...ctx, gameState: { ...ctx.gameState, activeContract: contract } }),
    ).toMatchObject({ error: "Adquiere la herramienta con buy nmap." });
  });
});
