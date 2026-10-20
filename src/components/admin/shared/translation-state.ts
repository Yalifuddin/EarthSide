import type { TranslationState } from "@/core/articles/article-translation";

/** Badge colour for each translation review state, shared by the editor and the dashboard. */
export const TRANSLATION_STATE_TONE: Record<TranslationState, "muted" | "rose" | "moss"> = {
  missing: "muted",
  needs_review: "rose",
  reviewed: "moss",
  outdated: "rose",
};
