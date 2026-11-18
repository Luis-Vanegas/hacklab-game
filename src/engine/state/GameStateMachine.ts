import type { GamePhase, GameState, GameDifficulty, PlayerState } from "@/lib/types";
import { logStateChange } from "@/lib/logger";

// State machine del juego.
// Transiciones explícitas: si no está en el mapa, es inválida.
// Cada transición es atómica: se completa o no cambia nada.

const VALID_TRANSITIONS: Record<GamePhase, readonly GamePhase[]> = {
  boot: ["menu"],
  menu: ["playing"],
  playing: ["in_contract", "menu", "game_over"],
  in_contract: ["playing", "game_over"],
  game_over: ["menu"],
} as const;

export function canTransition(from: GamePhase, to: GamePhase): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function transition(state: GameState, to: GamePhase): GameState {
  if (!canTransition(state.phase, to)) {
    throw new Error(
      `Transición inválida: ${state.phase} → ${to}. ` +
      `Permitidas: ${VALID_TRANSITIONS[state.phase].join(", ")}`,
    );
  }
  logStateChange("phase", state.phase, to);
  return { ...state, phase: to };
}

export function createInitialState(): GameState {
  const player: PlayerState = {
    username: "anonymous",
    credits: 500,
    xp: 0,
    level: 1,
    reputation: "script_kiddie",
  };

  return {
    phase: "boot",
    difficulty: "beginner",
    player,
    activeContract: null,
    completedContracts: [],
    unlockedTools: [],
    traceLevel: 0,
    connectedTo: null,
    storyFlags: {},
  };
}

// Idempotente: resetear trace no falla si ya está en 0
export function resetTrace(state: GameState): GameState {
  if (state.traceLevel === 0) return state;
  logStateChange("traceLevel", state.traceLevel, 0);
  return { ...state, traceLevel: 0 };
}

export function addTrace(state: GameState, amount: number): GameState {
  const newTrace = Math.min(100, Math.max(0, state.traceLevel + amount));
  if (newTrace === state.traceLevel) return state;
  logStateChange("traceLevel", state.traceLevel, newTrace);

  // Trace al 100% = game over
  if (newTrace >= 100) {
    return transition({ ...state, traceLevel: 100 }, "game_over");
  }
  return { ...state, traceLevel: newTrace };
}

export function setDifficulty(state: GameState, difficulty: GameDifficulty): GameState {
  if (state.difficulty === difficulty) return state;
  logStateChange("difficulty", state.difficulty, difficulty);
  return { ...state, difficulty };
}
