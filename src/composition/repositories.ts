import { env } from "@/config/env";
import type { ArticleRepository } from "@/core/articles/article-repository";
import type { TopicRequestRepository } from "@/core/topic-requests/topic-request-repository";
import { createDemoArticles } from "@/infrastructure/demo/demo-articles";
import { createDemoTopicRequests } from "@/infrastructure/demo/demo-topic-requests";
import { InMemoryArticleRepository } from "@/infrastructure/demo/in-memory-article-repository";
import { InMemoryTopicRequestRepository } from "@/infrastructure/demo/in-memory-topic-request-repository";
import { FirestoreArticleRepository } from "@/infrastructure/firebase/firestore-article-repository";
import { FirestoreTopicRequestRepository } from "@/infrastructure/firebase/firestore-topic-request-repository";

/**
 * Composition root for persistence: the only place that knows which concrete
 * repositories exist. Everything else depends on the `core` interfaces.
 */
export const isDemoMode = !env.isFirebaseConfigured;

let articleRepository: ArticleRepository | undefined;
let topicRequestRepository: TopicRequestRepository | undefined;

export function getArticleRepository(): ArticleRepository {
  articleRepository ??= isDemoMode
    ? new InMemoryArticleRepository(createDemoArticles())
    : new FirestoreArticleRepository();
  return articleRepository;
}

export function getTopicRequestRepository(): TopicRequestRepository {
  topicRequestRepository ??= isDemoMode
    ? new InMemoryTopicRequestRepository(createDemoTopicRequests())
    : new FirestoreTopicRequestRepository();
  return topicRequestRepository;
}
