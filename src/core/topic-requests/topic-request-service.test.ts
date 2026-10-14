import { describe, expect, it } from "vitest";
import { InMemoryTopicRequestRepository } from "@/infrastructure/demo/in-memory-topic-request-repository";
import { ValidationError } from "@/core/shared/validation";
import { TopicRequestSubmissionService } from "./topic-request-service";

describe("TopicRequestSubmissionService", () => {
  it("normalizes and stores a valid request as 'new'", async () => {
    const repository = new InMemoryTopicRequestRepository();
    const service = new TopicRequestSubmissionService(repository);

    await service.submit({
      email: "  Reader@Example.COM ",
      topic: "  Fast fashion ",
      description: "Dampak baju murah ke lingkungan.",
    });

    const [stored] = await repository.listAll();
    expect(stored).toMatchObject({
      email: "reader@example.com",
      topic: "Fast fashion",
      status: "new",
    });
  });

  it("rejects an invalid email and a too-short description", async () => {
    const service = new TopicRequestSubmissionService(new InMemoryTopicRequestRepository());
    const attempt = service.submit({ email: "bukan-email", topic: "Iklim", description: "pendek" });

    await expect(attempt).rejects.toBeInstanceOf(ValidationError);
    await attempt.catch((error: ValidationError) => {
      expect(error.errors).toEqual({
        email: "email_invalid",
        description: "description_too_short",
      });
    });
  });
});
