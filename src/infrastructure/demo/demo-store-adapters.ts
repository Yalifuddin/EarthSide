import type { ArticleWriter } from "@/core/articles/article-repository";
import type { TopicRequestInbox } from "@/core/topic-requests/topic-request-repository";
import {
  demoCountRequests,
  demoCreateArticle,
  demoDeleteArticle,
  demoDeleteRequest,
  demoFindArticle,
  demoListArticles,
  demoListRequests,
  demoUpdateArticle,
  demoUpdateRequestStatus,
} from "@/server/demo-store";

/**
 * Browser-side adapters that forward the dashboard's reads and writes to the
 * server's demo store (see `server/demo-store.ts`), so admin and public pages
 * share one source of truth even without Firebase.
 */
export class DemoStoreArticleWriter implements ArticleWriter {
  listAll = demoListArticles;
  findById = demoFindArticle;
  create = demoCreateArticle;
  update = demoUpdateArticle;
  delete = demoDeleteArticle;
}

export class DemoStoreTopicRequestInbox implements TopicRequestInbox {
  listAll = demoListRequests;
  countByStatus = demoCountRequests;
  updateStatus = demoUpdateRequestStatus;
  delete = demoDeleteRequest;
}
