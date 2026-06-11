"use client";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div style={{ background: "linear-gradient(160deg,#14141E 0%,#1E2030 100%)", paddingTop: "calc(98px + 3rem)", paddingBottom: "4rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem" }}>
          <Link href="/unretire" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "rgba(242,237,228,.4)", marginBottom: "1.5rem", textDecoration: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to UnRetire
          </Link>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", marginBottom: "1rem" }}>UnRetire</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 500, color: "#F2EDE4", lineHeight: 1.1, textTransform: "capitalize" }}>start</h1>
        </div>
      </div>
      <section style={{ background: "#F2EDE4", padding: "5rem 2.5rem", minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "#9A9080", fontStyle: "italic" }}>This section is coming soon.</p>
          <Link href="/unretire" style={{ display: "inline-block", marginTop: "1.5rem", padding: ".7rem 1.8rem", background: "#7A3A28", color: "#fff", borderRadius: 8, fontSize: ".8rem", fontWeight: 600, textDecoration: "none" }}>← Back to UnRetire</Link>
        </div>
      </section>
    </>
  );
}
