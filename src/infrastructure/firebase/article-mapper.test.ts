import { Timestamp } from "firebase/firestore/lite";
import { describe, expect, it } from "vitest";
import type { ArticleRecord, TranslatedArticle } from "@/core/articles/article";
import { articleFromData, toArticleFields } from "./article-mapper";

const deepContent = {
  type: "doc",
  content: [
    {
      type: "blockquote",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Dalam sekali" }] }],
            },
          ],
        },
      ],
    },
  ],
};

const translated: TranslatedArticle = {
  title: "Deep",
  excerpt: "Very deep",
  coverImageAlt: "",
  readingMinutes: 1,
  content: deepContent,
};

const record: ArticleRecord = {
  slug: "dalam-abc12",
  title: "Dalam",
  excerpt: "Dalam sekali",
  content: deepContent,
  coverImageUrl: null,
  coverImageAlt: "",
  category: "national",
  language: "id",
  status: "published",
  readingMinutes: 1,
  authorName: "Della",
  textFingerprint: "abc",
  translations: {
    en: {
      published: translated,
      draft: translated,
      needsReview: false,
      sourceFingerprint: "abc",
      updatedAt: new Date("2026-10-20T00:00:00Z"),
    },
  },
  publishedAt: new Date("2026-10-20T00:00:00Z"),
};

describe("article mapper", () => {
  it("stores translated bodies as JSON strings and reads them back", () => {
    const fields = toArticleFields(record);
    expect(typeof fields.translations.en?.draft.content).toBe("string");

    const article = articleFromData("id1", {
      ...fields,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    expect(article.translations.en?.published?.content).toEqual(deepContent);
    expect(article.translations.en?.updatedAt).toEqual(record.translations.en?.updatedAt);
  });

  it("reads documents saved before translations existed", () => {
    const article = articleFromData("old", {
      title: "Lama",
      content: deepContent,
      status: "published",
    });
    expect(article.translations).toEqual({});
    expect(article.language).toBe("id");
    expect(article.textFingerprint).not.toBe("");
  });
});
