import type { KeyboardEvent } from "react";

/**
 * Maneja la navegación por teclado (ArrowLeft, ArrowRight, Home, End)
 * dentro de un patrón ARIA `role="tablist"` con foco rotativo.
 */
export function handleTabListKeyDown<T extends string>(
  event: KeyboardEvent<HTMLElement>,
  tabs: readonly T[],
  current: T,
  onSelect: (next: T) => void,
): void {
  if (tabs.length === 0) {
    return;
  }

  const currentIndex = Math.max(0, tabs.indexOf(current));
  let nextIndex: number;

  switch (event.key) {
    case "ArrowRight":
      nextIndex = (currentIndex + 1) % tabs.length;
      break;
    case "ArrowLeft":
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      break;
    case "Home":
      nextIndex = 0;
      break;
    case "End":
      nextIndex = tabs.length - 1;
      break;
    default:
      return;
  }

  const nextTab = tabs[nextIndex];
  if (nextTab === undefined) {
    return;
  }

  event.preventDefault();
  onSelect(nextTab);

  const tablist = event.currentTarget.closest('[role="tablist"]');
  const buttons = tablist?.querySelectorAll<HTMLElement>('[role="tab"]');
  buttons?.[nextIndex]?.focus();
}
