import type { ZodError } from "zod";

/**
 * Validation failures are expressed as stable codes (not human text) so the
 * domain stays language-agnostic; the UI maps each code to a translated message.
 */
export type ValidationCode =
  | "email_invalid"
  | "topic_too_short"
  | "topic_too_long"
  | "description_too_short"
  | "description_too_long"
  | "title_too_short"
  | "title_too_long"
  | "content_empty"
  | "cover_url_invalid"
  | "cover_alt_too_long"
  | "category_invalid"
  | "status_invalid"
  | "language_invalid"
  | "unknown";

export type FieldErrors<T> = Partial<Record<keyof T, ValidationCode>>;

export type ValidationResult<T> =
  { success: true; data: T } | { success: false; errors: FieldErrors<T> };

export class ValidationError<T = unknown> extends Error {
  constructor(public readonly errors: FieldErrors<T>) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

const KNOWN_CODES = new Set<string>([
  "email_invalid",
  "topic_too_short",
  "topic_too_long",
  "description_too_short",
  "description_too_long",
  "title_too_short",
  "title_too_long",
  "content_empty",
  "cover_url_invalid",
  "cover_alt_too_long",
  "category_invalid",
  "status_invalid",
  "language_invalid",
]);

/** Converts a Zod error into `{ field: code }`, keeping the first issue per field. */
export function toFieldErrors<T>(error: ZodError<T>): FieldErrors<T> {
  const errors: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof T | undefined;
    if (field === undefined || errors[field]) continue;
    errors[field] = KNOWN_CODES.has(issue.message) ? (issue.message as ValidationCode) : "unknown";
  }
  return errors;
}
