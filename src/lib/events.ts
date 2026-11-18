import type { GameEvent } from "./types";

type EventListener = (event: GameEvent) => void;

// Bus de eventos para observabilidad.
// Toda acción significativa del juego pasa por aquí.
// Los módulos no se conocen entre sí: se comunican por eventos.
const listeners = new Set<EventListener>();
const history: GameEvent[] = [];
const MAX_HISTORY = 500;

export function emit(type: string, payload: Record<string, unknown>, source: string): void {
  const event: GameEvent = {
    type,
    payload,
    timestamp: Date.now(),
    source,
  };
  history.push(event);
  if (history.length > MAX_HISTORY) history.shift();
  listeners.forEach((fn) => fn(event));
}

export function subscribe(fn: EventListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getHistory(): readonly GameEvent[] {
  return history;
}

export function clearHistory(): void {
  history.length = 0;
}
