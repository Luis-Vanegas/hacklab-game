import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function echo(args: readonly string[]): CommandResult {
  if (!args.length) return commandError("Uso: echo <texto>");

  return { output: [args.join(" ")] };
}
