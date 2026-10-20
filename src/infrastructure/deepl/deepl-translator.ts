import type { ArticleLanguage } from "@/core/articles/article";
import type { Translator } from "@/core/translation/translator";

/** DeepL language codes; English targets need a variant. */
const SOURCE_CODES: Record<ArticleLanguage, string> = { id: "ID", en: "EN" };
const TARGET_CODES: Record<ArticleLanguage, string> = { id: "ID", en: "EN-US" };

/** DeepL accepts at most 50 texts per request. */
const BATCH_SIZE = 50;

interface DeepLResponse {
  translations?: { text: string }[];
  message?: string;
}

/**
 * Translates with DeepL (https://www.deepl.com/pro-api). `tag_handling: "xml"`
 * keeps our inline formatting tags around the right words.
 */
export class DeepLTranslator implements Translator {
  private readonly endpoint: string;

  constructor(private readonly apiKey: string) {
    // Free-plan keys end in ":fx" and live on a separate host.
    this.endpoint = apiKey.endsWith(":fx")
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";
  }

  async translate(segments: string[], from: ArticleLanguage, to: ArticleLanguage) {
    const results: string[] = [];
    for (let start = 0; start < segments.length; start += BATCH_SIZE) {
      results.push(
        ...(await this.translateBatch(segments.slice(start, start + BATCH_SIZE), from, to)),
      );
    }
    return results;
  }

  private async translateBatch(texts: string[], from: ArticleLanguage, to: ArticleLanguage) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts,
        source_lang: SOURCE_CODES[from],
        target_lang: TARGET_CODES[to],
        tag_handling: "xml",
        preserve_formatting: true,
      }),
    });
    const result = (await response.json().catch(() => ({}))) as DeepLResponse;
    if (!response.ok || !result.translations) {
      throw new Error(`DeepL responded ${response.status}: ${result.message ?? "no translations"}`);
    }
    return result.translations.map((translation) => translation.text);
  }
}
