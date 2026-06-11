"use client";
import { useState } from "react";

const inquiryTypes = [
  { title: "Speaking & Events", desc: "Keynotes, workshops, panel appearances, organizational programs" },
  { title: "Media & Podcast", desc: "Interviews, guest appearances, and media inquiries" },
  { title: "Book & Publishing", desc: "Rights, bulk orders, and publishing inquiries" },
  { title: "General Inquiry", desc: "Questions, feedback, or simply hello" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", type: "", org: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [nlEmail, setNlEmail] = useState("");
  const [nlDone, setNlDone] = useState(false);
  const [hoveredType, setHoveredType] = useState<number | null>(null);

  return (
    <>
      {/* ── HERO ── */}
      <div style={{ background: "#0D0D0D", paddingTop: "calc(var(--topnav-h) + 4rem)", paddingBottom: "5rem", borderBottom: "1px solid rgba(255,255,255,.07)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 60%, rgba(139,26,26,.07) 0%, transparent 55%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem", position: "relative", zIndex: 2 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
            <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />
            Get In Touch
          </p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(4rem,9vw,8rem)", fontWeight: 400, lineHeight: .9, color: "#F2EDE4", letterSpacing: "-.025em", marginBottom: "2rem" }}>
            Contact
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(242,237,228,.5)", lineHeight: 1.85, maxWidth: "48ch", fontWeight: 300 }}>
            Speaking, media, questions, or simply hello — this is the right place to reach out.
          </p>
        </div>
      </div>

      {/* ── INQUIRY TYPES ── cream section */}
      <section style={{ background: "#F2EDE4", padding: "5rem 2.5rem", borderBottom: "1px solid #D9CEBD" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".25em", textTransform: "uppercase", color: "#9A9080", marginBottom: "2rem" }}>What can we help with?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: "#D9CEBD", borderRadius: 12, overflow: "hidden" }}>
            {inquiryTypes.map((t, i) => (
              <div key={t.title}
                style={{ background: hoveredType === i ? "#fff" : "#EDE8DF", padding: "2rem 1.8rem", cursor: "pointer", transition: "background .2s", position: "relative" }}
                onMouseOver={() => setHoveredType(i)}
                onMouseOut={() => setHoveredType(null)}>
                {hoveredType === i && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#8B1A1A" }} />}
                <h3 style={{ fontFamily: "var(--mono)", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#0D0D0D", marginBottom: ".6rem" }}>{t.title}</h3>
                <p style={{ fontSize: ".8rem", color: "#9A9080", lineHeight: 1.7 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM + SIDEBAR ── dark section */}
      <section style={{ background: "#0D0D0D", padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "6rem", alignItems: "start" }}>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "calc(var(--topnav-h) + 2rem)" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />
              Connect
            </p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 400, color: "#F2EDE4", lineHeight: 1.1, marginBottom: "1.5rem" }}>
              Let&apos;s start a conversation
            </h2>
            <p style={{ fontSize: ".88rem", color: "rgba(242,237,228,.45)", lineHeight: 1.85, fontWeight: 300, marginBottom: "3rem" }}>
              Fill in the form and we&apos;ll get back to you soon. Or join the newsletter for weekly ideas delivered to your inbox.
            </p>

            {/* Newsletter mini */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: "2rem", marginBottom: "2.5rem" }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(242,237,228,.3)", marginBottom: ".75rem" }}>Newsletter</p>
              <p style={{ fontSize: ".82rem", color: "rgba(242,237,228,.4)", marginBottom: "1rem", lineHeight: 1.65 }}>Weekly ideas for living a fuller life.</p>
              {nlDone ? (
                <p style={{ color: "#8B1A1A", fontWeight: 600, fontSize: ".85rem" }}>✓ You&apos;re subscribed!</p>
              ) : (
                <div style={{ display: "flex", border: "1px solid rgba(255,255,255,.1)", borderRadius: 4, overflow: "hidden" }}>
                  <input type="email" placeholder="Your email" value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                    style={{ flex: 1, padding: ".65rem .9rem", border: "none", background: "transparent", fontSize: ".82rem", fontFamily: "var(--body)", outline: "none", color: "#F2EDE4" }} />
                  <button onClick={() => nlEmail && setNlDone(true)}
                    style={{ padding: ".65rem 1.2rem", background: "#8B1A1A", color: "#F2EDE4", border: "none", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer" }}>
                    Join
                  </button>
                </div>
              )}
            </div>

            {/* Socials */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: "2rem" }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(242,237,228,.3)", marginBottom: "1rem" }}>Follow</p>
              <div style={{ display: "flex", gap: ".6rem" }}>
                {[{ href: "https://linkedin.com/in/maherkaddoura", label: "in" }, { href: "https://instagram.com/maherkaddoura", label: "ig" }, { href: "https://x.com/maherkaddoura", label: "𝕏" }].map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".65rem", color: "rgba(242,237,228,.4)", transition: "all .18s", fontFamily: "monospace", textDecoration: "none" }}
                    onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#8B1A1A"; (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"; }}
                    onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.12)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.4)"; }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "3rem" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", color: "#8B1A1A", marginBottom: "1rem" }}>✓</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "#F2EDE4", marginBottom: ".5rem" }}>Message sent.</h3>
                <p style={{ fontSize: ".85rem", color: "rgba(242,237,228,.4)" }}>Thank you for reaching out. I&apos;ll be in touch soon.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                {[
                  { label: "Your Name", id: "name", type: "text", placeholder: "Full name" },
                  { label: "Email Address", id: "email", type: "email", placeholder: "your@email.com" },
                  { label: "Organization (optional)", id: "org", type: "text", placeholder: "Company or organization" },
                ].map(f => (
                  <div key={f.id}>
                    <label style={{ display: "block", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(242,237,228,.4)", marginBottom: ".5rem" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.id as keyof typeof form]} onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                      style={{ width: "100%", padding: ".85rem 1rem", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, fontSize: ".88rem", fontFamily: "var(--body)", outline: "none", background: "#1A1A1A", color: "#F2EDE4", transition: "border-color .2s" }}
                      onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = "#8B1A1A"}
                      onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,.08)"} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(242,237,228,.4)", marginBottom: ".5rem" }}>Inquiry Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: "100%", padding: ".85rem 1rem", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, fontSize: ".88rem", fontFamily: "var(--body)", outline: "none", background: "#1A1A1A", color: "#F2EDE4" }}>
                    <option value="">Select inquiry type</option>
                    {inquiryTypes.map(t => <option key={t.title}>{t.title}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: ".65rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(242,237,228,.4)", marginBottom: ".5rem" }}>Message</label>
                  <textarea placeholder="Tell me about your inquiry — the more context the better." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", padding: ".85rem 1rem", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, fontSize: ".88rem", fontFamily: "var(--body)", outline: "none", background: "#1A1A1A", color: "#F2EDE4", minHeight: 140, resize: "vertical", transition: "border-color .2s" }}
                    onFocus={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#8B1A1A"}
                    onBlur={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,.08)"} />
                </div>
                <button onClick={() => form.name && form.email && setSubmitted(true)}
                  style={{ alignSelf: "flex-start", padding: ".85rem 2.2rem", background: "#8B1A1A", color: "#F2EDE4", border: "none", borderRadius: 4, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", transition: "background .2s" }}
                  onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = "#A82020"}
                  onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = "#8B1A1A"}>
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
