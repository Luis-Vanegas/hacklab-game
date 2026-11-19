// Tipos compartidos del juego.
// Todos los agentes importan de aquí. Solo Claude Code lo modifica.

// --- State Machine del juego ---

export type GamePhase =
  | "boot" // Secuencia de arranque
  | "menu" // Menú principal
  | "playing" // Jugando (sin contrato activo)
  | "in_contract" // Dentro de un contrato
  | "game_over"; // Partida terminada

export type GameDifficulty = "beginner" | "normal" | "elite" | "anonymous";

// --- Terminal ---

export interface CommandContext {
  readonly gameState: GameState;
  readonly currentDir: string;
  readonly filesystem: FileSystemNode;
  readonly user: string;
  readonly hostname: string;
  readonly connectedTo: string | null;
  readonly difficulty: GameDifficulty;
  // Copia de solo lectura del historial de la sesión (para `history`)
  readonly history: readonly string[];
}

// Contrato: si `error` está presente, el engine ignora TODOS los cambios
// (stateChanges, filesystemChanges, cwd). Un comando fallido nunca cambia el juego.
export interface CommandResult {
  readonly output: string[];
  readonly stateChanges?: Partial<MutableGameFields>;
  readonly filesystemChanges?: FileSystemChange[];
  readonly error?: string;
  // Señal para la UI: qué tipo de output es
  readonly outputType?: "info" | "success" | "warning" | "error" | "hint";
  // Nuevo directorio actual (absoluto). Lo usa `cd`; el engine lo aplica.
  readonly cwd?: string;
  // Pide a la terminal visual que limpie la pantalla. Lo usa `clear`.
  readonly clearScreen?: boolean;
  // Pide abrir el editor con este archivo. Lo usa `edit`; el store lo publica a la UI.
  readonly openEditor?: { readonly path: string; readonly content: string };
}

export type CommandHandler = (
  args: readonly string[],
  ctx: CommandContext,
) => CommandResult | Promise<CommandResult>;

// --- Filesystem virtual ---

export type FileSystemNode =
  | {
      type: "dir";
      name: string;
      children: Record<string, FileSystemNode>;
      permissions: string;
      hidden?: boolean;
    }
  | { type: "file"; name: string; content: string; permissions: string; hidden?: boolean };

export interface FileSystemChange {
  readonly path: string;
  readonly action: "create" | "delete" | "modify";
  readonly node?: FileSystemNode;
}

// --- Estado del juego ---

export interface GameState {
  readonly phase: GamePhase;
  readonly difficulty: GameDifficulty;
  readonly player: PlayerState;
  readonly activeContract: Contract | null;
  readonly completedContracts: readonly string[];
  readonly unlockedTools: readonly string[];
  readonly traceLevel: number; // 0-100
  readonly connectedTo: string | null;
  readonly storyFlags: Record<string, boolean>;
}

// Campos que un comando puede mutar (a través de stateChanges)
export type MutableGameFields = Pick<GameState, "traceLevel" | "connectedTo" | "storyFlags"> & {
  playerCredits?: number;
  playerXp?: number;
  completeObjective?: string;
  unlockTool?: string;
};

export interface PlayerState {
  readonly username: string;
  readonly credits: number;
  readonly xp: number;
  readonly level: number;
  readonly reputation: ReputationTier;
}

// --- Reputación ---

export type ReputationTier = "script_kiddie" | "hacker" | "elite_hacker" | "l33t" | "anonymous";

export interface ReputationConfig {
  readonly tier: ReputationTier;
  readonly label: string;
  readonly minXp: number;
  readonly unlocksContracts: readonly string[];
  readonly unlocksTools: readonly string[];
}

// --- Contratos ---

// De día, trabajo autorizado en Nodo Seguro; de noche, encargos de CIPHER (ADR-005)
export type ContractChannel = "work" | "darknet";

export interface Contract {
  readonly id: string;
  readonly channel: ContractChannel;
  readonly title: string;
  readonly description: string;
  readonly difficulty: GameDifficulty;
  readonly requiredReputation: ReputationTier;
  readonly reward: ContractReward;
  readonly objectives: readonly Objective[];
  readonly target: TargetServer;
  readonly story: ContractStory;
}

export interface ContractReward {
  readonly credits: number;
  readonly xp: number;
  readonly partialMultiplier: number; // 0-1, pago parcial por objetivos incompletos
}

export interface Objective {
  readonly id: string;
  readonly description: string;
  readonly trigger: ObjectiveTrigger;
  readonly completed: boolean;
  readonly hint?: string;
  // Pistas escalonadas: suave, media y la solución
  readonly hints?: readonly string[];
}

// --- Avisos de juego para la UI (distintos de los eventos de observabilidad) ---

export type GameAlert =
  | {
      readonly type: "objective_completed";
      readonly objectiveId: string;
      readonly description: string;
    }
  | {
      readonly type: "contract_completed";
      readonly contractId: string;
      readonly title: string;
      readonly credits: number;
      readonly xp: number;
    }
  | { readonly type: "rank_up"; readonly from: ReputationTier; readonly to: ReputationTier }
  | { readonly type: "trace_alarm"; readonly level: number };

export type QueuedGameAlert = GameAlert & { readonly id: number };

// Qué acción completa un objetivo
export interface ObjectiveTrigger {
  readonly command: string; // Comando que dispara
  readonly args?: readonly string[]; // Args específicos (opcional)
  readonly requiresConnection?: boolean;
  // La salida debe contener este texto: valida el resultado de un script, no solo que corrió
  readonly outputIncludes?: string;
}

export interface TargetServer {
  readonly hostname: string;
  readonly ip: string;
  readonly ports: readonly PortInfo[];
  readonly filesystem: FileSystemNode;
  readonly credentials?: { username: string; password: string };
}

export interface PortInfo {
  readonly port: number;
  readonly service: string;
  readonly version: string;
  readonly vulnerable?: boolean;
}

// --- Historia ---

export interface ContractStory {
  readonly intro: readonly DialogueLine[];
  readonly onComplete: readonly DialogueLine[];
  readonly hints: Record<string, readonly DialogueLine[]>;
}

export interface DialogueLine {
  readonly character: string;
  readonly text: string;
  readonly delay?: number; // ms antes de mostrar
}

// --- Herramientas ---

export interface ToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly command: string; // Comando que habilita
  readonly traceModifier: number; // Cambio al trace level al usar
  readonly requiredLevel: number;
}

// --- Eventos (observabilidad) ---

export interface GameEvent {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly timestamp: number;
  readonly source: string;
}

// --- Persistencia ---

export interface SaveData {
  readonly version: number;
  readonly gameState: GameState;
  readonly commandHistory: readonly string[];
  readonly savedAt: number;
}

// --- IA opcional ---

export interface AiProvider {
  readonly available: boolean;
  getHint(context: CommandContext, objective: Objective): Promise<string | null>;
  validateSolution(contract: Contract, actions: readonly GameEvent[]): Promise<AiValidation | null>;
}

export interface AiValidation {
  readonly correct: boolean;
  readonly feedback: string;
  readonly suggestions: readonly string[];
}
