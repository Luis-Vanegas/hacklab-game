import { describe, expect, it } from "vitest";
import curl from "@/terminal/commands/curl";

describe("curl", () => {
  it("devuelve los encabezados y el cuerpo de una respuesta ficticia determinista", () => {
    const result = curl(["https://intranet.nodoseguro.test"]);
    expect(result.output).toEqual([
      "HTTP/1.1 200 Correcto",
      "Content-Type: text/html; charset=utf-8",
      "",
      "<h1>Intranet de Nodo Seguro</h1>",
    ]);
    expect(curl(["HTTPS://INTRANET.NODOSEGURO.TEST/#inicio"])).toEqual(result);
    expect(curl(["https://intranet.nodoseguro.test"])).toEqual(result);
  });

  it("indica el uso con URL inválida y no inventa respuestas para otras URL", () => {
    expect(curl([])).toHaveProperty("error", "Uso: curl <url-http-o-https>");
    expect(curl(["https://"])).toHaveProperty("error", "Uso: curl <url-http-o-https>");
    expect(curl(["ftp://archivo.example"])).toHaveProperty("error", "Uso: curl <url-http-o-https>");
    expect(curl(["https://intranet.nodoseguro.test/otra-ruta"])).toHaveProperty(
      "error",
      "URL sin respuesta en la red virtual.",
    );
  });
});
