import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { handleTabListKeyDown } from "@/ui/a11y/keyboardTabs";

const tabs = ["a", "b", "c"] as const;

// Evento mínimo: el helper solo usa key, preventDefault y currentTarget
function press(key: string) {
  const event = {
    key,
    preventDefault: vi.fn(),
    currentTarget: document.createElement("button"),
  } as unknown as KeyboardEvent<HTMLElement>;
  return event;
}

describe("navegación por teclado en pestañas", () => {
  it.each([
    ["ArrowRight", "a", "b"],
    ["ArrowRight", "c", "a"],
    ["ArrowLeft", "a", "c"],
    ["Home", "c", "a"],
    ["End", "a", "c"],
  ] as const)("%s desde %s va a %s", (key, current, expected) => {
    const onSelect = vi.fn();
    const event = press(key);
    handleTabListKeyDown(event, tabs, current, onSelect);
    expect(onSelect).toHaveBeenCalledWith(expected);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("ignora otras teclas para no romper la escritura", () => {
    const onSelect = vi.fn();
    const event = press("Enter");
    handleTabListKeyDown(event, tabs, "a", onSelect);
    expect(onSelect).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
