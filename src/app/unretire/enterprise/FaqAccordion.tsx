"use client";

import { useState } from "react";

export default function FaqAccordion({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-[#E4D8CB]">
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q} className="border-b border-[#E4D8CB]">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[1.15rem] sm:text-[1.3rem] text-[#232F3F] leading-snug">{q}</span>
              <span className="flex-shrink-0 w-6 text-center text-2xl leading-none text-[#D05D11]" aria-hidden="true">
                {isOpen ? "\u00d7" : "+"}
              </span>
            </button>
            {isOpen && (
              <p className="prose-body text-[15px] leading-[1.7] pb-6 max-w-[62ch]">{a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
