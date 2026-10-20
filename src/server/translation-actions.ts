"use server";

import { translationServices } from "@/composition/translation-services";
import {
  ARTICLE_LANGUAGES,
  type ArticleLanguage,
  type TranslatedArticle,
  type TranslationInput,
} from "@/core/articles/article";
import { validateTranslationInput } from "@/core/articles/article-validation";
import { extractPlainText } from "@/core/rich-text/rich-text";

/** Guards the translation quota against oversized requests (≈ a very long article). */
const MAX_SOURCE_CHARACTERS = 60_000;

export type TranslateArticleResult =
  | { ok: true; translation: TranslatedArticle }
  | { ok: false; reason: "unauthorized" | "unavailable" | "invalid" | "failed" };

interface TranslateArticleRequest {
  /** Firebase ID token of the signed-in author (server actions are public endpoints). */
  idToken: string | null;
  source: TranslationInput;
  from: string;
  to: string;
}

function isLanguage(value: string): value is ArticleLanguage {
  return ARTICLE_LANGUAGES.includes(value as ArticleLanguage);
}

/** Machine-translates an article for the author to review. Nothing is saved here. */
export async function translateArticle({
  idToken,
  source,
  from,
  to,
}: TranslateArticleRequest): Promise<TranslateArticleResult> {
  const { translation } = translationServices;
  if (!translation.isAvailable) return { ok: false, reason: "unavailable" };
  if (!(await translationServices.isAdminToken(idToken))) {
    return { ok: false, reason: "unauthorized" };
  }

  const valid = validateTranslationInput(source);
  if (!isLanguage(from) || !isLanguage(to) || from === to || !valid.success) {
    return { ok: false, reason: "invalid" };
  }
  if (extractPlainText(valid.data.content).length > MAX_SOURCE_CHARACTERS) {
    return { ok: false, reason: "invalid" };
  }

  try {
    return { ok: true, translation: await translation.translate(valid.data, from, to) };
  } catch (error) {
    console.error("Article translation failed", error);
    return { ok: false, reason: "failed" };
  }
}
