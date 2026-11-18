import type { CommandContext, CommandResult } from "@/lib/types";
import { findContractTarget } from "./contractTarget";
import { commandError } from "./shared";

export default function ssh(args: readonly string[], ctx: CommandContext): CommandResult {
  const [address, token] = args;
  if (args.length > 2 || !address) {
    return commandError("Uso: ssh <servidor-virtual> [ficha]");
  }

  const target = findContractTarget(ctx, address);
  if (!target) return commandError("Servidor ajeno al contrato activo.");
  if (!ctx.gameState.unlockedTools.includes("ssh")) {
    return commandError("Adquiere la herramienta con buy ssh.");
  }
  if (target.credentials?.password !== token) {
    return commandError("La ficha de acceso del escenario es inválida.");
  }

  const output = ["Sesión virtual activa en " + target.hostname + "."];
  if (ctx.connectedTo === target.hostname) return { output };

  return { output, stateChanges: { connectedTo: target.hostname } };
}
