import { describe, expect, it } from "vitest";
import { ArticleTranslationService } from "@/core/translation/translator";
import { InMemoryArticleRepository } from "@/infrastructure/demo/in-memory-article-repository";
import { PseudoTranslator } from "@/infrastructure/demo/pseudo-translator";
import type { ArticleInput, TranslationInput } from "./article";
import { ArticleAdminService } from "./article-admin-service";
import { ArticleQueryService } from "./article-query-service";
import { localizeSummary, translationStateOf } from "./article-translation";

const paragraph = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

const original: ArticleInput = {
  title: "Hutan Hujan Kita",
  category: "international",
  language: "id",
  status: "published",
  coverImageUrl: null,
  coverImageAlt: "Pepohonan",
  content: paragraph("Hutan hujan adalah rumah banyak makhluk."),
};

const english: TranslationInput = {
  title: "Our Rainforests",
  coverImageAlt: "Trees",
  content: paragraph("Rainforests are home to many creatures."),
};

function setup() {
  const repository = new InMemoryArticleRepository();
  return {
    admin: new ArticleAdminService(repository, "Della"),
    reader: new ArticleQueryService(repository),
  };
}

describe("article translation workflow", () => {
  it("shows the original to English readers until the translation is reviewed", async () => {
    const { admin, reader } = setup();
    const id = await admin.create(original);
    await admin.saveTranslationDraft(id, english);

    expect(translationStateOf((await admin.listAll())[0])).toBe("needs_review");
    const [beforeReview] = await reader.getLatest(1, "en");
    expect(beforeReview).toMatchObject({ title: "Hutan Hujan Kita", language: "id" });

    await admin.approveTranslation(id, english);
    expect(translationStateOf((await admin.listAll())[0])).toBe("reviewed");
    const [afterReview] = await reader.getLatest(1, "en");
    expect(afterReview).toMatchObject({ title: "Our Rainforests", language: "en" });

    const article = await reader.getBySlug(afterReview.slug, "en");
    expect(article?.content).toEqual(english.content);
    // Indonesian readers still get the original.
    expect((await reader.getLatest(1, "id"))[0].title).toBe("Hutan Hujan Kita");
  });

  it("keeps the reviewed translation live while a re-translation awaits review", async () => {
    const { admin, reader } = setup();
    const id = await admin.create(original);
    await admin.approveTranslation(id, english);

    await admin.update(id, { ...original, content: paragraph("Isi yang sudah diperbarui.") });
    expect(translationStateOf((await admin.listAll())[0])).toBe("outdated");

    await admin.saveTranslationDraft(id, { ...english, title: "Our Rainforests (updated)" });
    expect(translationStateOf((await admin.listAll())[0])).toBe("needs_review");
    expect((await reader.getLatest(1, "en"))[0].title).toBe("Our Rainforests");
  });

  it("drops a translation into the article's own language when its language changes", async () => {
    const { admin } = setup();
    const id = await admin.create(original);
    await admin.approveTranslation(id, english);
    await admin.update(id, { ...original, language: "en" });
    expect((await admin.getById(id))?.translations.en).toBeUndefined();
  });

  it("localizes a summary only when a reviewed translation exists", async () => {
    const { admin } = setup();
    const id = await admin.create(original);
    const [summary] = await admin.listAll();
    expect(localizeSummary(summary, "en").title).toBe("Hutan Hujan Kita");
    await admin.approveTranslation(id, english);
    const [translated] = await admin.listAll();
    expect(localizeSummary(translated, "en").title).toBe("Our Rainforests");
  });
});

describe("ArticleTranslationService", () => {
  it("translates title, image text and body, keeping formatting", async () => {
    const service = new ArticleTranslationService(new PseudoTranslator());
    const result = await service.translate(original, "id", "en");
    expect(result.title).toBe("[EN] Hutan Hujan Kita");
    expect(result.coverImageAlt).toBe("[EN] Pepohonan");
    expect(result.content.content![0].content![0].text).toBe(
      "[EN] Hutan hujan adalah rumah banyak makhluk.",
    );
    expect(result.excerpt).toContain("[EN] Hutan hujan");
  });

  it("refuses to translate without a configured service", async () => {
    await expect(
      new ArticleTranslationService(null).translate(original, "id", "en"),
    ).rejects.toThrow();
  });
});
