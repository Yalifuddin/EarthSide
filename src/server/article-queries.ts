import { cacheLife, cacheTag } from "next/cache";
import { publicServices } from "@/composition/public-services";
import type {
  Article,
  ArticleCategory,
  ArticleLanguage,
  ArticleSummary,
} from "@/core/articles/article";
import type { Page } from "@/core/shared/page";
import { CACHE_TAGS } from "./cache-tags";

/*
 * Cached read models for public pages. Results are shared across visitors and
 * invalidated on demand (see `refreshPublishedContent`) whenever the author
 * saves, so readers see new articles right away without hammering Firestore.
 * Reader-facing queries take the reader's `locale`, which is part of the cache key.
 */

const ARTICLES_PAGE_SIZE = 9;

export async function getLatestArticles(
  limit: number,
  locale: ArticleLanguage,
): Promise<ArticleSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.getLatest(limit, locale);
}

export async function getPublishedArticles(
  locale: ArticleLanguage,
  category: ArticleCategory | undefined,
  cursor: string | null = null,
  limit: number = ARTICLES_PAGE_SIZE,
): Promise<Page<ArticleSummary>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.listPublished({ category, cursor, limit }, locale);
}

/** First page of every category filter at once, so switching tabs is instant. */
export async function getArticlePagesByCategory(
  locale: ArticleLanguage,
  limit: number = ARTICLES_PAGE_SIZE,
): Promise<Record<"all" | ArticleCategory, Page<ArticleSummary>>> {
  const [all, national, international] = await Promise.all([
    getPublishedArticles(locale, undefined, null, limit),
    getPublishedArticles(locale, "national", null, limit),
    getPublishedArticles(locale, "international", null, limit),
  ]);
  return { all, national, international };
}

export async function getArticleBySlug(
  slug: string,
  locale: ArticleLanguage,
): Promise<Article | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.getBySlug(slug, locale);
}

export async function getRelatedArticles(
  articleId: string,
  category: ArticleCategory,
  limit: number,
  locale: ArticleLanguage,
): Promise<ArticleSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.getRelated({ id: articleId, category }, limit, locale);
}

/**
 * Every published article without bodies. With a locale it's what readers of
 * that language see (for search); without one, the originals (for the sitemap).
 */
export async function getPublishedIndex(locale?: ArticleLanguage): Promise<ArticleSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.getIndex(locale);
}
