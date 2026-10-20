import type { Page } from "@/core/shared/page";
import type { Article, ArticleCategory, ArticleLanguage, ArticleSummary } from "./article";
import type { ArticleReader } from "./article-repository";
import { searchArticles } from "./article-search";
import { localizeArticle, localizeSummary } from "./article-translation";

/** Upper bound for "every published article" lists (search, sitemap, slug checks). */
const INDEX_LIMIT = 500;

/**
 * Use cases for readers: browsing and reading published articles.
 *
 * Pass a `locale` to get each article in the reader's language (its reviewed
 * translation when available, otherwise the original). Without one, articles
 * come back as written — handy for language-independent jobs like sitemaps.
 */
export class ArticleQueryService {
  constructor(private readonly reader: ArticleReader) {}

  async getLatest(limit: number, locale?: ArticleLanguage): Promise<ArticleSummary[]> {
    const page = await this.reader.listPublished({ limit });
    return this.localizeAll(page.items, locale);
  }

  async listPublished(
    options: { category?: ArticleCategory; limit: number; cursor?: string | null },
    locale?: ArticleLanguage,
  ): Promise<Page<ArticleSummary>> {
    const page = await this.reader.listPublished(options);
    return { ...page, items: this.localizeAll(page.items, locale) };
  }

  async getBySlug(slug: string, locale?: ArticleLanguage): Promise<Article | null> {
    const article = await this.reader.findPublishedBySlug(slug);
    return article && locale ? localizeArticle(article, locale) : article;
  }

  /** Every published article (newest first), without bodies. */
  async getIndex(locale?: ArticleLanguage): Promise<ArticleSummary[]> {
    const page = await this.reader.listPublished({ limit: INDEX_LIMIT });
    return this.localizeAll(page.items, locale);
  }

  /** Searches what the reader actually sees, i.e. in their language. */
  async search(query: string, locale: ArticleLanguage): Promise<ArticleSummary[]> {
    return searchArticles(await this.getIndex(locale), query);
  }

  /**
   * Stories to suggest after an article: newest ones from the same category
   * first, topped up with the latest from any category.
   */
  async getRelated(
    article: Pick<ArticleSummary, "id" | "category">,
    limit: number,
    locale?: ArticleLanguage,
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
    return this.localizeAll(related, locale);
  }

  private localizeAll(items: ArticleSummary[], locale?: ArticleLanguage): ArticleSummary[] {
    return locale ? items.map((item) => localizeSummary(item, locale)) : items;
  }
}
