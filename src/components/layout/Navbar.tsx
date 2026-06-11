"use client";

import { useState } from "react";
import Link from "next/link";

const books = [
  { label: "All Books", href: "/books" },
  { label: "UnRetire", href: "/unretire" },
  { label: "Bouncing Forward", href: "/books/bouncing-forward" },
  { label: "33 Under 33", href: "/books/33-under-33" },
{ label: "The Singapore Way", href: "/books/singapore-way" },
];

// ← Speaking removed from here
const about = [
  { label: "Start Here", href: "/start-here" },
  { label: "About Maher", href: "/about" },
  { label: "Contact & FAQs", href: "/contact" },
];

export default function Navbar() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);


  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          height: "var(--topnav-h)", background: "rgba(13,13,13,.92)",
          backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 2.5rem",
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: ".55rem", fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 500, color: "#F2EDE4", letterSpacing: "-.01em", textDecoration: "none" }}>
          <span style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0, display: "inline-block" }}>
            <span style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: "radial-gradient(circle at 60% 50%,#2a2a2a,#0d0d0d)" }} />
            <span style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", background: "#8B1A1A" }} />
          </span>
          Half <em style={{ color: "#8B1A1A", fontStyle: "italic" }}>&nbsp;a Life</em>
        </Link>

        {/* Desktop links */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>

  

       
          {/* ── About dropdown (no Speaking inside) ── */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}>
            <button style={{ background: "none", border: "none", color: "rgba(242,237,228,.7)", fontSize: ".88rem", fontWeight: 400, fontFamily: "var(--body)", cursor: "pointer", display: "flex", alignItems: "center", gap: ".3rem", padding: ".4rem 0", transition: "color .18s" }}
              onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.color = "#F2EDE4"}
              onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(242,237,228,.7)"}>
              About
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
            {aboutOpen && (
              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: ".5rem", minWidth: 180, boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
                {about.map(a => (
                  <Link key={a.href} href={a.href} style={{ display: "block", padding: ".6rem 1rem", fontSize: ".85rem", color: "rgba(242,237,228,.65)", borderRadius: 6, transition: "all .15s", textDecoration: "none" }}
                    onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"; }}
                    onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.65)"; }}>
                    {a.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
   {/* ── Books dropdown ── */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setBooksOpen(true)}
            onMouseLeave={() => setBooksOpen(false)}>
            <button style={{ background: "none", border: "none", color: "rgba(242,237,228,.7)", fontSize: ".88rem", fontWeight: 400, fontFamily: "var(--body)", cursor: "pointer", display: "flex", alignItems: "center", gap: ".3rem", padding: ".4rem 0", transition: "color .18s" }}
              onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.color = "#F2EDE4"}
              onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(242,237,228,.7)"}>
              Books
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
            {booksOpen && (
              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: ".5rem", minWidth: 200, boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
                {books.map((b, i) => (
                  <div key={b.href}>
                    {i === 1 && <div style={{ height: 1, background: "rgba(255,255,255,.07)", margin: ".3rem .5rem" }} />}
                    <Link href={b.href} style={{ display: "block", padding: ".6rem 1rem", fontSize: ".85rem", color: "rgba(242,237,228,.65)", borderRadius: 6, transition: "all .15s", textDecoration: "none" }}
                      onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"; }}
                      onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.65)"; }}>
                      {b.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Speaking (standalone) ── */}
          <Link href="/speaking"
            style={{ color: "rgba(242,237,228,.7)", fontSize: ".88rem", textDecoration: "none", transition: "color .18s" }}
            onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"}
            onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.7)"}>
            Speaking
          </Link>

          <Link href="/newsletter"
            style={{ color: "rgba(242,237,228,.7)", fontSize: ".88rem", textDecoration: "none", transition: "color .18s" }}
            onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"}
            onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.7)"}>
            Newsletter
          </Link>
        </div>

        {/* CTA + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/newsletter" className="desktop-nav"
            style={{ padding: ".55rem 1.6rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 999, fontSize: ".8rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", transition: "background .2s", textDecoration: "none" }}
            onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#A82020"}
            onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8B1A1A"}>
            Join
          </Link>

          {/* Mobile hamburger */}
          <button onClick={() => setDrawerOpen(true)} className="mobile-only" aria-label="Open menu"
            style={{ background: "none", border: "none", color: "#F2EDE4", padding: ".4rem", display: "flex", flexDirection: "column", gap: 5 }}>
            {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 22, height: 1.5, background: "#F2EDE4" }} />)}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.6)" }} onClick={() => setDrawerOpen(false)} />}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 2001, width: 300, background: "#111", borderLeft: "1px solid rgba(255,255,255,.08)", padding: "2rem 1.5rem", transform: drawerOpen ? "translateX(0)" : "translateX(100%)", transition: "transform .28s cubic-bezier(.25,.46,.45,.94)", overflowY: "auto" }}>
        <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ background: "none", border: "none", color: "rgba(242,237,228,.4)", fontSize: "1.5rem", marginBottom: "2rem", display: "block", marginLeft: "auto", cursor: "pointer" }}>×</button>


        <div style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(242,237,228,.3)", margin: "1.5rem 0 1rem" }}>Books</div>
        {books.map(b => (
          <Link key={b.href} href={b.href} onClick={() => setDrawerOpen(false)} style={{ display: "block", padding: ".7rem 0", fontSize: ".9rem", color: "rgba(242,237,228,.7)", borderBottom: "1px solid rgba(255,255,255,.05)", textDecoration: "none" }}>{b.label}</Link>
        ))}

        <div style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(242,237,228,.3)", margin: "1.5rem 0 1rem" }}>About</div>
        {about.map(a => (
          <Link key={a.href} href={a.href} onClick={() => setDrawerOpen(false)} style={{ display: "block", padding: ".7rem 0", fontSize: ".9rem", color: "rgba(242,237,228,.7)", borderBottom: "1px solid rgba(255,255,255,.05)", textDecoration: "none" }}>{a.label}</Link>
        ))}

        <Link href="/speaking" onClick={() => setDrawerOpen(false)} style={{ display: "block", padding: ".7rem 0", marginTop: ".5rem", fontSize: ".9rem", color: "rgba(242,237,228,.7)", borderBottom: "1px solid rgba(255,255,255,.05)", textDecoration: "none" }}>Speaking</Link>
        <Link href="/newsletter" onClick={() => setDrawerOpen(false)} style={{ display: "block", padding: ".7rem 0", fontSize: ".9rem", color: "rgba(242,237,228,.7)", textDecoration: "none" }}>Newsletter</Link>

        <Link href="/newsletter" onClick={() => setDrawerOpen(false)} style={{ display: "block", marginTop: "1.5rem", padding: ".9rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 8, fontSize: ".85rem", fontWeight: 600, textAlign: "center", letterSpacing: ".06em", textTransform: "uppercase", textDecoration: "none" }}>Join</Link>
      </div>

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-only { display: flex !important; } }
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
      `}</style>
    </>
  );
}
