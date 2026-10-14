import type { ArticleCategory } from "@/core/articles/article";
import type { Locale } from "@/i18n/config";

/** Central place for building URLs, so paths are never hand-typed in components. */
export const routes = {
  home: (locale: Locale) => `/${locale}`,
  section: (locale: Locale, id: SectionId) => `/${locale}#${id}`,
  articles: (locale: Locale, category?: ArticleCategory) =>
    `/${locale}/articles${category ? `?category=${category}` : ""}`,
  search: (locale: Locale) => `/${locale}/articles#${SEARCH_INPUT_ID}`,
  article: (locale: Locale, slug: string) => `/${locale}/articles/${slug}`,
  admin: (locale: Locale) => `/${locale}/admin`,
  newArticle: (locale: Locale) => `/${locale}/admin/articles/new`,
  editArticle: (locale: Locale, id: string) =>
    `/${locale}/admin/articles/edit?id=${encodeURIComponent(id)}`,
};

/** Anchor of the archive's search box, so the navbar can jump straight to it. */
export const SEARCH_INPUT_ID = "search";

export const SECTION_IDS = {
  home: "home",
  articles: "articles",
  request: "request",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];
