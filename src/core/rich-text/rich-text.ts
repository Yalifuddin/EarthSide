import { isAllowedImageSrc } from "@/core/media/image-src";
import { slugify } from "@/core/shared/slug";

/**
 * Framework-agnostic representation of rich text (ProseMirror/Tiptap JSON shape).
 * The domain only needs to read text out of it, so it does not depend on Tiptap.
 */
export interface RichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
}

export const EMPTY_DOCUMENT: RichTextNode = { type: "doc", content: [] };

const BLOCK_SEPARATOR = "\n";
const WORDS_PER_MINUTE = 200;

/** Flattens a document into plain text, separating block nodes with newlines. */
export function extractPlainText(node: RichTextNode): string {
  if (node.type === "text") return node.text ?? "";
  if (!node.content?.length) return "";

  const isBlockContainer = node.content.some((child) => child.type !== "text");
  const parts = node.content.map(extractPlainText);
  return (isBlockContainer ? parts.join(BLOCK_SEPARATOR) : parts.join("")).trim();
}

function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function estimateReadingMinutes(text: string): number {
  return Math.max(1, Math.round(countWords(text) / WORDS_PER_MINUTE));
}

/**
 * Builds a short teaser from the opening sentences of a text, cut at a word
 * boundary so it never ends mid-word.
 */
export function buildExcerpt(text: string, maxLength = 220): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const slice = normalized.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : maxLength).replace(/[,.;:!?-]+$/, "")}…`;
}

const SAFE_LINK_PROTOCOLS = ["http:", "https:", "mailto:"];

function isSafeLink(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return SAFE_LINK_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/**
 * Defense in depth: drops links and images whose URLs use unsafe protocols
 * (e.g. `javascript:`) before a document is rendered as HTML.
 */
export function sanitizeRichText(node: RichTextNode): RichTextNode | null {
  if (node.type === "image" && !isAllowedImageSrc(node.attrs?.src)) {
    return null;
  }

  const marks = node.marks?.filter((mark) => mark.type !== "link" || isSafeLink(mark.attrs?.href));
  const content = node.content
    ?.map(sanitizeRichText)
    .filter((child): child is RichTextNode => child !== null);

  return { ...node, ...(marks && { marks }), ...(content && { content }) };
}

/** A table of contents is only worth showing once an article has a few sections. */
const MIN_HEADINGS_FOR_TOC = 2;

export function hasTableOfContents(headings: HeadingAnchor[]): boolean {
  return headings.length >= MIN_HEADINGS_FOR_TOC;
}

export interface HeadingAnchor {
  id: string;
  text: string;
  level: number;
}

/**
 * Gives every top-level heading a unique, readable `id` (for in-page links)
 * and returns them in order — the raw material for a table of contents.
 */
export function withHeadingAnchors(document: RichTextNode): {
  document: RichTextNode;
  headings: HeadingAnchor[];
} {
  const headings: HeadingAnchor[] = [];
  const used = new Map<string, number>();

  const content = document.content?.map((node) => {
    if (node.type !== "heading") return node;
    const text = extractPlainText(node);
    if (!text) return node;

    const base = slugify(text) || "bagian";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;

    headings.push({ id, text, level: Number(node.attrs?.level ?? 2) });
    return { ...node, attrs: { ...node.attrs, id } };
  });

  return { document: { ...document, ...(content && { content }) }, headings };
}
