/**
 * Static, non-secret facts about the site.
 * Change copy-independent values here (contact info, author, URLs).
 */
export const siteConfig = {
  name: "EarthSide",
  author: "Della",
  contactEmail: "earthside.contact@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
