import { ArticleEditor } from "@/components/admin/editor/article-editor";

/** Rendered only after client-side sign-in, so there is no server UI to validate. */
export const instant = false;

export default function NewArticlePage() {
  return <ArticleEditor />;
}
