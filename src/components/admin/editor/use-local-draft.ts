"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "earthside:draft:";
const SAVE_DELAY_MS = 1000;

interface StoredDraft<T> {
  savedAt: number;
  data: T;
}

function read<T>(key: string): StoredDraft<T> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as StoredDraft<T>) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, draft: StoredDraft<T>) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(draft));
  } catch {
    // Storage full or blocked (private mode) — autosave is best effort.
  }
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Ignore, see above.
  }
}

/**
 * Keeps an unsaved copy of the form in this browser, so a closed tab or a
 * crash doesn't lose Della's writing. Only offers to restore a copy that is
 * newer than the version stored in the database (`savedVersionAt`).
 */
export function useLocalDraft<T>(key: string, savedVersionAt: Date | null) {
  const [recovered, setRecovered] = useState<StoredDraft<T> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const stored = read<T>(key);
    const isNewer = stored && stored.savedAt > (savedVersionAt?.getTime() ?? 0);
    // Reading storage is only possible after mount, hence the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecovered(isNewer ? stored : null);
    return () => clearTimeout(timer.current);
  }, [key, savedVersionAt]);

  /** Debounced: call on every change with a function that captures the current form. */
  const schedule = useCallback(
    (snapshot: () => T) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(
        () => write(key, { savedAt: Date.now(), data: snapshot() }),
        SAVE_DELAY_MS,
      );
    },
    [key],
  );

  /** Forget the local copy (after a successful save, or when discarded). */
  const clear = useCallback(() => {
    clearTimeout(timer.current);
    remove(key);
    setRecovered(null);
  }, [key]);

  const dismiss = useCallback(() => setRecovered(null), []);

  return { recovered, schedule, clear, dismiss };
}
