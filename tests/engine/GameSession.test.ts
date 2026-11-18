import { describe, expect, it } from "vitest";
import { applyCommandResult, createSession, HOME_DIR } from "@/engine/session";
import { resolve } from "@/engine/filesystem";
import tutorialData from "@/data/contracts/00-tutorial.json";
import { acceptContract } from "@/engine/contracts";
import type { Contract } from "@/lib/types";

const tutorial = tutorialData as Contract;

describe("GameSession", () => {
  it("arranca en estado jugable, en el home y sin historial", () => {
    const session = createSession();
    expect(session.game.phase).toBe("playing");
    expect(session.currentDir).toBe(HOME_DIR);
    expect(session.history).toEqual([]);
  });

  it("aplica cwd, estado, filesystem e historial en un solo paso", () => {
    const session = createSession();
    const next = applyCommandResult(
      session,
      { input: "algo", command: "algo", args: [] },
      {
        output: [],
        cwd: "/etc",
        stateChanges: { playerCredits: 100, unlockTool: "ssh", connectedTo: "acme" },
        filesystemChanges: [{ path: "/home/user/notes", action: "delete" }],
      },
    );

    expect(next.currentDir).toBe("/etc");
    expect(next.game.player.credits).toBe(100);
    expect(next.game.unlockedTools).toEqual(["ssh"]);
    expect(next.game.connectedTo).toBe("acme");
    expect(resolve(next.filesystem, "/home/user/notes")).toBeNull();
    expect(next.history).toEqual(["algo"]);
    // La sesión original no cambia
    expect(session.currentDir).toBe(HOME_DIR);
  });

  it("si el comando falla solo registra el historial", () => {
    const session = createSession();
    const next = applyCommandResult(
      session,
      { input: "cd /nada", command: "cd", args: ["/nada"] },
      { output: ["error"], error: "error", cwd: "/nada" },
    );
    expect(next.currentDir).toBe(HOME_DIR);
    expect(next.game).toBe(session.game);
    expect(next.history).toEqual(["cd /nada"]);
  });

  it("no duplica herramientas desbloqueadas", () => {
    const once = applyCommandResult(
      createSession(),
      { input: "buy ssh", command: "buy", args: ["ssh"] },
      { output: [], stateChanges: { unlockTool: "ssh" } },
    );
    const twice = applyCommandResult(
      once,
      { input: "buy ssh", command: "buy", args: ["ssh"] },
      { output: [], stateChanges: { unlockTool: "ssh" } },
    );
    expect(twice.game.unlockedTools).toEqual(["ssh"]);
  });

  it("completa el objetivo cuyo trigger coincide con comando y argumentos", () => {
    const session = { ...createSession(), game: acceptContract(createSession().game, tutorial) };
    const ok = { output: [] };

    const afterCat = applyCommandResult(
      session,
      { input: "cat notes", command: "cat", args: ["notes"] },
      ok,
    );
    const afterOther = applyCommandResult(
      session,
      { input: "cat otro", command: "cat", args: ["otro"] },
      ok,
    );

    const done = (s: typeof session) =>
      s.game.activeContract?.objectives.filter((o) => o.completed).map((o) => o.trigger.command);
    expect(done(afterCat)).toEqual(["cat"]);
    expect(done(afterOther)).toEqual([]);
  });

  it("no completa objetivos si el comando falló", () => {
    const session = { ...createSession(), game: acceptContract(createSession().game, tutorial) };
    const next = applyCommandResult(
      session,
      { input: "ls", command: "ls", args: [] },
      { output: ["x"], error: "x" },
    );
    expect(next.game.activeContract?.objectives.some((o) => o.completed)).toBe(false);
  });
});
