import { describe, expect, it } from "vitest";
import type { RichTextNode } from "./rich-text";
import { toTranslatableDocument } from "./translatable-text";

const link = { type: "link", attrs: { href: "https://example.org", target: "_blank" } };

const document: RichTextNode = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2, id: null }, content: [{ type: "text", text: "Judul" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Mangrove " },
        { type: "text", text: "melindungi", marks: [{ type: "bold" }] },
        { type: "text", text: " pantai & " },
        { type: "text", text: "baca ini", marks: [link] },
        { type: "hardBreak" },
        { type: "text", text: "<baris dua>" },
      ],
    },
    { type: "image", attrs: { src: "https://res.cloudinary.com/x.jpg" } },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Satu" }] }],
        },
      ],
    },
  ],
};

describe("toTranslatableDocument", () => {
  it("turns each text block into one segment with formatting as tags", () => {
    expect(toTranslatableDocument(document).segments).toEqual([
      "Judul",
      'Mangrove <b>melindungi</b> pantai &amp; <a i="0">baca ini</a><br/>&lt;baris dua&gt;',
      "Satu",
    ]);
  });

  it("rebuilds the same document from untouched segments", () => {
    const translatable = toTranslatableDocument(document);
    expect(translatable.rebuild(translatable.segments)).toEqual(document);
  });

  it("keeps marks, links, images and structure after translation", () => {
    const translatable = toTranslatableDocument(document);
    const rebuilt = translatable.rebuild([
      "Title",
      'Mangroves <b>protect</b> coasts &amp; <a i="0">read this</a><br/>&lt;line two&gt;',
      "One",
    ]);
    const paragraph = rebuilt.content![1];
    expect(paragraph.content).toEqual([
      { type: "text", text: "Mangroves " },
      { type: "text", text: "protect", marks: [{ type: "bold" }] },
      { type: "text", text: " coasts & " },
      { type: "text", text: "read this", marks: [link] },
      { type: "hardBreak" },
      { type: "text", text: "<line two>" },
    ]);
    expect(rebuilt.content![2]).toEqual(document.content![2]);
    expect(rebuilt.content![3].content![0].content![0].content![0].text).toBe("One");
  });
});
