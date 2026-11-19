import { beforeEach, describe, expect, it } from "vitest";
import tutorial from "@/data/contracts/00-tutorial.json";
import dayOne from "@/data/contracts/10-dia-1-bienvenida.json";
import dayTwo from "@/data/contracts/11-dia-2-logs.json";
import dayThree from "@/data/contracts/12-dia-3-proceso-raro.json";
import workstation from "@/data/filesystem/workstation.json";
import { acceptContract } from "@/engine/contracts";
import type { Contract, FileSystemNode } from "@/lib/types";
import { CHARACTERS, useGameStore } from "@/store";
import { findVirtualNode } from "@/terminal/commands/virtualPath";

const tickets = [dayOne, dayTwo, dayThree] as readonly Contract[];
const tree = workstation as FileSystemNode;
const store = () => useGameStore.getState();

function openTicket(id: string) {
  const ticket = tickets.find((entry) => entry.id === id);
  if (!ticket) throw new Error("No existe el ticket de prueba " + id);
  useGameStore.setState({ game: acceptContract(store().game, ticket) });
}

function run(input: string): string[] {
  const result = store().runCommand(input);
  expect(result.error, input).toBeUndefined();
  return result.output;
}

function submitCompletedTicket(id: string) {
  const active = store().game.activeContract;
  expect(active?.id).toBe(id);
  expect(active?.objectives.length).toBeGreaterThan(0);
  expect(active?.objectives.every((objective) => objective.completed)).toBe(true);
  store().submitContract();
  expect(store().game.completedContracts).toContain(id);
}

describe("Tickets de Nodo Seguro", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
    // Se inyecta el árbol y se abre el ticket hasta que K2 conecte ambos al arranque.
    useGameStore.setState({ filesystem: tree });
  });

  it("conserva los archivos de inicio y da tres pistas distintas por objetivo", () => {
    expect(tree.type).toBe("dir");
    for (const path of [
      "/home/user/notes",
      "/home/user/.bashrc",
      "/home/user/bienvenida.txt",
      "/home/user/.bash_history",
      "/etc/passwd",
      "/etc/hosts",
      "/var/log/auth.log",
    ]) {
      expect(findVirtualNode(tree, path)?.type, path).toBe("file");
    }
    const historyFile = findVirtualNode(tree, "/home/user/.bash_history");
    expect(historyFile?.hidden).toBe(true);
    for (const ticket of tickets) {
      expect(ticket.channel).toBe("work");
      expect(ticket.story.intro[0]?.character).toBe("MARTA");
      expect(ticket.story.onComplete[0]?.character).toBe("MARTA");
      expect(CHARACTERS.MARTA.name).toBe("Marta Ríos");
      for (const objective of ticket.objectives) {
        expect(objective.hints).toHaveLength(3);
        expect(new Set(objective.hints).size).toBe(3);
        expect(objective.hints?.every((hint) => hint.trim().length > 0)).toBe(true);
      }
    }
  });

  it("completa la bienvenida y resuelve la intranet", () => {
    openTicket(dayOne.id);
    expect(run("cat bienvenida.txt").join("\n")).toContain("Marta Ríos");
    expect(run("ifconfig").join("\n")).toContain("10.20.0.15/24");
    expect(run("ping 10.20.0.1").join("\n")).toContain("4 recibidos");
    expect(run("nslookup intranet.nodoseguro.test").join("\n")).toContain("10.20.0.80");
    submitCompletedTicket(dayOne.id);
  });

  it("investiga los fallos y verifica la IP en el registro virtual", () => {
    openTicket(dayTwo.id);
    expect(run("tail /var/log/auth.log").join("\n")).toContain("Failed password");
    expect(run("grep -c Failed /var/log/auth.log")).toEqual(["4"]);
    const evidence = run("grep 203.0.113.45 /var/log/auth.log");
    expect(evidence).toHaveLength(4);
    expect(evidence.every((line) => line.includes("Failed password"))).toBe(true);
    submitCompletedTicket(dayTwo.id);
  });

  it("detecta la conexión y detiene el proceso ficticio", () => {
    openTicket(dayThree.id);
    expect(run("netstat").join("\n")).toContain("203.0.113.45:4444");
    expect(run("ps").join("\n")).toContain("svch0st");
    expect(run("kill 4444").join("\n")).toContain("Proceso virtual detenido");
    expect(run("ps").join("\n")).not.toContain("svch0st");
    submitCompletedTicket(dayThree.id);
  });

  it("alcanza 500 XP con los tres tickets y un contrato darknet", () => {
    expect(store().acceptContract("02-data-heist")).toBe(false);
    for (const ticket of tickets) {
      openTicket(ticket.id);
      for (const { trigger } of ticket.objectives) {
        run([trigger.command, ...(trigger.args ?? [])].join(" "));
      }
      submitCompletedTicket(ticket.id);
    }

    expect(store().game.player.xp).toBe(400);
    expect(store().acceptContract("02-data-heist")).toBe(false);
    expect(store().acceptContract(tutorial.id)).toBe(true);
    for (const line of ["ls", "cat notes", "cd /etc", "cat passwd", "whoami"]) run(line);
    submitCompletedTicket(tutorial.id);
    expect(store().game.player).toMatchObject({ xp: 500, level: 6, reputation: "hacker" });
    expect(store().acceptContract("02-data-heist")).toBe(true);
  });
});
