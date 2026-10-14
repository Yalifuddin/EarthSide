import { notFound } from "next/navigation";

/** It only ever renders the not-found UI, so there is no navigation UI to validate. */
export const instant = false;

/**
 * Proxy rewrites unknown article slugs here. Because this page calls
 * `notFound()` before anything streams, it is served with a real 404 status
 * (an unknown slug on the dynamic route can only stream a 200 + noindex).
 */
export default function MissingArticlePage() {
  notFound();
}
