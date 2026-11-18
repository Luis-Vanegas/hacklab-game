import type { CommandContext, CommandResult } from "@/lib/types";
import { findContractTarget } from "./contractTarget";
import { commandError } from "./shared";

export default function nmap(args: readonly string[], ctx: CommandContext): CommandResult {
  const [address] = args;
  if (args.length !== 1 || !address) return commandError("Uso: nmap <servidor-virtual>");

  const target = findContractTarget(ctx, address);
  if (!target) return commandError("Servidor ajeno al contrato activo.");
  if (!ctx.gameState.unlockedTools.includes("nmap")) {
    return commandError("Adquiere la herramienta con buy nmap.");
  }

  return {
    output: [
      "Inventario virtual de " + target.hostname,
      ...target.ports.map((entry) => entry.port + " " + entry.service + " " + entry.version),
    ],
  };
}
