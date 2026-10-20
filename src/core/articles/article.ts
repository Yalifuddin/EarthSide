import type { RichTextNode } from "@/core/rich-text/rich-text";

export const ARTICLE_CATEGORIES = ["national", "international"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const ARTICLE_STATUSES = ["draft", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

/** The language an article is written in (independent of the site's UI language). */
export const ARTICLE_LANGUAGES = ["id", "en"] as const;
export type ArticleLanguage = (typeof ARTICLE_LANGUAGES)[number];

export function isArticleCategory(value: unknown): value is ArticleCategory {
  return ARTICLE_CATEGORIES.includes(value as ArticleCategory);
}

/** Reader-facing text of an article in one language, without the body. */
export interface TranslatedSummary {
  title: string;
  excerpt: string;
  coverImageAlt: string;
  readingMinutes: number;
}

export interface TranslatedArticle extends TranslatedSummary {
  content: RichTextNode;
}

/**
 * One target language of an article. Readers only ever see `published` (the
 * reviewed version); `draft` holds fresh machine output or edits awaiting review.
 */
export interface ArticleTranslation {
  published: TranslatedArticle | null;
  draft: TranslatedArticle;
  needsReview: boolean;
  /** Fingerprint of the original text the draft was made from. */
  sourceFingerprint: string;
  updatedAt: Date;
}

/** What lists need to know about a translation (no bodies). */
export interface TranslationSummary {
  published: TranslatedSummary | null;
  needsReview: boolean;
  sourceFingerprint: string;
}

/** Everything needed to list an article, without its (heavy) body. */
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  category: ArticleCategory;
  /** The language of the text in this object (the original, unless localized for a reader). */
  language: ArticleLanguage;
  status: ArticleStatus;
  readingMinutes: number;
  authorName: string;
  /** Fingerprint of the original title, body and image text — tells when translations are stale. */
  textFingerprint: string;
  translations: Partial<Record<ArticleLanguage, TranslationSummary>>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface Article extends ArticleSummary {
  content: RichTextNode;
  translations: Partial<Record<ArticleLanguage, ArticleTranslation>>;
}

/** What the author fills in. Derived fields (slug, excerpt, …) are computed by the service. */
export interface ArticleInput {
  title: string;
  category: ArticleCategory;
  language: ArticleLanguage;
  status: ArticleStatus;
  content: RichTextNode;
  coverImageUrl: string | null;
  coverImageAlt: string;
}

/** The translatable part of an article, as edited in the translation tab. */
export type TranslationInput = Pick<ArticleInput, "title" | "content" | "coverImageAlt">;

/** The full set of persisted fields, as handed to a repository. */
export type ArticleRecord = Omit<Article, "id" | "createdAt" | "updatedAt">;

/** Drops bodies (original and translated) so lists stay light. */
export function summarize(article: Article): ArticleSummary {
  const { content, translations, ...rest } = article;
  void content;
  const summaries: ArticleSummary["translations"] = {};
  for (const [language, translation] of Object.entries(translations) as [
    ArticleLanguage,
    ArticleTranslation,
  ][]) {
    summaries[language] = {
      published: translation.published && withoutContent(translation.published),
      needsReview: translation.needsReview,
      sourceFingerprint: translation.sourceFingerprint,
    };
  }
  return { ...rest, translations: summaries };
}

function withoutContent({ content, ...summary }: TranslatedArticle): TranslatedSummary {
  void content;
  return summary;
}
