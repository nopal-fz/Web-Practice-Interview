"use client";

import { useEffect } from "react";

// Tekan "/" di mana pun (di luar kolom input) untuk memindah fokus ke pencarian.
export function SearchShortcut({ inputId }: { inputId: string }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/") return;
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      if (!input) return;
      event.preventDefault();
      input.focus();
      input.scrollIntoView({ block: "nearest" });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inputId]);

  return null;
}