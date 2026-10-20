import type { ArticleLanguage, TranslatedArticle, TranslationInput } from "@/core/articles/article";
import { toTranslatedArticle } from "@/core/articles/article-translation";
import { escapeXml, toTranslatableDocument, unescapeXml } from "@/core/rich-text/translatable-text";

/**
 * Port for a machine-translation service. Segments may contain the simple XML
 * tags produced by `toTranslatableDocument`, which must be kept intact.
 */
export interface Translator {
  translate(segments: string[], from: ArticleLanguage, to: ArticleLanguage): Promise<string[]>;
}

export class TranslatorUnavailableError extends Error {
  constructor() {
    super("No translation service is configured");
    this.name = "TranslatorUnavailableError";
  }
}

/** Use case: produce a translated draft of an article, formatting included. */
export class ArticleTranslationService {
  constructor(private readonly translator: Translator | null) {}

  get isAvailable(): boolean {
    return this.translator !== null;
  }

  /** @throws {TranslatorUnavailableError} when no translation service is configured. */
  async translate(
    source: TranslationInput,
    from: ArticleLanguage,
    to: ArticleLanguage,
  ): Promise<TranslatedArticle> {
    if (!this.translator) throw new TranslatorUnavailableError();

    const body = toTranslatableDocument(source.content);
    const texts = [escapeXml(source.title), escapeXml(source.coverImageAlt), ...body.segments];
    // Empty strings cost nothing to keep in place, but some services reject them.
    const indexes = texts.flatMap((text, index) => (text.trim() ? [index] : []));
    const translated = await this.translator.translate(
      indexes.map((index) => texts[index]),
      from,
      to,
    );

    const results = [...texts];
    indexes.forEach((original, position) => (results[original] = translated[position] ?? ""));
    const [title, coverImageAlt, ...segments] = results;

    return toTranslatedArticle({
      title: unescapeXml(title),
      coverImageAlt: unescapeXml(coverImageAlt),
      content: body.rebuild(segments),
    });
  }
}
