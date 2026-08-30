import type { ReactNode } from "react";

export type LegalSection = {
  heading: string;
  body?: string[];
  list?: string[];
};

/**
 * Shared shell for /privacy and /terms (S4.5, Known issue 3).
 *
 * One component so the two pages cannot drift apart in appearance, and so they
 * inherit the site's existing type scale and `.ur-site` tokens rather than
 * introducing a third look. No new design values are invented here.
 */

/** Renders the **bold** spans the legal copy uses for its lead-ins. */
function withEmphasis(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-[#14110D]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function LegalPage({
  title,
  updated,
  intro,
  sections,
  footer,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  footer?: ReactNode;
}) {
  return (
    <section className="bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <p className="eyebrow mb-5">Legal</p>
        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem]">{title}</h1>
        <span className="rule mt-6 mb-6" aria-hidden="true" />
        <p className="lede mb-3">{intro}</p>
        <p className="text-[13px] text-[#888888] mb-12">
          Last updated {updated}
        </p>

        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-xl sm:text-2xl mb-4">{s.heading}</h2>
              {s.body?.map((p, i) => (
                <p
                  key={i}
                  className="prose-body leading-[1.8] text-[#3A3A3A] mb-4"
                >
                  {withEmphasis(p)}
                </p>
              ))}
              {s.list && (
                <ul className="space-y-3 mt-2">
                  {s.list.map((item, i) => (
                    <li
                      key={i}
                      className="prose-body leading-[1.8] text-[#3A3A3A] pl-5 relative"
                    >
                      <span
                        className="absolute left-0 top-[0.7em] w-[6px] h-[6px] rounded-full bg-[#D05D11]"
                        aria-hidden="true"
                      />
                      {withEmphasis(item)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {footer && (
          <p className="prose-body leading-[1.8] text-[#666666] mt-14 pt-8 border-t border-[#ECECEC]">
            {footer}
          </p>
        )}
      </div>
    </section>
  );
}
