"use client";
import Link from "next/link";
import { useState } from "react";

export default function UnRetireNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, height: 70, background: "rgba(13,8,4,.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2.5rem" }}>
        {/* Logo */}
        <Link href="/unretire" style={{ display: "flex", alignItems: "baseline", gap: ".3rem", textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 700, color: "#F2EDE4", letterSpacing: ".06em" }}>UN</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 300, color: "rgba(242,237,228,.45)", letterSpacing: ".06em" }}>RETIRE</span>
        </Link>

        {/* Desktop links */}
        <div className="ur-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2.2rem" }}>
          {[
            { label: "The Book", href: "/unretire/book" },
            { label: "Framework", href: "/unretire/framework" },
            { label: "Articles", href: "/unretire/articles" },
            { label: "Journeys", href: "/unretire/journeys" },
            { label: "Community", href: "/unretire/community" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              style={{ fontSize: ".85rem", color: "rgba(242,237,228,.55)", textDecoration: "none", transition: "color .18s" }}
              onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"}
              onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.55)"}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Back to Half a Life — subtle link */}
        

          <Link href="/unretire/community" className="ur-desktop-nav"
            style={{ padding: ".5rem 1.4rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 999, fontSize: ".75rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}
            onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#A82020"}
            onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8B1A1A"}>
            Join
          </Link>

          {/* Mobile hamburger */}
          <button onClick={() => setDrawerOpen(true)} className="ur-mobile-only" aria-label="Open menu"
            style={{ background: "none", border: "none", color: "#F2EDE4", padding: ".4rem", display: "flex", flexDirection: "column", gap: 5, cursor: "pointer" }}>
            {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 22, height: 1.5, background: "#F2EDE4" }} />)}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.6)" }} onClick={() => setDrawerOpen(false)} />}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 2001, width: 300, background: "#0D0807", borderLeft: "1px solid rgba(255,255,255,.07)", padding: "2rem 1.5rem", transform: drawerOpen ? "translateX(0)" : "translateX(100%)", transition: "transform .28s cubic-bezier(.25,.46,.45,.94)", overflowY: "auto" }}>
        <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", color: "rgba(242,237,228,.4)", fontSize: "1.5rem", marginBottom: "2rem", display: "block", marginLeft: "auto", cursor: "pointer" }}>×</button>
        {[{ label: "The Book", href: "/unretire/book" }, { label: "Framework", href: "/unretire/framework" }, { label: "Articles", href: "/unretire/articles" }, { label: "Journeys", href: "/unretire/journeys" }, { label: "Community", href: "/unretire/community" }].map(l => (
          <Link key={l.href} href={l.href} onClick={() => setDrawerOpen(false)}
            style={{ display: "block", padding: ".8rem 0", fontSize: ".95rem", color: "rgba(242,237,228,.7)", borderBottom: "1px solid rgba(255,255,255,.05)", textDecoration: "none" }}>
            {l.label}
          </Link>
        ))}
        <Link href="/" onClick={() => setDrawerOpen(false)}
          style={{ display: "block", padding: ".8rem 0", marginTop: ".5rem", fontSize: ".75rem", fontFamily: "var(--mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(242,237,228,.3)", textDecoration: "none" }}>
          ← Back to Half a Life
        </Link>
        <Link href="/unretire/community" onClick={() => setDrawerOpen(false)}
          style={{ display: "block", marginTop: "1.5rem", padding: ".9rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 8, fontSize: ".85rem", fontWeight: 600, textAlign: "center", letterSpacing: ".06em", textTransform: "uppercase", textDecoration: "none" }}>
          Join
        </Link>
      </div>

      <div style={{ height: 70 }} />

      <style>{`
        @media(max-width:768px){ .ur-desktop-nav{ display:none!important; } .ur-mobile-only{ display:flex!important; } }
        @media(min-width:769px){ .ur-mobile-only{ display:none!important; } }
      `}</style>
    </>
  );
}
