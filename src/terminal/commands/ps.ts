import workstation from "@/data/machine/workstation.json";
import type { CommandContext, CommandResult } from "@/lib/types";
import { stoppedProcessFlag } from "./processFlags";
import { commandError } from "./shared";

export default function ps(args: readonly string[], ctx: CommandContext): CommandResult {
  if (args.length > 0) return commandError("Uso: ps");

  const running = workstation.processes.filter(
    (process) => !ctx.gameState.storyFlags[stoppedProcessFlag(process.pid)],
  );
  return {
    output: [
      "PID   USUARIO COMANDO",
      ...running.map(
        ({ pid, owner, command }) => String(pid).padEnd(5) + " " + owner.padEnd(7) + " " + command,
      ),
    ],
  };
}
