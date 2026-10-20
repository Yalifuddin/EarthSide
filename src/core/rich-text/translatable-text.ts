import type { RichTextMark, RichTextNode } from "./rich-text";

/*
 * Turns a rich-text document into a list of text "segments" a translation
 * service can handle, and puts the translated segments back without losing
 * formatting. Each block (paragraph, heading, list item text…) becomes one
 * segment, with inline formatting encoded as simple XML tags:
 *
 *   "Mangrove <b>melindungi</b> pantai, <a i="0">baca ini</a>."
 *
 * Translators that understand XML (DeepL with tag_handling=xml) translate the
 * sentence as a whole and keep the tags around the right words.
 */

const MARK_TAGS: Record<string, string> = { bold: "b", italic: "i", underline: "u", strike: "s" };
const TAG_MARKS: Record<string, string> = Object.fromEntries(
  Object.entries(MARK_TAGS).map(([mark, tag]) => [tag, mark]),
);

export function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function unescapeXml(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function isInlineBlock(node: RichTextNode): boolean {
  return Boolean(
    node.content?.length &&
    node.content.every((child) => child.type === "text" || child.type === "hardBreak"),
  );
}

/** Encodes one block's inline content; link attributes are kept aside and referenced by index. */
function encodeInline(nodes: RichTextNode[], links: RichTextMark[]): string {
  return nodes
    .map((node) => {
      if (node.type === "hardBreak") return "<br/>";
      let text = escapeXml(node.text ?? "");
      for (const mark of node.marks ?? []) {
        if (mark.type === "link") {
          links.push(mark);
          text = `<a i="${links.length - 1}">${text}</a>`;
        } else if (MARK_TAGS[mark.type]) {
          text = `<${MARK_TAGS[mark.type]}>${text}</${MARK_TAGS[mark.type]}>`;
        }
      }
      return text;
    })
    .join("");
}

const TOKEN = /<(\/?)(b|i|u|s|a|br)(?:\s+i="(\d+)")?\s*(\/?)>|([^<]+)/g;

/** Decodes a translated segment back into text nodes; unknown markup is dropped as plain text. */
function decodeInline(segment: string, links: RichTextMark[]): RichTextNode[] {
  const nodes: RichTextNode[] = [];
  const open: RichTextMark[] = [];

  for (const match of segment.matchAll(TOKEN)) {
    const [, closing, tag, linkIndex, selfClosing, text] = match;
    if (text !== undefined) {
      const value = unescapeXml(text);
      if (value)
        nodes.push({ type: "text", text: value, ...(open.length && { marks: [...open] }) });
      continue;
    }
    if (tag === "br" || selfClosing) {
      nodes.push({ type: "hardBreak" });
      continue;
    }
    const mark: RichTextMark | undefined =
      tag === "a" ? links[Number(linkIndex)] : { type: TAG_MARKS[tag] };
    if (closing) {
      const index = open.findLastIndex(
        (item) => item.type === (tag === "a" ? "link" : TAG_MARKS[tag]),
      );
      if (index >= 0) open.splice(index, 1);
    } else if (mark) {
      open.push(mark);
    }
  }
  return nodes;
}

export interface TranslatableDocument {
  segments: string[];
  /** Rebuilds the document from translated segments (same order and count). */
  rebuild(translated: string[]): RichTextNode;
}

export function toTranslatableDocument(document: RichTextNode): TranslatableDocument {
  const segments: string[] = [];
  const linkSets: RichTextMark[][] = [];

  const collect = (node: RichTextNode): void => {
    if (isInlineBlock(node)) {
      const links: RichTextMark[] = [];
      segments.push(encodeInline(node.content!, links));
      linkSets.push(links);
      return;
    }
    node.content?.forEach(collect);
  };
  collect(document);

  return {
    segments,
    rebuild(translated) {
      let index = 0;
      const replace = (node: RichTextNode): RichTextNode => {
        if (isInlineBlock(node)) {
          const current = index++;
          return { ...node, content: decodeInline(translated[current] ?? "", linkSets[current]) };
        }
        return node.content ? { ...node, content: node.content.map(replace) } : node;
      };
      return replace(document);
    },
  };
}
