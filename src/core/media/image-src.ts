/** Inline raster images (made by the demo uploader). SVG is excluded: it can carry scripts. */
const INLINE_RASTER_IMAGE = /^data:image\/(png|jpeg|webp|gif);base64,/;

function isSitePath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

/**
 * The one rule for where article images may come from: http(s) URLs, files
 * served by this site (e.g. `/demo/x.svg`) or inline raster data URLs.
 */
export function isAllowedImageSrc(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (isSitePath(value) || INLINE_RASTER_IMAGE.test(value)) return true;
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
