"use client";
import Link from "next/link";
import { useState } from "react";

const categories = ["All", "Begin Again", "Bounce Forward", "Live the Adventure", "Create Your Luck", "Live with Meaning"];

const articles = [
  { tag: "Begin Again", title: "The Courage to Begin Again: What Reinvention Really Requires", excerpt: "True reinvention asks us to change our story about who we are — not just our circumstances.", readTime: "8 min read", type: "Essay", access: "free", bg: "linear-gradient(135deg,#2a1a1a,#4a2a2a)" },
  { tag: "Bounce Forward", title: "After the Fall: Finding Ground When Everything Has Changed", excerpt: "How to bounce forward into something truer than what came before.", readTime: "6 min read", type: "Essay", access: "premium", bg: "linear-gradient(135deg,#1a1a2a,#2a2a4a)" },
  { tag: "Live the Adventure", title: "What It Means to Choose Aliveness Over Safety", excerpt: "Safety is not the opposite of danger. It is the opposite of aliveness.", readTime: "7 min read", type: "Essay", access: "premium", bg: "linear-gradient(135deg,#1a1208,#3a2a18)" },
  { tag: "Create Your Luck", title: "Serendipity Is Not Random: How to Create More Luck", excerpt: "Lucky people are open, connected, and in motion — not just fortunate.", readTime: "5 min read", type: "Reflection", access: "premium", bg: "linear-gradient(135deg,#2a1a0a,#4a3a1a)" },
  { tag: "Live with Meaning", title: "The Quiet Revolution: Living Closer to What Matters", excerpt: "Meaning is built in the daily choices about what we give our attention to.", readTime: "9 min read", type: "Essay", access: "premium", bg: "linear-gradient(135deg,#1a0a1a,#3a1a3a)" },
  { tag: "Begin Again", title: "Designing the Second Half: A Framework for What Comes Next", excerpt: "How to approach life's next chapter with intention rather than drift.", readTime: "10 min read", type: "Essay", access: "premium", bg: "linear-gradient(135deg,#0a1a1a,#1a3a3a)" },
  { tag: "Live with Meaning", title: "What Do You Want to Leave Behind? On Contribution and Legacy", excerpt: "Legacy is what you deliberately choose to give while you're still here.", readTime: "7 min read", type: "Reflection", access: "premium", bg: "linear-gradient(135deg,#1a1a0a,#3a3a1a)" },
  { tag: "Bounce Forward", title: "The Gift Nobody Asked For: What Adversity Actually Teaches", excerpt: "Growth through difficulty is real — but it requires a specific kind of attention.", readTime: "8 min read", type: "Essay", access: "premium", bg: "linear-gradient(135deg,#0a1a2a,#1a3a4a)" },
  { tag: "Live the Adventure", title: "Curiosity as a Survival Skill: The Case for Staying Interested", excerpt: "The most alive people share a relentless, genuine curiosity about the world.", readTime: "6 min read", type: "Essay", access: "premium", bg: "linear-gradient(135deg,#1a0a0a,#3a1a1a)" },
];

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered = activeCategory === "All" ? articles : articles.filter(a => a.tag === activeCategory);

  return (
    <>
      {/* Hero */}
      <div style={{ background: "#F2EDE4", paddingTop: "calc(var(--topnav-h) + 3rem)", paddingBottom: "3rem", borderBottom: "1px solid #D9CEBD" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "#9A9080", marginBottom: "1.5rem", textDecoration: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Home
          </Link>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".25em", textTransform: "uppercase", color: "#9A9080", marginBottom: "1rem" }}>Essays & Reflections</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem,5vw,4.5rem)", fontWeight: 400, lineHeight: 1.05, color: "#0D0D0D", marginBottom: "1rem" }}>
            Articles for living<br /><em style={{ color: "#8B1A1A" }}>a fuller life</em>
          </h1>
          <p style={{ fontSize: ".95rem", color: "#5C5248", lineHeight: 1.8, maxWidth: "52ch", marginBottom: "2rem" }}>Essays, stories, quotes, and deep dives — across every dimension of a fully lived life.</p>

          {/* Category filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem" }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: ".4rem 1.1rem", border: `1.5px solid ${activeCategory === cat ? "#8B1A1A" : "rgba(13,13,13,.2)"}`, borderRadius: 999, fontSize: ".72rem", fontWeight: activeCategory === cat ? 600 : 400, color: activeCategory === cat ? "#8B1A1A" : "#5C5248", background: activeCategory === cat ? "rgba(139,26,26,.06)" : "transparent", cursor: "pointer", transition: "all .18s", fontFamily: "var(--body)" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <section style={{ background: "#F2EDE4", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }} className="articles-grid">
            {filtered.map((article, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "box-shadow .2s, transform .2s" }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                {/* Thumbnail */}
                <div style={{ background: article.bg, height: 120, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  {/* Premium badge */}
                  {article.access === "premium" && (
                    <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(139,26,26,.85)", color: "#F2EDE4", fontSize: ".55rem", fontFamily: "var(--mono)", letterSpacing: ".1em", textTransform: "uppercase", padding: ".2rem .6rem", borderRadius: 999 }}>
                      Premium
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", background: "rgba(0,0,0,.4)", color: "rgba(255,255,255,.7)", fontSize: ".58rem", fontFamily: "var(--mono)", letterSpacing: ".1em", textTransform: "uppercase", padding: ".2rem .6rem", borderRadius: 4 }}>
                    {article.type}
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding: "1.4rem" }}>
                  <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".5rem" }}>{article.tag}</p>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 400, color: "#0D0D0D", lineHeight: 1.35, marginBottom: ".6rem" }}>{article.title}</h3>
                  <p style={{ fontSize: ".8rem", color: "#9A9080", lineHeight: 1.7, marginBottom: ".8rem" }}>{article.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: ".7rem", color: "#9A9080", fontFamily: "var(--mono)" }}>{article.readTime}</span>
                    <span style={{ fontSize: ".75rem", fontWeight: 600, color: "#8B1A1A" }}>Read →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem", color: "#9A9080" }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1.2rem" }}>No articles in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section style={{ background: "#0D0D0D", padding: "5rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem" }}>Stay in the loop</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, color: "#F2EDE4", lineHeight: 1.15, marginBottom: "1rem" }}>Weekly articles in your inbox</h2>
          <p style={{ fontSize: ".88rem", color: "rgba(242,237,228,.55)", lineHeight: 1.8, marginBottom: "2rem" }}>New essays and reflections every week — no fluff, no spam.</p>
          {subscribed ? (
            <p style={{ color: "#F2EDE4", fontWeight: 600 }}>✓ You&apos;re subscribed. See you next week.</p>
          ) : (
            <div style={{ display: "flex", gap: ".75rem", maxWidth: 400, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
              <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, minWidth: 200, padding: ".85rem 1.4rem", background: "#1A1A1A", border: "1px solid rgba(255,255,255,.12)", borderRadius: 999, fontSize: ".88rem", color: "#F2EDE4", fontFamily: "var(--body)", outline: "none" }} />
              <button onClick={() => email && setSubscribed(true)}
                style={{ padding: ".85rem 1.8rem", background: "#8B1A1A", color: "#fff", border: "none", borderRadius: 999, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", transition: "background .2s" }}
                onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = "#A82020"}
                onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = "#8B1A1A"}>
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          .articles-grid{grid-template-columns:1fr!important;}
        }
        @media(min-width:769px) and (max-width:1024px){
          .articles-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>
    </>
  );
}
