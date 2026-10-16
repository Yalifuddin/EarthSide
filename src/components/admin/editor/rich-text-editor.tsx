"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useState } from "react";
import { useAdminServices } from "@/components/admin/shell/admin-auth-provider";
import type { RichTextNode } from "@/core/rich-text/rich-text";
import { useI18n } from "@/i18n/i18n-provider";
import { richTextExtensions } from "@/lib/rich-text/extensions";
import { EditorToolbar } from "./editor-toolbar";
import { describeUploadError } from "./image-errors";

interface RichTextEditorProps {
  initialContent: RichTextNode;
  onReady: (editor: Editor) => void;
  onChange: () => void;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * WYSIWYG editor for article bodies. It is uncontrolled: the parent reads
 * the document (see `readDocument`) when saving instead of mirroring every keystroke.
 */
export function RichTextEditor({
  initialContent,
  onReady,
  onChange,
  invalid,
  describedBy,
}: RichTextEditorProps) {
  const { dict } = useI18n();
  const { images } = useAdminServices();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      ...richTextExtensions,
      Placeholder.configure({ placeholder: dict.admin.editor.contentPlaceholder }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "article-prose px-5 py-6 sm:px-8",
        "aria-label": dict.admin.editor.contentLabel,
        ...(invalid ? { "aria-invalid": "true" } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
    },
    onCreate: ({ editor: created }) => onReady(created),
    onUpdate: onChange,
  });

  async function insertImage(file: File) {
    if (!editor) return;
    setUploading(true);
    setUploadError(null);
    try {
      const src = await images.upload(file, "articles");
      editor
        .chain()
        .focus()
        .setImage({ src, alt: file.name.replace(/\.[^.]+$/, "") })
        .run();
    } catch (error) {
      setUploadError(describeUploadError(error, dict));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={`rounded-3xl border-2 bg-white/80 transition focus-within:border-moss ${invalid ? "border-rose-deep" : "border-forest/10"}`}
    >
      {editor && (
        <div className="p-2">
          <EditorToolbar editor={editor} onInsertImage={insertImage} uploadingImage={uploading} />
        </div>
      )}
      {uploadError && (
        <p
          role="alert"
          className="mx-4 rounded-xl bg-rose-soft px-3 py-2 text-sm font-semibold text-rose-deep"
        >
          {uploadError}
        </p>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
