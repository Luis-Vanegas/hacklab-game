import { beforeEach, describe, expect, it } from "vitest";
import dayFour from "@/data/contracts/13-dia-4-phishing.json";
import dayFive from "@/data/contracts/14-dia-5-logs-web.json";
import daySix from "@/data/contracts/15-dia-6-contrasenas.json";
import daySeven from "@/data/contracts/16-dia-7-informe.json";
import workstation from "@/data/filesystem/workstation.json";
import { acceptContract } from "@/engine/contracts";
import type { Contract, FileSystemNode } from "@/lib/types";
import { useGameStore } from "@/store";

const tickets = [dayFour, dayFive, daySix, daySeven] as readonly Contract[];
const store = () => useGameStore.getState();

function openTicket(id: string) {
  const ticket = tickets.find((entry) => entry.id === id);
  if (!ticket) throw new Error("Falta el ticket " + id);
  // K3 agrega los tickets al catálogo de la interfaz.
  useGameStore.setState({ game: acceptContract(store().game, ticket) });
}

function run(command: string): string[] {
  const result = store().runCommand(command);
  expect(result.error, command).toBeUndefined();
  return result.output;
}

function submit(id: string) {
  const active = store().game.activeContract;
  expect(active?.id).toBe(id);
  expect(active?.objectives.every((objective) => objective.completed)).toBe(true);
  store().submitContract();
  expect(store().game.completedContracts).toContain(id);
}

describe("Primera semana de Nodo Seguro, días 4 a 7", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
    useGameStore.setState({ filesystem: workstation as FileSystemNode });
  });

  it("documenta el remitente y el dominio ficticio del correo", () => {
    openTicket(dayFour.id);
    expect(run("cat ~/correo/factura.eml").join("\n")).toContain("Factura pendiente");
    expect(run("grep From: ~/correo/factura.eml")).toHaveLength(1);
    expect(run("grep https:// ~/correo/factura.eml").join("\n")).toContain(
      "https://nodoseguro-pagos.example/",
    );
    expect(run("grep nodoseguro-pagos.example ~/correo/factura.eml")).toHaveLength(2);
    submit(dayFour.id);
  });

  it("encuentra y cuenta las tres alertas SQL registradas", () => {
    openTicket(dayFive.id);
    expect(run("grep sql_injection /var/log/nginx/access.log")).toHaveLength(3);
    expect(run("grep -c sql_injection /var/log/nginx/access.log")).toEqual(["3"]);
    submit(dayFive.id);
  });

  it("distingue la integridad del archivo de la debilidad de MD5", () => {
    openTicket(daySix.id);
    expect(run("file ~/auditoria/hashes.txt")).toEqual(["~/auditoria/hashes.txt: texto"]);
    expect(run("sha256sum ~/auditoria/hashes.txt")[0]).toMatch(/^[a-f0-9]{64}/u);
    expect(run("grep MD5 ~/auditoria/hashes.txt")).toHaveLength(1);
    expect(run("grep MD5 ~/auditoria/criterios.txt")[0]).toContain(
      "No es adecuado para almacenar contraseñas",
    );
    submit(daySix.id);
  });

  it("escribe, lee y entrega el informe sin tocar archivos reales", () => {
    openTicket(daySeven.id);
    const summary =
      "Dominio sospechoso: nodoseguro-pagos.example; intentos web: 3; MD5 debe retirarse.";
    expect(store().runCommand("cat ~/informe.txt").error).toBeDefined();
    const command = 'echo "' + summary + '" > ~/informe.txt';
    run(command);
    expect(store().runCommand(command).filesystemChanges).toBeUndefined();
    expect(run("cat ~/informe.txt")).toEqual([summary, ""]);
    submit(daySeven.id);
  });
});
