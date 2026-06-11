"use client";
import Link from "next/link";
import { useState } from "react";

const topics = [
  { num: "01", title: "UnRetire: Designing Your Next Chapter", desc: "For organizations supporting workforce transitions, pre-retirees, and leaders rethinking what comes next. A practical, inspiring framework for reinventing with intention." },
  { num: "02", title: "Bounce Forward: Turning Setbacks into Growth", desc: "For teams navigating change, disruption, or difficult seasons. A research-grounded, human conversation about what real resilience looks and feels like." },
  { num: "03", title: "The Adventure Way: Living More Bravely", desc: "For any audience hungry for more aliveness, courage, and engagement. An invitation to choose the full life — with practical tools to make it real." },
  { num: "04", title: "Luck by Design: Creating More Possibility", desc: "For leaders and entrepreneurs who want to increase their openness, connection, and readiness for the fortunate coincidences that change everything." },
  { num: "05", title: "Half a Life: Meaning, Reinvention & Human Growth", desc: "The signature keynote — weaving together all themes into one cohesive experience about what it means to live fully across every season of life." },
];

const formats = [
  { title: "Keynote", duration: "45–75 min", desc: "A single powerful talk for conferences, summits, and large gatherings." },
  { title: "Workshop", duration: "Half-day", desc: "An interactive session with exercises and group work for smaller teams." },
  { title: "Leadership Retreat", duration: "Full-day", desc: "A deep immersive experience for executive teams and senior leaders." },
];

