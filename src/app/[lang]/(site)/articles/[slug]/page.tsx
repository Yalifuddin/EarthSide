import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleCover, ArticleHeader } from "@/components/articles/article-header";
import { ReadingProgress } from "@/components/articles/reading-progress";
import { ShareButton } from "@/components/articles/share-button";
import { TableOfContents } from "@/components/articles/table-of-contents";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { hasTableOfContents } from "@/core/rich-text/rich-text";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { renderRichText } from "@/lib/rich-text/render-rich-text";
import { routes } from "@/lib/routes";
import { getArticleBySlug, getRelatedArticles } from "@/server/article-queries";

type Props = PageProps<"/[lang]/articles/[slug]">;

const RELATED_COUNT = 3;

/** The root layout already 404s unknown locales; this just narrows the type. */
function toLocale(lang: string): Locale {
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const article = await getArticleBySlug(slug, toLocale(lang));
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.authorName],
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    },
  };
}

export default function ArticlePage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleView params={params} />
    </Suspense>
  );
}

async function ArticleView({ params }: Pick<Props, "params">) {
  const { slug, lang } = await params;
  const article = await getArticleBySlug(slug, toLocale(lang));
  if (!article) notFound();

  const [{ locale, dict }, related] = await Promise.all([
    getDictionary(),
    getRelatedArticles(article.id, article.category, RELATED_COUNT, toLocale(lang)),
  ]);
  const body = renderRichText(article.content);

  return (
    <>
      <ReadingProgress />
      <article className="pt-32 pb-20">
        <Container className="max-w-3xl">
          <Reveal offset={12}>
            <Link
              href={routes.home(locale)}
              className="inline-flex items-center gap-2 text-sm font-bold text-leaf hover:text-forest"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {dict.articles.backToHome}
            </Link>
          </Reveal>

          <Reveal delay={0.05} className="mt-6">
            <ArticleHeader
              article={article}
              locale={locale}
              dict={dict}
              actions={<ShareButton title={article.title} />}
            />
          </Reveal>
        </Container>

        <Container className="mt-10 max-w-5xl">
          <Reveal delay={0.1}>
            <ArticleCover
              src={article.coverImageUrl}
              alt={article.coverImageAlt || article.title}
              priority
            />
          </Reveal>
        </Container>

        <Container
          className={cn(
            "mt-12 max-w-5xl",
            hasTableOfContents(body.headings) &&
              "lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-12",
          )}
        >
          <aside className="mb-8 lg:order-2 lg:mb-0">
            <TableOfContents headings={body.headings} />
          </aside>
          <div
            lang={article.language}
            className="article-prose mx-auto max-w-3xl lg:order-1"
            // Rendered from a sanitized document by our own renderer, see renderRichText.
            dangerouslySetInnerHTML={{ __html: body.html }}
          />
        </Container>
      </article>

      {related.length > 0 && (
        <section className="bg-cream bg-grain py-20" aria-labelledby="more-stories">
          <Container>
            <h2
              id="more-stories"
              className="text-center font-display text-3xl text-forest sm:text-4xl"
            >
              {dict.articles.moreStories}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.08}>
                  <ArticleCard article={item} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div className="animate-pulse pt-32 pb-20" aria-hidden>
      <Container className="max-w-3xl space-y-5">
        <div className="h-4 w-32 rounded-full bg-forest/10" />
        <div className="h-6 w-24 rounded-full bg-moss/20" />
        <div className="h-12 w-full rounded-2xl bg-forest/10" />
        <div className="h-12 w-2/3 rounded-2xl bg-forest/10" />
      </Container>
      <Container className="mt-10 max-w-5xl">
        <div className="aspect-[16/9] rounded-t-[16rem] rounded-b-[2.5rem] bg-moss/15" />
      </Container>
    </div>
  );
}
