import Link from "next/link";
import { notFound } from "next/navigation";
import { modules, getModule, COURSE_UNLOCKED } from "../courseData";

export function generateStaticParams() {
  return modules.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const m = getModule(module);
  if (!m) return { title: "Course Module" };
  return {
    title: `Module ${m.num}: ${m.title} — The (Un)Retire Course`,
    description: m.summary,
  };
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const m = getModule(module);
  if (!m) notFound();

  const idx = modules.findIndex((x) => x.slug === m.slug);
  const prev = modules[idx - 1];
  const next = modules[idx + 1];

  return (
    <>
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link href="/unretire/learn/course" className="pill-link mb-6 inline-block">
            ← All modules
          </Link>
          <p className="eyebrow mb-3">Module {m.num} of {modules.length}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-5">{m.title}</h1>
          <p className="lede max-w-[58ch]">{m.summary}</p>
        </div>
      </section>

      {/* ── LESSONS ──────────────────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="eyebrow mb-6">{m.lessons.length} lessons in this module</p>

          <div className="space-y-5">
            {m.lessons.map((l, i) => (
              <div key={l.id} className="card p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-2">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FAF3EE] text-[#D05D11] text-[13px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h2 className="text-[1.15rem] text-[#232F3F] leading-snug">{l.title}</h2>
                </div>

                {COURSE_UNLOCKED && l.youtubeId ? (
                  <>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black mt-5 mb-5">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${l.youtubeId}`}
                        title={l.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {l.pdfUrl && (
                      <a href={l.pdfUrl} target="_blank" rel="noopener noreferrer" className="pill-link">
                        Download the companion guide (PDF) →
                      </a>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-[14px] text-[#9A9080] mt-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    Video + companion guide — unlocks with enrollment
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* prev / next */}
          <div className="flex items-center justify-between gap-3 mt-8">
            {prev ? (
              <Link href={`/unretire/learn/course/${prev.slug}`} className="btn btn-outline">
                ← Module {prev.num}
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/unretire/learn/course/${next.slug}`} className="btn btn-crimson">
                Module {next.num} →
              </Link>
            ) : (
              <Link href="/unretire/learn/course" className="btn btn-crimson">
                Back to overview →
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
