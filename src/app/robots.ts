import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { LOCALES } from "@/i18n/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard is for Della only and has nothing for search engines.
      disallow: LOCALES.map((locale) => `/${locale}/admin`),
    },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
  };
}
