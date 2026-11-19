import { marksFindings } from "@/engine/reputation";
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

export const useIntroSeen = () => useGameStore((s) => s.game.storyFlags.introSeen === true);
export const useMarkIntroSeen = () => useGameStore((s) => s.markIntroSeen);

// Python (Fase 3): la terminal usa runCommandAsync; el editor, el archivo abierto y el guardado
export const useRunCommandAsync = () => useGameStore((s) => s.runCommandAsync);
export const usePythonStatus = () => useGameStore((s) => s.pythonStatus);
export const useEditorFile = () => useGameStore((s) => s.editorFile);
export const useSaveFile = () => useGameStore((s) => s.saveFile);
export const useCloseEditor = () => useGameStore((s) => s.closeEditor);

// Avisos tipo videojuego. La UI muestra `events` y llama `dismiss(id)` al cerrarlos.
export function useGameEvents() {
  const events = useGameStore((s) => s.events);
  const dismiss = useGameStore((s) => s.dismissEvent);
  return { events, dismiss };
}

// Terminal legible: hallazgos de la partida y si todavía se marcan (S3/S4)
export const useFindings = () => useGameStore((s) => s.findings);
export const useShowFindings = () => useGameStore((s) => marksFindings(s.game.player.reputation));
