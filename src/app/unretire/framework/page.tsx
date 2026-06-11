"use client";
import Link from "next/link";
import { useState } from "react";

const mindsets = [
  { num: "01", title: "Freedom", color: "#8B1A1A", quote: "I now have the freedom to shape life on my terms.", desc: "For decades, calendars dictated rhythm, titles defined identity, and deadlines created urgency. Freedom at this stage is not withdrawal — it is authorship." },
  { num: "02", title: "Evolution", color: "#2A4A6A", quote: "My identity is evolving — not ending.", desc: "Instead of asking 'Who was I?' begin asking 'Who am I becoming?' Evolution is not dramatic reinvention. Your experience is foundation — not ceiling." },
  { num: "03", title: "Balance", color: "#2A5A3A", quote: "I design my days with intention and harmony.", desc: "Balance is not about equal time on everything. It's about conscious attention to all seven dimensions of life — not just the ones that shout loudest." },
  { num: "04", title: "Relevance", color: "#5A3A1A", quote: "I don't have an expiry date.", desc: "You are not less relevant because you are no longer busy. Relevance in this chapter is about contribution — not title, position, or pace." },
  { num: "05", title: "Joy", color: "#4A2A5A", quote: "Curiosity and play are essential, not optional.", desc: "Joy is not a reward for completing your obligations. It is a practice — as serious and as necessary as any other dimension of a well-lived life." },
];

const practices = [
  { title: "Ignite", icon: "✦", desc: "Reignite your curiosity, creativity, and sense of aliveness.", href: "/unretire/framework/practice-ignite" },
  { title: "Move", icon: "◈", desc: "Build a body that supports the life you want to live.", href: "/unretire/framework/practice-move" },
  { title: "Connect", icon: "◎", desc: "Deepen the relationships that truly matter.", href: "/unretire/framework/practice-connect" },
  { title: "Contribute", icon: "◆", desc: "Find your way of giving back with lasting impact.", href: "/unretire/framework/practice-contribute" },
  { title: "Explore", icon: "◉", desc: "Embrace discovery — inward and outward.", href: "/unretire/framework/practice-explore" },
  { title: "Grow", icon: "▲", desc: "Keep learning, stretching, and becoming.", href: "/unretire/framework/practice-grow" },
  { title: "Optimise", icon: "◐", desc: "Design your days, energy, and environment intentionally.", href: "/unretire/framework/practice-optimize" },
];

