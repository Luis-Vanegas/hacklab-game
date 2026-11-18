import { describe, expect, it } from "vitest";
import { applyChanges, createRootFS, listDir, resolve } from "@/engine/filesystem/VirtualFS";

describe("VirtualFS", () => {
  it("oculta archivos ocultos salvo que se pidan", () => {
    const home = resolve(createRootFS(), "/home/user");
    if (!home) throw new Error("falta /home/user");
    expect(listDir(home, false)).not.toContain(".bashrc");
    expect(listDir(home, true)).toContain(".bashrc");
  });

  it("borra sin mutar el árbol original y es idempotente", () => {
    const root = createRootFS();
    const change = { path: "/home/user/notes", action: "delete" as const };
    const once = applyChanges(root, [change]);
    const twice = applyChanges(once, [change]);

    expect(resolve(root, "/home/user/notes")).not.toBeNull();
    expect(resolve(once, "/home/user/notes")).toBeNull();
    expect(twice).toEqual(once);
  });
});
