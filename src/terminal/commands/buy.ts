import shopData from "@/data/tools/shop.json";
import type { CommandContext, CommandResult, ToolDefinition } from "@/lib/types";
import { commandError } from "./shared";

const shop: readonly ToolDefinition[] = shopData;

export default function buy(args: readonly string[], ctx: CommandContext): CommandResult {
  const [id] = args;
  if (args.length !== 1 || !id) return commandError("Uso: buy <herramienta>");

  const tool = shop.find((entry) => entry.id === id);
  if (!tool) return commandError("Herramienta desconocida: " + id);

  const { player, unlockedTools } = ctx.gameState;
  if (unlockedTools.includes(tool.id)) {
    return { output: ["Ya tienes " + tool.name + "."], outputType: "info" };
  }
  if (player.level < tool.requiredLevel) {
    return commandError("Nivel requerido: " + tool.requiredLevel);
  }
  if (player.credits < tool.price) return commandError("Créditos insuficientes.");

  return {
    output: ["Compraste " + tool.name + "."],
    outputType: "success",
    stateChanges: {
      playerCredits: player.credits - tool.price,
      unlockTool: tool.id,
    },
  };
}
