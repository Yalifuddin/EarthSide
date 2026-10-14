import "server-only";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import {
  EMPTY_DOCUMENT,
  sanitizeRichText,
  withHeadingAnchors,
  type HeadingAnchor,
  type RichTextNode,
} from "@/core/rich-text/rich-text";
import { richTextExtensions } from "./extensions";

export interface RenderedArticleBody {
  html: string;
  headings: HeadingAnchor[];
}

/**
 * Turns a stored document into HTML on the server. Only nodes/marks known to
 * the shared extensions are emitted, unsafe URLs are stripped beforehand, and
 * headings get ids for the table of contents.
 */
export function renderRichText(document: RichTextNode): RenderedArticleBody {
  const { document: anchored, headings } = withHeadingAnchors(
    sanitizeRichText(document) ?? EMPTY_DOCUMENT,
  );
  return {
    html: renderToHTMLString({ content: anchored, extensions: richTextExtensions }),
    headings,
  };
}
