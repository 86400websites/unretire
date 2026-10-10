import EmailCaptureBand from "../EmailCaptureBand";
import BlogIndex from "./BlogIndex";
import { articles, categories } from "./articlesData";

export const metadata = {
  title: "Blog",
  description:
    "Short, practical essays on retiring with purpose — identity, mindset, health, money, and the design of a fuller next chapter.",
};

export default function BlogPage() {
  const cards = articles.map(
    ({ slug, title, excerpt, category, readingMinutes }) => ({
      slug,
      title,
      excerpt,
      category,
      readingMinutes,
    }),
  );

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <p className="eyebrow mb-6">Blog</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            Short notes on living fully.
          </h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[58ch] mx-auto">
            Brief, practical essays you can read in five minutes and use the
            same day. One idea, one story, one small move — drawn from the
            framework and from life.
          </p>
        </div>
      </section>

      <BlogIndex cards={cards} categories={categories} />

      <EmailCaptureBand />
    </>
  );
}
