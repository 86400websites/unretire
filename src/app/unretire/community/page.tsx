"use client";
import Link from "next/link";
import { useState } from "react";

export default function CommunityPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <div style={{ background: "linear-gradient(160deg,#0D0807 0%,#111108 100%)", paddingTop: "calc(98px + 3rem)", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", marginBottom: "1rem" }}>You&apos;re Not Alone in This</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 500, color: "#F2EDE4", lineHeight: 1.1, marginBottom: "1.2rem" }}>Community</h1>
          <p style={{ fontSize: ".95rem", color: "rgba(242,237,228,.65)", lineHeight: 1.85, maxWidth: "60ch", fontWeight: 300 }}>A growing circle of people designing their retirement with intention — sharing, supporting, and learning together.</p>
        </div>
      </div>

      <section style={{ background: "#F2EDE4", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start", marginBottom: "4rem" }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#7A3A28", marginBottom: ".75rem" }}>Why Community Matters</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 400, color: "#0D0D0D", lineHeight: 1.15, marginBottom: "1.2rem" }}>The Practice of Connect, in Action</h2>
            <p style={{ fontSize: ".9rem", color: "#5C5248", lineHeight: 1.9, marginBottom: "1rem" }}>The (Un)Retire framework includes Connect as one of its seven core practices — because the research is unambiguous: strong relationships are the single greatest predictor of a long, healthy, and meaningful life.</p>
            <p style={{ fontSize: ".9rem", color: "#5C5248", lineHeight: 1.9, marginBottom: "2rem" }}>The Community is where that practice comes to life. A space for people thinking intentionally about their next chapter — not to be told what to do, but to think, share, and grow alongside others in the same season of life.</p>
            <a href="#join-form" style={{ display: "inline-block", padding: ".8rem 2rem", background: "#7A3A28", color: "#fff", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none" }}>Request to Join</a>
          </div>
          <div style={{ background: "#EDE8DF", borderRadius: 14, padding: "2.5rem" }}>
            <blockquote style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.1rem,2vw,1.4rem)", fontWeight: 300, fontStyle: "italic", color: "#7A3A28", lineHeight: 1.55, margin: "0 0 1.2rem" }}>
              &ldquo;The most powerful conversations I&apos;ve had about retirement haven&apos;t been with financial advisers. They&apos;ve been with people living it.&rdquo;
            </blockquote>
            <cite style={{ fontSize: ".7rem", fontStyle: "normal", fontFamily: "var(--mono)", color: "#9A9080", letterSpacing: ".08em", textTransform: "uppercase" }}>— Maher Kaddoura, (Un)Retire</cite>
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #D9CEBD", display: "flex", gap: "1rem" }}>
              {[{ num: "340+", label: "Members" }, { num: "18", label: "Countries" }, { num: "Monthly", label: "Live Events" }].map((stat, i) => (
                <div key={stat.label} style={{ textAlign: "center", flex: 1, paddingLeft: i > 0 ? "1rem" : 0, borderLeft: i > 0 ? "1px solid #D9CEBD" : "none" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", color: "#7A3A28", fontWeight: 500 }}>{stat.num}</div>
                  <div style={{ fontSize: ".6rem", fontFamily: "var(--mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "#9A9080" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's offered */}
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem", marginBottom: "4rem" }}>
          {[
            { title: "Monthly Discussions", desc: "Guided group conversations on framework themes — purpose, identity, relationships, time, and legacy. Real talk, no performance." },
            { title: "Reading & Reflection Circles", desc: "Small groups working through the book or workbook together — sharing reactions, insights, and honest reflections." },
            { title: "Live Events & Workshops", desc: "Monthly live sessions with Maher and guest contributors. Practical, focused, and built around your real questions." },
          ].map(item => (
            <div key={item.title} style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 12, padding: "2rem", textAlign: "center" }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".6rem" }}>{item.title}</h3>
              <p style={{ fontSize: ".82rem", color: "#9A9080", lineHeight: 1.75 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Join form */}
        <div id="join-form" style={{ maxWidth: 600, margin: "0 auto", background: "#EDE8DF", border: "1px solid #D9CEBD", borderRadius: 14, padding: "2.8rem" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#7A3A28", marginBottom: ".75rem" }}>Join the Community</p>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".5rem" }}>Request to Join</h3>
          <p style={{ fontSize: ".82rem", color: "#9A9080", marginBottom: "2rem", lineHeight: 1.7 }}>Tell us a little about where you are in your (Un)Retire journey and we&apos;ll be in touch.</p>
          {submitted ? (
            <p style={{ color: "#7A3A28", fontWeight: 600 }}>✓ Request received! We&apos;ll be in touch soon.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[{ label: "Your Name", id: "name", type: "text", placeholder: "Full name" }, { label: "Email Address", id: "email", type: "email", placeholder: "your@email.com" }].map(f => (
                <div key={f.id}>
                  <label style={{ display: "block", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C5248", marginBottom: ".4rem" }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.id as keyof typeof form]} onChange={e => setForm({ ...form, [f.id]: e.target.value })} style={{ width: "100%", padding: ".75rem 1rem", border: "1.5px solid #D9CEBD", borderRadius: 8, fontSize: ".88rem", fontFamily: "var(--body)", outline: "none", background: "#fff", color: "#0D0D0D" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C5248", marginBottom: ".4rem" }}>Tell us about yourself</label>
                <textarea placeholder="Where are you in your retirement journey?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ width: "100%", padding: ".75rem 1rem", border: "1.5px solid #D9CEBD", borderRadius: 8, fontSize: ".88rem", fontFamily: "var(--body)", outline: "none", background: "#fff", color: "#0D0D0D", minHeight: 100, resize: "vertical" }} />
              </div>
              <button onClick={() => form.name && form.email && setSubmitted(true)} style={{ padding: ".8rem 2rem", background: "#7A3A28", color: "#fff", border: "none", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", cursor: "pointer", alignSelf: "flex-start" }}>Send Request</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
