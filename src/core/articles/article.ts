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

/** Everything needed to list an article, without its (heavy) body. */
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  category: ArticleCategory;
  language: ArticleLanguage;
  status: ArticleStatus;
  readingMinutes: number;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface Article extends ArticleSummary {
  content: RichTextNode;
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

/** The full set of persisted fields, as handed to a repository. */
export type ArticleRecord = Omit<Article, "id" | "createdAt" | "updatedAt">;
