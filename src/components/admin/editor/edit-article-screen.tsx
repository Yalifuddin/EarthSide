"use client";

import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { useAsyncData } from "@/hooks/use-async-data";
import { useI18n } from "@/i18n/i18n-provider";
import { routes } from "@/lib/routes";
import { useAdminServices } from "../admin-auth-provider";
import { PanelEmpty, PanelError, PanelLoading } from "../panel-state";
import { ArticleEditor } from "./article-editor";

/** Reads `?id=` and opens that article (drafts included) in the editor. */
export function EditArticleScreen() {
  const id = useSearchParams().get("id") ?? "";
  return <ArticleLoader key={id} id={id} />;
}

function ArticleLoader({ id }: { id: string }) {
  const { locale, dict } = useI18n();
  const { articles } = useAdminServices();
  const article = useAsyncData(() => (id ? articles.getById(id) : Promise.resolve(null)));

  if (article.status === "loading") return <PanelLoading />;
  if (article.status === "error") return <PanelError onRetry={article.reload} />;
  if (!article.data) {
    return (
      <div className="flex flex-col items-center pb-16">
        <PanelEmpty message={dict.admin.editor.notFound} />
        <ButtonLink href={routes.admin(locale)} variant="outline">
          {dict.admin.editor.back}
        </ButtonLink>
      </div>
    );
  }
  return <ArticleEditor article={article.data} />;
}