export default function FrameworkPage() {
  const [activeM, setActiveM] = useState<number | null>(null);

  return (
    <>
      {/* ── HERO ─────────────────────────── */}
      <div style={{ background: "linear-gradient(145deg,#0D0807 0%,#1A0F08 100%)", paddingTop: "calc(70px + 4rem)", paddingBottom: "5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 50%, rgba(139,26,26,.1) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem", position: "relative", zIndex: 2 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".28em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
            <span style={{ display: "inline-block", width: 28, height: 1, background: "#8B1A1A" }} />
            The (Un)Retire Framework
          </p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem,7vw,6rem)", fontWeight: 400, color: "#F2EDE4", lineHeight: .95, marginBottom: "1.5rem", letterSpacing: "-.02em" }}>
            Mindset <em style={{ color: "#8B1A1A", fontStyle: "normal" }}>×</em> Practice
          </h1>
          <div style={{ width: 1, height: 56, background: "linear-gradient(to bottom, rgba(139,26,26,.7), transparent)", marginBottom: "1.5rem" }} />
          <p style={{ fontSize: "1rem", color: "rgba(242,237,228,.55)", lineHeight: 1.85, maxWidth: "52ch", fontWeight: 300 }}>
            Living fully is like building a bridge: your mindset is the foundation, and your daily practices are the bricks that hold it up. Without both, the structure doesn&apos;t stand.
          </p>
        </div>
      </div>

      {/* ── CORE EQUATION — cream ────────── */}
      <section style={{ background: "#F2EDE4", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem" }}>The Model</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 400, color: "#0D0D0D", lineHeight: 1.15, marginBottom: "1.2rem" }}>How the Framework Works</h2>
            <p style={{ fontSize: ".9rem", color: "#5C5248", lineHeight: 1.9, fontWeight: 300, marginBottom: "1rem" }}>When Maher stepped away from his corporate roles, he realised something important: retirement doesn&apos;t magically become meaningful. You have to create meaning through both mindset and action.</p>
            <p style={{ fontSize: ".9rem", color: "#5C5248", lineHeight: 1.9, fontWeight: 300 }}>Over decades of experience, he developed a simple but life-changing formula: <strong style={{ color: "#0D0D0D" }}>(Un)Retire = Empowered Mindset × Intentional Practice.</strong></p>
          </div>
          {/* Equation card */}
          <div style={{ background: "#0D0807", borderRadius: 16, padding: "3rem", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "2rem" }}>The Core Equation</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "3.2rem", color: "#F2EDE4", fontWeight: 400, lineHeight: 1 }}>Mindset</p>
            <p style={{ fontSize: "3rem", color: "#8B1A1A", margin: ".4rem 0", fontWeight: 700, lineHeight: 1 }}>×</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "3.2rem", color: "#F2EDE4", fontWeight: 400, lineHeight: 1 }}>Practice</p>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,.15)", margin: "2rem auto 1.2rem" }} />
            <p style={{ fontSize: ".78rem", color: "rgba(242,237,228,.45)", lineHeight: 1.85, fontWeight: 300 }}>Neither works alone. Each amplifies the other — raising the quality of your entire life design.</p>
          </div>
        </div>
      </section>

      {/* ── 5 MINDSETS — dark ────────────── */}
      <section style={{ background: "#0D0807", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
            Five Mindsets
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
          </p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 400, color: "#F2EDE4", textAlign: "center", marginBottom: ".6rem" }}>The Five (Un)Retire Mindsets</h2>
          <p style={{ fontSize: ".88rem", color: "rgba(242,237,228,.4)", textAlign: "center", marginBottom: "3.5rem", maxWidth: "52ch", margin: "0 auto 3.5rem" }}>Transformational belief shifts that unlock your ability to live fully in this new chapter.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,.04)", borderRadius: 14, overflow: "hidden" }}>
            {mindsets.map((m, i) => (
              <div key={m.num}
                style={{ background: activeM === i ? "#1A0F08" : "#0D0807", padding: "2rem 2.5rem", cursor: "pointer", transition: "background .2s", borderLeft: `3px solid ${activeM === i ? m.color : "transparent"}`, display: "grid", gridTemplateColumns: "56px 1fr 1fr", gap: "2rem", alignItems: "center" }}
                onClick={() => setActiveM(activeM === i ? null : i)}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", fontWeight: 300, color: activeM === i ? m.color : "rgba(255,255,255,.1)", lineHeight: 1, transition: "color .2s" }}>{m.num}</div>
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 400, color: "#F2EDE4", marginBottom: ".3rem" }}>{m.title}</h3>
                  <p style={{ fontFamily: "var(--serif)", fontSize: ".88rem", color: activeM === i ? m.color : "rgba(242,237,228,.3)", fontStyle: "italic", transition: "color .2s" }}>&ldquo;{m.quote}&rdquo;</p>
                </div>
                <p style={{ fontSize: ".85rem", color: activeM === i ? "rgba(242,237,228,.75)" : "rgba(242,237,228,.35)", lineHeight: 1.8, transition: "color .2s" }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: ".72rem", color: "rgba(242,237,228,.25)", marginTop: "1.2rem", fontFamily: "var(--mono)", letterSpacing: ".1em" }}>Click any mindset to highlight it</p>
        </div>
      </section>

      {/* ── 7 PRACTICES — cream ──────────── */}
      <section style={{ background: "#EDE8DF", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <span style={{ flex: 1, height: 1, background: "#D9CEBD" }} />
            Seven Practices
            <span style={{ flex: 1, height: 1, background: "#D9CEBD" }} />
          </p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 400, color: "#0D0D0D", textAlign: "center", marginBottom: ".6rem" }}>The Seven Daily Practices</h2>
          <p style={{ fontSize: ".88rem", color: "#9A9080", textAlign: "center", maxWidth: "52ch", margin: "0 auto 3.5rem" }}>Each practice is paired with a concrete action step — because growth comes from doing, not reading.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
            {practices.map((p, i) => (
              <Link key={p.title} href={p.href}
                style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 12, padding: "1.8rem", textDecoration: "none", transition: "all .2s", display: "block", position: "relative", overflow: "hidden" }}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#8B1A1A"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.1)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#D9CEBD"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "#D9CEBD", marginBottom: ".8rem", lineHeight: 1 }}>{p.icon}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".5rem" }}>{p.title}</h3>
                <p style={{ fontSize: ".78rem", color: "#9A9080", lineHeight: 1.7, marginBottom: "1rem" }}>{p.desc}</p>
                <span style={{ fontSize: ".7rem", fontWeight: 600, color: "#8B1A1A", fontFamily: "var(--mono)", letterSpacing: ".08em" }}>Explore →</span>
              </Link>
            ))}
            {/* CTA card */}
            <div style={{ background: "#0D0807", borderRadius: 12, padding: "1.8rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1rem", color: "#F2EDE4", fontWeight: 300, lineHeight: 1.6, marginBottom: "1.2rem" }}>Ready to put the framework into practice?</p>
              <Link href="/unretire/book" style={{ fontSize: ".72rem", fontWeight: 600, color: "#8B1A1A", textDecoration: "none", fontFamily: "var(--mono)", letterSpacing: ".08em" }}>Get the Book →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────── */}
      <section style={{ background: "#8B1A1A", padding: "5rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#F2EDE4", marginBottom: "1rem" }}>Start designing your next chapter</h2>
          <p style={{ fontSize: ".9rem", color: "rgba(242,237,228,.75)", lineHeight: 1.8, marginBottom: "2rem", fontWeight: 300 }}>The full framework — 5 mindsets, 7 practices, and the 14-day starter plan — lives in the book.</p>
          <Link href="/unretire/book" style={{ display: "inline-block", padding: ".9rem 2.5rem", background: "#F2EDE4", color: "#8B1A1A", borderRadius: 3, fontSize: ".82rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}>Get UnRetire →</Link>
        </div>
      </section>
    </>
  );
}
