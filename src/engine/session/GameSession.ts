import type {
  CommandResult,
  FileSystemNode,
  GameState,
  MutableGameFields,
  Objective,
} from "@/lib/types";
import { completeObjective } from "@/engine/contracts";
import { applyChanges, createRootFS } from "@/engine/filesystem";
import { addCredits, addXp } from "@/engine/reputation";
import { addTrace, createInitialState, transition } from "@/engine/state";

// Sesión de juego: todo lo que cambia al ejecutar un comando.
// Inmutable: cada comando produce una sesión nueva o devuelve la misma.

export interface GameSession {
  readonly game: GameState;
  readonly filesystem: FileSystemNode;
  readonly currentDir: string;
  readonly history: readonly string[];
}

export interface ExecutedCommand {
  readonly input: string;
  readonly command: string;
  readonly args: readonly string[];
}

export const HOME_DIR = "/home/user";

export function createSession(game?: GameState, history: readonly string[] = []): GameSession {
  // ponytail: sin pantalla de menú todavía, la partida nueva arranca directo en "playing"
  const initial = game ?? transition(transition(createInitialState(), "menu"), "playing");
  return { game: initial, filesystem: createRootFS(), currentDir: HOME_DIR, history };
}

// Aplica de una vez todo lo que devolvió un comando. Si el comando falló,
// solo se registra en el historial: un error nunca cambia el juego a medias.
export function applyCommandResult(
  session: GameSession,
  executed: ExecutedCommand,
  result: CommandResult,
): GameSession {
  const history = [...session.history, executed.input];
  if (result.error !== undefined) return { ...session, history };

  const game = trackObjectives(applyStateChanges(session.game, result.stateChanges), executed);
  return {
    game,
    filesystem: applyChanges(session.filesystem, result.filesystemChanges ?? []),
    currentDir: result.cwd ?? session.currentDir,
    history,
  };
}

function applyStateChanges(game: GameState, changes?: Partial<MutableGameFields>): GameState {
  if (!changes) return game;
  let next = game;

  // Los valores llegan absolutos; se convierten en deltas para reusar las reglas del engine
  if (changes.traceLevel !== undefined) next = addTrace(next, changes.traceLevel - next.traceLevel);
  if (changes.connectedTo !== undefined) next = { ...next, connectedTo: changes.connectedTo };
  if (changes.storyFlags)
    next = { ...next, storyFlags: { ...next.storyFlags, ...changes.storyFlags } };
  if (changes.playerCredits !== undefined) {
    next = {
      ...next,
      player: addCredits(next.player, changes.playerCredits - next.player.credits),
    };
  }
  if (changes.playerXp !== undefined) {
    next = { ...next, player: addXp(next.player, changes.playerXp - next.player.xp) };
  }
  if (changes.unlockTool && !next.unlockedTools.includes(changes.unlockTool)) {
    next = { ...next, unlockedTools: [...next.unlockedTools, changes.unlockTool] };
  }
  if (changes.completeObjective) next = completeObjective(next, changes.completeObjective);
  return next;
}

function trackObjectives(game: GameState, executed: ExecutedCommand): GameState {
  const pending = game.activeContract?.objectives.filter(
    (objective) => !objective.completed && matches(objective, executed, game),
  );
  return (pending ?? []).reduce((state, objective) => completeObjective(state, objective.id), game);
}

function matches(objective: Objective, executed: ExecutedCommand, game: GameState): boolean {
  const { trigger } = objective;
  if (trigger.command !== executed.command) return false;
  if (trigger.requiresConnection && game.connectedTo === null) return false;
  if (!trigger.args) return true;
  return (
    trigger.args.length === executed.args.length &&
    trigger.args.every((arg, i) => arg === executed.args[i])
  );
}
