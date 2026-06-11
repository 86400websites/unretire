"use client";
import Link from "next/link";
import { useState } from "react";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <div style={{ paddingTop: "calc(var(--topnav-h) + 1rem)", paddingBottom: "1rem"  }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem" }}>
       
        </div>
      </div>

      <section style={{ background: "#f5f5f5", padding: "4rem 2.5rem 3rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 40px rgba(0,0,0,.12)" }}>

            {/* Left — offer */}
            <div style={{ background: "linear-gradient(155deg,#1a0a0a 0%,#3a1010 55%,#1a0808 100%)", padding: "3rem 2.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "1.5rem", right: "1.8rem", width: 65, height: 65, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", lineHeight: 1.2 }}>
                  <div style={{ fontSize: ".38rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", fontWeight: 600 }}>HALF</div>
                  <div style={{ fontSize: ".38rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", fontWeight: 600 }}>A LIFE</div>
                  <div style={{ fontSize: ".38rem", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", fontWeight: 600 }}>LETTER</div>
                </div>
              </div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 600, color: "#fff", lineHeight: 1.25, marginBottom: ".9rem", marginTop: 0 }}>
                Join 2,000+<br />Students of Life
              </h2>
              <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.8)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Subscribe for The Half a Life Letter & The Mini-Guide (both free!):
              </p>
              <div style={{ background: "linear-gradient(135deg,#c9a96e,#8a6a3a)", borderRadius: 10, padding: "1.5rem", maxWidth: 220, position: "relative", boxShadow: "0 8px 24px rgba(0,0,0,.3)" }}>
                <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: "#8B1A1A", color: "#fff", fontSize: ".52rem", letterSpacing: ".12em", textTransform: "uppercase", padding: ".22rem .7rem", borderRadius: 30, fontWeight: 600, whiteSpace: "nowrap" }}>Free with signup</div>
                <div style={{ fontSize: ".6rem", letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", marginBottom: ".4rem" }}>Half a Life</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 600, color: "#fff", lineHeight: 1.3, marginBottom: ".3rem" }}>Mini-Guide to<br />Living Fully</div>
                <div style={{ fontSize: ".65rem", color: "rgba(255,255,255,.55)", marginBottom: "1rem" }}>5 Principles for a Richer Life</div>
                <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 6, padding: ".9rem", display: "flex", flexDirection: "column", gap: ".3rem" }}>
                  {[70, 90, 55, 80, 65].map((w, i) => (
                    <div key={i} style={{ height: 6, background: `rgba(255,255,255,${0.5 - i * 0.08})`, borderRadius: 3, width: `${w}%` }} />
                  ))}
                </div>
                <div style={{ fontSize: ".6rem", color: "rgba(255,255,255,.45)", marginTop: ".6rem", textAlign: "right", fontStyle: "italic" }}>— Maher Kaddoura</div>
              </div>
            </div>

            {/* Right — form */}
            <div style={{ background: "#fff", padding: "3rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {submitted ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✓</div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "#0D0D0D", marginBottom: ".5rem" }}>You&apos;re in!</h3>
                  <p style={{ fontSize: ".85rem", color: "#9A9080" }}>Check your inbox for the Mini-Guide and your welcome series.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", fontSize: ".7rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#5C5248", marginBottom: ".6rem" }}>Your email address</label>
                    <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                      style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #EDE5D8", borderRadius: 6, padding: ".82rem 1rem", fontSize: ".9rem", color: "#0D0D0D", outline: "none", fontFamily: "var(--body)" }} />
                  </div>
                  <button onClick={() => email && setSubmitted(true)} style={{ width: "100%", background: "#8B1A1A", color: "#fff", border: "none", borderRadius: 6, padding: ".9rem 1.5rem", fontSize: ".8rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", marginBottom: "1rem", transition: "background .2s" }}
                    onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = "#A82020"}
                    onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = "#8B1A1A"}>
                    Subscribe
                  </button>
                  <div style={{ fontSize: ".72rem", color: "#9A9080", textAlign: "center", lineHeight: 1.6 }}>No fluff. No spam. No ads.<br />Unsubscribe any time.</div>
                  <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #EDE5D8" }}>
                    <div style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#5C5248", marginBottom: ".75rem" }}>Also included:</div>
                    {["The Half a Life Mini-Guide (instant download)", "Welcome series: 5 emails to orient you", "Access to the full newsletter archive"].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: ".6rem", fontSize: ".78rem", color: "#5C5248", marginBottom: ".5rem" }}>
                        <span style={{ color: "#8B1A1A", flexShrink: 0, marginTop: ".05rem" }}>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
