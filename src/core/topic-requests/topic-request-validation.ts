import { z } from "zod";
import { toFieldErrors, type ValidationResult } from "@/core/shared/validation";
import type { TopicRequestInput } from "./topic-request";

export const TOPIC_REQUEST_LIMITS = {
  email: { max: 254 },
  topic: { min: 3, max: 120 },
  description: { min: 10, max: 1000 },
} as const;

const topicRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(
      z
        .email({ error: "email_invalid" })
        .max(TOPIC_REQUEST_LIMITS.email.max, { error: "email_invalid" }),
    ),
  topic: z
    .string()
    .trim()
    .min(TOPIC_REQUEST_LIMITS.topic.min, { error: "topic_too_short" })
    .max(TOPIC_REQUEST_LIMITS.topic.max, { error: "topic_too_long" }),
  description: z
    .string()
    .trim()
    .min(TOPIC_REQUEST_LIMITS.description.min, { error: "description_too_short" })
    .max(TOPIC_REQUEST_LIMITS.description.max, { error: "description_too_long" }),
});

export function validateTopicRequest(
  input: TopicRequestInput,
): ValidationResult<TopicRequestInput> {
  const result = topicRequestSchema.safeParse(input);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, errors: toFieldErrors(result.error) };
}
