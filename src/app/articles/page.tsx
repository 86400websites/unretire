import ArticlesList from "./ArticlesList";

export default function UnRetireArticlesPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow mb-6">Articles &amp; Essays</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
              Ideas for the Next Chapter
            </h1>
            <span className="rule mt-7 mb-7" aria-hidden="true" />
            <p className="lede max-w-[58ch]">
              Essays on mindset, identity, purpose, and the practices that turn
              retirement from a finish line into a beginning.
            </p>
          </div>
        </div>
      </section>

      {/* ── FILTER + GRID (client island) ────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <ArticlesList />
        </div>
      </section>
    </>
  );
}
