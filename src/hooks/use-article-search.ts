"use client";

import { useEffect, useState } from "react";
import type { ArticleSummary } from "@/core/articles/article";
import { SEARCH_LIMITS } from "@/core/articles/article-search";
import { searchPublishedArticles } from "@/server/actions";

const DEBOUNCE_MS = 300;

type SearchState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "done"; query: string; results: ArticleSummary[] }
  | { status: "failed" };

export function isSearchable(query: string): boolean {
  return query.trim().length >= SEARCH_LIMITS.minQueryLength;
}

/** Debounced archive search; ignores responses for queries the reader already moved past. */
export function useArticleSearch(query: string): SearchState {
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const trimmed = query.trim();

  useEffect(() => {
    if (!isSearchable(trimmed)) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setState({ status: "searching" });
      try {
        const results = await searchPublishedArticles(trimmed);
        if (!cancelled) setState({ status: "done", query: trimmed, results });
      } catch {
        if (!cancelled) setState({ status: "failed" });
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  return isSearchable(trimmed) ? state : { status: "idle" };
}
