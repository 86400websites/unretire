"use client";

import { useState } from "react";

/**
 * "What readers say" — real, attributable reader reviews for (Un)Retire
 * (from Heather, Oct 2026). Three cards per row; each review collapses to
 * three lines with a "Read more" toggle, mirroring the Bouncing Forward layout.
 * Text is verbatim from the source, with only whitespace normalised.
 */
type Review = { quote: string; author: string };

const reviews: Review[] = [
  {
    quote:
      "UnRetire turns retirement from an ending into an open question about what comes next and gives you a practical way to answer it. It made me rethink what a second half of life can look like.",
    author: "Sozana Blidy",
  },
  {
    quote:
      "UnRetire makes the prospect of retirement less daunting. Even though I’m not ready to retire yet, after reading UnRetire I have started creating an exciting strategy for retirement — not just financially but for enjoying my life and still making a meaningful contribution to society.",
    author: "Heather Meyer",
  },
  {
    quote:
      "This was very insightful. We do not always remember that we are more than the title we carry at our jobs, and once that is gone we might lose a bit of our identity — so this really helps to plan for when the title disappears. I really found the information valuable in the book and it was explained clearly. I would recommend this to anyone who is close to retirement or already retired. To be honest, even if you are far from it you might just get some new insights in this book!",
    author: "Roelien Morrison",
  },
  {
    quote:
      "This book really made me think about what I want this next part of my life to look like. After so many years focused on work and responsibilities, I hadn’t really stopped to think about life after work. It gave me a few questions worth sitting with and some guidance as I think about my next chapter.",
    author: "Darlene van Wyk",
  },
  {
    quote:
      "I’m 68, and I appreciated that this book didn’t speak to me as though my interesting years were behind me. I don’t need to fill every hour with something to do. But I do want things to look forward to, and this book made me think about what those could be.",
    author: "Carolyn Lewis",
  },
  {
    quote:
      "UnRetire: life has meaning again! This book helped me realise I can add value to many other areas in my life where my self-worth is maintained — and that my value to others and communities is still useful and has a positive impact. Worthwhile book, highly recommended.",
    author: "Yvonne van der Merwe",
  },
  {
    quote:
      "I love that UnRetire comes with a workbook as well. It is so helpful to have a daily practical guide and not just a theory to use. It’s an asset to anyone, whether you have already retired, are about to retire, or are even retiring in the future.",
    author: "Lara Sanousian",
  },
];

function ReviewCard({ review }: { review: Review }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="card flex flex-col p-7">
      <span className="mb-4 text-[#D05D11]" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5 6C6.46 6 4 8.46 4 11.5V18h6v-6H7.2c0-1.82 1.48-3.3 3.3-3.3V6H9.5Zm10 0c-3.04 0-5.5 2.46-5.5 5.5V18h6v-6h-2.8c0-1.82 1.48-3.3 3.3-3.3V6h-1Z" />
        </svg>
      </span>

      <p
        className={`prose-body text-[15px] leading-[1.75] text-[#444444] ${
          open ? "" : "line-clamp-3"
        }`}
      >
        {review.quote}
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1 self-start text-[13px] font-bold text-[#D05D11] transition-colors hover:text-[#8B1A1A]"
      >
        {open ? "Show less" : "Read more"}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="mt-6 border-t border-[#ECECEC] pt-5">
        <p className="font-bold text-[#232F3F]">{review.author}</p>
      </div>
    </article>
  );
}

export default function ReviewsSection() {
  return (
    <section className="bg-[#FBF5F2] border-y border-[#ECECEC]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <p className="eyebrow mb-5">Reviews</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
            Here&apos;s what readers say about (Un)Retire
          </h2>
          <span className="rule mt-6 mb-0 mx-auto" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {reviews.map((r) => (
            <ReviewCard key={r.author} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
