import { cacheLife, cacheTag } from "next/cache";
import { publicServices } from "@/composition/public-services";
import type { Article, ArticleCategory, ArticleSummary } from "@/core/articles/article";
import type { Page } from "@/core/shared/page";
import { CACHE_TAGS } from "./cache-tags";

/*
 * Cached read models for public pages. Results are shared across visitors and
 * invalidated on demand (see `refreshPublishedContent`) whenever the author
 * saves, so readers see new articles right away without hammering Firestore.
 */

const ARTICLES_PAGE_SIZE = 9;

export async function getLatestArticles(limit: number): Promise<ArticleSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.getLatest(limit);
}

export async function getPublishedArticles(
  category: ArticleCategory | undefined,
  cursor: string | null = null,
  limit: number = ARTICLES_PAGE_SIZE,
): Promise<Page<ArticleSummary>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.listPublished({ category, cursor, limit });
}

/** First page of every category filter at once, so switching tabs is instant. */
export async function getArticlePagesByCategory(
  limit: number = ARTICLES_PAGE_SIZE,
): Promise<Record<"all" | ArticleCategory, Page<ArticleSummary>>> {
  const [all, national, international] = await Promise.all([
    getPublishedArticles(undefined, null, limit),
    getPublishedArticles("national", null, limit),
    getPublishedArticles("international", null, limit),
  ]);
  return { all, national, international };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.getBySlug(slug);
}

export async function getRelatedArticles(
  articleId: string,
  category: ArticleCategory,
  limit: number,
): Promise<ArticleSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.getRelated({ id: articleId, category }, limit);
}

/** Every published article without bodies — feeds search and the sitemap. */
export async function getPublishedIndex(): Promise<ArticleSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles);
  return publicServices.articles.getIndex();
}
