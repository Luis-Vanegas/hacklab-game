import { emit } from "./events";

// Logger de trazabilidad.
// Registra acciones del jugador para debug y replay.

export function logAction(action: string, detail: Record<string, unknown> = {}): void {
  emit("player.action", { action, ...detail }, "logger");
}

export function logStateChange(field: string, from: unknown, to: unknown): void {
  emit("state.change", { field, from, to }, "logger");
}

export function logError(message: string, context: Record<string, unknown> = {}): void {
  emit("error", { message, ...context }, "logger");
}
