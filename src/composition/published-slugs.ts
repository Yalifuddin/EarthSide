import { ArticleQueryService } from "@/core/articles/article-query-service";
import { PublishedSlugRegistry } from "@/server/published-slug-registry";
import { getArticleRepository } from "./repositories";

/**
 * Wiring for Proxy's slug check. Deliberately avoids `server-only` modules,
 * which can't be bundled into Proxy.
 */
const articles = new ArticleQueryService(getArticleRepository());

export const publishedSlugs = new PublishedSlugRegistry(async () =>
  (await articles.getIndex()).map((article) => article.slug),
);
