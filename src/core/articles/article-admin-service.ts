import { buildExcerpt, estimateReadingMinutes, extractPlainText } from "@/core/rich-text/rich-text";
import { createUniqueSlug } from "@/core/shared/slug";
import { ValidationError } from "@/core/shared/validation";
import type {
  Article,
  ArticleInput,
  ArticleRecord,
  ArticleStatus,
  ArticleSummary,
} from "./article";
import type { ArticleWriter } from "./article-repository";
import { validateArticleInput } from "./article-validation";

export class ArticleNotFoundError extends Error {
  constructor(id: string) {
    super(`Article "${id}" was not found`);
    this.name = "ArticleNotFoundError";
  }
}

/** Use cases for the author: drafting, publishing and managing articles. */
export class ArticleAdminService {
  constructor(
    private readonly writer: ArticleWriter,
    private readonly authorName: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  listAll(): Promise<ArticleSummary[]> {
    return this.writer.listAll();
  }

  getById(id: string): Promise<Article | null> {
    return this.writer.findById(id);
  }

  /** @throws {ValidationError} when the input is invalid. */
  async create(input: ArticleInput): Promise<string> {
    const data = this.validate(input);
    return this.writer.create(
      this.toRecord(data, { slug: createUniqueSlug(data.title), publishedAt: null }),
    );
  }

  /** @throws {ValidationError | ArticleNotFoundError} */
  async update(id: string, input: ArticleInput): Promise<void> {
    const data = this.validate(input);
    const existing = await this.requireArticle(id);
    // The slug never changes after creation, so shared links keep working.
    await this.writer.update(id, this.toRecord(data, existing));
  }

  async setStatus(id: string, status: ArticleStatus): Promise<void> {
    const existing = await this.requireArticle(id);
    await this.update(id, { ...existing, status });
  }

  delete(id: string): Promise<void> {
    return this.writer.delete(id);
  }

  private validate(input: ArticleInput): ArticleInput {
    const result = validateArticleInput(input);
    if (!result.success) throw new ValidationError(result.errors);
    return result.data;
  }

  private async requireArticle(id: string): Promise<Article> {
    const article = await this.writer.findById(id);
    if (!article) throw new ArticleNotFoundError(id);
    return article;
  }

  private toRecord(
    input: ArticleInput,
    existing: Pick<Article, "slug" | "publishedAt">,
  ): ArticleRecord {
    const plainText = extractPlainText(input.content);
    const isFirstPublish = input.status === "published" && existing.publishedAt === null;

    return {
      ...input,
      slug: existing.slug,
      excerpt: buildExcerpt(plainText),
      readingMinutes: estimateReadingMinutes(plainText),
      authorName: this.authorName,
      publishedAt: isFirstPublish ? this.now() : existing.publishedAt,
    };
  }
}
