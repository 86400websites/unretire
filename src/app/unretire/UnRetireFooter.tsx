import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "The Book", href: "/unretire/book" },
      { label: "Learn", href: "/unretire/learn" },
      { label: "Practice", href: "/unretire/practice" },
      { label: "Stories", href: "/unretire/stories" },
      { label: "About Maher", href: "/unretire/about" },
    ],
  },
  {
    title: "Practice",
    links: [
      { label: "The 5 Mindsets", href: "/unretire/practice#mindsets" },
      { label: "The 7 Practices", href: "/unretire/practice#practices" },
      { label: "14-Day Starter Plan", href: "/unretire/practice#tools" },
      { label: "Wheel of Life", href: "/unretire/assess" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Newsletter", href: "/unretire/newsletter" },
      { label: "Podcast", href: "/unretire/podcast" },
      { label: "Blog", href: "/unretire/blog" },
      { label: "Contact", href: "/unretire/contact" },
    ],
  },
];

export default function UnRetireFooter() {
  return (
    <footer className="bg-[#232F3F] text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            <Image
              src="/assets/unretire/logo-on-dark.png"
              alt="UnRetire"
              width={150}
              height={54}
              className="h-7 w-auto mb-4"
            />
            <p className="text-[14px] leading-relaxed text-white/55 max-w-[280px] mb-3">
              Reboot. Don&apos;t Mute.
            </p>
            <p className="text-[14px] italic leading-relaxed text-white/45 max-w-[280px] mb-6">
              &ldquo;Aging is inevitable. Diminishing is optional.&rdquo;
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase text-white/55 hover:text-white transition-colors border border-white/15 rounded-full px-3.5 py-1.5"
            >
              <span className="relative inline-block w-3 h-3 rounded-full overflow-hidden flex-shrink-0">
                <span className="absolute left-0 top-0 w-1/2 h-full bg-white" />
                <span className="absolute right-0 top-0 w-1/2 h-full bg-[#D05D11]" />
              </span>
              Part of Half a Life
            </Link>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-white/35 mb-4">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[14px] text-white/55 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-7">
          <p className="text-[12px] text-white/35">© 2026 UnRetire · Maher Kaddoura · Part of Half a Life</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
