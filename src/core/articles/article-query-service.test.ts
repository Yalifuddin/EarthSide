import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/infrastructure/demo/in-memory-article-repository";
import type { Article, ArticleCategory } from "./article";
import { ArticleQueryService } from "./article-query-service";

let counter = 0;
function article(title: string, category: ArticleCategory, daysAgo: number): Article {
  counter += 1;
  const date = new Date(Date.UTC(2026, 9, 15 - daysAgo));
  return {
    id: `a${counter}`,
    slug: `slug-${counter}`,
    title,
    excerpt: `Ringkasan tentang ${title.toLowerCase()}`,
    content: { type: "doc", content: [] },
    coverImageUrl: null,
    coverImageAlt: "",
    category,
    language: "id",
    status: "published",
    readingMinutes: 1,
    authorName: "Della",
    createdAt: date,
    updatedAt: date,
    publishedAt: date,
  };
}

describe("ArticleQueryService", () => {
  const current = article("Mangrove di pesisir", "national", 0);
  const sameCategory = article("Sungai Citarum", "national", 5);
  const newerOther = article("Es di kutub mencair", "international", 1);
  const service = new ArticleQueryService(
    new InMemoryArticleRepository([current, sameCategory, newerOther]),
  );

  it("suggests same-category stories first, then tops up with others", async () => {
    const related = await service.getRelated(current, 2);
    expect(related.map((a) => a.id)).toEqual([sameCategory.id, newerOther.id]);
  });

  it("searches titles and excerpts, ignoring case and accents", async () => {
    expect((await service.search("KUTUB")).map((a) => a.id)).toEqual([newerOther.id]);
    expect((await service.search("citarúm")).map((a) => a.id)).toEqual([sameCategory.id]);
  });

  it("ignores queries that are too short", async () => {
    expect(await service.search("a")).toEqual([]);
  });
});
