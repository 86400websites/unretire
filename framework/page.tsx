import Link from "next/link";

const mindsets = [
  { num: "01", title: "Freedom", quote: "I now have the freedom to shape life on my terms.", desc: "For decades, calendars dictated rhythm, titles defined identity, and deadlines created urgency. Freedom at this stage is not withdrawal — it is authorship." },
  { num: "02", title: "Evolution", quote: "My identity is evolving — not ending.", desc: "Instead of asking 'Who was I?' begin asking 'Who am I becoming?' Evolution is not dramatic reinvention. Your experience is foundation — not ceiling." },
  { num: "03", title: "Balance", quote: "I design my days with intention and harmony.", desc: "Balance is not about equal time on everything. It's about conscious attention to all seven dimensions of life — not just the ones that shout loudest." },
  { num: "04", title: "Relevance", quote: "I don't have an expiry date.", desc: "You are not less relevant because you are no longer busy. Relevance in this chapter is about contribution — not title, position, or pace." },
  { num: "05", title: "Joy", quote: "Curiosity and play are essential, not optional.", desc: "Joy is not a reward for completing your obligations. It is a practice — as serious and as necessary as any other dimension of a well-lived life." },
];

const practices = [
  { title: "Ignite", desc: "Reignite your curiosity, creativity, and sense of aliveness.", href: "/unretire/framework/practice-ignite" },
  { title: "Move", desc: "Build a body that supports the life you want to live.", href: "/unretire/framework/practice-move" },
  { title: "Connect", desc: "Deepen the relationships that truly matter.", href: "/unretire/framework/practice-connect" },
  { title: "Contribute", desc: "Find your way of giving back with lasting impact.", href: "/unretire/framework/practice-contribute" },
  { title: "Explore", desc: "Embrace discovery — inward and outward.", href: "/unretire/framework/practice-explore" },
  { title: "Grow", desc: "Keep learning, stretching, and becoming.", href: "/unretire/framework/practice-grow" },
  { title: "Optimise", desc: "Design your days, energy, and environment intentionally.", href: "/unretire/framework/practice-optimize" },
];

export default function FrameworkPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#0D0807 0%,#111108 100%)", paddingTop: "calc(98px + 3rem)", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", marginBottom: "1rem" }}>The (Un)Retire Framework</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 500, color: "#F2EDE4", lineHeight: 1.1, marginBottom: "1.2rem" }}>Mindset <span style={{ color: "#7A3A28" }}>×</span> Practice</h1>
          <p style={{ fontSize: ".95rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, maxWidth: "60ch", fontWeight: 300 }}>Living fully is like building a bridge: your mindset is the foundation, and your daily practices are the bricks that hold it up. Without both, the structure doesn&apos;t stand.</p>
        </div>
      </div>

      {/* Core equation */}
      <section style={{ background: "#0D0807", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#7A3A28", marginBottom: ".75rem" }}>The Model</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 500, color: "#F2EDE4", lineHeight: 1.15, marginBottom: "1.2rem" }}>How the Framework Works</h2>
            <p style={{ fontSize: ".9rem", color: "rgba(242,237,228,.65)", lineHeight: 1.9, fontWeight: 300, marginBottom: "1rem" }}>When Maher stepped away from his corporate roles, he realised something important: retirement doesn&apos;t magically become meaningful. You have to create meaning through both mindset and action.</p>
            <p style={{ fontSize: ".9rem", color: "rgba(242,237,228,.65)", lineHeight: 1.9, fontWeight: 300 }}>Over decades of experience, he developed a simple but life-changing formula: <strong style={{ color: "#F2EDE4" }}>(Un)Retire = Empowered Mindset × Intentional Practice.</strong> The real shift happens when the two move together.</p>
          </div>
          <div style={{ background: "#111108", borderRadius: 14, padding: "3rem", textAlign: "center", border: "1px solid rgba(255,255,255,.07)" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#7A3A28", marginBottom: "1.5rem" }}>The Core Equation</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "3rem", color: "#F2EDE4", fontWeight: 400, lineHeight: 1 }}>Mindset</p>
            <p style={{ fontSize: "2.5rem", color: "#7A3A28", margin: ".3rem 0", fontWeight: 700 }}>×</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "3rem", color: "#F2EDE4", fontWeight: 400, lineHeight: 1 }}>Practice</p>
            <p style={{ fontSize: ".78rem", color: "rgba(242,237,228,.55)", margin: "1.5rem 0 0", lineHeight: 1.85, fontWeight: 300 }}>Neither works alone. The multiplication means each amplifies the other — raising the quality of your entire life design.</p>
          </div>
        </div>
      </section>

      {/* 5 Mindsets */}
      <section style={{ background: "#EDE8DF", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#7A3A28", marginBottom: ".75rem", textAlign: "center" }}>Five Mindsets</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 400, color: "#0D0D0D", textAlign: "center", marginBottom: ".75rem" }}>The Five (Un)Retire Mindsets</h2>
          <p style={{ fontSize: ".88rem", color: "#9A9080", textAlign: "center", marginBottom: "3rem", maxWidth: "52ch", margin: "0 auto 3rem" }}>These aren&apos;t motivational slogans. They are transformational belief shifts that unlock your ability to live fully in this new chapter.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {mindsets.map(m => (
              <div key={m.num} style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 12, padding: "2rem 2.5rem", display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: "2rem", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", fontWeight: 300, color: "#D9CEBD", lineHeight: 1 }}>{m.num}</div>
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".4rem" }}>{m.title}</h3>
                  <p style={{ fontFamily: "var(--serif)", fontSize: ".9rem", color: "#7A3A28", fontStyle: "italic" }}>&ldquo;{m.quote}&rdquo;</p>
                </div>
                <p style={{ fontSize: ".85rem", color: "#5C5248", lineHeight: 1.8 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Practices */}
      <section style={{ background: "#0D0807", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#7A3A28", marginBottom: ".75rem", textAlign: "center" }}>Seven Practices</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 400, color: "#F2EDE4", textAlign: "center", marginBottom: "3rem" }}>The Seven Daily Practices</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
            {practices.map(p => (
              <Link key={p.title} href={p.href} style={{ background: "#111108", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "1.8rem", textDecoration: "none", transition: "border-color .2s, transform .2s", display: "block" }}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#7A3A28"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.07)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "#F2EDE4", marginBottom: ".5rem" }}>{p.title}</h3>
                <p style={{ fontSize: ".78rem", color: "rgba(242,237,228,.5)", lineHeight: 1.7 }}>{p.desc}</p>
                <p style={{ fontSize: ".72rem", color: "#7A3A28", marginTop: ".8rem", fontWeight: 600 }}>Explore →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
