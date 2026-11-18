import type { GameAlert, GameState } from "@/lib/types";

export const TRACE_ALARM_LEVEL = 75;

// Los avisos se deducen comparando el estado antes y después de una transición.
// Así ningún comando ni sistema tiene que acordarse de anunciar lo que hizo.
export function diffGameEvents(before: GameState, after: GameState): GameAlert[] {
  const events: GameAlert[] = [];

  const wasDone = new Set(
    before.activeContract?.objectives.filter((o) => o.completed).map((o) => o.id),
  );
  for (const o of after.activeContract?.objectives ?? []) {
    if (o.completed && !wasDone.has(o.id)) {
      events.push({ type: "objective_completed", objectiveId: o.id, description: o.description });
    }
  }

  const finished = before.activeContract;
  if (
    finished &&
    !before.completedContracts.includes(finished.id) &&
    after.completedContracts.includes(finished.id)
  ) {
    events.push({
      type: "contract_completed",
      contractId: finished.id,
      title: finished.title,
      credits: after.player.credits - before.player.credits,
      xp: after.player.xp - before.player.xp,
    });
  }

  if (after.player.reputation !== before.player.reputation) {
    events.push({ type: "rank_up", from: before.player.reputation, to: after.player.reputation });
  }

  if (before.traceLevel < TRACE_ALARM_LEVEL && after.traceLevel >= TRACE_ALARM_LEVEL) {
    events.push({ type: "trace_alarm", level: after.traceLevel });
  }

  return events;
}
