import { Timestamp, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore/lite";
import {
  ARTICLE_LANGUAGES,
  isArticleCategory,
  type Article,
  type ArticleLanguage,
  type ArticleRecord,
  type ArticleSummary,
} from "@/core/articles/article";
import { EMPTY_DOCUMENT, type RichTextNode } from "@/core/rich-text/rich-text";

/** Shape of an article document as stored in Firestore. */
export interface ArticleDocument {
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date(0);
}

export function toArticleSummary(id: string, data: DocumentData): ArticleSummary {
  const doc = data as Partial<ArticleDocument>;
  return {
    id,
    slug: doc.slug ?? id,
    title: doc.title ?? "",
    excerpt: doc.excerpt ?? "",
    coverImageUrl: doc.coverImageUrl ?? null,
    coverImageAlt: doc.coverImageAlt ?? "",
    category: isArticleCategory(doc.category) ? doc.category : "national",
    // Articles saved before the language field existed were all Indonesian.
    language: ARTICLE_LANGUAGES.includes(doc.language as ArticleLanguage)
      ? (doc.language as ArticleLanguage)
      : "id",
    status: doc.status === "published" ? "published" : "draft",
    readingMinutes: doc.readingMinutes ?? 1,
    authorName: doc.authorName ?? "",
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
    publishedAt: doc.publishedAt ? toDate(doc.publishedAt) : null,
  };
}

export function toArticle(snapshot: QueryDocumentSnapshot): Article {
  const data = snapshot.data();
  return {
    ...toArticleSummary(snapshot.id, data),
    content: (data.content as RichTextNode | undefined) ?? EMPTY_DOCUMENT,
  };
}

/** Converts domain fields into Firestore-friendly values (timestamps are set by the repository). */
export function toArticleFields(record: ArticleRecord) {
  return {
    ...record,
    publishedAt: record.publishedAt ? Timestamp.fromDate(record.publishedAt) : null,
  };
}
