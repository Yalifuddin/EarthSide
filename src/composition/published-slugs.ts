import { ArticleQueryService } from "@/core/articles/article-query-service";
import {
  ALL_SLUGS_EXIST,
  PublishedSlugRegistry,
  type SlugChecker,
} from "@/server/published-slug-registry";
import { getArticleRepository, isDemoMode } from "./repositories";

/**
 * Wiring for Proxy's slug check. Deliberately avoids `server-only` modules,
 * which can't be bundled into Proxy.
 *
 * In demo mode Proxy runs with its own copy of the in-memory store and can't
 * see articles created in the dashboard, so it lets every slug through (the
 * page itself still shows the not-found screen for unknown ones).
 */
function createSlugChecker(): SlugChecker {
  if (isDemoMode) return ALL_SLUGS_EXIST;
  const articles = new ArticleQueryService(getArticleRepository());
  return new PublishedSlugRegistry(
    async () => (await articles.getIndex()).map((article) => article.slug),
    async (slug) => (await articles.getBySlug(slug)) !== null,
  );
}

export const publishedSlugs = createSlugChecker();
