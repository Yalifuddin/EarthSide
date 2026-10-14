const MAX_SLUG_LENGTH = 70;
const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, "");
}

function randomSuffix(length: number): string {
  let suffix = "";
  for (let i = 0; i < length; i++) {
    suffix += SUFFIX_ALPHABET[Math.floor(Math.random() * SUFFIX_ALPHABET.length)];
  }
  return suffix;
}

/** A readable slug with a short random suffix, so two articles never collide. */
export function createUniqueSlug(title: string): string {
  const base = slugify(title) || "article";
  return `${base}-${randomSuffix(5)}`;
}
