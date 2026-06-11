"use client";
import Link from "next/link";
import Image from "next/image";
const framework = [
  { title: "Resilience", desc: "Weathering the storms of adversity. Resilience is not the absence of pain — it's the presence of the right practices and perspective while in pain." },
  { title: "Faith & Belief", desc: "Grounded in belief. The spiritual and philosophical foundations that give adversity meaning and allow healing to begin." },
  { title: "Gratitude", desc: "In the darkest moments, gratitude became Maher's anchor. This section shows how to cultivate it as a daily practice, not a feel-good abstraction." },
  { title: "Community", desc: "Support is not weakness — it is the single most reliable predictor of resilience. This section explores how to build and lean on genuine community in hard times." },
];

const ideas = [
  { num: "01", text: "Every challenge holds a hidden opportunity — a chance to grow, dig deep, and emerge transformed. Adversity is not a dead end. It is a doorway." },
  { num: "02", text: "Post-traumatic growth is real. What if every hardship has been leading you toward the greatest version of yourself? Active engagement — not passive endurance — is the key." },
  { num: "03", text: "The question after every setback is not 'how do I get back?' but 'who am I becoming through this?' Bouncing forward is about evolving, not returning." },
  { num: "04", text: "Unconditional giving doesn't just help the recipient; it elevates you, creating a cycle of purpose and fulfillment. Grief, met with purpose, becomes a catalyst for change." },
  { num: "05", text: "This is not a strict blueprint but a flexible compass. The approach is deeply personal — designed to assist you in charting your own course through life's challenges." },
  { num: "06", text: "Fostering strength from Hikmat's legacy — the book honors loss as something sacred while transforming it into a foundation for a life of greater purpose and meaning." },
];

const chapters = [
  { label: "Foreword & Intro", title: "Welcome to Bouncing Forward" },
  { label: "From the Author", title: "Transforming Grief into Purpose" },
  { label: "Chapter 1", title: "The Pillars That Propel You Beyond Recovery" },
  { label: "Chapter 2", title: "The 4-Element Framework to Bounce Forward" },
  { label: "Element 1", title: "Resilience – Weathering the Storms" },
  { label: "Reflection", title: "Embrace Challenges as Pathways to Growth" },
  { label: "Reflection", title: "Value the Power of Community in Healing" },
  { label: "Closing", title: "Fostering Strength from Hikmat's Legacy" },
];

const resources = [
  { type: "Podcast", title: "How Setbacks Become Springboards", desc: "The companion conversation to this book — on turning life's hardest moments into its most defining ones.", cta: "Listen now", href: "/articles" },
  { type: "Tool", title: "Bounce Forward Scorecard", desc: "Measure your resilience across the four elements and identify exactly where to focus your rebuilding.", cta: "Take it now", href: "/articles" },
  { type: "Journey", title: "Recovering from a Setback", desc: "A compassionate guided pathway for those rising from loss, failure, or adversity.", cta: "Start journey", href: "/articles" },
];

