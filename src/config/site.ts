/**
 * Static, non-secret facts about the site.
 * Change copy-independent values here (contact info, author, URLs).
 */
export const siteConfig = {
  name: "EarthSide",
  author: "Della",
  /**
   * The site's single public identity: shown as contact info, receives request
   * notifications and is the address replies to readers are sent from.
   * (Dashboard logins are a separate list: NEXT_PUBLIC_ADMIN_EMAILS.)
   */
  contactEmail: "earthside.contact@gmail.com",
  /** Default dashboard logins, used when NEXT_PUBLIC_ADMIN_EMAILS is not set. */
  defaultAdminEmails: ["earthside.contact@gmail.com", "yalif1710@gmail.com"],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
