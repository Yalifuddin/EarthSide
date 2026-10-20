import { buildExcerpt, estimateReadingMinutes, extractPlainText } from "@/core/rich-text/rich-text";
import { createUniqueSlug } from "@/core/shared/slug";
import { ValidationError } from "@/core/shared/validation";
import type {
  Article,
  ArticleInput,
  ArticleRecord,
  ArticleStatus,
  ArticleSummary,
  ArticleTranslation,
  TranslationInput,
} from "./article";
import type { ArticleWriter } from "./article-repository";
import { fingerprintOf, toTranslatedArticle, translationTargetOf } from "./article-translation";
import { validateArticleInput, validateTranslationInput } from "./article-validation";

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
      this.toRecord(data, {
        slug: createUniqueSlug(data.title),
        publishedAt: null,
        translations: {},
      }),
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

  /**
   * Stores a (machine or edited) translation as a draft awaiting review. Readers
   * keep seeing the previously reviewed version, if any, until it's approved.
   * @throws {ValidationError | ArticleNotFoundError}
   */
  async saveTranslationDraft(id: string, input: TranslationInput): Promise<void> {
    const data = this.validateTranslation(input);
    await this.updateTranslation(id, (article, current) => ({
      published: current?.published ?? null,
      draft: toTranslatedArticle(data),
      needsReview: true,
      // Saved against the original as it is now, so it counts as up to date.
      sourceFingerprint: article.textFingerprint,
      updatedAt: this.now(),
    }));
  }

  /** Publishes the draft translation to readers (optionally saving last edits first). */
  async approveTranslation(id: string, input: TranslationInput): Promise<void> {
    const draft = toTranslatedArticle(this.validateTranslation(input));
    await this.updateTranslation(id, (article) => ({
      published: draft,
      draft,
      needsReview: false,
      sourceFingerprint: article.textFingerprint,
      updatedAt: this.now(),
    }));
  }

  private async updateTranslation(
    id: string,
    next: (article: Article, current: ArticleTranslation | undefined) => ArticleTranslation,
  ): Promise<void> {
    const article = await this.requireArticle(id);
    const target = translationTargetOf(article.language);
    const { id: _id, createdAt: _created, updatedAt: _updated, ...record } = article;
    void _id;
    void _created;
    void _updated;
    await this.writer.update(id, {
      ...record,
      translations: {
        ...article.translations,
        [target]: next(article, article.translations[target]),
      },
    });
  }

  private validate(input: ArticleInput): ArticleInput {
    const result = validateArticleInput(input);
    if (!result.success) throw new ValidationError(result.errors);
    return result.data;
  }

  private validateTranslation(input: TranslationInput): TranslationInput {
    const result = validateTranslationInput(input);
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
    existing: Pick<Article, "slug" | "publishedAt" | "translations">,
  ): ArticleRecord {
    const plainText = extractPlainText(input.content);
    const isFirstPublish = input.status === "published" && existing.publishedAt === null;
    // A translation *into* the article's own language makes no sense (e.g. after
    // the author switched the original's language), so it's dropped.
    const { [input.language]: _sameLanguage, ...translations } = existing.translations;
    void _sameLanguage;

    return {
      ...input,
      slug: existing.slug,
      excerpt: buildExcerpt(plainText),
      readingMinutes: estimateReadingMinutes(plainText),
      authorName: this.authorName,
      textFingerprint: fingerprintOf(input),
      translations,
      publishedAt: isFirstPublish ? this.now() : existing.publishedAt,
    };
  }
}
