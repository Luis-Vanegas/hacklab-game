import type { Contract, GameState, ReputationTier } from "@/lib/types";
import { emit } from "@/lib/events";
import { addCredits, addXp } from "@/engine/reputation";

// Sistema de contratos.
// Atómico: activar un contrato cambia el estado completo o no cambia nada.
// Los contratos se cargan desde JSON en src/data/contracts/.

export function canAcceptContract(state: GameState, contract: Contract): boolean {
  // No aceptar si ya tiene uno activo
  if (state.activeContract) return false;
  // No aceptar si ya lo completó
  if (state.completedContracts.includes(contract.id)) return false;
  // Verificar reputación mínima
  const tierOrder: readonly ReputationTier[] = [
    "script_kiddie",
    "hacker",
    "elite_hacker",
    "l33t",
    "anonymous",
  ];
  const playerIdx = tierOrder.indexOf(state.player.reputation);
  const requiredIdx = tierOrder.indexOf(contract.requiredReputation);
  return playerIdx >= requiredIdx;
}

export function acceptContract(state: GameState, contract: Contract): GameState {
  if (!canAcceptContract(state, contract)) {
    throw new Error(`No se puede aceptar el contrato "${contract.title}"`);
  }

  emit("contract.accepted", { contractId: contract.id }, "ContractSystem");

  return {
    ...state,
    phase: "in_contract",
    activeContract: {
      ...contract,
      // Resetear objetivos a no completados
      objectives: contract.objectives.map((obj) => ({ ...obj, completed: false })),
    },
  };
}

export function completeObjective(state: GameState, objectiveId: string): GameState {
  if (!state.activeContract) return state;

  const objectives = state.activeContract.objectives.map((obj) =>
    obj.id === objectiveId ? { ...obj, completed: true } : obj,
  );

  // Si ya estaba completado, idempotente
  const previous = state.activeContract.objectives;
  const changed = objectives.some((obj, i) => obj.completed !== previous[i]?.completed);
  if (!changed) return state;

  emit("objective.completed", { objectiveId }, "ContractSystem");

  const updatedContract = { ...state.activeContract, objectives };
  return { ...state, activeContract: updatedContract };
}

export function isContractComplete(contract: Contract): boolean {
  return contract.objectives.every((obj) => obj.completed);
}

export function getCompletionRatio(contract: Contract): number {
  if (contract.objectives.length === 0) return 0;
  const completed = contract.objectives.filter((obj) => obj.completed).length;
  return completed / contract.objectives.length;
}

export function submitContract(state: GameState): GameState {
  if (!state.activeContract) {
    throw new Error("No hay contrato activo para entregar");
  }

  const contract = state.activeContract;
  const ratio = getCompletionRatio(contract);
  // El multiplicador penaliza solo las entregas incompletas
  const multiplier = ratio === 1 ? 1 : ratio * contract.reward.partialMultiplier;
  const credits = Math.floor(contract.reward.credits * multiplier);
  const xp = Math.floor(contract.reward.xp * ratio);

  emit(
    "contract.submitted",
    {
      contractId: contract.id,
      completionRatio: ratio,
      credits,
      xp,
    },
    "ContractSystem",
  );

  return {
    ...state,
    phase: "playing",
    activeContract: null,
    completedContracts: [...state.completedContracts, contract.id],
    // addXp recalcula nivel y reputación: sin esto el jugador nunca sube de tier
    player: addXp(addCredits(state.player, credits), xp),
    traceLevel: 0, // Resetear trace al entregar contrato
  };
}

export function getAvailableContracts(
  allContracts: readonly Contract[],
  state: GameState,
): readonly Contract[] {
  return allContracts.filter((c) => canAcceptContract(state, c));
}
