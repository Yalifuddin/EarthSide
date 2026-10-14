"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AsyncState<T> =
  | { status: "loading"; data: T | undefined; error: undefined }
  | { status: "success"; data: T; error: undefined }
  | { status: "error"; data: T | undefined; error: unknown };

/**
 * Loads data on mount and on `reload()`. Keeps the previous data while
 * reloading so lists don't flash empty after every mutation.
 */
export function useAsyncData<T>(load: () => Promise<T>) {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const [state, setState] = useState<AsyncState<T>>({
    status: "loading",
    data: undefined,
    error: undefined,
  });

  const reload = useCallback(async () => {
    setState((current) => ({ status: "loading", data: current.data, error: undefined }));
    try {
      const data = await loadRef.current();
      setState({ status: "success", data, error: undefined });
    } catch (error) {
      setState((current) => ({ status: "error", data: current.data, error }));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Optimistically patch local data without refetching. */
  const mutate = useCallback((update: (data: T) => T) => {
    setState((current) =>
      current.data === undefined ? current : { ...current, data: update(current.data) },
    );
  }, []);

  return { ...state, reload, mutate };
}
