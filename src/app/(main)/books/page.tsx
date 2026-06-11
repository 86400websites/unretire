"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const books = [
  {
    num: "01",
    category: "Reinvention",
    href: "/unretire",
    title: "UnRetire",
    subtitle: "Reboot. Don't Mute.",
    tag: "Begin Again · Reinvention",
    blurb: "Retirement is not the end — it's the most dangerous beginning. Design your next chapter with 5 mindsets and 7 practices that restore meaning, vitality, and joy.",
    for: "For anyone at a major life threshold",
    image: "/assets/images/1.png",
    accent: "#8B1A1A",
  },
  {
    num: "02",
    category: "Resilience",
    href: "/books/bouncing-forward",
    title: "Bouncing Forward",
    subtitle: "Not back. Forward.",
    tag: "Bounce Forward · Resilience",
    blurb: "Born from the loss of his son Hikmat, this book teaches you not just to survive adversity — but to emerge from it stronger, wiser, and more fully yourself.",
    for: "For those navigating loss, failure, or adversity",
    image: "/assets/images/book-bouncing-forward-cover.png",
    accent: "#2A4A6A",
  },
  {
    num: "03",
    category: "Courage & Aliveness",
    href: "/books/33-under-33",
    title: "33 Under 33",
    subtitle: "Young People Impacting the World",
    tag: "Youth · Impact · Leadership",
    blurb: "The stories of 33 extraordinary young people who chose to impact the world before turning 33 — and what their journeys reveal about purpose, courage, and leadership.",
    for: "For young leaders and those who inspire them",
    image: "/assets/images/3.png",
    accent: "#1A4A3A",
  },
  {
    num: "04",
    category: "Nation Building",
    href: "/books/singapore-way",
    title: "The Singapore Way",
    subtitle: "Bold Principles. Real Prosperity.",
    tag: "Nation Building · Leadership",
    blurb: "A primer on how bold principles turned hardship into prosperity — the lessons Singapore's transformation offers to every leader, community, and individual willing to learn from it.",
    for: "For leaders, policy thinkers, and nation builders",
    image: "/assets/images/4.png",
    accent: "#4A2A1A",
  },
];

export default function BooksPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);

  return (
    <>
      {/* Hero */}
      <div style={{ background: "#0D0D0D", paddingTop: "calc(var(--topnav-h) + 4rem)", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
            <span style={{ display: "inline-block", width: 32, height: 1, background: "#8B1A1A" }} />
            The Library
          </p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3.5rem,8vw,7rem)", fontWeight: 400, lineHeight: .92, color: "#F2EDE4", letterSpacing: "-.02em", marginBottom: "2rem" }}>
            Books for every<br />
            <em style={{ color: "#8B1A1A", fontStyle: "italic" }}>season of life</em>
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(242,237,228,.5)", lineHeight: 1.8, maxWidth: "48ch", fontWeight: 300 }}>
            Four books by Maher Kaddoura — each an entry point into the larger world of Half a Life, organized by the life need they most directly serve.
          </p>
        </div>
      </div>

      {/* Books — full-width editorial rows */}
      <section style={{ background: "#0D0D0D" }}>
        {books.map((book, i) => (
          <Link key={book.href} href={book.href}
            style={{ display: "block", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,.06)", transition: "background .25s" }}
            onMouseOver={() => setHovered(i)}
            onMouseOut={() => setHovered(null)}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: i % 2 === 0 ? "260px 1fr auto" : "auto 1fr 260px", gap: "4rem", alignItems: "center", padding: "4rem 0", transition: "all .25s" }}>

                {/* Book number + category label (always first in DOM) */}
                {i % 2 !== 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ position: "relative", width: 200, height: 280 }}>
                      <Image src={book.image} alt={book.title} fill style={{ objectFit: "contain", filter: hovered === i ? "none" : "brightness(.85)", transition: "filter .3s", transform: hovered === i ? "translateY(-4px)" : "translateY(0)", transitionProperty: "filter, transform" }} />
                    </div>
                  </div>
                )}

                {/* Text */}
                <div style={{ gridColumn: i % 2 === 0 ? "2" : "2" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "1.5rem" }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: "3.5rem", fontWeight: 300, color: "rgba(255,255,255,.08)", lineHeight: 1 }}>{book.num}</span>
                    <div style={{ height: 1, width: 40, background: "rgba(255,255,255,.12)" }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(242,237,228,.3)" }}>{book.category}</span>
                  </div>
                  <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 400, color: "#F2EDE4", lineHeight: 1.05, marginBottom: ".5rem", letterSpacing: "-.01em" }}>{book.title}</h2>
                  <p style={{ fontFamily: "var(--serif)", fontSize: "1rem", color: "rgba(242,237,228,.35)", fontStyle: "italic", marginBottom: "1.2rem" }}>{book.subtitle}</p>
                  <p style={{ fontSize: ".88rem", color: "rgba(242,237,228,.55)", lineHeight: 1.85, maxWidth: "52ch", marginBottom: "1.5rem", fontWeight: 300 }}>{book.blurb}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".15em", textTransform: "uppercase", color: book.accent === "#8B1A1A" ? "#8B1A1A" : "rgba(242,237,228,.35)" }}>
                      {book.tag}
                    </span>
                    <span style={{ fontSize: ".8rem", color: hovered === i ? "#F2EDE4" : "rgba(242,237,228,.4)", fontWeight: 600, transition: "color .2s" }}>
                      Explore →
                    </span>
                  </div>
                </div>

                {/* Image (even rows = left, odd = right) */}
                {i % 2 === 0 && (
                  <div style={{ gridColumn: "1", gridRow: "1", display: "flex", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: 200, height: 280 }}>
                      <Image src={book.image} alt={book.title} fill style={{ objectFit: "contain", filter: hovered === i ? "none" : "brightness(.85)", transition: "filter .3s, transform .3s", transform: hovered === i ? "translateY(-4px)" : "translateY(0)" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hover accent line at bottom */}
            <div style={{ height: 2, background: book.accent, transform: hovered === i ? "scaleX(1)" : "scaleX(0)", transition: "transform .3s ease", transformOrigin: "left" }} />
          </Link>
        ))}

        {/* More coming */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 2.5rem", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 400, color: "#F2EDE4", marginBottom: ".4rem" }}>More books are coming</h3>
              <p style={{ fontSize: ".84rem", color: "rgba(242,237,228,.4)" }}>Half a Life is a growing body of work.</p>
            </div>
            {notified ? (
              <p style={{ color: "#8B1A1A", fontWeight: 600, fontSize: ".9rem" }}>✓ You&apos;re on the list!</p>
            ) : (
              <div style={{ display: "flex", border: "1px solid rgba(255,255,255,.12)", borderRadius: 6, overflow: "hidden" }}>
                <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ padding: ".7rem 1.2rem", background: "transparent", border: "none", color: "#F2EDE4", fontSize: ".85rem", fontFamily: "var(--body)", outline: "none", minWidth: 220 }} />
                <button onClick={() => email && setNotified(true)}
                  style={{ padding: ".7rem 1.5rem", background: "#8B1A1A", color: "#F2EDE4", border: "none", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Notify me
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
