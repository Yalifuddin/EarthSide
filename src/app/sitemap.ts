import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { LOCALES, type Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { getPublishedIndex } from "@/server/article-queries";

function absolute(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

/** One entry per page, with its other-language twin listed as an alternate. */
function localized(
  path: (locale: Locale) => string,
  extra: Partial<MetadataRoute.Sitemap[number]>,
) {
  return LOCALES.map((locale) => ({
    url: absolute(path(locale)),
    alternates: {
      languages: Object.fromEntries(LOCALES.map((other) => [other, absolute(path(other))])),
    },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedIndex();
  const newest = articles[0]?.updatedAt;

  return [
    ...localized(routes.home, { changeFrequency: "daily", priority: 1, lastModified: newest }),
    ...localized(routes.articles, {
      changeFrequency: "daily",
      priority: 0.8,
      lastModified: newest,
    }),
    ...articles.flatMap((article) =>
      localized((locale) => routes.article(locale, article.slug), {
        lastModified: article.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
  ];
}
