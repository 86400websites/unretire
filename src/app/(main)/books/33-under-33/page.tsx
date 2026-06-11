"use client";
import Link from "next/link";
import Image from "next/image";

export default function Under33Page() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#1C1917 0%,#0D0D0D 100%)", paddingTop: "calc(var(--topnav-h) + 3rem)", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem" }}>
          <Link href="/books" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "rgba(242,237,228,.4)", marginBottom: "2rem", textDecoration: "none" }}
            onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.75)"}
            onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.4)"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            All Books
          </Link>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4rem", alignItems: "center" }}>
            <Image src="/assets/images/3.png" alt="33 Under 33" width={185} height={262} style={{ borderRadius: 4, boxShadow: "-10px 10px 38px rgba(0,0,0,.5)", flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: ".75rem" }}>Young People · Impact</p>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.4rem,5vw,4.4rem)", fontWeight: 300, color: "#F2EDE4", lineHeight: 1.05, marginBottom: "2rem" }}>33 Under 33</h1>
              <a href="https://amazon.com" target="_blank" rel="noopener noreferrer"
                style={{ padding: ".75rem 2rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 4, fontSize: ".8rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none" }}>
                Get the Book
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Coming soon */}
      <section style={{ background: "#F2EDE4", padding: "6rem 2.5rem", textAlign: "center", minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 500 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".25em", textTransform: "uppercase", color: "#9A9080", marginBottom: "1rem" }}>Book Details</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 400, color: "#0D0D0D", marginBottom: "1rem" }}>More details coming soon</h2>
          <p style={{ fontSize: ".9rem", color: "#9A9080", lineHeight: 1.8, marginBottom: "2rem" }}>We&apos;re preparing the full book page. Check back soon or subscribe to the newsletter to be notified.</p>
          <Link href="/newsletter" style={{ display: "inline-block", padding: ".8rem 2rem", background: "#0D0D0D", color: "#F2EDE4", borderRadius: 4, fontSize: ".8rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none" }}>
            Stay Updated →
          </Link>
        </div>
      </section>
    </>
  );
}
