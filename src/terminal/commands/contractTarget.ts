import type { CommandContext, TargetServer } from "@/lib/types";

export function findContractTarget(ctx: CommandContext, address: string): TargetServer | null {
  const target = ctx.gameState.activeContract?.target;
  if (!target || (target.hostname !== address && target.ip !== address)) return null;
  return target;
}
