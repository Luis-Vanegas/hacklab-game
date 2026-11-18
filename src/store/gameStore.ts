import { create } from "zustand";
import tutorial from "@/data/contracts/00-tutorial.json";
import firstHack from "@/data/contracts/01-first-hack.json";
import dataHeist from "@/data/contracts/02-data-heist.json";
import {
  acceptContract as acceptInEngine,
  canAcceptContract,
  submitContract as submitInEngine,
} from "@/engine/contracts";
import { applyCommandResult, createSession, type GameSession } from "@/engine/session";
import { emit } from "@/lib/events";
import { load, save } from "@/lib/persistence";
import { getAllTiers } from "@/engine/reputation";
import type {
  CommandContext,
  CommandResult,
  Contract,
  GameDifficulty,
  GamePhase,
  GameState,
  ReputationTier,
} from "@/lib/types";
import { executeCommand, parseCommand } from "@/terminal/CommandParser";

// Capa de integración: une parser, comandos y engine, y es lo único con efectos
// (persistencia y eventos). La UI solo habla con este store a través de los hooks.

// Los JSON pasan por tests/data, que valida su estructura contra estos tipos
export const CONTRACTS: readonly Contract[] = [tutorial, firstHack, dataHeist] as Contract[];

// ponytail: tope fijo para que localStorage no crezca sin límite
const MAX_HISTORY = 500;

export interface GameStore extends GameSession {
  runCommand(input: string): CommandResult;
  acceptContract(contractId: string): boolean;
  submitContract(): void;
  newGame(): void;
}

export const useGameStore = create<GameStore>()((set, get) => {
  // Guarda y publica en un solo lugar: toda transición pasa por aquí
  const commit = (session: GameSession, event: string, payload: Record<string, unknown>) => {
    set(session);
    save({ gameState: session.game, commandHistory: session.history });
    emit(event, payload, "gameStore");
  };

  return {
    ...loadSession(),

    runCommand(input) {
      const parsed = parseCommand(input);
      const session = currentSession(get());
      const result = executeCommand(input, buildContext(session));
      if (parsed === null) return result;

      const executed = "error" in parsed ? { input, command: "", args: [] } : { input, ...parsed };
      const next = applyCommandResult(session, executed, result);
      commit({ ...next, history: next.history.slice(-MAX_HISTORY) }, "command.executed", {
        command: executed.command,
        ok: result.error === undefined,
      });
      return result;
    },

    acceptContract(contractId) {
      const session = currentSession(get());
      const contract = CONTRACTS.find((c) => c.id === contractId);
      if (!contract || !canAcceptContract(session.game, contract)) return false;
      commit(
        { ...session, game: acceptInEngine(session.game, contract) },
        "store.contract.accepted",
        {
          contractId,
        },
      );
      return true;
    },

    submitContract() {
      const session = currentSession(get());
      // Perder (game_over) no permite cobrar el contrato en curso
      if (session.game.phase !== "in_contract" || !session.game.activeContract) return;
      commit({ ...session, game: submitInEngine(session.game) }, "store.contract.submitted", {});
    },

    newGame() {
      commit(createSession(), "game.new", {});
    },
  };
});

// Recupera la partida guardada. El progreso es lo único que se persiste:
// el filesystem y el directorio vuelven al inicio en cada carga.
export function loadSession(): GameSession {
  const saved = load();
  if (!saved || !isGameState(saved.gameState) || !Array.isArray(saved.commandHistory)) {
    return createSession();
  }
  return createSession(
    saved.gameState,
    saved.commandHistory.filter((h) => typeof h === "string"),
  );
}

function currentSession(store: GameStore): GameSession {
  return {
    game: store.game,
    filesystem: store.filesystem,
    currentDir: store.currentDir,
    history: store.history,
  };
}

function buildContext(session: GameSession): CommandContext {
  return {
    gameState: session.game,
    currentDir: session.currentDir,
    filesystem: session.filesystem,
    user: session.game.player.username,
    hostname: session.game.connectedTo ?? "darknet",
    connectedTo: session.game.connectedTo,
    difficulty: session.game.difficulty,
    history: session.history,
  };
}

// localStorage es una entrada no confiable: el jugador puede editarlo.
// Se valida todo lo que el engine lee; ante la duda, partida nueva.
const PHASES: readonly GamePhase[] = ["boot", "menu", "playing", "in_contract", "game_over"];
const DIFFICULTIES: readonly GameDifficulty[] = ["beginner", "normal", "elite", "anonymous"];
const TIERS: readonly ReputationTier[] = getAllTiers().map((t) => t.tier);

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  const { player, activeContract } = value;
  return (
    PHASES.includes(value.phase as GamePhase) &&
    DIFFICULTIES.includes(value.difficulty as GameDifficulty) &&
    typeof value.traceLevel === "number" &&
    (value.connectedTo === null || typeof value.connectedTo === "string") &&
    isRecord(value.storyFlags) &&
    isStringArray(value.completedContracts) &&
    isStringArray(value.unlockedTools) &&
    isRecord(player) &&
    typeof player.username === "string" &&
    typeof player.xp === "number" &&
    typeof player.credits === "number" &&
    typeof player.level === "number" &&
    TIERS.includes(player.reputation as ReputationTier) &&
    (activeContract === null || isContract(activeContract))
  );
}

function isContract(value: unknown): boolean {
  if (!isRecord(value) || typeof value.id !== "string" || !isRecord(value.target)) return false;
  return (
    Array.isArray(value.objectives) &&
    value.objectives.every(
      (o: unknown) =>
        isRecord(o) &&
        typeof o.id === "string" &&
        typeof o.completed === "boolean" &&
        isRecord(o.trigger) &&
        typeof o.trigger.command === "string",
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}
