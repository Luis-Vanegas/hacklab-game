import { create } from "zustand";
import machine from "@/data/machine/workstation.json";
import shopData from "@/data/tools/shop.json";
import {
  acceptContract as acceptInEngine,
  canAcceptContract,
  submitContract as submitInEngine,
} from "@/engine/contracts";
import {
  applyCommandResult,
  createSession,
  diffGameEvents,
  type GameSession,
} from "@/engine/session";
import { applyChanges, resolve } from "@/engine/filesystem";
import { collectFiles, fileChanges } from "@/engine/scripting";
import { HOME_DIR } from "@/engine/session";
import { DEFAULT_USERNAME, setUsername, validateUsername } from "@/engine/state";
import { emit } from "@/lib/events";
import { load, save } from "@/lib/persistence";
import { getAllTiers } from "@/engine/reputation";
import type {
  CommandContext,
  CommandResult,
  Contract,
  Finding,
  GameDifficulty,
  GamePhase,
  GameState,
  QueuedGameAlert,
  ReputationTier,
  ToolDefinition,
} from "@/lib/types";
import { executeCommand, parseCommand, type ParsedCommand } from "@/terminal/CommandParser";
import { commands } from "@/terminal/commands";
import { editablePathError, MAX_FILE_CHARS } from "@/terminal/commands/edit";
import { commandError, type CommandManual } from "@/terminal/commands/shared";
import { findVirtualNode, resolveVirtualPath } from "@/terminal/commands/virtualPath";
import { createWorkerRunner, type PythonRunner, type PythonStatus } from "./python/pythonRunner";

export const PYTHON_TIMEOUT_MESSAGE = "Tiempo agotado: el script tardó más de 5 s y se detuvo.";
const PYTHON_LOADING_MESSAGE = "Cargando el intérprete de Python…";

// El worker real no existe en jsdom: las pruebas inyectan un runner falso
let pythonRunner: PythonRunner | null = null;
export function setPythonRunner(runner: PythonRunner | null): void {
  pythonRunner = runner;
}

// Capa de integración: une parser, comandos y engine, y es lo único con efectos
// (persistencia y eventos). La UI solo habla con este store a través de los hooks.

// Los JSON pasan por tests/data, que valida su estructura contra estos tipos
// Todo JSON en src/data/contracts entra al juego solo; el prefijo numérico define el orden
const contractModules = import.meta.glob<Contract>("@/data/contracts/*.json", {
  eager: true,
  import: "default",
});
// Equipo del jugador en Nodo Seguro: es el host del prompt mientras no esté conectado a otro
export const LOCAL_HOST: string = machine.hostname;

export const CONTRACTS: readonly Contract[] = Object.keys(contractModules)
  .sort()
  .map((path) => contractModules[path] as Contract);
export const TOOLS: readonly ToolDefinition[] = shopData;

// Manual de cada comando para la guía visual, sin la función que lo ejecuta
export const COMMAND_GUIDE: readonly CommandManual[] = commands.map(({ run, ...manual }) => manual);

// ponytail: tope fijo para que localStorage no crezca sin límite
const MAX_HISTORY = 500;
// ponytail: si la UI no descarta avisos, solo se guardan los últimos
const MAX_EVENTS = 20;
// ponytail: el panel muestra los últimos; los más viejos ya se leyeron
const MAX_FINDINGS = 30;

// Suma los hallazgos de un comando: el más reciente primero, sin repetir el mismo texto
export function addFindings(
  current: readonly Finding[],
  result: CommandResult,
  command: string,
): readonly Finding[] {
  if (result.error !== undefined) return current;
  const fresh = (result.highlights ?? []).flatMap((h) =>
    h.kind === "finding" && h.note ? [{ text: h.text, note: h.note, command }] : [],
  );
  if (fresh.length === 0) return current;
  const seen = new Set(fresh.map((f) => f.text));
  return [...fresh, ...current.filter((f) => !seen.has(f.text))].slice(0, MAX_FINDINGS);
}

