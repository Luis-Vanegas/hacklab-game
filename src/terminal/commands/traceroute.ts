import type { CommandResult } from "@/lib/types";
import { findNetworkHost } from "./networkHosts";
import { commandError } from "./shared";

export default function traceroute(args: readonly string[]): CommandResult {
  const [address] = args;
  if (args.length !== 1 || !address) return commandError("Uso: traceroute <host>");

  const host = findNetworkHost(address);
  if (!host) return commandError("Host inalcanzable");

  return {
    output: [
      "Ruta a " + host.hostname + " (" + host.ip + ")",
      ...host.route.map((hop, index) => index + 1 + "  " + hop.ip + "  " + hop.elapsedMs + " ms"),
    ],
  };
}
