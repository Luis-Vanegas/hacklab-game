import type { CommandContext, CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function crack(args: readonly string[], ctx: CommandContext): CommandResult {
  if (args.length !== 1 || args[0] !== "ficha") return commandError("Uso: crack ficha");

  const fixtureToken = ctx.gameState.activeContract?.target.credentials?.password;
  if (!fixtureToken) return commandError("Este contrato no tiene un desafío de ficha.");
  if (!ctx.gameState.unlockedTools.includes("hydra")) {
    return commandError("Adquiere la herramienta con buy hydra.");
  }

  // El desenlace forma parte de los datos escritos para la misión.
  return { output: ["Ficha del escenario: " + fixtureToken], outputType: "success" };
}
