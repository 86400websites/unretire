"use client";
import { useState } from "react";

const categories = ["All", "Mindset", "Identity", "Purpose", "Relationships", "Health", "Practices"];
const articles = [
  { tag: "Mindset", title: "The 5 Mindsets of the (Un)Retiree", desc: "Freedom, Evolution, Balance, Relevance, Joy. The five mental shifts that separate those who drift from those who design.", time: "8 min read", access: "free" },
  { tag: "Mindset", title: "Dealing with the Drift", desc: "The most common retirement problem nobody talks about — and the simple daily practice that fixes it.", time: "6 min read", access: "premium" },
  { tag: "Mindset", title: "From Fear to Freedom", desc: "Retirement can feel like loss before it feels like liberation. Here's how to move through the fear faster.", time: "7 min read", access: "premium" },
  { tag: "Identity", title: "Who Are You Without Your Title?", desc: "The identity crisis of retirement is real — and it's the starting point for everything that comes next.", time: "9 min read", access: "premium" },
  { tag: "Purpose", title: "Finding Your Second Act Purpose", desc: "Purpose in retirement is not found — it is built, through the work you do and the people you serve.", time: "8 min read", access: "premium" },
  { tag: "Relationships", title: "The Relationship Reset", desc: "How retirement changes your most important relationships — and what to do about it.", time: "6 min read", access: "premium" },
  { tag: "Health", title: "The Vitality Imperative", desc: "Why physical health is not a vanity project in retirement — it's the foundation for everything else.", time: "7 min read", access: "premium" },
  { tag: "Practices", title: "The 14-Day Ignite Protocol", desc: "A practical, day-by-day plan to reignite your curiosity and sense of aliveness in just two weeks.", time: "10 min read", access: "free" },
];

export default function UnRetireArticlesPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? articles : articles.filter(a => a.tag === active);

  return (
    <>
      <div style={{ background: "linear-gradient(160deg,#0D0807 0%,#111108 100%)", paddingTop: "calc(98px + 3rem)", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", marginBottom: "1rem" }}>Articles & Essays</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 500, color: "#F2EDE4", lineHeight: 1.1, marginBottom: "1.5rem" }}>Ideas for the Next Chapter</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem" }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActive(cat)} style={{ padding: ".4rem 1rem", border: `1.5px solid ${active === cat ? "#7A3A28" : "rgba(255,255,255,.15)"}`, borderRadius: 999, fontSize: ".72rem", fontWeight: active === cat ? 600 : 400, color: active === cat ? "#7A3A28" : "rgba(242,237,228,.6)", background: active === cat ? "rgba(122,58,40,.1)" : "transparent", cursor: "pointer", fontFamily: "var(--body)" }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <section style={{ background: "#EDE8DF", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
          {filtered.map((a, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 12, padding: "1.8rem", position: "relative", cursor: "pointer", transition: "box-shadow .2s" }}
              onMouseOver={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.1)"}
              onMouseOut={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}>
              {a.access === "premium" && <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(13,13,13,.07)", color: "#9A9080", fontSize: ".52rem", fontFamily: "var(--mono)", letterSpacing: ".1em", textTransform: "uppercase", padding: ".18rem .55rem", borderRadius: 999 }}>✦ Premium</div>}
              <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", color: "#7A3A28", marginBottom: ".5rem" }}>{a.tag}</p>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 400, color: "#0D0D0D", lineHeight: 1.35, marginBottom: ".6rem" }}>{a.title}</h3>
              <p style={{ fontSize: ".8rem", color: "#9A9080", lineHeight: 1.7, marginBottom: "1rem" }}>{a.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: ".7rem", color: "#9A9080", fontFamily: "var(--mono)" }}>{a.time}</span>
                {a.access === "free" ? <span style={{ fontSize: ".75rem", fontWeight: 600, color: "#7A3A28" }}>Read →</span> : <span style={{ fontSize: ".75rem", color: "#9A9080" }}>🔒 Members</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
