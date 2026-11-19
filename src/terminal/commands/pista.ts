import type { CommandContext, CommandResult, Objective } from "@/lib/types";
import { commandError } from "./shared";

const hintLevels = ["Pista suave", "Pista media", "Solución"];

function hintTexts(objective: Objective): string[] {
  // Aceptamos el campo nuevo cuando lo publique el motor, además de los contratos anteriores.
  if ("hints" in objective && Array.isArray(objective.hints)) {
    const hints = objective.hints
      .filter((hint): hint is string => typeof hint === "string" && hint.trim() !== "")
      .slice(0, hintLevels.length);

    if (hints.length > 0) return hints;
  }

  return objective.hint?.trim() ? [objective.hint] : [];
}

export default function pista(args: readonly string[], ctx: CommandContext): CommandResult {
  if (args.length > 0) return commandError("Uso: pista");

  const contract = ctx.gameState.activeContract;
  const objective = contract?.objectives.find((entry) => !entry.completed);
  if (!contract || !objective)
    return commandError("No hay un objetivo pendiente para pedir una pista.");

  const hints = hintTexts(objective);
  if (hints.length === 0) return commandError("El objetivo actual no tiene pistas.");

  const alreadyRequested = ctx.gameState.storyFlags;
  // Las marcas booleanas permiten contar las pistas por contrato y por objetivo.
  const flags = hints.map(
    (_, index) => "hint:" + contract.id + ":" + objective.id + ":" + (index + 1),
  );
  const next = flags.findIndex((flag) => !alreadyRequested[flag]);
  const index = next < 0 ? hints.length - 1 : next;
  const hint = hints[index];
  const flag = flags[index];
  const label = hints.length === 1 ? "Pista" : hintLevels[index];

  if (!hint || !flag) return commandError("El objetivo actual no tiene pistas.");

  const output = [label + ": " + hint];
  if (next < 0) return { output, outputType: "hint" };

  return { output, outputType: "hint", stateChanges: { storyFlags: { [flag]: true } } };
}