export default function BouncingForwardPage() {
  return (
    <>
      {/* Dark Hero */}
      <div style={{ background: "linear-gradient(160deg,#1C1917 0%,#0D0D0D 100%)", paddingTop: "calc(var(--topnav-h) + 3rem)", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem" }}>
          <Link href="/books" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "rgba(242,237,228,.4)", marginBottom: "2rem", textDecoration: "none", transition: "color .18s" }}
            onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.75)"}
            onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.4)"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            All Books
          </Link>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "15rem", alignItems: "center" }}>
            {/* Book cover */}
              <Image src="/assets/images/2.png" alt="Bouncing Forward" width={185} height={262}  />
            <div>
              <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem" }}>Bounce Forward · Resilience</p>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.4rem,5vw,4.4rem)", fontWeight: 300, color: "#F2EDE4", lineHeight: 1.05, marginBottom: ".5rem" }}>Bouncing Forward</h1>
              <p style={{ fontSize: ".9rem", color: "rgba(242,237,228,.45)", fontStyle: "italic", fontFamily: "var(--serif)", marginBottom: "1.2rem" }}>By Maher Kaddoura — Dedicated in memory of his son Hikmat</p>
              <p style={{ fontSize: "1rem", color: "rgba(242,237,228,.72)", fontWeight: 300, lineHeight: 1.85, maxWidth: "48ch", marginBottom: "2rem" }}>Born from the most personal of losses — the death of his son Hikmat — this book is Maher Kaddoura's gift to anyone navigating devastation. It teaches you not just to survive adversity, but to emerge from it stronger, wiser, and more fully yourself. Not bouncing back. Bouncing forward.</p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <a href="https://www.amazon.com/s?k=Bouncing+Forward+Maher+Kaddoura" target="_blank" rel="noopener noreferrer"
                  style={{ padding: ".75rem 2rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 4, fontSize: ".8rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}
                  onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#A82020"}
                  onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8B1A1A"}>
                  Get the Book
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why it matters */}
      <section style={{ background: "#F2EDE4", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ paddingBottom: "3rem", borderBottom: "1px solid #D9CEBD", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 400, color: "#0D0D0D", marginBottom: "1rem" }}>Why this book matters</h2>
            <p style={{ fontSize: ".9rem", color: "#5C5248", lineHeight: 1.9, maxWidth: "68ch" }}>On a quiet night in January 2008, Maher Kaddoura received a call that changed everything. His son Hikmat, in the prime of his youth, had been struck by a car in Amman. Three days later, Hikmat was gone. In that void, Maher discovered something he had never been taught — how to face tragedy head-on. Gratitude became his anchor. Faith became his ground. And from that darkness, he didn't just bounce back. He bounced forward. <em>Bouncing Forward</em> is not theory. It's hard-won truth offered as a compass for anyone navigating life's storms.</p>
          </div>

          {/* 4-Element Framework */}
          <div style={{ paddingBottom: "3rem", borderBottom: "1px solid #D9CEBD", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".6rem" }}>The 4-Element Framework</h2>
            <p style={{ fontSize: ".86rem", color: "#9A9080", marginBottom: "1.8rem", maxWidth: "60ch" }}>At the heart of the book is a proven four-element framework for rising through adversity — not around it.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {framework.map(f => (
                <div key={f.title} style={{ background: "#EDE8DF", border: "1px solid #D9CEBD", borderRadius: 10, padding: "1.6rem" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 300, color: "#8B1A1A", marginBottom: ".5rem" }}>{f.title}</div>
                  <p style={{ fontSize: ".82rem", color: "#5C5248", lineHeight: 1.75, fontWeight: 300 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key ideas */}
          <div style={{ paddingBottom: "3rem", borderBottom: "1px solid #D9CEBD", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 400, color: "#0D0D0D", marginBottom: "1.5rem" }}>Key ideas</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
              {ideas.map(idea => (
                <div key={idea.num} style={{ background: "#EDE8DF", border: "1px solid #D9CEBD", borderRadius: 10, padding: "1.6rem" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 300, color: "#D9CEBD", marginBottom: ".5rem" }}>{idea.num}</div>
                  <p style={{ fontSize: ".82rem", color: "#5C5248", lineHeight: 1.75, fontWeight: 300 }}>{idea.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div style={{ paddingBottom: "3rem", borderBottom: "1px solid #D9CEBD", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".5rem" }}>Book Contents</h2>
            <p style={{ fontSize: ".86rem", color: "#9A9080", marginBottom: "1.5rem" }}>Each chapter is paired with companion podcast episodes, tools, and reflection worksheets.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
              {chapters.map((ch, i) => (
                <div key={i} style={{ border: "1px solid #D9CEBD", borderRadius: 8, padding: "1.1rem", fontSize: ".82rem", cursor: "pointer", transition: "border-color .2s, background .2s", background: "#fff" }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#8B1A1A"; (e.currentTarget as HTMLDivElement).style.background = "#FAF8F4"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#D9CEBD"; (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}>
                  <div style={{ fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#9A9080", marginBottom: ".3rem" }}>{ch.label}</div>
                  <div style={{ color: "#0D0D0D", lineHeight: 1.4 }}>{ch.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 400, color: "#0D0D0D", marginBottom: "1.5rem" }}>Companion Resources</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
              {resources.map(r => (
                <div key={r.title} style={{ padding: "1.6rem", border: "1px solid #D9CEBD", borderRadius: 10, background: "#EDE8DF" }}>
                  <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".15em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".5rem" }}>{r.type}</p>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".4rem" }}>{r.title}</h3>
                  <p style={{ fontSize: ".78rem", color: "#9A9080", lineHeight: 1.7, marginBottom: "1rem", fontWeight: 300 }}>{r.desc}</p>
                  <Link href={r.href} style={{ fontSize: ".75rem", fontWeight: 600, color: "#8B1A1A", textDecoration: "none" }}>{r.cta} →</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#0D0D0D", padding: "5rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 400, color: "#F2EDE4", marginBottom: "1rem" }}>Get Your Copy</h2>
          <p style={{ fontSize: ".9rem", color: "rgba(242,237,228,.55)", marginBottom: "2rem", lineHeight: 1.8 }}>Available on Amazon worldwide.</p>
          <a href="https://www.amazon.com/s?k=Bouncing+Forward+Maher+Kaddoura" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", padding: ".9rem 2.5rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 4, fontSize: ".82rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}>
            Buy on Amazon →
          </a>
        </div>
      </section>
    </>
  );
}
