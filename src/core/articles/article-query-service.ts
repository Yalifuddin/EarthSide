import type { Page } from "@/core/shared/page";
import type { Article, ArticleCategory, ArticleSummary } from "./article";
import type { ArticleReader } from "./article-repository";
import { searchArticles } from "./article-search";

/** Upper bound for "every published article" lists (search, sitemap, slug checks). */
const INDEX_LIMIT = 500;

/** Use cases for readers: browsing and reading published articles. */
export class ArticleQueryService {
  constructor(private readonly reader: ArticleReader) {}

  async getLatest(limit: number): Promise<ArticleSummary[]> {
    const page = await this.reader.listPublished({ limit });
    return page.items;
  }

  listPublished(options: {
    category?: ArticleCategory;
    limit: number;
    cursor?: string | null;
  }): Promise<Page<ArticleSummary>> {
    return this.reader.listPublished(options);
  }

  getBySlug(slug: string): Promise<Article | null> {
    return this.reader.findPublishedBySlug(slug);
  }

  /** Every published article (newest first), without bodies. */
  async getIndex(): Promise<ArticleSummary[]> {
    const page = await this.reader.listPublished({ limit: INDEX_LIMIT });
    return page.items;
  }

  async search(query: string): Promise<ArticleSummary[]> {
    return searchArticles(await this.getIndex(), query);
  }

  /**
   * Stories to suggest after an article: newest ones from the same category
   * first, topped up with the latest from any category.
   */
  async getRelated(
    article: Pick<ArticleSummary, "id" | "category">,
    limit: number,
  ): Promise<ArticleSummary[]> {
    const [sameCategory, latest] = await Promise.all([
      this.reader.listPublished({ category: article.category, limit: limit + 1 }),
      this.reader.listPublished({ limit: limit * 2 + 1 }),
    ]);

    const seen = new Set<string>([article.id]);
    const related: ArticleSummary[] = [];
    for (const candidate of [...sameCategory.items, ...latest.items]) {
      if (related.length === limit) break;
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      related.push(candidate);
    }
    return related;
  }
}
