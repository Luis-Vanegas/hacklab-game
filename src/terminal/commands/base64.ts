import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function base64(args: readonly string[]): CommandResult {
  const decode = args[0] === "-d";
  const value = args[decode ? 1 : 0];
  if (args.length !== (decode ? 2 : 1) || value === undefined) {
    return commandError("Uso: base64 [-d] <texto>");
  }

  if (decode) {
    try {
      const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
      return { output: [new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes)] };
    } catch {
      return commandError("Entrada inválida. Uso: base64 -d <texto Base64 en UTF-8>");
    }
  }

  let bytes = "";
  for (const byte of new TextEncoder().encode(value)) bytes += String.fromCharCode(byte);
  return { output: [btoa(bytes)] };
}
