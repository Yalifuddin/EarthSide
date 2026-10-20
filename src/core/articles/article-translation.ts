import { buildExcerpt, estimateReadingMinutes, extractPlainText } from "@/core/rich-text/rich-text";
import type {
  Article,
  ArticleLanguage,
  ArticleSummary,
  TranslatedArticle,
  TranslationInput,
} from "./article";

/** Each article is translated into the one other site language. */
export function translationTargetOf(language: ArticleLanguage): ArticleLanguage {
  return language === "id" ? "en" : "id";
}

/** Small, stable hash (djb2) — only used to notice that a text changed, not for security. */
function hash(text: string): string {
  let value = 5381;
  for (let i = 0; i < text.length; i++) value = ((value << 5) + value + text.charCodeAt(i)) | 0;
  return (value >>> 0).toString(36);
}

/** Changes whenever the title, body or image description of the original changes. */
export function fingerprintOf({ title, content, coverImageAlt }: TranslationInput): string {
  return hash(JSON.stringify([title.trim(), coverImageAlt.trim(), content]));
}

/** Derives excerpt and reading time for a translated text, like for originals. */
export function toTranslatedArticle(input: TranslationInput): TranslatedArticle {
  const plainText = extractPlainText(input.content);
  return {
    title: input.title.trim(),
    coverImageAlt: input.coverImageAlt.trim(),
    content: input.content,
    excerpt: buildExcerpt(plainText),
    readingMinutes: estimateReadingMinutes(plainText),
  };
}

export type TranslationState =
  /** Never translated. */
  | "missing"
  /** A draft is waiting for the author's review. */
  | "needs_review"
  /** The reviewed version matches the current original. */
  | "reviewed"
  /** The original changed after the last translation (e.g. translating failed). */
  | "outdated";

export function translationStateOf(
  article: Pick<ArticleSummary, "language" | "textFingerprint" | "translations">,
): TranslationState {
  const translation = article.translations[translationTargetOf(article.language)];
  if (!translation) return "missing";
  if (translation.needsReview) return "needs_review";
  return translation.sourceFingerprint === article.textFingerprint ? "reviewed" : "outdated";
}

/**
 * The version a reader should see in `locale`: the reviewed translation when
 * there is one, otherwise the original (whose `language` then tells the UI so).
 */
export function localizeSummary(article: ArticleSummary, locale: ArticleLanguage): ArticleSummary {
  const published = article.language === locale ? null : article.translations[locale]?.published;
  if (!published) return article;
  return { ...article, ...published, language: locale };
}

export function localizeArticle(article: Article, locale: ArticleLanguage): Article {
  const published = article.language === locale ? null : article.translations[locale]?.published;
  if (!published) return article;
  return { ...article, ...published, language: locale };
}