// Deben declararse antes de crear el store: create() llama a loadSession() al importar
// el módulo, y con una partida guardada isGameState las usa en ese mismo momento.
const PHASES: readonly GamePhase[] = ["boot", "menu", "playing", "in_contract", "game_over"];
const DIFFICULTIES: readonly GameDifficulty[] = ["beginner", "normal", "elite", "anonymous"];
const TIERS: readonly ReputationTier[] = getAllTiers().map((t) => t.tier);

export interface GameStore extends GameSession {
  // Avisos pendientes para la UI. No se guardan: son de la sesión en curso.
  readonly events: readonly QueuedGameAlert[];
  readonly pythonStatus: PythonStatus;
  // Archivo abierto en el editor. No se guarda: es de la sesión en curso.
  readonly editorFile: { readonly path: string; readonly content: string } | null;
  // Hallazgos marcados en esta partida (S3). No se guardan: son de la sesión en curso.
  readonly findings: readonly Finding[];
  runCommand(input: string): CommandResult;
  // Igual que runCommand, pero `python` espera al intérprete. `onNotice` avisa mientras carga.
  runCommandAsync(input: string, onNotice?: (message: string) => void): Promise<CommandResult>;
  saveFile(path: string, content: string): CommandResult;
  closeEditor(): void;
  acceptContract(contractId: string): boolean;
  submitContract(): void;
  // Devuelve el error si el nombre no es válido; en ese caso no crea partida (S1)
  newGame(name?: string): string | null;
  dismissEvent(id: number): void;
  markIntroSeen(): void;
}

