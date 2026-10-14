import type { Article, ArticleRecord, ArticleSummary } from "@/core/articles/article";
import type { ArticleRepository, PublishedArticlesQuery } from "@/core/articles/article-repository";
import type { Page } from "@/core/shared/page";

function toSummary(article: Article): ArticleSummary {
  const { content, ...summary } = article;
  void content;
  return summary;
}

const byPublishedDesc = (a: ArticleSummary, b: ArticleSummary) =>
  (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);

/** Volatile repository for demo mode and tests. */
export class InMemoryArticleRepository implements ArticleRepository {
  private readonly articles = new Map<string, Article>();

  constructor(seed: Article[] = []) {
    seed.forEach((article) => this.articles.set(article.id, article));
  }

  async listPublished({
    category,
    limit,
    cursor,
  }: PublishedArticlesQuery): Promise<Page<ArticleSummary>> {
    const after = cursor ? Number(cursor) : Infinity;
    const matching = [...this.articles.values()]
      .filter((a) => a.status === "published" && (!category || a.category === category))
      .filter((a) => (a.publishedAt?.getTime() ?? 0) < after)
      .map(toSummary)
      .sort(byPublishedDesc);

    const items = matching.slice(0, limit);
    const last = items.at(-1);
    const hasMore = matching.length > limit;
    return {
      items,
      nextCursor: hasMore && last?.publishedAt ? String(last.publishedAt.getTime()) : null,
    };
  }

  async findPublishedBySlug(slug: string): Promise<Article | null> {
    const article = [...this.articles.values()].find((a) => a.slug === slug);
    return article?.status === "published" ? article : null;
  }

  async listAll(): Promise<ArticleSummary[]> {
    return [...this.articles.values()]
      .map(toSummary)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async findById(id: string): Promise<Article | null> {
    return this.articles.get(id) ?? null;
  }

  async create(record: ArticleRecord): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    this.articles.set(id, { ...record, id, createdAt: now, updatedAt: now });
    return id;
  }

  async update(id: string, record: ArticleRecord): Promise<void> {
    const existing = this.articles.get(id);
    if (!existing) return;
    this.articles.set(id, { ...existing, ...record, updatedAt: new Date() });
  }

  async delete(id: string): Promise<void> {
    this.articles.delete(id);
  }
}
