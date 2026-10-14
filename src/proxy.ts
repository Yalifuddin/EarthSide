import { NextResponse, type NextRequest } from "next/server";
import { publishedSlugs } from "@/composition/published-slugs";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES, type Locale } from "@/i18n/config";

/** Static route that answers with a real 404 (see its page for why). */
const MISSING_ARTICLE_SEGMENT = "missing-article";
const ARTICLE_PATH = new RegExp(`^/(${LOCALES.join("|")})/articles/([^/]+)/?$`);

/** Picks a locale: remembered choice → browser preference → default. */
function resolveLocale(request: NextRequest): Locale {
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(remembered)) return remembered;

  const preferred = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  return preferred.find(isLocale) ?? DEFAULT_LOCALE;
}

/** `/articles` → `/id/articles` */
function redirectToLocalized(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = `/${resolveLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

/**
 * Unknown article slugs are rewritten to a static 404 page *before* rendering
 * starts — once a page streams, its status is fixed at 200.
 */
async function guardArticle(request: NextRequest, locale: string, slug: string) {
  if (slug === MISSING_ARTICLE_SEGMENT || (await publishedSlugs.has(slug))) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/articles/${MISSING_ARTICLE_SEGMENT}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (!hasLocale) return redirectToLocalized(request);

  const article = ARTICLE_PATH.exec(pathname);
  if (article) return guardArticle(request, article[1], decodeURIComponent(article[2]));
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (images, icons…).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
