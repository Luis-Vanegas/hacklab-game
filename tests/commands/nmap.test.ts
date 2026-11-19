import { describe, expect, it } from "vitest";
import shelter from "@/data/contracts/04-archivo-de-turno.json";
import services from "@/data/findings/services.json";
import type { Contract } from "@/lib/types";
import nmap from "@/terminal/commands/nmap";
import { acmeContract as contract, makeContext } from "./fixtures";

function withInventory(activeContract: Contract) {
  const base = makeContext();
  return {
    ...base,
    gameState: { ...base.gameState, activeContract, unlockedTools: ["nmap"] },
  };
}

describe("nmap", () => {
  it("presenta columnas alineadas y destaca el FTP sin cifrar del inventario virtual", () => {
    const ctx = withInventory(contract);
    const result = nmap(["acme.example"], ctx);
    expect(result.output).toEqual([
      "Inventario virtual de acme.example",
      "PUERTO   ESTADO   SERVICIO  VERSIÓN",
      "21/tcp   abierto  ftp       FTP estándar (sin TLS)",
      "22/tcp   abierto  ssh       simulación Acme",
      "443/tcp  abierto  https     simulación Acme",
    ]);
    expect(result.highlights).toEqual([{ text: "ftp", kind: "finding", note: services.ftp.note }]);
    expect(nmap(["192.0.2.11"], ctx)).toEqual(result);
    expect(nmap(["acme.example"], ctx)).toEqual(result);
    expect(nmap(["otro.example"], ctx)).toHaveProperty("error");
  });

  it("destaca SMBv1 y deja los servicios comunes sin marca", () => {
    const result = nmap([shelter.target.hostname], withInventory(shelter as Contract));
    expect(result.highlights).toEqual([{ text: "smb", kind: "finding", note: services.smb.note }]);
  });

  it("distingue servicios repetidos por puerto y muestra una nota cuando falta una específica", () => {
    const active = {
      ...contract,
      target: {
        ...contract.target,
        ports: [
          { port: 80, service: "http", version: "Sin soporte", vulnerable: true },
          { port: 8080, service: "http", version: "Con soporte" },
          { port: 23, service: "telnet", version: "Telnet estándar", vulnerable: true },
          { port: 3389, service: "rdp", version: "Restringido", vulnerable: false },
        ],
      },
    };
    expect(nmap([active.target.hostname], withInventory(active)).highlights).toEqual([
      { text: "80/tcp", kind: "finding", note: services.legacy.note },
      { text: "telnet", kind: "finding", note: services.telnet.note },
    ]);
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
