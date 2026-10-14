import type { Page } from "@/core/shared/page";
import type { Article, ArticleCategory, ArticleRecord, ArticleSummary } from "./article";

export interface PublishedArticlesQuery {
  category?: ArticleCategory;
  limit: number;
  cursor?: string | null;
}

/**
 * Read-only port used by public pages. Kept separate from the writer port
 * (Interface Segregation) so reader-facing code cannot mutate content.
 */
export interface ArticleReader {
  listPublished(query: PublishedArticlesQuery): Promise<Page<ArticleSummary>>;
  findPublishedBySlug(slug: string): Promise<Article | null>;
}

/** Admin port: full access to drafts and mutations. */
export interface ArticleWriter {
  listAll(): Promise<ArticleSummary[]>;
  findById(id: string): Promise<Article | null>;
  create(record: ArticleRecord): Promise<string>;
  update(id: string, record: ArticleRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ArticleRepository extends ArticleReader, ArticleWriter {}