export const useGameStore = create<GameStore>()((set, get) => {
  // Guarda y publica en un solo lugar: toda transición pasa por aquí
  let nextEventId = 1;
  const commit = (session: GameSession, event: string, payload: Record<string, unknown>) => {
    const fresh = diffGameEvents(get().game, session.game).map((e) => ({
      ...e,
      id: nextEventId++,
    }));
    set({ ...session, events: [...get().events, ...fresh].slice(-MAX_EVENTS) });
    save({ gameState: session.game, commandHistory: session.history });
    emit(event, payload, "gameStore");
  };

  // Registra un comando ya ejecutado sobre el estado actual: historial, objetivos y archivos
  const record = (
    input: string,
    parsed: ParsedCommand | { error: string },
    result: CommandResult,
  ) => {
    const session = currentSession(get());
    const executed = "error" in parsed ? { input, command: "", args: [] } : { input, ...parsed };
    const next = applyCommandResult(session, executed, result);
    commit({ ...next, history: next.history.slice(-MAX_HISTORY) }, "command.executed", {
      command: executed.command,
      ok: result.error === undefined,
    });
    if (result.openEditor && result.error === undefined) set({ editorFile: result.openEditor });
    const findings = addFindings(get().findings, result, input);
    if (findings !== get().findings) set({ findings });
  };

  return {
    ...loadSession(),
    events: [],
    pythonStatus: "idle",
    editorFile: null,
    findings: [],

    runCommand(input) {
      const parsed = parseCommand(input);
      const result = executeCommand(input, buildContext(currentSession(get())));
      if (parsed !== null) record(input, parsed, result);
      return result;
    },

    async runCommandAsync(input, onNotice) {
      const parsed = parseCommand(input);
      const session = currentSession(get());
      const script =
        parsed && !("error" in parsed) && parsed.command === "python"
          ? pythonScriptPath(parsed.args, session)
          : null;
      if (!parsed || "error" in parsed || script === null) return get().runCommand(input);

      const { pythonStatus } = get();
      if (pythonStatus === "loading" || pythonStatus === "running") {
        return commandError("Ya hay un script de Python en ejecución.");
      }

      const before = collectFiles(session.filesystem, HOME_DIR);
      pythonRunner ??= createWorkerRunner();
      const outcome = await pythonRunner.run(
        { files: before, script, cwd: session.currentDir },
        (status) => {
          set({ pythonStatus: status });
          if (status === "loading") onNotice?.(PYTHON_LOADING_MESSAGE);
        },
      );

      if (outcome.kind === "unavailable") {
        set({ pythonStatus: "error" });
        emit("python.unavailable", { reason: outcome.message }, "gameStore");
        // Plan B (S8): la salida guardada de los scripts de ejemplo
        const fallback = get().runCommand(input);
        return {
          ...fallback,
          output: ["No se pudo cargar el intérprete de Python.", ...fallback.output],
        };
      }

      set({ pythonStatus: "idle" });
      let result: CommandResult;
      if (outcome.kind === "timeout") {
        result = commandError(PYTHON_TIMEOUT_MESSAGE);
      } else if (!outcome.response.ok) {
        // Un script que falla no deja archivos a medias (atomicidad)
        result = {
          output: [...outcome.response.output],
          error: "El script terminó con error.",
          outputType: "error",
        };
      } else {
        result = {
          output: [...outcome.response.output],
          filesystemChanges: fileChanges(
            currentSession(get()).filesystem,
            before,
            outcome.response.files,
          ),
        };
      }
      record(input, parsed, result);
      return result;
    },

    saveFile(path, content) {
      const session = currentSession(get());
      const error =
        editablePathError(session.filesystem, path) ??
        (content.length > MAX_FILE_CHARS
          ? `El archivo supera ${MAX_FILE_CHARS} caracteres.`
          : null);
      if (error) return commandError(error);

      const name = path.slice(path.lastIndexOf("/") + 1);
      const existing = resolve(session.filesystem, path);
      const filesystem = applyChanges(session.filesystem, [
        {
          path,
          action: existing ? "modify" : "create",
          node: { type: "file", name, content, permissions: "-rw-r--r--" },
        },
      ]);
      commit({ ...session, filesystem }, "file.saved", { path });
      set({ editorFile: { path, content } });
      return { output: ["Guardado: " + path], outputType: "success" };
    },

    closeEditor() {
      set({ editorFile: null });
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

    newGame(name) {
      const username = name?.trim() || DEFAULT_USERNAME;
      const error = validateUsername(username);
      if (error) return error;
      const session = createSession();
      commit({ ...session, game: setUsername(session.game, username) }, "game.new", { username });
      // Los avisos, el editor y los hallazgos de la partida anterior ya no aplican
      set({ events: [], editorFile: null, findings: [] });
      return null;
    },

    dismissEvent(id) {
      set({ events: get().events.filter((e) => e.id !== id) });
    },

    markIntroSeen() {
      const session = currentSession(get());
      if (session.game.storyFlags.introSeen) return;
      const game = { ...session.game, storyFlags: { ...session.game.storyFlags, introSeen: true } };
      commit({ ...session, game }, "story.intro.seen", {});
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

// Solo se ejecuta de verdad un archivo de /home/user: es lo único que se copia al sandbox.
// Cualquier otro caso sigue por el comando síncrono, que da el mensaje de error.
function pythonScriptPath(args: readonly string[], session: GameSession): string | null {
  const [arg] = args;
  if (args.length !== 1 || !arg || arg.startsWith("-")) return null;
  const path = resolveVirtualPath(session.currentDir, arg);
  if (!path.startsWith(HOME_DIR + "/")) return null;
  return findVirtualNode(session.filesystem, path)?.type === "file" ? path : null;
}

function buildContext(session: GameSession): CommandContext {
  return {
    gameState: session.game,
    currentDir: session.currentDir,
    filesystem: session.filesystem,
    user: session.game.player.username,
    hostname: session.game.connectedTo ?? LOCAL_HOST,
    connectedTo: session.game.connectedTo,
    difficulty: session.game.difficulty,
    history: session.history,
  };
}

// localStorage es una entrada no confiable: el jugador puede editarlo.
// Se valida todo lo que el engine lee; ante la duda, partida nueva.

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
