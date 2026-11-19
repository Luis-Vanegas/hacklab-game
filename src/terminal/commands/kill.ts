import workstation from "@/data/machine/workstation.json";
import type { CommandContext, CommandResult } from "@/lib/types";
import { stoppedProcessFlag } from "./processFlags";
import { commandError } from "./shared";

export default function kill(args: readonly string[], ctx: CommandContext): CommandResult {
  const [value] = args;
  const pid = Number(value);
  if (
    args.length !== 1 ||
    !value ||
    !/^\d+$/u.test(value) ||
    !Number.isSafeInteger(pid) ||
    pid <= 0
  ) {
    return commandError("Uso: kill <pid> (un entero positivo)");
  }

  const process = workstation.processes.find((entry) => entry.pid === pid);
  if (!process)
    return commandError("No existe el proceso virtual con PID " + pid + ". Uso: kill <pid>");

  const flag = stoppedProcessFlag(pid);
  if (ctx.gameState.storyFlags[flag]) {
    return { output: ["El proceso virtual " + pid + " ya está detenido."] };
  }

  return {
    output: ["Proceso virtual detenido: " + process.command + " (" + pid + ")."],
    outputType: "success",
    stateChanges: { storyFlags: { [flag]: true } },
  };
}
