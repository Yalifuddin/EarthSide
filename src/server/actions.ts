"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { publicServices } from "@/composition/public-services";
import { isArticleCategory, type ArticleSummary } from "@/core/articles/article";
import { searchArticles } from "@/core/articles/article-search";
import type { Page } from "@/core/shared/page";
import { ValidationError, type FieldErrors } from "@/core/shared/validation";
import type { TopicRequestInput } from "@/core/topic-requests/topic-request";
import { getPublishedArticles, getPublishedIndex } from "./article-queries";
import { CACHE_TAGS } from "./cache-tags";

export type SubmitTopicRequestResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; errors: FieldErrors<TopicRequestInput> }
  | { ok: false; reason: "rate_limited" | "challenge_failed" | "failed" };

export interface TopicRequestSubmission extends TopicRequestInput {
  /** Honeypot: real visitors never see this field, so any value means a bot. */
  website?: string;
  /** Turnstile token, when the CAPTCHA is enabled. */
  humanToken?: string;
}

async function clientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerList.get("x-real-ip");
}

/** Receives a reader's topic suggestion, after the spam checks. */
export async function submitTopicRequest({
  website = "",
  humanToken = "",
  ...request
}: TopicRequestSubmission): Promise<SubmitTopicRequestResult> {
  const verdict = await publicServices.spamGuard.check({
    honeypot: website,
    humanToken,
    clientIp: await clientIp(),
  });
  // Bots get a fake success so they don't learn to adapt.
  if (verdict === "bot") return { ok: true };
  if (verdict !== "ok") return { ok: false, reason: verdict };

  try {
    await publicServices.topicRequests.submit(request);
    return { ok: true };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { ok: false, reason: "invalid", errors: error.errors };
    }
    console.error("Failed to submit topic request", error);
    return { ok: false, reason: "failed" };
  }
}

/** Archive search. Runs over the cached index, so typing doesn't hit Firestore. */
export async function searchPublishedArticles(query: string): Promise<ArticleSummary[]> {
  return searchArticles(await getPublishedIndex(), query.slice(0, 100));
}

/** "Load more" for the article archive. */
export async function loadMoreArticles(
  category: string | null,
  cursor: string,
): Promise<Page<ArticleSummary>> {
  return getPublishedArticles(isArticleCategory(category) ? category : undefined, cursor);
}

/**
 * Called by the dashboard after the author saves, so public pages drop their
 * cached copies. It only expires caches (no data is exposed or changed), so it
 * is safe to leave unauthenticated.
 */
export async function refreshPublishedContent(): Promise<void> {
  updateTag(CACHE_TAGS.articles);
}
