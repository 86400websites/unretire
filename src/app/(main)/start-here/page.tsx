"use client";
import Link from "next/link";
import { useState } from "react";

const paths = [
  { title: "I'm entering a new chapter", desc: "Retirement, career shift, major transition — you're at a threshold and want to cross it with intention.", cta: "Start with UnRetire →", href: "/unretire", color: "#7A3A28" },
  { title: "I'm recovering from a setback", desc: "Loss, failure, grief — life has knocked you back. The question is how you rise and what you build.", cta: "Start with Bouncing Forward →", href: "/books/bouncing-forward", color: "#2A4A6A" },
  { title: "I want more adventure and aliveness", desc: "Something in you is restless, hungry for more. You want a bigger, braver, more fully-felt life.", cta: "Start with The Adventure Way →", href: "/books/adventure-way", color: "#2A5A3A" },
  { title: "I'm looking for more meaning", desc: "The external markers are in place, but something feels hollow. You're ready for a deeper conversation.", cta: "Start with The Meaning Map →", href: "/articles", color: "#4A3A6A" },
  { title: "Make the second half count", desc: "You've lived enough to know what matters. Now you want to live it fully — with energy and purpose.", cta: "Take the Next Chapter Assessment →", href: "/tools", color: "#5A3A1A" },
  { title: "Help me find my path", desc: "Not sure where to start? Browse all books, tools, and journeys — or let the articles guide you.", cta: "Browse Everything →", href: "/books", color: "#1A3A4A" },
];

const startingPoints = [
  { type: "Book", title: "UnRetire", desc: "If you're standing at any threshold, this is the clearest place to start. Reinvention, intention, and the courage to begin again.", cta: "Learn More", href: "/unretire" },
  { type: "Articles", title: "Essays & Reflections", desc: "Start with 'The Courage to Begin Again' — an essay that sets the tone for everything Half a Life stands for.", cta: "Read Articles", href: "/articles" },
  { type: "Newsletter", title: "The Half a Life Letter", desc: "Weekly ideas for living a fuller life. Join 2,000+ people navigating change with intention.", cta: "Subscribe Free", href: "/newsletter" },
];

const sequence = [
  { num: "1", title: "Choose your moment", desc: "Find the path below that speaks to where you are right now — not where you think you should be." },
  { num: "2", title: "Pick your first book", desc: "Based on your moment — reinvention, resilience, aliveness, or meaning — pick the book that speaks directly to you." },
  { num: "3", title: "Read one article", desc: "Browse the articles section and find one essay that names exactly what you're feeling. Start there." },
  { num: "4", title: "Subscribe to weekly ideas", desc: "Stay in the conversation. Weekly essays and reflections keep the philosophy alive in everyday life." },
  { num: "5", title: "Come back often", desc: "Half a Life is not a single book or a course. It's a body of work you return to across different seasons." },
];

export default function StartHerePage() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
 
   {/* Hero */}
