import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";

/** Headings that can carry an `id`, so the table of contents can link to them. */
const AnchoredHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("id"),
        renderHTML: (attributes: { id?: string | null }) =>
          attributes.id ? { id: attributes.id } : {},
      },
    };
  },
}).configure({ levels: [2, 3] });

/**
 * The single source of truth for which formatting articles support.
 * Shared by the editor (writing) and the static renderer (reading), so what
 * Della sees while typing is exactly what readers get.
 */
export const richTextExtensions = [
  StarterKit.configure({
    heading: false,
    code: false,
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    },
  }),
  AnchoredHeading,
  Image.configure({ HTMLAttributes: { loading: "lazy" } }),
];
