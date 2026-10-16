import { describe, expect, it } from "vitest";
import { ValidationError } from "@/core/shared/validation";
import { InMemoryArticleRepository } from "@/infrastructure/demo/in-memory-article-repository";
import type { ArticleInput } from "./article";
import { ArticleAdminService } from "./article-admin-service";

const FIXED_NOW = new Date("2026-10-13T08:00:00Z");

function makeService() {
  const repository = new InMemoryArticleRepository();
  const service = new ArticleAdminService(repository, "Della", () => FIXED_NOW);
  return { repository, service };
}

const validInput: ArticleInput = {
  title: "Kenapa Hutan Penting?",
  category: "national",
  language: "id",
  status: "draft",
  coverImageUrl: null,
  coverImageAlt: "",
  content: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Hutan adalah rumah banyak makhluk." }],
      },
    ],
  },
};

describe("ArticleAdminService", () => {
  it("derives slug, excerpt, reading time and author on create", async () => {
    const { service } = makeService();
    const id = await service.create(validInput);
    const article = await service.getById(id);

    expect(article?.slug).toMatch(/^kenapa-hutan-penting-[a-z0-9]{5}$/);
    expect(article?.excerpt).toBe("Hutan adalah rumah banyak makhluk.");
    expect(article?.readingMinutes).toBe(1);
    expect(article?.authorName).toBe("Della");
    expect(article?.publishedAt).toBeNull();
  });

  it("stamps publishedAt on first publish and keeps it afterwards", async () => {
    const { service } = makeService();
    const id = await service.create({ ...validInput, status: "published" });
    expect((await service.getById(id))?.publishedAt).toEqual(FIXED_NOW);

    await service.setStatus(id, "draft");
    await service.setStatus(id, "published");
    expect((await service.getById(id))?.publishedAt).toEqual(FIXED_NOW);
  });

  it("keeps the slug stable when the title changes", async () => {
    const { service } = makeService();
    const id = await service.create(validInput);
    const before = (await service.getById(id))!.slug;

    await service.update(id, { ...validInput, title: "Judul yang benar-benar baru" });
    expect((await service.getById(id))!.slug).toBe(before);
  });

  it("rejects invalid input with field error codes", async () => {
    const { service } = makeService();
    const attempt = service.create({
      ...validInput,
      title: "Hi",
      content: { type: "doc", content: [] },
    });

    await expect(attempt).rejects.toBeInstanceOf(ValidationError);
    await attempt.catch((error: ValidationError<ArticleInput>) => {
      expect(error.errors).toEqual({ title: "title_too_short", content: "content_empty" });
    });
  });
});
