"use client";

import { useCallback } from "react";
import { useAdminServices } from "@/components/admin/shell/admin-auth-provider";
import { useAdminFeatures } from "@/components/admin/shell/admin-features";
import type { Article, TranslationInput } from "@/core/articles/article";
import { translationTargetOf } from "@/core/articles/article-translation";
import { translateArticle, type TranslateArticleResult } from "@/server/translation-actions";

export type TranslationFailure = Extract<TranslateArticleResult, { ok: false }>["reason"];

/**
 * Machine translation for the dashboard: asks the server to translate (proving
 * who we are with the sign-in token) and stores the result as a draft.
 */
export function useMachineTranslation() {
  const { machineTranslation } = useAdminFeatures();
  const { auth, articles } = useAdminServices();

  /** Translates the original into the other language and saves it for review. */
  const translateIntoDraft = useCallback(
    async (
      article: Pick<Article, "id" | "language">,
      source: TranslationInput,
    ): Promise<{ ok: true } | { ok: false; reason: TranslationFailure }> => {
      const result = await translateArticle({
        idToken: await auth.getIdToken(),
        source,
        from: article.language,
        to: translationTargetOf(article.language),
      });
      if (!result.ok) return result;

      const { title, content, coverImageAlt } = result.translation;
      await articles.saveTranslationDraft(article.id, { title, content, coverImageAlt });
      return { ok: true };
    },
    [auth, articles],
  );

  return { available: machineTranslation, translateIntoDraft };
}
