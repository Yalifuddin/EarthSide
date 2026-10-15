import type { Editor } from "@tiptap/react";
import type { RichTextNode } from "@/core/rich-text/rich-text";

/**
 * The editor's document as plain JSON. ProseMirror builds some objects (e.g.
 * heading `attrs`) with a `null` prototype, which React can't send to a server
 * action and some stores reject — a JSON round-trip turns them into plain data.
 */
export function readDocument(editor: Editor): RichTextNode {
  return JSON.parse(JSON.stringify(editor.getJSON())) as RichTextNode;
}
