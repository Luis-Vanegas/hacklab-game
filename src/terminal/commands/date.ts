import workstation from "@/data/machine/workstation.json";
import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function date(args: readonly string[]): CommandResult {
  if (args.length > 0) return commandError("Uso: date");

  return { output: [workstation.gameDate] };
}
