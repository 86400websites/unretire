"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const mindsets = [
  { title: "Freedom", desc: "Design life on your own terms." },
  { title: "Evolution", desc: "Growth continues throughout life." },
  { title: "Balance", desc: "Harmony across all dimensions." },
  { title: "Relevance", desc: "You don't have an expiry date." },
  { title: "Joy", desc: "Curiosity and play are essential." },
];

const practices = ["Ignite", "Move", "Connect", "Contribute", "Explore", "Grow", "Optimize"];

const challenges = [
  { title: "Loss of Structure", desc: "At first, retirement feels like a long weekend. Then a long vacation. Then a blur. Days blend into each other. The calendar that once commanded your attention sits empty.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A3A28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { title: "Loss of Identity", desc: "You're safe. Comfortable. Respected for who you were. Yet something inside asks an uncomfortable question: \"Is this it?\" Not because you want more success — but because you want more life.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A3A28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/></svg> },
  { title: "Loss of Purpose", desc: "No one warns you about this part. They told you retirement is freedom. What they didn't tell you: retirement done wrong doesn't feel like freedom. It feels like drift.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A3A28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
];

const profiles = [
  { href: "/unretire/profile/status-dropper", title: "The Status Dropper", quote: "\"I didn't realise how much my title defined me.\"" },
  { href: "/unretire/profile/comfortable-drifter", title: "The Comfortable Drifter", quote: "\"Life is pleasant... but it feels a little flat.\"" },
  { href: "/unretire/profile/family-first-caretaker", title: "The Family-First Caretaker", quote: "\"My time now revolves around family.\"" },
  { href: "/unretire/profile/still-ambitious-builder", title: "The Still-Ambitious Builder", quote: "\"I'm not finished creating.\"" },
  { href: "/unretire/profile/health-reset-retiree", title: "The Health Reset Retiree", quote: "\"Now it's time to take care of myself.\"" },
  { href: "/unretire/profile/forced-retiree", title: "The Forced Retiree", quote: "\"I didn't choose this transition.\"" },
];

const bookFeatures = [
  "5 Transformational Mindsets: Freedom, Evolution, Balance, Relevance, Joy",
  "7 Daily Practices: Ignite, Move, Connect, Contribute, Explore, Grow, Optimize",
  "Real stories from Japan, Kenya, Italy, Costa Rica, Jordan, and beyond",
  "The 14-Day Starter Plan to build real momentum immediately",
  "Companion Life Design Workbook with structured exercises",
];

export default function UnRetirePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      {/* ── Back pill ─────────────────────────── */}
      <Link href="/" style={{ position: "fixed", bottom: "1.4rem", right: "1.4rem", zIndex: 8000, background: "#0D0807", color: "rgba(242,237,228,.75)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 999, padding: ".5rem 1.1rem", fontSize: ".68rem", fontWeight: 500, letterSpacing: ".05em", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: ".4rem", boxShadow: "0 4px 18px rgba(0,0,0,.3)", opacity: 0.82 }}>
        ← Half a Life
      </Link>

      {/* ── HERO ──────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "linear-gradient(160deg,#2C1A0E 0%,#1A1008 40%,#0F0A05 100%)", padding: "calc(64px + 3rem) 2.5rem 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 50%,rgba(180,90,20,.12) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "auto 1fr", gap: "5rem", alignItems: "end", position: "relative", zIndex: 2 }}>
          <div style={{ flexShrink: 0 }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(242,237,228,.4)", marginBottom: "1.2rem" }}>Life after work is just the beginning</p>
            <div style={{ position: "relative", width: 250 }}>
              <Image src="/assets/images/1.png" alt="UnRetire by Maher Kaddoura" width={250} height={340} style={{ width: "100%", height: "auto" }} />
            </div>
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3.5rem,6vw,5.5rem)", fontWeight: 700, lineHeight: 1.0, color: "#F2EDE4", marginBottom: "2rem", letterSpacing: "-.01em" }}>
              Reboot.<br />Don&apos;t Mute.
            </h1>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/unretire/framework" style={{ display: "inline-flex", alignItems: "center", padding: ".7rem 1.8rem", background: "#7A3A28", color: "#fff", borderRadius: 4, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}
                onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8F4A35"}
                onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#7A3A28"}>
                Explore the Framework →
              </Link>
              <Link href="/unretire/start" style={{ display: "inline-flex", alignItems: "center", padding: ".7rem 1.8rem", background: "rgba(255,255,255,.1)", color: "#F2EDE4", border: "1px solid rgba(255,255,255,.2)", borderRadius: 4, fontSize: ".75rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", textDecoration: "none", transition: "all .2s" }}
                onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.16)"}
                onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.1)"}>
                Start Here
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO + PROBLEM ───────────────────── */}
      <section style={{ background: "#E8E0D4", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }} className="two-col">
          <div style={{ background: "#1A1208", borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ aspectRatio: "16/10", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", cursor: "pointer" }}>
              <div style={{ width: 54, height: 54, background: "#7A3A28", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem", boxShadow: "0 8px 24px rgba(122,58,40,.4)", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              </div>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 600, color: "#F2EDE4", textAlign: "center", marginBottom: ".3rem" }}>Watch the UnRetire message</p>
              <p style={{ fontSize: ".72rem", color: "rgba(242,237,228,.4)", textAlign: "center", lineHeight: 1.5 }}>Maher&apos;s personal message about what it means to UnRetire</p>
            </div>
            <div style={{ background: "#1A1208", borderTop: "1px solid rgba(255,255,255,.06)", padding: ".75rem 1.2rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
              <div style={{ background: "#7A3A28", borderRadius: 4, padding: ".2rem .5rem", fontSize: ".5rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", whiteSpace: "nowrap", lineHeight: 1.4 }}>NEW<br />CHAPTER</div>
              <p style={{ fontSize: ".72rem", color: "rgba(242,237,228,.45)", lineHeight: 1.5 }}>Reboot. Don&apos;t Mute. The beginning of an intentional next chapter.</p>
            </div>
          </div>
          <div>
            <p style={{ fontSize: "1.05rem", color: "#3A3228", lineHeight: 1.9, fontWeight: 400 }}>Retirement is the only major life transition we prepare for financially — but avoid emotionally. (Un)Retire gives you the framework to design what comes next — on purpose, not by default.</p>
          </div>
        </div>
      </section>

      {/* ── THE CHALLENGE ─────────────────────── */}
      <section style={{ background: "#111108", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", display: "block", marginBottom: ".75rem" }}>The Challenge</span>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, lineHeight: 1.12, color: "#F2EDE4", letterSpacing: "-.015em" }}>The Problem with Retirement</h2>
            <p style={{ fontSize: ".92rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, maxWidth: 580, margin: ".8rem auto 0", fontWeight: 300 }}>For generations, retirement has been framed as the reward for a lifetime of work — a time to slow down, step aside, and finally rest.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }} className="three-col">
            {challenges.map(c => (
              <div key={c.title} style={{ background: "#0D0807", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "2rem", transition: "transform .2s, box-shadow .2s", cursor: "default" }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,.3)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                <div style={{ width: 48, height: 48, background: "rgba(122,58,40,.12)", border: "1px solid rgba(122,58,40,.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.1rem" }}>{c.icon}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "#F2EDE4", marginBottom: ".7rem", fontWeight: 500 }}>{c.title}</h3>
                <p style={{ fontSize: ".82rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "3rem", background: "#7A3A28", borderRadius: 10, padding: "2.5rem 3rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.1rem,2vw,1.5rem)", color: "#fff", fontWeight: 400, lineHeight: 1.6, fontStyle: "italic" }}>&ldquo;The real risk is not aging. It&apos;s muting yourself — your curiosity, your contribution, your sense of relevance, your joy.&rdquo;</p>
            <p style={{ marginTop: "1rem", fontSize: ".72rem", color: "rgba(255,255,255,.6)", fontStyle: "italic" }}>&ldquo;Retirement is not a finish line. It&apos;s an inflection point — a new beginning.&rdquo;</p>
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ────────────────────────── */}
      <section style={{ background: "#0D0807", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }} className="two-col">
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", display: "block", marginBottom: ".75rem" }}>The Philosophy</span>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: "#F2EDE4", lineHeight: 1.12, marginBottom: "1.5rem", letterSpacing: "-.015em" }}>A New Way to<br />Think About Retirement</h2>
            <p style={{ fontSize: ".92rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, fontWeight: 300, marginBottom: "1rem" }}>(Un)Retire is not about working forever. It&apos;s not about staying busy. It&apos;s not about denying age or pretending nothing has changed.</p>
            <p style={{ fontSize: ".92rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, fontWeight: 300, marginBottom: "1.5rem" }}>It&apos;s about <strong style={{ color: "#F2EDE4", fontWeight: 500 }}>rebooting</strong> your identity when old labels fall away. <strong style={{ color: "#F2EDE4", fontWeight: 500 }}>Choosing</strong> purpose over drift. <strong style={{ color: "#F2EDE4", fontWeight: 500 }}>Designing</strong> a life that feels whole — not just comfortable.</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "#7A3A28", fontStyle: "italic" }}>Not by default — but by design.</p>
          </div>
          <div style={{ background: "#111108", borderRadius: 14, padding: "3rem", textAlign: "center", border: "1px solid rgba(255,255,255,.07)" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#7A3A28", marginBottom: "1.5rem" }}>The Core Equation</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "3rem", color: "#F2EDE4", fontWeight: 400, lineHeight: 1 }}>Mindset</p>
            <p style={{ fontSize: "2.5rem", color: "#7A3A28", margin: ".3rem 0", fontWeight: 700 }}>✕</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "3rem", color: "#F2EDE4", fontWeight: 400, lineHeight: 1 }}>Practice</p>
            <p style={{ fontSize: ".78rem", color: "rgba(242,237,228,.65)", margin: "1.5rem 0 2rem", lineHeight: 1.85, fontWeight: 300 }}>Five powerful mindsets. Seven intentional practices. Together, a complete guide for the next chapter of life.</p>
            <Link href="/unretire/framework" style={{ display: "inline-flex", alignItems: "center", padding: ".7rem 1.8rem", background: "#7A3A28", color: "#fff", borderRadius: 4, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}
              onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8F4A35"}
              onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#7A3A28"}>
              Explore the Framework +
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE FRAMEWORK ─────────────────────── */}
      <section style={{ background: "#F2EDE4", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", display: "block", marginBottom: ".75rem" }}>The Framework</span>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#0D0D0D", marginBottom: ".7rem" }}>Five Mindsets. Seven Practices.</h2>
          <p style={{ fontSize: ".88rem", color: "#9A9080", marginBottom: "3rem" }}>The building blocks of an intentional life after career.</p>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {mindsets.map(m => (
              <div key={m.title} style={{ flex: 1, minWidth: 140, maxWidth: 180, background: "#fff", borderRadius: 10, padding: "1.4rem 1rem", boxShadow: "0 2px 12px rgba(0,0,0,.06)", textAlign: "center" }}>
                <div style={{ width: 36, height: 36, background: "rgba(122,58,40,.1)", borderRadius: 8, margin: "0 auto .8rem" }} />
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", color: "#0D0D0D", marginBottom: ".4rem" }}>{m.title}</div>
                <div style={{ fontSize: ".72rem", color: "#9A9080", lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#0D0807", borderRadius: 10, padding: "1.2rem 2rem", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: ".5rem" }}>
            {practices.map(p => (
              <Link key={p} href={`/unretire/framework/practice-${p.toLowerCase()}`} style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(242,237,228,.7)", textDecoration: "none", padding: ".3rem .5rem", transition: "color .18s" }}
                onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "#7A3A28"}
                onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.7)"}>
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFILES ──────────────────────────── */}
      <section style={{ background: "#F2EDE4", padding: "6rem 2.5rem", borderTop: "1px solid rgba(0,0,0,.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", display: "block", marginBottom: ".75rem" }}>Is this you?</span>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#0D0D0D", marginBottom: ".7rem" }}>Which Retiree Are You?</h2>
            <p style={{ fontSize: ".88rem", color: "#9A9080" }}>The (Un)Retire journey speaks to people at many different points in the retirement transition.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }} className="three-col">
            {profiles.map(p => (
              <Link key={p.href} href={p.href} style={{ background: "#F2EDE4", border: "1.5px solid rgba(0,0,0,.08)", borderRadius: 10, padding: "1.5rem", textDecoration: "none", transition: "all .2s", display: "block" }}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#7A3A28"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,0,0,.08)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.05rem", color: "#0D0D0D", marginBottom: ".5rem", fontWeight: 500 }}>{p.title}</div>
                <div style={{ fontSize: ".78rem", color: "#9A9080", fontStyle: "italic" }}>{p.quote}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUY THE BOOK ──────────────────────── */}
      <section style={{ background: "#0D0807", padding: "7rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "5rem", alignItems: "center" }} className="two-col">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image src="/assets/images/book-unretire-cover.png" alt="UnRetire" width={240} height={320} style={{ maxWidth: 240, width: "100%", borderRadius: 6, boxShadow: "0 24px 64px rgba(0,0,0,.5)" }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, color: "#F2EDE4", lineHeight: 1.15, marginBottom: "1.5rem" }}>The complete guide to designing your next chapter</h2>
            <p style={{ fontSize: ".92rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, fontWeight: 300, marginBottom: "1.5rem" }}>From &ldquo;Reboot Don&apos;t Mute&rdquo; to the 14-Day Starter Plan — a comprehensive framework for approaching retirement not as an end, but as a beginning.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", marginBottom: "2rem" }}>
              {bookFeatures.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: ".75rem" }}>
                  <span style={{ color: "#7A3A28", marginTop: ".1rem", flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: ".85rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, fontWeight: 300 }}>{f}</span>
                </div>
              ))}
            </div>
            <a href="https://amazon.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: ".8rem 2rem", background: "#7A3A28", color: "#fff", borderRadius: 4, fontSize: ".8rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}
              onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8F4A35"}
              onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#7A3A28"}>
              Buy on Amazon →
            </a>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────── */}
      <section style={{ background: "#7A3A28", padding: "6rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#fff", marginBottom: "1rem" }}>Join the<br />(Un)Retire Newsletter</h2>
          <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.75)", lineHeight: 1.8, marginBottom: "2.5rem", fontWeight: 300 }}>Weekly insights on designing the life you were made for — delivered every Monday morning.</p>
          {submitted ? (
            <p style={{ color: "rgba(255,255,255,.9)", fontSize: ".9rem" }}>✓ You&apos;re in. See you Monday.</p>
          ) : (
            <div style={{ display: "flex", gap: ".75rem", maxWidth: 400, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
              <input type="email" placeholder="Enter Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ flex: 1, minWidth: 200, padding: ".85rem 1.4rem", background: "#F2EDE4", border: "none", borderRadius: 999, fontSize: ".88rem", color: "#0D0D0D", fontFamily: "var(--body)", outline: "none" }} />
              <button onClick={() => email && setSubmitted(true)} style={{ padding: ".85rem 1.8rem", background: "#0D0D0D", color: "#fff", border: "none", borderRadius: 999, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", transition: "background .2s" }}
                onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = "#1A1A1A"}
                onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = "#0D0D0D"}>
                Join
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          .two-col{grid-template-columns:1fr!important;gap:2.5rem!important;}
          .three-col{grid-template-columns:1fr!important;}
        }
      `}</style>
    </>
  );
}
