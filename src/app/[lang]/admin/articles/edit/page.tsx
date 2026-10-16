import { Suspense } from "react";
import { EditArticleScreen } from "@/components/admin/editor/edit-article-screen";
import { PanelLoading } from "@/components/admin/shared/panel-state";

/** Rendered only after client-side sign-in, so there is no server UI to validate. */
export const instant = false;

/** `/admin/articles/edit?id=…` — the id is read in the browser, after sign-in. */
export default function EditArticlePage() {
  return (
    <Suspense fallback={<PanelLoading />}>
      <EditArticleScreen />
    </Suspense>
  );
}
