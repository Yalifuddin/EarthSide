"use server";

/*
 * Demo mode only: lets the browser dashboard read and write the *same*
 * in-memory store the public pages render from, so edits made in /admin show
 * up on the site right away. Refuses to run with a real database or outside
 * `next dev`, because server actions are public endpoints.
 */

import {
  getArticleRepository,
  getTopicRequestRepository,
  isDemoMode,
} from "@/composition/repositories";
import type { Article, ArticleRecord, ArticleSummary } from "@/core/articles/article";
import type { TopicRequest, TopicRequestStatus } from "@/core/topic-requests/topic-request";

/**
 * Objects crossing the action boundary are tied to that one request; storing
 * them and returning them in a later response fails ("opaque temporary
 * reference"). Copy on the way in and out (Dates survive structuredClone).
 */
function detach<T>(value: T): T {
  return structuredClone(value);
}

function assertDemoStore() {
  if (!isDemoMode || process.env.NODE_ENV !== "development") {
    throw new Error("The demo store is only available in local development without Firebase.");
  }
}

export async function demoListArticles(): Promise<ArticleSummary[]> {
  assertDemoStore();
  return detach(await getArticleRepository().listAll());
}

export async function demoFindArticle(id: string): Promise<Article | null> {
  assertDemoStore();
  return detach(await getArticleRepository().findById(id));
}

export async function demoCreateArticle(record: ArticleRecord): Promise<string> {
  assertDemoStore();
  return getArticleRepository().create(detach(record));
}

export async function demoUpdateArticle(id: string, record: ArticleRecord): Promise<void> {
  assertDemoStore();
  await getArticleRepository().update(id, detach(record));
}

export async function demoDeleteArticle(id: string): Promise<void> {
  assertDemoStore();
  await getArticleRepository().delete(id);
}

export async function demoListRequests(): Promise<TopicRequest[]> {
  assertDemoStore();
  return detach(await getTopicRequestRepository().listAll());
}

export async function demoCountRequests(status: TopicRequestStatus): Promise<number> {
  assertDemoStore();
  return getTopicRequestRepository().countByStatus(status);
}

export async function demoUpdateRequestStatus(
  id: string,
  status: TopicRequestStatus,
): Promise<void> {
  assertDemoStore();
  await getTopicRequestRepository().updateStatus(id, status);
}

export async function demoDeleteRequest(id: string): Promise<void> {
  assertDemoStore();
  await getTopicRequestRepository().delete(id);
}
