"use client";

import { useState } from "react";

const categories = ["All", "Mindset", "Identity", "Purpose", "Relationships", "Health", "Practices"];

const articles = [
  { tag: "Mindset", title: "The 5 Mindsets of the (Un)Retiree", desc: "Freedom, Evolution, Balance, Relevance, Joy. The five mental shifts that separate those who drift from those who design.", time: "8 min read", access: "free" },
  { tag: "Mindset", title: "Dealing with the Drift", desc: "The most common retirement problem nobody talks about — and the simple daily practice that fixes it.", time: "6 min read", access: "premium" },
  { tag: "Mindset", title: "From Fear to Freedom", desc: "Retirement can feel like loss before it feels like liberation. Here's how to move through the fear faster.", time: "7 min read", access: "premium" },
  { tag: "Identity", title: "Who Are You Without Your Title?", desc: "The identity crisis of retirement is real — and it's the starting point for everything that comes next.", time: "9 min read", access: "premium" },
  { tag: "Purpose", title: "Finding Your Second Act Purpose", desc: "Purpose in retirement is not found — it is built, through the work you do and the people you serve.", time: "8 min read", access: "premium" },
  { tag: "Relationships", title: "The Relationship Reset", desc: "How retirement changes your most important relationships — and what to do about it.", time: "6 min read", access: "premium" },
  { tag: "Health", title: "The Vitality Imperative", desc: "Why physical health is not a vanity project in retirement — it's the foundation for everything else.", time: "7 min read", access: "premium" },
  { tag: "Practices", title: "The 14-Day Ignite Protocol", desc: "A practical, day-by-day plan to reignite your curiosity and sense of aliveness in just two weeks.", time: "10 min read", access: "free" },
];

export default function ArticlesList() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? articles : articles.filter((a) => a.tag === active);

  return (
    <>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-12 sm:mb-14">
        {categories.map((cat) => {
          const on = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              aria-pressed={on}
              className={`px-4 py-2 rounded-full text-[12px] font-bold tracking-[0.08em] uppercase transition-colors border ${
                on
                  ? "bg-[#D05D11] border-[#D05D11] text-white"
                  : "bg-white border-[#E5E5E5] text-[#444444] hover:text-[#D05D11] hover:border-[#D8C9B8]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <article
            key={a.title}
            className="card card-hover relative p-7 flex flex-col"
          >
            {a.access === "premium" && (
              <span className="absolute top-5 right-5 inline-flex items-center gap-1 bg-[#FAF3EE] text-[#D05D11] text-[10px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 py-1">
                ✦ Premium
              </span>
            )}
            <p className="eyebrow mb-3">{a.tag}</p>
            <h3 className="text-[1.2rem] leading-snug mb-3 pr-16">{a.title}</h3>
            <p className="prose-body text-[14px] text-[#666666] leading-[1.7] mb-6 flex-1">{a.desc}</p>
            <div className="flex items-center justify-between pt-4 border-t border-[#ECECEC]">
              <span className="text-[12px] text-[#888888] tracking-[0.04em]">{a.time}</span>
              {a.access === "free" ? (
                <span className="pill-link">Read →</span>
              ) : (
                <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#888888]">
                  🔒 Members
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
