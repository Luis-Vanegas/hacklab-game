import workstation from "@/data/machine/workstation.json";
import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function hostname(args: readonly string[]): CommandResult {
  if (args.length === 0) return { output: [workstation.hostname] };
  if (args.length === 1 && args[0] === "-a") {
    return { output: [workstation.hostname + ".nodoseguro.test"] };
  }
  return commandError("Uso: hostname [-a]");
}
