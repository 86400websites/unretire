"use client";

import { useState } from "react";
import Link from "next/link";

type Card = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
};

export default function BlogIndex({ cards, categories }: { cards: Card[]; categories: string[] }) {
  const [active, setActive] = useState<string>("All");
  const tabs = ["All", ...categories];
  const shown = active === "All" ? cards : cards.filter((c) => c.category === active);

  return (
    <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* filter pills */}
        <div className="flex flex-wrap gap-2 mb-9">
          {tabs.map((t) => {
            const on = t === active;
            return (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-colors border ${
                  on
                    ? "bg-[#8B1A1A] text-white border-[#8B1A1A]"
                    : "bg-white text-[#4A443B] border-[#ECECEC] hover:border-[#D05D11] hover:text-[#D05D11]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {shown.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/${c.slug}`}
              className="card card-hover flex flex-col p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#FAF3EE] text-[#D05D11] text-[11px] font-semibold tracking-wide uppercase">
                  {c.category}
                </span>
                <span className="text-[12px] text-[#9A9080]">{c.readingMinutes} min</span>
              </div>
              <h2 className="text-[1.3rem] leading-snug text-[#14110D] mb-3">{c.title}</h2>
              <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-6 flex-1">
                {c.excerpt}
              </p>
              <span className="pill-link">Read →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
