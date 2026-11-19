import network from "@/data/network/hosts.json";
import type { CommandResult } from "@/lib/types";
import { commandError } from "./shared";

export default function curl(args: readonly string[]): CommandResult {
  const [address] = args;
  const usage = "Uso: curl <url-http-o-https>";
  if (args.length !== 1 || !address || !/^https?:\/\//iu.test(address)) {
    return commandError(usage);
  }

  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return commandError(usage);
  }
  if (url.username || url.password) return commandError(usage);

  // El fragmento es local al cliente y no forma parte de la solicitud HTTP.
  url.hash = "";
  const response = network.responses.find((entry) => entry.url === url.href);
  if (!response) return commandError("URL sin respuesta en la red virtual.");

  return {
    output: [
      "HTTP/1.1 " + response.status + " " + response.reason,
      ...Object.entries(response.headers).map(([name, value]) => name + ": " + value),
      "",
      response.body,
    ],
  };
}
