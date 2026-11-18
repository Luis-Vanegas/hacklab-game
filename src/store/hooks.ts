import { useGameStore } from "./gameStore";

// Hooks públicos para la UI. Cada uno se suscribe solo a su porción del estado,
// así un cambio de créditos no vuelve a renderizar la barra de rastreo.

export const usePlayer = () => useGameStore((s) => s.game.player);
export const useTraceLevel = () => useGameStore((s) => s.game.traceLevel);
export const useActiveContract = () => useGameStore((s) => s.game.activeContract);
export const useCompletedContracts = () => useGameStore((s) => s.game.completedContracts);
export const useUnlockedTools = () => useGameStore((s) => s.game.unlockedTools);
export const useDifficulty = () => useGameStore((s) => s.game.difficulty);
export const useGamePhase = () => useGameStore((s) => s.game.phase);
export const useConnectedTo = () => useGameStore((s) => s.game.connectedTo);
export const useCurrentDir = () => useGameStore((s) => s.currentDir);

export const useRunCommand = () => useGameStore((s) => s.runCommand);
export const useAcceptContract = () => useGameStore((s) => s.acceptContract);
export const useSubmitContract = () => useGameStore((s) => s.submitContract);
export const useNewGame = () => useGameStore((s) => s.newGame);
