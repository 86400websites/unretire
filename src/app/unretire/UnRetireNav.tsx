"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type Child = { label: string; href: string; desc: string };
type NavItem = { label: string; href: string; children?: Child[] };

const navItems: NavItem[] = [
  { label: "The Book", href: "/unretire/book" },
  {
    label: "Learn",
    href: "/unretire/learn",
    children: [
      { label: "Online Course", href: "/unretire/learn/course", desc: "Ten guided modules across the framework." },
      { label: "Podcast", href: "/unretire/podcast", desc: "Conversations with people who refused to fade." },
      { label: "Blog", href: "/unretire/blog", desc: "Short, practical notes on living fully." },
    ],
  },
  {
    label: "Practice",
    href: "/unretire/practice",
    children: [
      { label: "The 5 Mindsets", href: "/unretire/practice#mindsets", desc: "How you think — five belief shifts." },
      { label: "The 7 Practices", href: "/unretire/practice#practices", desc: "What you do — seven daily practices." },
      { label: "14-Day Starter Plan", href: "/unretire/practice#tools", desc: "One small move a day for two weeks." },
      { label: "The Toolkit", href: "/unretire/tools", desc: "28 experiments across the 7 practices." },
    ],
  },
  { label: "Stories", href: "/unretire/stories" },
  { label: "About", href: "/unretire/about" },
];

const chevron = (open: boolean) => (
  <svg
    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function UnRetireNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname() ?? "/unretire";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const openNow = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#ECECEC]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px] gap-4">
          {/* Logo */}
          <Link href="/unretire" aria-label="UnRetire — home" className="flex items-center flex-shrink-0">
            <Image
              src="/assets/unretire/logo-color.png"
              alt="UnRetire"
              width={150}
              height={54}
              priority
              className="h-[26px] w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="UnRetire">
            {navItems.map((item) => {
              const active = isActive(item.href);
              if (!item.children) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`px-3.5 py-2 rounded-full text-[12px] font-bold tracking-[0.1em] uppercase transition-colors ${
                      active ? "bg-[#FAF3EE] text-[#D05D11]" : "text-[#444444] hover:text-[#D05D11] hover:bg-[#FBF5F2]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
              const open = openMenu === item.label;
              return (
                <div key={item.href} className="relative" onMouseEnter={() => openNow(item.label)} onMouseLeave={closeSoon}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={open}
                    onFocus={() => openNow(item.label)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold tracking-[0.1em] uppercase transition-colors ${
                      active || open ? "bg-[#FAF3EE] text-[#D05D11]" : "text-[#444444] hover:text-[#D05D11] hover:bg-[#FBF5F2]"
                    }`}
                  >
                    {item.label}
                    {chevron(open)}
                  </Link>
                  {open && (
                    <div className="absolute left-0 top-full pt-2 w-[300px]" onMouseEnter={() => openNow(item.label)} onMouseLeave={closeSoon}>
                      <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-[0_22px_44px_-22px_rgba(17,17,17,0.28)] p-2">
                        {item.children.map((c) => (
                          <Link
                            key={c.label}
                            href={c.href}
                            onClick={() => setOpenMenu(null)}
                            className="block rounded-xl px-4 py-3 hover:bg-[#FBF5F2] transition-colors"
                          >
                            <span className="block text-[13px] font-bold text-[#232F3F]">{c.label}</span>
                            <span className="block text-[12px] text-[#666666] leading-snug mt-0.5">{c.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center">
            <Link href="/unretire/start" className="btn btn-crimson">
              Start Your Next Chapter
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="ur-mobile-menu"
            className="lg:hidden p-2 -mr-2 text-[#232F3F]"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="ur-mobile-menu" className="lg:hidden border-t border-[#ECECEC] bg-white">
          <div className="px-5 sm:px-6 py-4 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              if (!item.children) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block px-3 py-3 rounded-xl text-[12px] font-bold tracking-[0.1em] uppercase transition-colors ${
                      active ? "bg-[#FAF3EE] text-[#D05D11]" : "text-[#232F3F] hover:bg-[#FBF5F2]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
              const sub = mobileSub === item.label;
              return (
                <div key={item.href}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="flex-1 px-3 py-3 rounded-xl text-[12px] font-bold tracking-[0.1em] uppercase text-[#232F3F] hover:bg-[#FBF5F2] transition-colors"
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileSub(sub ? null : item.label)}
                      aria-label={`${item.label} submenu`}
                      aria-expanded={sub}
                      className="p-3 text-[#232F3F] hover:text-[#D05D11] transition-colors"
                    >
                      {chevron(sub)}
                    </button>
                  </div>
                  {sub && (
                    <div className="pl-3 pb-2 space-y-1">
                      {item.children.map((c) => (
                        <Link
                          key={c.label}
                          href={c.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-lg text-[13px] text-[#444444] hover:bg-[#FBF5F2] hover:text-[#D05D11] transition-colors"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-3 mt-2 border-t border-[#ECECEC] space-y-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-[12px] font-bold tracking-[0.12em] uppercase text-[#666666] hover:text-[#D05D11] transition-colors"
              >
                ← Back to Half a Life
              </Link>
              <Link href="/unretire/start" onClick={() => setMobileOpen(false)} className="btn btn-crimson w-full">
                Start Your Next Chapter
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
