import type { CommandResult, ReputationTier } from "@/lib/types";
import { commandCategoryLabels, commandError, findCommand } from "./shared";
import type { CommandManual } from "./shared";

const rankLabels: Record<ReputationTier, string> = {
  script_kiddie: "Aprendiz",
  hacker: "Hacker",
  elite_hacker: "Hacker de élite",
  l33t: "1337",
  anonymous: "Anónimo",
};

export default function createMan(getCommands: () => readonly CommandManual[]) {
  return (args: readonly string[]): CommandResult => {
    const [name] = args;
    if (args.length !== 1 || !name) return commandError("Uso: man <comando>");

    const command = findCommand(getCommands(), name);
    if (!command) return commandError("Sin manual para: " + name);

    return {
      output: [
        "Uso: " + command.usage,
        command.description,
        "Ejemplo: " + command.example,
        "Categoría: " + commandCategoryLabels[command.category],
        "Qué aprendes: " + command.learn,
        "En la vida real: " + command.realWorld,
        "Rango de desbloqueo: " + rankLabels[command.unlockRank],
      ],
    };
  };
}
