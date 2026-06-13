"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const paths = [
  { title: "I'm entering a new chapter", desc: "Retirement, career shift, major transition — you're at a threshold and want to cross it with intention.", cta: "Start with UnRetire", href: "/unretire", color: "#8B1A1A", icon: "◈" },
  { title: "I'm recovering from a setback", desc: "Loss, failure, grief — life has knocked you back. The question is how you rise and what you build.", cta: "Start with Bouncing Forward", href: "/books/bouncing-forward", color: "#2A4A6A", icon: "◎" },
  { title: "I want more adventure and aliveness", desc: "Something in you is restless, hungry for more. You want a bigger, braver, more fully-felt life.", cta: "Start with The Adventure Way", href: "/books/33-under-33", color: "#2A5A3A", icon: "◆" },
  { title: "I'm looking for more meaning", desc: "The external markers are in place, but something feels hollow. You're ready for a deeper conversation.", cta: "Explore Articles", href: "/articles", color: "#4A3A6A", icon: "✦" },
  { title: "Make the second half count", desc: "You've lived enough to know what matters. Now you want to live it fully — with energy and purpose.", cta: "Explore the Books", href: "/books", color: "#5A3A1A", icon: "▲" },
  { title: "Help me find my path", desc: "Not sure where to start? Browse all books, tools, and journeys — or let the articles guide you.", cta: "Browse Everything", href: "/books", color: "#1A3A4A", icon: "◐" },
];

const startingPoints = [
  { type: "Book", title: "UnRetire", desc: "If you're standing at any threshold, this is the clearest place to start. Reinvention, intention, and the courage to begin again.", cta: "Learn More", href: "/unretire", bg: "linear-gradient(135deg,#1a0807,#2a1008)" },
  { type: "Articles", title: "Essays & Reflections", desc: "Start with 'The Courage to Begin Again' — an essay that sets the tone for everything Half a Life stands for.", cta: "Read Articles", href: "/articles", bg: "linear-gradient(135deg,#0a1020,#121830)" },
  { type: "Newsletter", title: "The Half a Life Letter", desc: "Weekly ideas for living a fuller life. Join 2,000+ people navigating change with intention.", cta: "Subscribe Free", href: "/newsletter", bg: "linear-gradient(135deg,#0a1a10,#122018)" },
];

// Simple intersection observer hook for scroll animations
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

