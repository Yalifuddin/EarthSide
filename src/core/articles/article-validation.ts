import { z } from "zod";
import { extractPlainText, type RichTextNode } from "@/core/rich-text/rich-text";
import { toFieldErrors, type ValidationResult } from "@/core/shared/validation";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_LANGUAGES,
  ARTICLE_STATUSES,
  type ArticleInput,
} from "./article";

export const ARTICLE_LIMITS = {
  title: { min: 5, max: 160 },
  coverImageAlt: { max: 200 },
} as const;

/** Absolute http(s)/blob URLs, or paths served by this site (e.g. `/demo/x.svg`). */
function isImageUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["https:", "http:", "blob:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const richTextSchema = z.custom<RichTextNode>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    (value as RichTextNode).type === "doc" &&
    extractPlainText(value as RichTextNode).length > 0,
  { error: "content_empty" },
);

const articleInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(ARTICLE_LIMITS.title.min, { error: "title_too_short" })
    .max(ARTICLE_LIMITS.title.max, { error: "title_too_long" }),
  category: z.enum(ARTICLE_CATEGORIES, { error: "category_invalid" }),
  language: z.enum(ARTICLE_LANGUAGES, { error: "language_invalid" }),
  status: z.enum(ARTICLE_STATUSES, { error: "status_invalid" }),
  content: richTextSchema,
  coverImageUrl: z.string().refine(isImageUrl, { error: "cover_url_invalid" }).nullable(),
  coverImageAlt: z
    .string()
    .trim()
    .max(ARTICLE_LIMITS.coverImageAlt.max, { error: "cover_alt_too_long" }),
});

export function validateArticleInput(input: ArticleInput): ValidationResult<ArticleInput> {
  const result = articleInputSchema.safeParse(input);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, errors: toFieldErrors(result.error) };
}
