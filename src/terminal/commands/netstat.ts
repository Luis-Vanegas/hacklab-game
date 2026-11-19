import network from "@/data/network/hosts.json";
import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function netstat(args: readonly string[]): CommandResult {
  if (args.length > 0) return commandError("Uso: netstat");

  return {
    output: [
      "Protocolo  Dirección local       Dirección remota      Estado",
      ...network.connections.map(
        ({ protocol, local, remote, state }) =>
          protocol.padEnd(11) + local.padEnd(22) + remote.padEnd(22) + state,
      ),
    ],
  };
}
