import type { ReputationTier, ReputationConfig, PlayerState } from "@/lib/types";
import { logStateChange } from "@/lib/logger";

// Sistema de reputación y niveles.
// Determinista: dado un XP, siempre retorna el mismo tier.
// Los tiers desbloquean contratos y herramientas.

const TIERS: readonly ReputationConfig[] = [
  {
    tier: "script_kiddie",
    label: "Script Kiddie",
    minXp: 0,
    unlocksContracts: ["00-tutorial", "01-first-hack"],
    unlocksTools: ["nmap", "ssh"],
  },
  {
    tier: "hacker",
    label: "Hacker",
    minXp: 500,
    unlocksContracts: ["02-data-heist"],
    unlocksTools: ["hydra", "sqlmap"],
  },
  {
    tier: "elite_hacker",
    label: "Elite Hacker",
    minXp: 2000,
    unlocksContracts: [],
    unlocksTools: ["metasploit", "proxychains"],
  },
  {
    tier: "l33t",
    label: "1337",
    minXp: 5000,
    unlocksContracts: [],
    unlocksTools: ["zero_day"],
  },
  {
    tier: "anonymous",
    label: "Anonymous",
    minXp: 10000,
    unlocksContracts: [],
    unlocksTools: [],
  },
] as const;

export function getTierForXp(xp: number): ReputationConfig {
  // Recorrer de mayor a menor para encontrar el tier más alto alcanzado
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i]!.minXp) return TIERS[i]!;
  }
  return TIERS[0]!;
}

export function getLevelForXp(xp: number): number {
  // Cada 100 XP = 1 nivel. Mínimo nivel 1.
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function addXp(player: PlayerState, amount: number): PlayerState {
  const newXp = player.xp + amount;
  const newLevel = getLevelForXp(newXp);
  const newTier = getTierForXp(newXp);

  if (newXp === player.xp) return player;

  logStateChange("player.xp", player.xp, newXp);
  if (newTier.tier !== player.reputation) {
    logStateChange("player.reputation", player.reputation, newTier.tier);
  }

  return {
    ...player,
    xp: newXp,
    level: newLevel,
    reputation: newTier.tier,
  };
}

export function addCredits(player: PlayerState, amount: number): PlayerState {
  const newCredits = player.credits + amount;
  if (newCredits === player.credits) return player;
  logStateChange("player.credits", player.credits, newCredits);
  return { ...player, credits: newCredits };
}

export function getAllTiers(): readonly ReputationConfig[] {
  return TIERS;
}

export function getTierConfig(tier: ReputationTier): ReputationConfig {
  return TIERS.find((t) => t.tier === tier) ?? TIERS[0]!;
}

export function getNextTier(current: ReputationTier): ReputationConfig | null {
  const idx = TIERS.findIndex((t) => t.tier === current);
  return idx < TIERS.length - 1 ? TIERS[idx + 1]! : null;
}
