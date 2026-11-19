import workstation from "@/data/machine/workstation.json";
import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function uname(args: readonly string[]): CommandResult {
  const { name, release, architecture, operatingSystem } = workstation.system;
  if (args.length === 0) return { output: [name] };
  if (args.length === 1 && args[0] === "-a") {
    return {
      output: [[name, workstation.hostname, release, architecture, operatingSystem].join(" ")],
    };
  }
  return commandError("Uso: uname [-a]");
}
