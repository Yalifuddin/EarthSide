"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { IMAGE_UPLOAD_RULES } from "@/core/media/image-uploader";
import type { Dictionary } from "@/i18n/dictionaries/id";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";

interface ToolbarAction {
  key: keyof Dictionary["admin"]["editor"]["toolbar"];
  icon: LucideIcon;
  run: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
}

/** Declarative list of formatting buttons — add a feature by adding an entry. */
const FORMAT_GROUPS: ToolbarAction[][] = [
  [
    {
      key: "heading2",
      icon: Heading2,
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive("heading", { level: 2 }),
    },
    {
      key: "heading3",
      icon: Heading3,
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive("heading", { level: 3 }),
    },
  ],
  [
    {
      key: "bold",
      icon: Bold,
      run: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive("bold"),
    },
    {
      key: "italic",
      icon: Italic,
      run: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive("italic"),
    },
    {
      key: "underline",
      icon: Underline,
      run: (e) => e.chain().focus().toggleUnderline().run(),
      isActive: (e) => e.isActive("underline"),
    },
    {
      key: "strike",
      icon: Strikethrough,
      run: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive("strike"),
    },
  ],
  [
    {
      key: "bulletList",
      icon: List,
      run: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive("bulletList"),
    },
    {
      key: "orderedList",
      icon: ListOrdered,
      run: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive("orderedList"),
    },
    {
      key: "blockquote",
      icon: Quote,
      run: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive("blockquote"),
    },
    { key: "divider", icon: Minus, run: (e) => e.chain().focus().setHorizontalRule().run() },
  ],
];

const HISTORY_GROUP: ToolbarAction[] = [
  { key: "undo", icon: Undo2, run: (e) => e.chain().focus().undo().run() },
  { key: "redo", icon: Redo2, run: (e) => e.chain().focus().redo().run() },
];

interface EditorToolbarProps {
  editor: Editor;
  onInsertImage: (file: File) => void;
  uploadingImage: boolean;
}

export function EditorToolbar({ editor, onInsertImage, uploadingImage }: EditorToolbarProps) {
  const { dict } = useI18n();
  const labels = dict.admin.editor.toolbar;
  const fileInput = useRef<HTMLInputElement>(null);

  // Re-render only when the active formatting actually changes.
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      ...Object.fromEntries(
        FORMAT_GROUPS.flat()
          .filter((action) => action.isActive)
          .map((action) => [action.key, action.isActive!(e)]),
      ),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  }) as Record<string, boolean>;

  function toggleLink() {
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = window.prompt(dict.admin.editor.linkPrompt, "https://");
    if (href && href !== "https://") {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
  }

  return (
    <div
      role="toolbar"
      aria-label={dict.admin.editor.contentLabel}
      className="sticky top-16 z-20 flex flex-wrap items-center gap-1 rounded-2xl border border-forest/10 bg-cream/95 p-1.5 backdrop-blur"
    >
      {FORMAT_GROUPS.map((group, index) => (
        <Group key={index}>
          {group.map((action) => (
            <ToolButton
              key={action.key}
              label={labels[action.key]}
              icon={action.icon}
              active={active[action.key]}
              onClick={() => action.run(editor)}
            />
          ))}
        </Group>
      ))}
      <Group>
        <ToolButton label={labels.link} icon={Link2} active={active.link} onClick={toggleLink} />
        <ToolButton
          label={labels.image}
          icon={uploadingImage ? undefined : ImagePlus}
          onClick={() => fileInput.current?.click()}
          disabled={uploadingImage}
        >
          {uploadingImage && <Spinner />}
        </ToolButton>
        <input
          ref={fileInput}
          type="file"
          accept={IMAGE_UPLOAD_RULES.acceptedTypes.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onInsertImage(file);
            event.target.value = "";
          }}
        />
      </Group>
      <Group>
        {HISTORY_GROUP.map((action) => (
          <ToolButton
            key={action.key}
            label={labels[action.key]}
            icon={action.icon}
            disabled={action.key === "undo" ? !active.canUndo : !active.canRedo}
            onClick={() => action.run(editor)}
          />
        ))}
      </Group>
    </div>
  );
}

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 border-r border-forest/10 pr-1 last:border-0">
      {children}
    </div>
  );
}

interface ToolButtonProps {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
}

function ToolButton({ label, icon: Icon, active, disabled, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()} // keep the editor's selection
      onClick={onClick}
      className={cn(
        "grid size-9 place-items-center rounded-xl transition disabled:opacity-35",
        active ? "bg-forest text-cream" : "text-forest hover:bg-forest/10",
      )}
    >
      {Icon && <Icon className="size-4" aria-hidden />}
      {children}
    </button>
  );
}
