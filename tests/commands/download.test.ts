import { describe, expect, it } from "vitest";
import download from "@/terminal/commands/download";
import { acmeContract as contract, directory, file, makeContext } from "./fixtures";
const source = "/entrega/turno.txt";
const path = "/home/user/turno.txt";
const base = makeContext();
const connected = {
  ...base,
  connectedTo: "acme.example",
  gameState: { ...base.gameState, activeContract: contract, connectedTo: "acme.example" },
};

describe("download", () => {
  it("propone copiar un archivo virtual al directorio local con nombre y contenido originales", () => {
    const result = download([source], connected);
    expect(result.filesystemChanges).toEqual([
      {
        path,
        action: "create",
        node: expect.objectContaining({
          name: "turno.txt",
          type: "file",
          content: expect.stringContaining("AC-14"),
        }),
      },
    ]);
    expect(download([source], connected)).toEqual(result);
  });

  it("evita una segunda copia o reemplazar un archivo existente", () => {
    const original = download([source], connected).filesystemChanges?.[0]?.node;
    if (!original) throw new Error("Falta la entrada de la primera copia.");

    const withFile = (entry: typeof original) => ({
      ...connected,
      filesystem: directory("/", {
        home: directory("home", { user: directory("user", { "turno.txt": entry }) }),
      }),
    });

    expect(download([source], withFile(original))).toEqual({
      output: ["Ya tienes la copia virtual en " + path + "."],
    });
    const collision = download([source], withFile(file("turno.txt", "Otro contenido")));
    expect(collision).toHaveProperty("error");
    expect(collision).not.toHaveProperty("filesystemChanges");
  });

  it("rechaza rutas relativas o inválidas y requiere la sesión del escenario", () => {
    expect(download([], connected)).toHaveProperty("error");
    expect(download(["turno.txt"], connected)).toHaveProperty("error");
    expect(download(["/entrega"], connected)).toHaveProperty("error");
    expect(download([source], base)).toHaveProperty("error");
    expect(download([source], { ...connected, connectedTo: "otro.example" })).toHaveProperty(
      "error",
    );
    expect(download([source], { ...connected, currentDir: "/inexistente" })).toHaveProperty(
      "error",
    );
  });
});
