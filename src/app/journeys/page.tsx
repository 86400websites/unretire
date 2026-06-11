"use client";
import Link from "next/link";

const journeys = [
  { title: "The Purpose Journey", desc: "Rediscover your reason to rise", stages: "6 stages · ~8 weeks", access: "free", href: "/unretire/journeys/purpose" },
  { title: "The Vitality Journey", desc: "Build a body that matches your ambitions", stages: "5 stages · ~6 weeks", access: "premium", href: "/unretire/journeys/health" },
  { title: "The Connection Journey", desc: "Deepen the relationships that truly matter", stages: "5 stages · ~8 weeks", access: "premium", href: "/unretire/journeys/relationships" },
  { title: "The Contribution Journey", desc: "Find your way of giving back with impact", stages: "5 stages · ~6 weeks", access: "premium", href: "/unretire/journeys/contribution" },
  { title: "The Adventure Journey", desc: "Embrace exploration in your next chapter", stages: "5 stages · ~6 weeks", access: "premium", href: "/unretire/journeys/adventure" },
  { title: "The Life Design Journey", desc: "Architect the days you actually want to live", stages: "6 stages · ~10 weeks", access: "premium", href: "/unretire/journeys/design" },
  { title: "The Mindset Journey", desc: "Rewire the beliefs that hold you back", stages: "5 stages · ~8 weeks", access: "premium", href: "/unretire/journeys/mindset" },
];

export default function JourneysPage() {
  return (
    <>
      <div style={{ background: "linear-gradient(160deg,#0D0807 0%,#111108 100%)", paddingTop: "calc(98px + 3rem)", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", marginBottom: "1rem" }}>Life Journeys</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 500, color: "#F2EDE4", lineHeight: 1.1, marginBottom: "1.2rem" }}>Guided Journeys for Your Next Chapter</h1>
          <p style={{ fontSize: ".95rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, maxWidth: "60ch", fontWeight: 300 }}>Each journey is a structured, self-paced experience designed to help you go deeper into one dimension of your (Un)Retire life.</p>
        </div>
      </div>

      <section style={{ background: "#EDE8DF", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 14, padding: "2.5rem 3rem", marginBottom: "3rem", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".75rem" }}>How the Journeys Work</h2>
            <p style={{ fontSize: ".88rem", color: "#5C5248", lineHeight: 1.85, maxWidth: "58ch", margin: "0 auto" }}>Each journey is divided into stages — reflection, insight, and action. You move at your own pace. There is no right order. The best journey is the one that resonates with where you are right now.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
            {journeys.map(j => (
              <div key={j.title} style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 12, padding: "2rem", position: "relative", transition: "box-shadow .2s, transform .2s", cursor: j.access === "free" ? "pointer" : "default" }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                {j.access === "free" ? (
                  <span style={{ display: "inline-block", background: "rgba(122,58,40,.1)", color: "#7A3A28", fontSize: ".55rem", fontFamily: "var(--mono)", letterSpacing: ".12em", textTransform: "uppercase", padding: ".2rem .6rem", borderRadius: 999, marginBottom: ".75rem" }}>Free</span>
                ) : (
                  <span style={{ display: "inline-block", background: "rgba(13,13,13,.07)", color: "#9A9080", fontSize: ".55rem", fontFamily: "var(--mono)", letterSpacing: ".12em", textTransform: "uppercase", padding: ".2rem .6rem", borderRadius: 999, marginBottom: ".75rem" }}>✦ Premium</span>
                )}
                <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".15em", textTransform: "uppercase", color: "#9A9080", marginBottom: ".5rem" }}>{j.stages}</p>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".5rem" }}>{j.title}</h3>
                <p style={{ fontSize: ".82rem", color: "#9A9080", lineHeight: 1.7, marginBottom: "1rem" }}>{j.desc}</p>
                {j.access === "free" ? (
                  <Link href={j.href} style={{ fontSize: ".78rem", fontWeight: 600, color: "#7A3A28", textDecoration: "none" }}>Begin Journey →</Link>
                ) : (
                  <span style={{ fontSize: ".78rem", color: "#9A9080" }}>🔒 Premium Members Only</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#0D0807", padding: "4rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "#F2EDE4", marginBottom: ".75rem" }}>Unlock All Journeys</h2>
          <p style={{ fontSize: ".88rem", color: "rgba(242,237,228,.55)", marginBottom: "1.8rem", lineHeight: 1.8 }}>Get access to all 7 guided journeys plus the full tool library, premium articles, and community.</p>
          <Link href="/unretire/community" style={{ display: "inline-block", padding: ".8rem 2.2rem", background: "#7A3A28", color: "#fff", borderRadius: 4, fontSize: ".8rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none" }}>Join Premium →</Link>
        </div>
      </section>
    </>
  );
}
