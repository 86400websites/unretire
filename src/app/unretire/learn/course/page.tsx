import Link from "next/link";
import EmailCaptureBand from "../../EmailCaptureBand";
import { modules, totalLessons, COURSE_INTRO_YOUTUBE_ID } from "./courseData";
import { getAccess } from "@/lib/auth/entitlements";
import CheckoutButton from "@/app/unretire/premium/CheckoutButton";

export const metadata = {
  title: "The (Un)Retire Course",
  description:
    "The (Un)Retire online course — ten guided modules across the framework, each lesson with a video and a downloadable companion guide.",
};

export default async function CoursePage() {
  const { userId, products } = await getAccess();
  const loggedIn = !!userId;
  const unlocked = products.includes("premium") || products.includes("course");

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <p className="eyebrow mb-6">Online Course</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">The (Un)Retire Course</h1>
          <span className="rule mt-7 mb-7 mx-auto" aria-hidden="true" />
          <p className="lede max-w-[58ch] mx-auto">
            The book&apos;s companion course — a guided walk through the whole framework, at your own
            pace. Ten modules, each lesson with a short video and a downloadable companion guide you can
            actually use.
          </p>
        </div>
      </section>

      {/* ── COURSE INTRO VIDEO (free preview) ────────────────── */}
      {COURSE_INTRO_YOUTUBE_ID && (
        <section className="bg-white">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 pb-12">
            <p className="eyebrow mb-3 text-center">Course introduction · free preview</p>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#ECECEC]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${COURSE_INTRO_YOUTUBE_ID}`}
                title="Course introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* ── WHAT'S INSIDE (stats) ────────────────────────────── */}
      <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { n: "10", l: "Modules" },
              { n: String(totalLessons), l: "Lessons" },
              { n: "Video", l: "Every lesson" },
              { n: "PDF", l: "Companion guide each" },
            ].map((s) => (
              <div key={s.l} className="card p-6 text-center">
                <p className="text-[2rem] leading-none text-[#D05D11] mb-2">{s.n}</p>
                <p className="text-[13px] text-[#666666] leading-snug">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULE LIST ──────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">The curriculum</p>
            <h2 className="text-3xl sm:text-4xl">Ten modules, one step at a time</h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>

          <div className="space-y-4">
            {modules.map((m) => (
              <Link
                key={m.slug}
                href={`/unretire/learn/course/${m.slug}`}
                className="card card-hover flex items-center gap-5 p-6"
              >
                <span className="flex-shrink-0 w-11 h-11 rounded-full bg-[#FAF3EE] text-[#D05D11] text-[1.1rem] font-bold flex items-center justify-center">
                  {m.num}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[1.1rem] text-[#232F3F] leading-snug mb-1">{m.title}</span>
                  <span className="block prose-body text-[14px] text-[#666666] leading-[1.6]">{m.summary}</span>
                </span>
                <span className="flex-shrink-0 flex items-center gap-2 text-[13px] text-[#9A9080]">
                  <span className="hidden sm:inline">{m.lessons.length} lessons</span>
                  {unlocked ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D05D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-label="Open">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-label="Locked">
                      <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENROLL / ACCESS CTA ──────────────────────────────── */}
      <section className="bg-[#8B1A1A]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          {unlocked ? (
            <>
              <p className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">You&apos;re enrolled.</p>
              <p className="text-white/70 text-[17px] leading-[1.7] mb-8 max-w-[46ch] mx-auto">
                Everything is unlocked. Jump back in wherever you left off.
              </p>
              <Link href="/unretire/learn/course/module-1" className="btn bg-white text-[#8B1A1A] hover:bg-[#F5F5F5]">
                Start the course →
              </Link>
            </>
          ) : (
            <>
              <p className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">Get the full course.</p>
              <p className="text-white/70 text-[17px] leading-[1.7] mb-2 max-w-[46ch] mx-auto">
                Ten modules, every lesson and worksheet — yours to keep.
              </p>
              <p className="text-5xl sm:text-6xl font-bold text-white leading-none mt-6 mb-2">$99</p>
              <p className="text-white/70 text-[15px] mb-8">one-time</p>
              <div className="flex flex-col items-center gap-4">
                <CheckoutButton
                  product="course"
                  loggedIn={loggedIn}
                  owned={unlocked}
                  label="Buy the course — $99"
                  className="btn bg-white text-[#8B1A1A] hover:bg-[#F5F5F5]"
                />
                <Link href="/unretire/premium" className="text-white text-[14px] underline hover:opacity-80">
                  Or get it free with Premium ($199/year) →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <EmailCaptureBand />
    </>
  );
}