<div style={{ background: "#0D0D0D", paddingTop: "var(--topnav-h)", minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
  {/* Radial glow */}
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 60%, rgba(139,26,26,.18) 0%, transparent 55%)", pointerEvents: "none" }} />
  {/* Big decorative letter */}
  <div style={{ position: "absolute", right: "-2vw", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--serif)", fontSize: "clamp(260px,35vw,480px)", fontWeight: 700, color: "rgba(139,26,26,.06)", lineHeight: 1, letterSpacing: "-.04em", userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap" }}>Here</div>

  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2.5rem", position: "relative", zIndex: 2, width: "100%" }}>
    <p style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".35em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "2rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
      <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />
      Your Entry Point
    </p>
    <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(5rem,12vw,10rem)", fontWeight: 400, lineHeight: .88, color: "#F2EDE4", letterSpacing: "-.03em", marginBottom: "3rem" }}>
      Start<br />
      <em style={{ color: "#8B1A1A", fontStyle: "italic" }}>Here</em>
    </h1>
    <p style={{ fontSize: "clamp(.95rem,1.5vw,1.1rem)", color: "rgba(242,237,228,.6)", lineHeight: 1.85, maxWidth: "46ch", fontWeight: 300 }}>
      Half a Life is a philosophy, a body of work, and a community. Find the right path in — based on where you are right now, not where you think you should be.
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginTop: "3rem" }}>
      <a href="#find-path" style={{ display: "inline-flex", alignItems: "center", gap: ".6rem", padding: ".85rem 2.2rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 3, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}
        onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#A82020"}
        onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8B1A1A"}>
        Find Your Path
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
      </a>
      <span style={{ fontSize: ".75rem", color: "rgba(242,237,228,.3)", letterSpacing: ".05em" }}>or scroll to explore</span>
    </div>
  </div>
</div>

      {/* Find your path */}
   {/* ══ FIND YOUR PATH — Mel Robbins inspired ══════════════ */}
<section id="find-path" style={{ background: "#0D0D0D", padding: "6rem 2.5rem" }}>
  <div style={{ maxWidth: 1100, margin: "0 auto" }}>

    {/* Section header */}
    <div style={{ marginBottom: "4rem" }}>
      <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.2rem" }}>Find Your Path</p>
      <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem,6vw,5.5rem)", fontWeight: 400, lineHeight: .95, color: "#F2EDE4", letterSpacing: "-.02em" }}>
        Where are you<br /><em style={{ color: "#8B1A1A", fontStyle: "italic" }}>right now?</em>
      </h2>
      <p style={{ fontSize: "1rem", color: "rgba(242,237,228,.5)", lineHeight: 1.7, maxWidth: "44ch", marginTop: "1.2rem", fontWeight: 300 }}>
        Different seasons call for different wisdom. Choose what speaks to your moment.
      </p>
    </div>

    {/* Path cards — stacked list style like Mel Robbins */}
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {paths.map((path, i) => (
        <Link key={i} href={path.href}
          style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "2rem", padding: "2rem 0", borderTop: "1px solid rgba(255,255,255,.08)", textDecoration: "none", transition: "background .2s", borderRadius: i === 0 ? "8px 8px 0 0" : i === paths.length - 1 ? "0 0 8px 8px" : 0 }}
          onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "1rem"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,.06)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "0"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2rem" }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 400, color: "#F2EDE4", lineHeight: 1.2, flex: "0 0 auto", minWidth: "clamp(220px,30vw,340px)" }}>{path.title}</span>
            <span style={{ fontSize: ".85rem", color: "rgba(242,237,228,.45)", lineHeight: 1.7, fontWeight: 300 }}>{path.desc}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem", whiteSpace: "nowrap", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#8B1A1A", fontWeight: 600 }}>{path.cta.replace(" →", "")}</span>
            <span style={{ color: "#8B1A1A", fontSize: "1.1rem", lineHeight: 1 }}>→</span>
          </div>
        </Link>
      ))}
      {/* Bottom border */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.08)" }} />
    </div>

  </div>
</section>


      {/* Three places to begin */}
      <section style={{ background: "#0D0D0D", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem" }}>Recommended Starting Points</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#F2EDE4", marginBottom: "3rem" }}>Three places to begin</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
            {startingPoints.map(sp => (
              <div key={sp.title} style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "2.2rem" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".6rem" }}>{sp.type}</p>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 400, color: "#F2EDE4", marginBottom: ".7rem" }}>{sp.title}</h3>
                <p style={{ fontSize: ".82rem", color: "rgba(242,237,228,.55)", lineHeight: 1.8, marginBottom: "1.5rem", fontWeight: 300 }}>{sp.desc}</p>
                <Link href={sp.href} style={{ display: "inline-block", padding: ".6rem 1.4rem", background: "rgba(139,26,26,.15)", color: "#F2EDE4", borderRadius: 6, fontSize: ".75rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none", border: "1px solid rgba(139,26,26,.3)", transition: "background .2s" }}
                  onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,.3)"}
                  onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,.15)"}>
                  {sp.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suggested sequence */}
      <section style={{ background: "#F2EDE4", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#9A9080", marginBottom: ".75rem" }}>Suggested Sequence</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#0D0D0D", marginBottom: "3rem" }}>A suggested starting sequence</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sequence.map((step, i) => (
              <div key={step.num} style={{ display: "flex", gap: "1.8rem", alignItems: "flex-start", padding: "1.8rem 0", borderBottom: i < sequence.length - 1 ? "1px solid #D9CEBD" : "none" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #D9CEBD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--serif)", fontSize: "1rem", color: "#8B1A1A", fontWeight: 400 }}>{step.num}</div>
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".4rem" }}>{step.title}</h3>
                  <p style={{ fontSize: ".85rem", color: "#9A9080", lineHeight: 1.75 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section style={{ background: "#8B1A1A", padding: "5rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#F2EDE4", marginBottom: "1rem" }}>Begin your Half a Life journey</h2>
          <p style={{ fontSize: ".9rem", color: "rgba(242,237,228,.8)", lineHeight: 1.8, marginBottom: "2rem" }}>Weekly ideas for living a fuller life — delivered every week to your inbox, free.</p>
          <Link href="/newsletter" style={{ display: "inline-block", padding: ".9rem 2.5rem", background: "#F2EDE4", color: "#8B1A1A", borderRadius: 999, fontSize: ".82rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}>Join the Newsletter →</Link>
        </div>
      </section>

      <style>{`@media(max-width:768px){.paths-grid{grid-template-columns:1fr!important;}}`}</style>
    </>
  );
}
