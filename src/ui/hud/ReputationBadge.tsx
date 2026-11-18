// Badge de reputación del jugador.
// Traduce el tier interno a una etiqueta legible y un esquema cromático coherente con el progreso.

import type { ReputationTier } from "@/lib/types";

export interface ReputationBadgeProps {
  readonly tier: ReputationTier;
  readonly level?: number;
  readonly xp?: number;
}

const TIER_META: Record<
  ReputationTier,
  { readonly label: string; readonly variant: "default" | "accent" | "primary" | "warning" }
> = {
  script_kiddie: { label: "Script Kiddie", variant: "default" },
  hacker: { label: "Hacker", variant: "accent" },
  elite_hacker: { label: "Elite Hacker", variant: "primary" },
  l33t: { label: "L33T", variant: "warning" },
  anonymous: { label: "Anonymous", variant: "primary" },
};

export function ReputationBadge({ tier, level, xp }: ReputationBadgeProps) {
  const meta = TIER_META[tier];
  const variantClass =
    meta.variant === "default" ? "hl-badge" : `hl-badge hl-badge--${meta.variant}`;

  return (
    <span className={variantClass} data-testid="reputation-badge">
      <span>{meta.label}</span>
      {level !== undefined ? <span className="hl-tabular">LVL {level}</span> : null}
      {xp !== undefined ? <span className="hl-tabular">({xp} XP)</span> : null}
    </span>
  );
}
