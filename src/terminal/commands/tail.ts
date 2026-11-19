import type { CommandContext, CommandResult } from "@/lib/types";
import { previewFile } from "./virtualFile";

export default function tail(args: readonly string[], ctx: CommandContext): CommandResult {
  return previewFile("tail", args, ctx);
}
