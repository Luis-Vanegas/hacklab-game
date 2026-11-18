import { describe, expect, it } from "vitest";
import type { Contract } from "@/lib/types";
import ssh from "@/terminal/commands/ssh";
import { acmeContract, archiveContract, makeContext } from "./fixtures";

function sessionContext(activeContract: Contract) {
  const ctx = makeContext();
  return { ...ctx, gameState: { ...ctx.gameState, activeContract, unlockedTools: ["ssh"] } };
}

describe("ssh", () => {
  it("propone cambiar la sesión virtual una sola vez", () => {
    const ctx = sessionContext(acmeContract);
    const result = ssh(["acme.example"], ctx);
    expect(result.stateChanges).toEqual({ connectedTo: "acme.example" });
    expect(ssh(["acme.example"], ctx)).toEqual(result);
    expect(ctx.connectedTo).toBeNull();
    expect(ssh(["acme.example"], { ...ctx, connectedTo: "acme.example" })).toEqual({
      output: result.output,
    });
  });

  it("comprueba únicamente la ficha del escenario activo", () => {
    const ctx = sessionContext(archiveContract);
    expect(ssh(["archivo.example"], ctx)).toHaveProperty("error");
    expect(ssh(["archivo.example", "INCORRECTA"], ctx)).toHaveProperty("error");
    expect(ssh(["archivo.example", "FICHA-39"], ctx).stateChanges).toEqual({
      connectedTo: "archivo.example",
    });
    expect(ssh(["otro.example", "FICHA-39"], ctx)).toHaveProperty("error");
  });

  it("rechaza argumentos inválidos y exige la herramienta", () => {
    const ctx = sessionContext(acmeContract);
    expect(ssh([], ctx)).toHaveProperty("error");
    expect(ssh(["acme.example", "extra", "otro"], ctx)).toHaveProperty("error");
    expect(
      ssh(["acme.example"], { ...ctx, gameState: { ...ctx.gameState, unlockedTools: [] } }),
    ).toHaveProperty("error");
  });
});
