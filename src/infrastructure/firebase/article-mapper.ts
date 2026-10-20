import { Timestamp, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore/lite";
import {
  ARTICLE_LANGUAGES,
  isArticleCategory,
  summarize,
  type Article,
  type ArticleLanguage,
  type ArticleRecord,
  type ArticleSummary,
  type ArticleTranslation,
  type TranslatedArticle,
} from "@/core/articles/article";
import { fingerprintOf } from "@/core/articles/article-translation";
import { EMPTY_DOCUMENT, type RichTextNode } from "@/core/rich-text/rich-text";

/**
 * A translated text as stored in Firestore. Its body is kept as a JSON string:
 * nested inside `translations`, a deep document (lists in quotes…) could
 * otherwise exceed Firestore's 20-level nesting limit.
 */
type StoredTranslatedArticle = Omit<TranslatedArticle, "content"> & {
  content: string | RichTextNode;
};

/** Shape of a translation as stored in Firestore. */
interface TranslationDocument {
  published: StoredTranslatedArticle | null;
  draft: StoredTranslatedArticle;
  needsReview: boolean;
  sourceFingerprint: string;
  updatedAt: Timestamp;
}

/** Shape of an article document as stored in Firestore. */
interface ArticleDocument {
  slug: string;
  title: string;
  excerpt: string;
  content: RichTextNode;
  coverImageUrl: string | null;
  coverImageAlt: string;
  category: string;
  language: string;
  status: string;
  readingMinutes: number;
  authorName: string;
  textFingerprint: string;
  translations: Partial<Record<ArticleLanguage, TranslationDocument>>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date(0);
}

function isLanguage(value: unknown): value is ArticleLanguage {
  return ARTICLE_LANGUAGES.includes(value as ArticleLanguage);
}

function fromStored(stored: StoredTranslatedArticle): TranslatedArticle {
  const content =
    typeof stored.content === "string"
      ? (JSON.parse(stored.content) as RichTextNode)
      : (stored.content ?? EMPTY_DOCUMENT);
  return { ...stored, content };
}

function toStored(translated: TranslatedArticle): StoredTranslatedArticle {
  return { ...translated, content: JSON.stringify(translated.content) };
}

function toTranslations(raw: unknown): Article["translations"] {
  const translations: Article["translations"] = {};
  if (!raw || typeof raw !== "object") return translations;

  for (const [language, value] of Object.entries(raw as Record<string, TranslationDocument>)) {
    if (!isLanguage(language) || !value?.draft) continue;
    translations[language] = {
      published: value.published ? fromStored(value.published) : null,
      draft: fromStored(value.draft),
      needsReview: Boolean(value.needsReview),
      sourceFingerprint: value.sourceFingerprint ?? "",
      updatedAt: toDate(value.updatedAt),
    };
  }
  return translations;
}

/** Tolerates documents written by older versions (missing fields get safe defaults). */
export function articleFromData(id: string, data: DocumentData): Article {
  const doc = data as Partial<ArticleDocument>;
  const title = doc.title ?? "";
  const content = doc.content ?? EMPTY_DOCUMENT;
  const coverImageAlt = doc.coverImageAlt ?? "";

  return {
    id,
    slug: doc.slug ?? id,
    title,
    excerpt: doc.excerpt ?? "",
    content,
    coverImageUrl: doc.coverImageUrl ?? null,
    coverImageAlt,
    category: isArticleCategory(doc.category) ? doc.category : "national",
    // Articles saved before the language field existed were all Indonesian.
    language: isLanguage(doc.language) ? doc.language : "id",
    status: doc.status === "published" ? "published" : "draft",
    readingMinutes: doc.readingMinutes ?? 1,
    authorName: doc.authorName ?? "",
    textFingerprint: doc.textFingerprint ?? fingerprintOf({ title, content, coverImageAlt }),
    translations: toTranslations(doc.translations),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
    publishedAt: doc.publishedAt ? toDate(doc.publishedAt) : null,
  };
}

export function toArticle(snapshot: QueryDocumentSnapshot): Article {
  return articleFromData(snapshot.id, snapshot.data());
}

export function toArticleSummary(id: string, data: DocumentData): ArticleSummary {
  return summarize(articleFromData(id, data));
}

/** Converts domain fields into Firestore-friendly values (timestamps are set by the repository). */
export function toArticleFields(record: ArticleRecord) {
  const translations: Partial<Record<ArticleLanguage, TranslationDocument>> = {};
  for (const [language, translation] of Object.entries(record.translations) as [
    ArticleLanguage,
    ArticleTranslation,
  ][]) {
    translations[language] = {
      ...translation,
      published: translation.published && toStored(translation.published),
      draft: toStored(translation.draft),
      updatedAt: Timestamp.fromDate(translation.updatedAt),
    };
  }
  return {
    ...record,
    translations,
    publishedAt: record.publishedAt ? Timestamp.fromDate(record.publishedAt) : null,
  };
}