export default function StartHerePage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [hoveredSp, setHoveredSp] = useState<number | null>(null);

  return (
    <>
      {/* Hero — unchanged */}
      <div style={{ background: "#0D0D0D", paddingTop: "calc(var(--topnav-h) + 4rem)", minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 60%, rgba(139,26,26,.18) 0%, transparent 55%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "-2vw", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--serif)", fontSize: "clamp(260px,35vw,480px)", fontWeight: 700, color: "rgba(139,26,26,.06)", lineHeight: 1, letterSpacing: "-.04em", userSelect: "none", pointerEvents: "none" }}>Here</div>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2.5rem", position: "relative", zIndex: 2, width: "100%" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".35em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "2rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
            <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />Your Entry Point
          </p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(5rem,12vw,10rem)", fontWeight: 400, lineHeight: .88, color: "#F2EDE4", letterSpacing: "-.03em", marginBottom: "3rem" }}>
            Start<br /><em style={{ color: "#8B1A1A", fontStyle: "italic" }}>Here</em>
          </h1>
          <div style={{ width: 1, height: 80, background: "linear-gradient(to bottom, #8B1A1A, transparent)", marginBottom: "2.5rem" }} />
          <p style={{ fontSize: "clamp(.95rem,1.5vw,1.1rem)", color: "rgba(242,237,228,.6)", lineHeight: 1.85, maxWidth: "46ch", fontWeight: 300 }}>
            Half a Life is a philosophy, a body of work, and a community. Find the right path in — based on where you are right now.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginTop: "3rem" }}>
            <a href="#find-path" style={{ display: "inline-flex", alignItems: "center", gap: ".6rem", padding: ".85rem 2.2rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 3, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none" }}>
              Find Your Path
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── FIND YOUR PATH ── */}
      <section id="find-path" style={{ background: "#0D0D0D", padding: "7rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />Find Your Path
            </p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 400, lineHeight: .95, color: "#F2EDE4", letterSpacing: "-.02em", marginBottom: "1.2rem" }}>
              Where are you<br /><em style={{ color: "#8B1A1A", fontStyle: "italic" }}>right now?</em>
            </h2>
            <p style={{ fontSize: ".95rem", color: "rgba(242,237,228,.45)", lineHeight: 1.8, maxWidth: "46ch", marginBottom: "4rem", fontWeight: 300 }}>
              Different seasons call for different wisdom. Choose what speaks to your moment.
            </p>
          </FadeIn>

          {/* Path cards — 2 col grid, dark editorial */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(255,255,255,.06)", borderRadius: 16, overflow: "hidden" }}>
            {paths.map((path, i) => (
              <FadeIn key={i} delay={i * 80}>
                <Link href={path.href}
                  style={{ display: "block", height: "100%", background: hovered === i ? "#111" : "#0D0D0D", padding: "2.8rem", textDecoration: "none", transition: "background .22s", borderLeft: hovered === i ? `3px solid ${path.color}` : "3px solid transparent", position: "relative", overflow: "hidden" }}
                  onMouseOver={() => setHovered(i)}
                  onMouseOut={() => setHovered(null)}>
                  {/* Icon */}
                  <div style={{ fontSize: "1.6rem", color: hovered === i ? path.color : "rgba(255,255,255,.12)", marginBottom: "1.5rem", transition: "color .22s", lineHeight: 1 }}>{path.icon}</div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.1rem,1.8vw,1.5rem)", fontWeight: 400, color: "#F2EDE4", lineHeight: 1.25, marginBottom: ".8rem" }}>{path.title}</h3>
                  <p style={{ fontSize: ".82rem", color: "rgba(242,237,228,.45)", lineHeight: 1.85, marginBottom: "1.5rem", fontWeight: 300 }}>{path.desc}</p>
                  {/* CTA */}
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem", opacity: hovered === i ? 1 : 0.4, transition: "opacity .22s" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: path.color, fontWeight: 600 }}>{path.cta}</span>
                    <span style={{ color: path.color, fontSize: ".9rem" }}>→</span>
                  </div>
                  {/* Bottom accent line */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: path.color, transform: hovered === i ? "scaleX(1)" : "scaleX(0)", transition: "transform .3s ease", transformOrigin: "left" }} />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE PLACES TO BEGIN ── */}
      <section style={{ background: "#F2EDE4", padding: "7rem 2.5rem", borderBottom: "1px solid #D9CEBD" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#9A9080", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "#D9CEBD" }} />Recommended Starting Points
            </p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 400, lineHeight: .95, color: "#0D0D0D", letterSpacing: "-.02em", marginBottom: "4rem" }}>
              Three places<br />to <em style={{ color: "#8B1A1A", fontStyle: "italic" }}>begin</em>
            </h2>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
            {startingPoints.map((sp, i) => (
              <FadeIn key={sp.title} delay={i * 100}>
                <div
                  style={{ background: hoveredSp === i ? "#fff" : "#EDE8DF", border: `1.5px solid ${hoveredSp === i ? "#8B1A1A" : "#D9CEBD"}`, borderRadius: 16, overflow: "hidden", transition: "all .25s", transform: hoveredSp === i ? "translateY(-6px)" : "translateY(0)", boxShadow: hoveredSp === i ? "0 20px 56px rgba(0,0,0,.12)" : "0 2px 12px rgba(0,0,0,.04)", height: "100%", display: "flex", flexDirection: "column" }}
                  onMouseOver={() => setHoveredSp(i)}
                  onMouseOut={() => setHoveredSp(null)}>
                  {/* Top accent bar with gradient */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, #8B1A1A, rgba(139,26,26,.3))`, opacity: hoveredSp === i ? 1 : 0, transition: "opacity .25s" }} />
                  <div style={{ padding: "2.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1rem" }}>{sp.type}</p>
                    <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".8rem", lineHeight: 1.2 }}>{sp.title}</h3>
                    <p style={{ fontSize: ".85rem", color: "#5C5248", lineHeight: 1.85, marginBottom: "2rem", fontWeight: 300, flex: 1 }}>{sp.desc}</p>
                    <Link href={sp.href}
                      style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", padding: ".75rem 1.6rem", background: hoveredSp === i ? "#8B1A1A" : "#0D0D0D", color: "#F2EDE4", borderRadius: 4, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none", transition: "background .22s", alignSelf: "flex-start" }}>
                      {sp.cta} →
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Suggested sequence — unchanged */}
      <section style={{ background: "#0D0D0D", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem" }}>Suggested Sequence</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#F2EDE4", marginBottom: "3rem" }}>A suggested starting sequence</h2>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { num: "1", title: "Choose your moment", desc: "Find the path above that speaks to where you are right now — not where you think you should be." },
              { num: "2", title: "Pick your first book", desc: "Based on your moment — reinvention, resilience, aliveness, or meaning — pick the book that speaks directly to you." },
              { num: "3", title: "Read one article", desc: "Browse the articles section and find one essay that names exactly what you're feeling. Start there." },
              { num: "4", title: "Subscribe to weekly ideas", desc: "Stay in the conversation. Weekly essays and reflections keep the philosophy alive in everyday life." },
              { num: "5", title: "Come back often", desc: "Half a Life is not a single book or a course. It's a body of work you return to across different seasons." },
            ].map((step, i) => (
              <FadeIn key={step.num} delay={i * 80}>
                <div style={{ display: "flex", gap: "1.8rem", alignItems: "flex-start", padding: "2rem 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid rgba(139,26,26,.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--serif)", fontSize: "1rem", color: "#8B1A1A", fontWeight: 400 }}>{step.num}</div>
                  <div>
                    <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 400, color: "#F2EDE4", marginBottom: ".4rem" }}>{step.title}</h3>
                    <p style={{ fontSize: ".85rem", color: "rgba(242,237,228,.45)", lineHeight: 1.75 }}>{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
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

      <style>{`
        @media(max-width:768px){
          #find-path > div > div:last-child { grid-template-columns: 1fr !important; }
          section > div > div[style*="repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
