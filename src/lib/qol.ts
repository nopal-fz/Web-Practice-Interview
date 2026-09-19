"use client";

import { useMemo, useSyncExternalStore } from "react";

export const BOOKMARK_KEY = "qol:bookmarks";
export const MASTERED_KEY = "qol:mastered";

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
}

function emit(key: string) {
  window.dispatchEvent(new CustomEvent(key));
}

function snapshotOf(key: string): string {
  return readIds(key).sort().join("|");
}

export type QolSet = ReturnType<typeof useQolSet>;

// Set id berbasis localStorage yang sinkron antar komponen di tab yang sama
// lewat CustomEvent, dan antar tab lewat event "storage".
export function useQolSet(key: string) {
  const list = useSyncExternalStore(
    (onChange) => {
      const handler = () => onChange();
      window.addEventListener(key, handler);
      window.addEventListener("storage", handler);
      return () => {
        window.removeEventListener(key, handler);
        window.removeEventListener("storage", handler);
      };
    },
    () => snapshotOf(key),
    () => "",
  );

  const ids = useMemo(() => {
    const set = new Set<string>();
    for (const part of list.split("|")) if (part) set.add(part);
    return set;
  }, [list]);

  const toggle = (id: string) => {
    const next = new Set(readIds(key));
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    writeIds(key, [...next]);
    emit(key);
  };

  return { ids, count: ids.size, has: (id: string) => ids.has(id), toggle };
}