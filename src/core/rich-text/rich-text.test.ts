import { describe, expect, it } from "vitest";
import {
  buildExcerpt,
  estimateReadingMinutes,
  extractPlainText,
  sanitizeRichText,
  withHeadingAnchors,
  type RichTextNode,
} from "./rich-text";

const doc: RichTextNode = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Judul" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Halo " },
        { type: "text", text: "Bumi", marks: [{ type: "bold" }] },
      ],
    },
  ],
};

describe("extractPlainText", () => {
  it("joins inline text and separates blocks with newlines", () => {
    expect(extractPlainText(doc)).toBe("Judul\nHalo Bumi");
  });

  it("returns an empty string for an empty document", () => {
    expect(extractPlainText({ type: "doc", content: [] })).toBe("");
  });
});

describe("buildExcerpt", () => {
  it("keeps short text intact", () => {
    expect(buildExcerpt("Pendek saja.", 50)).toBe("Pendek saja.");
  });

  it("cuts long text at a word boundary and adds an ellipsis", () => {
    const excerpt = buildExcerpt("satu dua tiga empat lima enam tujuh", 16);
    expect(excerpt).toBe("satu dua tiga…");
  });
});

describe("estimateReadingMinutes", () => {
  it("never returns less than one minute", () => {
    expect(estimateReadingMinutes("tiga kata saja")).toBe(1);
  });

  it("assumes about 200 words per minute", () => {
    expect(estimateReadingMinutes(Array(1000).fill("kata").join(" "))).toBe(5);
  });
});

describe("sanitizeRichText", () => {
  it("removes javascript: links but keeps the text", () => {
    const dirty: RichTextNode = {
      type: "text",
      text: "klik",
      marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }, { type: "bold" }],
    };
    expect(sanitizeRichText(dirty)).toEqual({
      type: "text",
      text: "klik",
      marks: [{ type: "bold" }],
    });
  });

  it("drops images with unsafe sources", () => {
    const dirty: RichTextNode = {
      type: "doc",
      content: [
        { type: "image", attrs: { src: "data:text/html,<script>" } },
        { type: "image", attrs: { src: "https://res.cloudinary.com/x.jpg" } },
      ],
    };
    expect(sanitizeRichText(dirty)?.content).toHaveLength(1);
  });
});

describe("withHeadingAnchors", () => {
  it("gives headings unique ids and lists them in order", () => {
    const heading = (text: string, level: number): RichTextNode => ({
      type: "heading",
      attrs: { level },
      content: [{ type: "text", text }],
    });
    const { document, headings } = withHeadingAnchors({
      type: "doc",
      content: [heading("Apa itu Mangrove?", 2), heading("Apa itu Mangrove?", 3)],
    });

    expect(headings).toEqual([
      { id: "apa-itu-mangrove", text: "Apa itu Mangrove?", level: 2 },
      { id: "apa-itu-mangrove-2", text: "Apa itu Mangrove?", level: 3 },
    ]);
    expect(document.content?.[1].attrs).toEqual({ level: 3, id: "apa-itu-mangrove-2" });
  });
});
