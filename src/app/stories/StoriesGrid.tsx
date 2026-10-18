"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type Story = {
  slug: string;
  img: string;
  kind: string;
  tag: string;
  title: string;
  name: string;
  country: string;
  closing: string;
  body: string[];
};

export default function StoriesGrid({ stories }: { stories: Story[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const active = openIdx === null ? null : stories[openIdx];

  // Lock background scroll + close on Escape while a story is open.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  const src = (img: string) => `/assets/unretire/images/stories/${img}.png`;

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => setOpenIdx(i)}
            aria-haspopup="dialog"
            className="card card-hover flex flex-col overflow-hidden text-left"
          >
            <div className="relative aspect-[4/3] border-b border-[#ECECEC] bg-[#FBF5F2]">
              <Image
                src={src(s.img)}
                alt={`${s.title} — ${s.name}`}
                fill
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#D05D11]">
                {s.kind} · {s.tag}
              </p>
              <h3 className="mb-2 text-[1.3rem] leading-snug">{s.title}</h3>
              <p className="mb-4 text-[13px] font-bold tracking-[0.02em] text-[#232F3F]">
                {s.name} · {s.country}
              </p>
              <p className="prose-body mt-auto text-[14px] italic leading-[1.6] text-[#666666]">
                {s.closing}
              </p>
              <span className="mt-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[#D05D11]">
                Read the story →
              </span>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setOpenIdx(null)}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-6 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(17,17,17,0.5)]"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(null)}
              aria-label="Close story"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#232F3F] shadow-sm transition-colors hover:bg-white"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative aspect-[3/2] w-full bg-[#FBF5F2]">
              <Image
                src={src(active.img)}
                alt={`${active.title} — ${active.name}`}
                fill
                sizes="(min-width: 640px) 672px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="p-7 sm:p-8">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#D05D11]">
                {active.kind} · {active.tag}
              </p>
              <h2 className="text-2xl leading-tight sm:text-3xl">
                {active.title}
              </h2>
              <p className="mt-2 text-[14px] font-bold tracking-[0.02em] text-[#232F3F]">
                {active.name} · {active.country}
              </p>
              <span className="rule mb-6 mt-6 block" aria-hidden="true" />
              <div className="space-y-4">
                {active.body.map((p, i) => (
                  <p
                    key={i}
                    className="prose-body text-[16px] leading-[1.8] text-[#444444]"
                  >
                    {p}
                  </p>
                ))}
              </div>
              <p className="mt-6 text-[1.1rem] italic leading-[1.5] text-[#D05D11]">
                {active.closing}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
