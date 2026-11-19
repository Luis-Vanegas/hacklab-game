import type { CommandResult } from "@/lib/types";
import { findNetworkHost } from "./networkHosts";
import { commandError } from "./shared";

export default function ping(args: readonly string[]): CommandResult {
  const [address] = args;
  if (args.length !== 1 || !address) return commandError("Uso: ping <host>");

  const host = findNetworkHost(address);
  if (!host) return commandError("Host inalcanzable");

  const replies = host.latenciesMs.map(
    (elapsedMs, index) =>
      "Respuesta desde " + host.ip + ": secuencia=" + (index + 1) + " tiempo=" + elapsedMs + " ms",
  );

  return {
    output: [
      "PING " + host.hostname + " (" + host.ip + ")",
      ...replies,
      replies.length + " enviados, " + replies.length + " recibidos, 0 % de pérdida",
    ],
  };
}
