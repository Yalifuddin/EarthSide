import type { ArticleLanguage } from "@/core/articles/article";
import type { Translator } from "@/core/translation/translator";

/**
 * Demo-only stand-in for DeepL: marks each text with the target language, so
 * the whole translate → review → publish flow can be tried without an API key.
 */
export class PseudoTranslator implements Translator {
  async translate(segments: string[], _from: ArticleLanguage, to: ArticleLanguage) {
    return segments.map((segment) => `[${to.toUpperCase()}] ${segment}`);
  }
}
