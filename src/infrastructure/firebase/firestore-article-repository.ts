import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore/lite";
import type { Article, ArticleRecord, ArticleSummary } from "@/core/articles/article";
import type { ArticleRepository, PublishedArticlesQuery } from "@/core/articles/article-repository";
import type { Page } from "@/core/shared/page";
import { toArticle, toArticleFields, toArticleSummary } from "./article-mapper";
import { COLLECTIONS, getDb } from "./firebase-app";

/** Cursor = the `publishedAt` of the last item, in epoch milliseconds. */
function decodeCursor(cursor: string | null | undefined): Timestamp | null {
  const millis = Number(cursor);
  return cursor && Number.isFinite(millis) ? Timestamp.fromMillis(millis) : null;
}

function encodeCursor(item: ArticleSummary | undefined): string | null {
  return item?.publishedAt ? String(item.publishedAt.getTime()) : null;
}

export class FirestoreArticleRepository implements ArticleRepository {
  private get articles() {
    return collection(getDb(), COLLECTIONS.articles);
  }

  async listPublished({
    category,
    limit: pageSize,
    cursor,
  }: PublishedArticlesQuery): Promise<Page<ArticleSummary>> {
    const after = decodeCursor(cursor);
    const constraints: QueryConstraint[] = [
      where("status", "==", "published"),
      ...(category ? [where("category", "==", category)] : []),
      orderBy("publishedAt", "desc"),
      ...(after ? [startAfter(after)] : []),
      // Fetch one extra to know whether another page exists.
      limit(pageSize + 1),
    ];

    const snapshot = await getDocs(query(this.articles, ...constraints));
    const items = snapshot.docs.map((d) => toArticleSummary(d.id, d.data()));
    const hasMore = items.length > pageSize;
    const pageItems = items.slice(0, pageSize);

    return { items: pageItems, nextCursor: hasMore ? encodeCursor(pageItems.at(-1)) : null };
  }

  async findPublishedBySlug(slug: string): Promise<Article | null> {
    const snapshot = await getDocs(
      query(this.articles, where("slug", "==", slug), where("status", "==", "published"), limit(1)),
    );
    const first = snapshot.docs[0];
    return first ? toArticle(first) : null;
  }

  async listAll(): Promise<ArticleSummary[]> {
    const snapshot = await getDocs(query(this.articles, orderBy("updatedAt", "desc")));
    return snapshot.docs.map((d) => toArticleSummary(d.id, d.data()));
  }

  async findById(id: string): Promise<Article | null> {
    const snapshot = await getDoc(doc(this.articles, id));
    return snapshot.exists() ? toArticle(snapshot) : null;
  }

  async create(record: ArticleRecord): Promise<string> {
    const ref = await addDoc(this.articles, {
      ...toArticleFields(record),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }

  async update(id: string, record: ArticleRecord): Promise<void> {
    await updateDoc(doc(this.articles, id), {
      ...toArticleFields(record),
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.articles, id));
  }
}
