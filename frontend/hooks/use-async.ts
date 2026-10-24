"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Loads data when `deps` change. Returns { data, loading, error, reload }. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fnRef.current());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, deps);

  return { data, loading, error, reload: load };
}

/** Runs a write action (create/update/delete), shows a success/error note, then calls onDone. */
export function useAction(onDone?: () => void) {
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (fn: () => Promise<unknown>, okText: string) => {
    try {
      await fn();
      setNote({ ok: true, text: okText });
      onDone?.();
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "Action failed" });
    }
  };
  return { run, note };
}