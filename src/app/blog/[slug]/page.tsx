import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "../articlesData";
import EmailCaptureBand from "../../EmailCaptureBand";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Article" };
  return {
    title: a.metaTitle,
    description: a.metaDescription,
    openGraph: {
      title: a.metaTitle,
      description: a.metaDescription,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  return (
    <>
      {/* ── ARTICLE ─────────────────────────────────────────── */}
      <article className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link href="/blog" className="pill-link mb-6 inline-block">
            ← All articles
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span className="px-3 py-1 rounded-full bg-[#FAF3EE] text-[#D05D11] text-[12px] font-semibold tracking-wide uppercase">
              {a.category}
            </span>
            <span className="text-[13px] text-[#9A9080]">
              {a.readingMinutes} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.12] text-[#14110D]">
            {a.title}
          </h1>
          <span className="rule my-7" aria-hidden="true" />

          {/* body */}
          <div>
            {a.body.map((b, i) =>
              b.type === "h2" ? (
                <h2
                  key={i}
                  className="text-2xl sm:text-[1.6rem] text-[#232F3F] leading-snug mt-9 mb-4"
                >
                  {b.text}
                </h2>
              ) : (
                <p
                  key={i}
                  className="prose-body text-[17px] leading-[1.85] mb-6"
                  dangerouslySetInnerHTML={{ __html: b.html }}
                />
              ),
            )}
          </div>

          {/* closing CTA */}
          <div className="rounded-2xl border border-[#ECECEC] bg-[#FBF5F2] p-8 sm:p-10 mt-9">
            <p
              className="prose-body text-[16px] leading-[1.8] mb-6"
              dangerouslySetInnerHTML={{ __html: a.cta }}
            />
            <div className="flex flex-wrap gap-3">
              <Link href="/book" className="btn btn-crimson">
                Explore the Book
              </Link>
              <Link href="/start" className="btn btn-outline">
                Get the Free Starter Plan
              </Link>
            </div>
          </div>
        </div>
      </article>

      <EmailCaptureBand />
    </>
  );
}
