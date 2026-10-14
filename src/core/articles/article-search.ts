import type { ArticleSummary } from "./article";

export const SEARCH_LIMITS = {
  minQueryLength: 2,
  maxResults: 24,
} as const;

/** Lowercases and strips accents so "Polusí" matches "polusi". */
function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

const TITLE_WEIGHT = 3;
const EXCERPT_WEIGHT = 1;

/**
 * Simple in-memory search for a small archive: every word must appear in the
 * title or excerpt; title hits rank higher, then newer stories first.
 * (Firestore has no full-text search, and the archive is small.)
 */
export function searchArticles(
  articles: ArticleSummary[],
  query: string,
  maxResults: number = SEARCH_LIMITS.maxResults,
): ArticleSummary[] {
  const tokens = tokenize(query);
  if (tokens.join("").length < SEARCH_LIMITS.minQueryLength) return [];

  return articles
    .map((article) => {
      const title = normalize(article.title);
      const excerpt = normalize(article.excerpt);
      let score = 0;
      for (const token of tokens) {
        const inTitle = title.includes(token);
        const inExcerpt = excerpt.includes(token);
        if (!inTitle && !inExcerpt) return null;
        score += (inTitle ? TITLE_WEIGHT : 0) + (inExcerpt ? EXCERPT_WEIGHT : 0);
      }
      return { article, score };
    })
    .filter((hit): hit is { article: ArticleSummary; score: number } => hit !== null)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.article.publishedAt?.getTime() ?? 0) - (a.article.publishedAt?.getTime() ?? 0),
    )
    .slice(0, maxResults)
    .map((hit) => hit.article);
}