export default function SpeakingPage() {
  const [form, setForm] = useState({ name: "", email: "", org: "", eventType: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);

  return (
    <>
      {/* ── HERO ──────────────────────────── */}
      <div style={{ background: "#0D0D0D", paddingTop: "calc(var(--topnav-h) + 4rem)", paddingBottom: "5rem", borderBottom: "1px solid rgba(255,255,255,.07)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 50%, rgba(139,26,26,.07) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem", position: "relative", zIndex: 2 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
            <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />
            Live Events & Keynotes
          </p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(4rem,9vw,8rem)", fontWeight: 400, lineHeight: .9, color: "#F2EDE4", letterSpacing: "-.025em", marginBottom: "2.5rem" }}>
            Speaking
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(242,237,228,.55)", lineHeight: 1.85, maxWidth: "52ch", fontWeight: 300, marginBottom: "3rem" }}>
            Keynotes and workshops for organizations, conferences, and communities navigating change, building resilience, and pursuing meaningful work.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="#inquiry" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", padding: ".85rem 2.2rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 3, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}
              onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#A82020"}
              onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8B1A1A"}>
              Enquire About Speaking
            </a>
            <a href="#topics" style={{ display: "inline-flex", alignItems: "center", padding: ".85rem 2.2rem", background: "transparent", color: "rgba(242,237,228,.6)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 3, fontSize: ".78rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", transition: "all .2s" }}
              onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.3)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.6)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.12)"; }}>
              View Topics
            </a>
          </div>
        </div>
      </div>

      {/* ── PHILOSOPHY ────────────────────── */}
      <section style={{ background: "#F2EDE4", padding: "5rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontWeight: 300, color: "#0D0D0D", lineHeight: 1.65, fontStyle: "italic" }}>
              &ldquo;The best speaking experiences don&apos;t just inform — they shift something.&rdquo;
            </p>
            <div style={{ width: 48, height: 2, background: "#8B1A1A", margin: "2rem 0" }} />
            <p style={{ fontSize: ".88rem", color: "#5C5248", lineHeight: 1.85, fontWeight: 300 }}>
              The talks and workshops built around Half a Life are designed to move people: to help them see their situation differently, feel the possibility in their moment, and leave with practical tools for what comes next.
            </p>
          </div>
          {/* Formats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#D9CEBD", borderRadius: 12, overflow: "hidden" }}>
            {formats.map(f => (
              <div key={f.title} style={{ background: "#fff", padding: "1.8rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "#0D0D0D", marginBottom: ".3rem" }}>{f.title}</div>
                  <div style={{ fontSize: ".78rem", color: "#9A9080", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#8B1A1A", whiteSpace: "nowrap", flexShrink: 0 }}>{f.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEYNOTE TOPICS ────────────────── */}
      <section id="topics" style={{ background: "#0D0D0D", padding: "6rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
            <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />
            Keynote Topics
          </p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 400, color: "#F2EDE4", marginBottom: "3rem", letterSpacing: "-.015em" }}>
            Five talks that move people
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden" }}>
            {topics.map((t, i) => (
              <div key={t.num}
                style={{ background: hoveredTopic === i ? "#141414" : "#0D0D0D", padding: "2.2rem", cursor: "default", transition: "background .2s", borderBottom: i < 3 ? "1px solid rgba(255,255,255,.06)" : "none" }}
                onMouseOver={() => setHoveredTopic(i)}
                onMouseOut={() => setHoveredTopic(null)}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", fontWeight: 300, color: "rgba(255,255,255,.07)", lineHeight: 1, marginBottom: "1.2rem" }}>{t.num}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 400, color: "#F2EDE4", lineHeight: 1.35, marginBottom: ".8rem" }}>{t.title}</h3>
                <p style={{ fontSize: ".8rem", color: "rgba(242,237,228,.45)", lineHeight: 1.8, fontWeight: 300 }}>{t.desc}</p>
                {hoveredTopic === i && <div style={{ width: 24, height: 2, background: "#8B1A1A", marginTop: "1.2rem", transition: "width .3s" }} />}
              </div>
            ))}
            {/* 5th card spans 2 cols */}
            <div style={{ background: hoveredTopic === 4 ? "#141414" : "#0D0D0D", padding: "2.2rem", gridColumn: "1 / -1", borderTop: "1px solid rgba(255,255,255,.06)", transition: "background .2s", cursor: "default", display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", alignItems: "center" }}
              onMouseOver={() => setHoveredTopic(4)}
              onMouseOut={() => setHoveredTopic(null)}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "4rem", fontWeight: 300, color: "rgba(255,255,255,.05)", lineHeight: 1 }}>05</div>
              <div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 400, color: "#F2EDE4", marginBottom: ".6rem" }}>{topics[4].title}</h3>
                <p style={{ fontSize: ".82rem", color: "rgba(242,237,228,.45)", lineHeight: 1.8, fontWeight: 300, maxWidth: "65ch" }}>{topics[4].desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENQUIRY FORM ──────────────────── */}
      <section id="inquiry" style={{ background: "#EDE8DF", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "6rem", alignItems: "start" }}>
          <div style={{ position: "sticky", top: "calc(var(--topnav-h) + 2rem)" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />
              Get in Touch
            </p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 400, color: "#0D0D0D", lineHeight: 1.1, marginBottom: "1.2rem" }}>Bring Half a Life to your audience</h2>
            <p style={{ fontSize: ".88rem", color: "#9A9080", lineHeight: 1.85, fontWeight: 300, marginBottom: "2rem" }}>For keynotes, workshops, and speaking engagements — complete the form and we&apos;ll respond within 2 business days.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {["Conferences & Summits", "Corporate Keynotes", "Leadership Retreats", "Workshops & Half-days", "Awards Dinners"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: ".75rem", fontSize: ".82rem", color: "#5C5248" }}>
                  <span style={{ color: "#8B1A1A", flexShrink: 0 }}>—</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 14, padding: "3rem" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "#8B1A1A", marginBottom: "1rem" }}>✓</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "#F2EDE4", marginBottom: ".5rem" }}>Enquiry received.</h3>
                <p style={{ fontSize: ".85rem", color: "rgba(242,237,228,.45)" }}>We&apos;ll be in touch within 2 business days.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                {[
                  { label: "Your Name *", id: "name", type: "text", placeholder: "Full name", col: 1 },
                  { label: "Email Address *", id: "email", type: "email", placeholder: "your@email.com", col: 1 },
                  { label: "Organisation *", id: "org", type: "text", placeholder: "Company or organisation", col: 1 },
                ].map(f => (
                  <div key={f.id}>
                    <label style={{ display: "block", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#5C5248", marginBottom: ".5rem" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.id as keyof typeof form]} onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                      style={{ width: "100%", padding: ".8rem 1rem", border: "1px solid #D9CEBD", borderRadius: 6, fontSize: ".88rem", fontFamily: "var(--body)", outline: "none", background: "#F2EDE4", color: "#0D0D0D", transition: "border-color .2s" }}
                      onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = "#8B1A1A"}
                      onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,.1)"} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#5C5248", marginBottom: ".5rem" }}>Event Type</label>
                  <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}
                    style={{ width: "100%", padding: ".8rem 1rem", border: "1px solid #D9CEBD", borderRadius: 6, fontSize: ".88rem", fontFamily: "var(--body)", outline: "none", background: "#1A1A1A", color: "#F2EDE4" }}>
                    <option value="">Select type</option>
                    {["Conference / Summit", "Corporate Keynote", "Workshop / Half-day", "Leadership Retreat", "Awards Dinner", "Other"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#5C5248", marginBottom: ".5rem" }}>Tell us about your event *</label>
                  <textarea placeholder="Describe your audience, the event context, and the outcome you're hoping for..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", padding: ".8rem 1rem", border: "1px solid #D9CEBD", borderRadius: 6, fontSize: ".88rem", fontFamily: "var(--body)", outline: "none", background: "#1A1A1A", color: "#F2EDE4", minHeight: 120, resize: "vertical", transition: "border-color .2s" }}
                    onFocus={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#8B1A1A"}
                    onBlur={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,.1)"} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <button onClick={() => form.name && form.email && setSubmitted(true)}
                    style={{ padding: ".85rem 2.2rem", background: "#8B1A1A", color: "#F2EDE4", border: "none", borderRadius: 4, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", transition: "background .2s" }}
                    onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = "#A82020"}
                    onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = "#8B1A1A"}>
                    Send Enquiry
                  </button>
                  <span style={{ fontSize: ".72rem", color: "#9A9080" }}>We respond within 2 business days</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          .speaking-grid{grid-template-columns:1fr!important;}
          .topics-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </>
  );
}
