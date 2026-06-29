"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { modules, COURSE_UNLOCKED, COURSE_INTRO_YOUTUBE_ID, type Module } from "./courseData";

type Item = {
  key: string;
  moduleSlug: string;
  label: string;
  youtubeId?: string;
  pdfUrl?: string;
  pdfLabel?: string;
};

function buildItems(m: Module): Item[] {
  const items: Item[] = [];
  if (m.intro && (m.intro.youtubeId || m.intro.deliverablePdf)) {
    items.push({
      key: `${m.slug}__intro`,
      moduleSlug: m.slug,
      label: "Introduction",
      youtubeId: m.intro.youtubeId,
      pdfUrl: m.intro.deliverablePdf,
      pdfLabel: "module deliverable (PDF)",
    });
  }
  for (const l of m.lessons) {
    items.push({
      key: `${m.slug}__${l.id}`,
      moduleSlug: m.slug,
      label: l.title,
      youtubeId: l.youtubeId,
      pdfUrl: l.pdfUrl,
      pdfLabel: "lesson worksheet (PDF)",
    });
  }
  return items;
}

const LockIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const PlayIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default function CoursePlayer({ initialSlug }: { initialSlug: string }) {
  const allItems = useMemo(() => modules.flatMap(buildItems), []);
  const initialModule = modules.find((m) => m.slug === initialSlug) ?? modules[0];
  const firstKey = buildItems(initialModule)[0]?.key ?? allItems[0]?.key;

  const [activeKey, setActiveKey] = useState<string>(firstKey);
  const [open, setOpen] = useState<Record<string, boolean>>({ [initialModule.slug]: true });

  const active = allItems.find((i) => i.key === activeKey) ?? allItems[0];
  const activeModule = modules.find((m) => m.slug === active.moduleSlug);

  const toggle = (slug: string) => setOpen((o) => ({ ...o, [slug]: !o[slug] }));
  const select = (it: Item) => {
    setActiveKey(it.key);
    setOpen((o) => ({ ...o, [it.moduleSlug]: true }));
  };

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Link href="/unretire/learn/course" className="pill-link mb-6 inline-block">
          ← Course overview
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* ── SIDEBAR: all modules + lessons ───────────────── */}
          <aside className="lg:w-[340px] lg:flex-shrink-0 lg:order-1">
            <div className="rounded-2xl border border-[#ECECEC] bg-[#FBF5F2] overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <p className="eyebrow px-5 pt-7 pb-2">Course content</p>

              {modules.map((m) => {
                const items = buildItems(m);
                const isOpen = !!open[m.slug];
                return (
                  <div key={m.slug} className="border-t border-[#ECECEC]">
                    <button
                      onClick={() => toggle(m.slug)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/60 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FAF3EE] text-[#D05D11] text-[12px] font-bold flex items-center justify-center">
                        {m.num}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] text-[#232F3F] leading-snug">{m.title}</span>
                        <span className="block text-[12px] text-[#9A9080] mt-0.5">{items.length} items</span>
                      </span>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9080" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {isOpen && (
                      <ul className="pb-2">
                        {items.map((it) => {
                          const isActive = it.key === active.key;
                          return (
                            <li key={it.key}>
                              <button
                                onClick={() => COURSE_UNLOCKED && select(it)}
                                disabled={!COURSE_UNLOCKED}
                                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                                  isActive ? "bg-white" : "hover:bg-white/60"
                                } ${COURSE_UNLOCKED ? "cursor-pointer" : "cursor-default"}`}
                              >
                                <span className={isActive ? "text-[#D05D11]" : "text-[#9A9080]"}>
                                  {COURSE_UNLOCKED ? <PlayIcon /> : <LockIcon />}
                                </span>
                                <span
                                  className={`flex-1 text-[13px] leading-snug ${
                                    isActive ? "text-[#232F3F] font-semibold" : "text-[#4A443B]"
                                  }`}
                                >
                                  {it.label}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ── MAIN: video + resources ──────────────────────── */}
          <div className="flex-1 min-w-0 lg:order-2">
            {COURSE_UNLOCKED ? (
              <>
                {active.youtubeId ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#ECECEC]">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${active.youtubeId}`}
                      title={active.label}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl bg-[#FBF5F2] border border-[#ECECEC] flex items-center justify-center text-[14px] text-[#9A9080]">
                    No video for this item yet.
                  </div>
                )}

                <p className="eyebrow mt-6 mb-2">
                  {activeModule ? `Module ${activeModule.num} · ${activeModule.title}` : "Course"}
                </p>
                <h1 className="text-2xl sm:text-3xl leading-snug mb-5">{active.label}</h1>

                <div className="rounded-2xl border border-[#ECECEC] bg-[#FBF5F2] p-5 sm:p-8">
                  <p className="eyebrow mb-3">Resources</p>
                  {active.pdfUrl ? (
                    <a href={active.pdfUrl} target="_blank" rel="noopener noreferrer" className="pill-link">
                      Download the {active.pdfLabel} →
                    </a>
                  ) : (
                    <p className="text-[14px] text-[#9A9080]">No downloadable resource for this lesson.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {COURSE_INTRO_YOUTUBE_ID && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#ECECEC]">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${COURSE_INTRO_YOUTUBE_ID}`}
                      title="Course introduction"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <p className="eyebrow mt-6 mb-2">Free preview</p>
                <h1 className="text-2xl sm:text-3xl leading-snug mb-5">Course introduction</h1>

                <div className="rounded-2xl border border-[#ECECEC] bg-[#FBF5F2] p-8 sm:p-10 text-center">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF3EE] text-[#D05D11] mb-5">
                    <LockIcon size={20} />
                  </span>
                  <h2 className="text-xl sm:text-2xl text-[#232F3F] leading-snug mb-3">
                    The rest of the course unlocks with enrollment
                  </h2>
                  <p className="prose-body text-[15px] leading-[1.7] mb-8 max-w-[44ch] mx-auto">
                    Enrollment opens soon. Get the free Starter Plan in the meantime — and you&apos;ll be
                    first to know when the doors open.
                  </p>
                  <Link href="/unretire/start" className="btn btn-crimson">
                    Get the Free Starter Plan
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
