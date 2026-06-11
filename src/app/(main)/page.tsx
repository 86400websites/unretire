"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Topic data ──────────────────────────────────────────────
const topicData: Record<
  string,
  { label: string; title: string; body: string }
> = {
  leapfrogging: {
    label: "Topic",
    title: "Leapfrogging",
    body: "How nations, companies, and individuals skip over conventional stages of development to achieve breakthroughs. Stories and frameworks from 40 years of working with bold leaders across 100+ countries.",
  },
  reinvention: {
    label: "Topic",
    title: "Reinvention",
    body: "The art of starting again — not from scratch, but from experience. How to shed old identities without losing yourself, and build the next chapter with intention and courage.",
  },
  "nation-building": {
    label: "Topic",
    title: "Nation-Building",
    body: "What makes a country thrive? Maher's decades of work in public policy and leadership bring rare insight into how institutions, culture, and vision combine to build prosperous nations.",
  },
  leadership: {
    label: "Topic",
    title: "Leadership",
    body: "Leadership is not a title — it's a practice. Real conversations with real leaders about what it means to carry responsibility, inspire trust, and make hard decisions with humanity.",
  },
  innovation: {
    label: "Topic",
    title: "Innovation",
    body: "Innovation is not just technology. It's a mindset, a culture, and a discipline. Practical frameworks for building organizations and lives that keep evolving.",
  },
  resilience: {
    label: "Topic",
    title: "Resilience",
    body: "Resilience isn't about bouncing back to who you were. It's about bouncing forward into who you're becoming. Hard-won lessons from setbacks, losses, and moments of reinvention.",
  },
  "social-impact": {
    label: "Topic",
    title: "Social Impact",
    body: "How individuals and organizations create lasting change. Beyond charity — the systems, stories, and strategies that make communities and societies genuinely better.",
  },
  adventure: {
    label: "Topic",
    title: "Adventure",
    body: "Life is short and the world is wide. Stories from the road, the mountains, and the unexpected encounters that shaped a worldview built on curiosity and courage.",
  },
  mentorship: {
    label: "Topic",
    title: "Mentorship",
    body: "The most valuable thing you can give someone is not money or connections — it's your attention and your honesty. Reflections on mentoring, being mentored, and paying it forward.",
  },
  legacy: {
    label: "Topic",
    title: "Legacy",
    body: "What do you want to leave behind? Not in terms of monuments or wealth, but in how people lived differently because you were here. A deep conversation about meaning and lasting impact.",
  },
  entrepreneurship: {
    label: "Topic",
    title: "Entrepreneurship",
    body: "Building something from nothing — the real story, not the highlight reel. Practical wisdom for founders, intrapreneurs, and anyone who sees a gap and decides to fill it.",
  },
  purpose: {
    label: "Topic",
    title: "Purpose",
    body: "Purpose is not found — it's built. Through the work you do, the people you serve, and the commitments you keep. A practical and honest guide to living a life that matters.",
  },
};

const topics = Object.entries(topicData).map(([slug, data]) => ({
  slug,
  name: data.title,
}));

// ── Book ecosystems ──────────────────────────────────────────
const bookEcosystems = [
  {
    href: "/unretire",
    title: "UNRETIRE",
    bg: "#B5672A",
    image: "/assets/images/1.png",
    alt: "UnRetire",
    description:
      "For anyone refusing to disappear into a calendar of nothing. The 5 Mindsets framework, the 7 Life Dimensions, and the Bootcamp that lives them.",
    features: [
      "Book + Emirati Edition",
      "5 Mindsets framework",
      "REFIRE 4-week course",
      "Community membership",
      "Wheel of Life workbook",
    ],
  },
  {
    href: "/books/bouncing-forward",
    title: "BOUNCING FORWARD",
    bg: "#6080B8",
    image: "/assets/images/2.png",
    alt: "Bouncing Forward",
    description:
      "For anyone refusing to disappear into a calendar of nothing. The 5 Mindsets framework, the 7 Life Dimensions, and the Bootcamp that lives them.",
    features: [
      "Book + Emirati Edition",
      "5 Mindsets framework",
      "REFIRE 4-week course",
      "Community membership",
      "Wheel of Life workbook",
    ],
  },
  {
    href: "/books/adventure-way",
    title: "33 UNDER 33",
    bg: "#4A8A85",
    image: "/assets/images/3.png",
    alt: "33 Under 33",
    description:
      "For anyone refusing to disappear into a calendar of nothing. The 5 Mindsets framework, the 7 Life Dimensions, and the Bootcamp that lives them.",
    features: [
      "Book + Emirati Edition",
      "5 Mindsets framework",
      "REFIRE 4-week course",
      "Community membership",
      "Wheel of Life workbook",
    ],
  },
  {
    href: "/books/lucky-zone",
    title: "SINGAPORE WAY",
    bg: "#8B3535",
    image: "/assets/images/4.png",
    alt: "The Singapore Way",
    description:
      "For anyone refusing to disappear into a calendar of nothing. The 5 Mindsets framework, the 7 Life Dimensions, and the Bootcamp that lives them.",
    features: [
      "Book + Emirati Edition",
      "5 Mindsets framework",
      "REFIRE 4-week course",
      "Community membership",
      "Wheel of Life workbook",
    ],
  },
];

// ── Ecosystem icons ──────────────────────────────────────────
const ecosystemIcons = [
  {
    label: "The Book",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: "Frameworks",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Course",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="#5C5248" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Podcast",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
  {
    label: "Community",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Tools",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    label: "Live Tales",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

// ── Page component ───────────────────────────────────────────
export default function HomePage() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleTopicClick = (slug: string) => {
    setActiveTopic(activeTopic === slug ? null : slug);
  };

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: "var(--topnav-h)",
          backgroundImage: "url('/assets/images/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(13,13,13,.85) 0%, rgba(13,13,13,.4) 70%, transparent 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            padding: "5rem 5vw",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(3.8rem,7.5vw,6.5rem)",
                fontWeight: 400,
                lineHeight: 1.0,
                color: "#F2EDE4",
                marginBottom: ".2rem",
                letterSpacing: "-.02em",
              }}
            >
              Don&apos;t live
            </h1>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(3.8rem,7.5vw,6.5rem)",
                fontWeight: 400,
                lineHeight: 1.0,
                letterSpacing: "-.02em",
                marginBottom: "1.5rem",
              }}
            >
              <em style={{ color: "#8B1A1A", fontStyle: "italic" }}>Half</em>
              <span style={{ color: "#F2EDE4" }}> a life</span>
            </h1>
            <div
              style={{
                width: 72,
                height: 2,
                background: "#8B1A1A",
                marginBottom: "2rem",
              }}
            />
            <p
              style={{
                fontFamily: "var(--body)",
                fontSize: ".85rem",
                color: "rgba(242,237,228,.85)",
                marginBottom: "2rem",
                lineHeight: 1.7,
              }}
            >
              <strong>Faith. Purpose. Growth.</strong>
              <br />
              <span style={{ fontWeight: 300 }}>
                Real conversations and practical wisdom for the life you were
                made for.
              </span>
            </p>
            <Link
            href="/start-here"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: ".8rem 2.2rem",
                background: "#8B1A1A",
                color: "#F2EDE4",
                border: "none",
                borderRadius: 3,
                fontSize: ".78rem",
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background .2s",
              }}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "#A82020")
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "#8B1A1A")
              }
            >
              Start Here
            </Link>
          </div>
        </div>
      </section>

      {/* ══ ONE MANTRA ════════════════════════════════════════ */}
      <section style={{ background: "#F2EDE4", padding: "3rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5rem",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="two-col"
          >
            {/* Left */}
            <div>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".6rem",
                  letterSpacing: ".25em",
                  textTransform: "uppercase",
                  color: "#9A9080",
                  marginBottom: "1.2rem",
                }}
              >
                The Platform
              </p>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(2.4rem,4.5vw,3.6rem)",
                  fontWeight: 400,
                  lineHeight: 1.08,
                  color: "#0D0D0D",
                  marginBottom: "1.5rem",
                  letterSpacing: "-.015em",
                }}
              >
                One Mantra
                <br />
                <em style={{ color: "#8B1A1A" }}>Different</em> Ecosystems
              </h2>
              <p
                style={{
                  fontSize: ".95rem",
                  color: "#5C5248",
                  lineHeight: 1.9,
                  fontWeight: 300,
                  marginBottom: "2.5rem",
                }}
              >
                Each book by Maher Kaddoura is its own complete world —
                frameworks, courses, community, and tools — all rooted in the
                same belief: you were made for more.
              </p>
              <Link
                href="/books"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: ".75rem 2rem",
                  background: "#0D0D0D",
                  color: "#F2EDE4",
                  borderRadius: 3,
                  fontSize: ".78rem",
                  fontWeight: 600,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "background .2s",
                }}
                onMouseOver={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background =
                    "#222")
                }
                onMouseOut={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background =
                    "#0D0D0D")
                }
              >
                View books
              </Link>
            </div>

            {/* Right — books image */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src="/assets/images/5.png"
                alt="Maher Kaddoura books"
                width={390}
                height={390}
                style={{
                  maxWidth: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,.2))",
                }}
              />
            </div>
          </div>

          {/* Ecosystem icons */}
          <div
            style={{
              paddingTop: "3rem",
              borderTop: "1px solid rgba(13,13,13,.1)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".55rem",
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "#9A9080",
                textAlign: "center",
                marginBottom: "2.2rem",
              }}
            >
              Inside every ecosystem.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "3.5rem",
                flexWrap: "wrap",
              }}
            >
              {ecosystemIcons.map((icon) => (
                <div
                  key={icon.label}
                  style={{ textAlign: "center", opacity: 0.55 }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(13,13,13,.2)",
                      margin: "0 auto .6rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {icon.svg}
                  </div>
                  <div
                    style={{
                      fontSize: ".52rem",
                      letterSpacing: ".15em",
                      textTransform: "uppercase",
                      color: "#5C5248",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {icon.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FIND WHAT MATTERS ════════════════════════════════ */}
      <section
        style={{
          background: "#F2EDE4",
          padding: "5rem 2.5rem",
          borderTop: "1px solid rgba(13,13,13,.08)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "start",
              marginBottom: "2.5rem",
            }}
            className="two-col"
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(2rem,3.5vw,2.8rem)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: "#0D0D0D",
                  letterSpacing: "-.01em",
                }}
              >
                Find what{" "}
                <em style={{ color: "#8B1A1A" }}>matters</em>
                <br />
                to you.
              </h2>
              <p
                style={{
                  marginTop: ".8rem",
                  fontSize: ".82rem",
                  color: "#9A9080",
                  fontWeight: 300,
                  lineHeight: 1.7,
                }}
              >
                Forty years of work, across every topic that shapes how we live,
                lead, and leap forward.
              </p>
            </div>

            {/* Topic pills */}
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: ".65rem", paddingTop: ".4rem" }}
            >
              {topics.map((topic) => (
                <button
                  key={topic.slug}
                  onClick={() => handleTopicClick(topic.slug)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: ".45rem 1.1rem",
                    border: `1.5px solid ${activeTopic === topic.slug ? "#8B1A1A" : "rgba(13,13,13,.2)"}`,
                    borderRadius: 999,
                    fontSize: ".72rem",
                    fontWeight: activeTopic === topic.slug ? 600 : 400,
                    color: activeTopic === topic.slug ? "#8B1A1A" : "#5C5248",
                    background:
                      activeTopic === topic.slug
                        ? "rgba(139,26,26,.06)"
                        : "transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all .18s",
                    fontFamily: "var(--body)",
                  }}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          {/* Expand panel */}
          {activeTopic && topicData[activeTopic] && (
            <div
              style={{
                borderRadius: 12,
                background: "#0D0D0D",
                marginTop: "1rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{ padding: "2.5rem 3rem", position: "relative" }}
              >
                <button
                  onClick={() => setActiveTopic(null)}
                  style={{
                    position: "absolute",
                    top: "1.2rem",
                    right: "1.4rem",
                    background: "none",
                    border: "none",
                    color: "rgba(242,237,228,.4)",
                    fontSize: "1.4rem",
                    cursor: "pointer",
                    lineHeight: 1,
                    padding: ".2rem .5rem",
                    transition: "color .18s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "#F2EDE4")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(242,237,228,.4)")
                  }
                >
                  ×
                </button>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: ".58rem",
                    letterSpacing: ".22em",
                    textTransform: "uppercase",
                    color: "#8B1A1A",
                    marginBottom: ".6rem",
                  }}
                >
                  {topicData[activeTopic].label}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "clamp(1.6rem,3vw,2.2rem)",
                    fontWeight: 400,
                    color: "#F2EDE4",
                    marginBottom: "1rem",
                  }}
                >
                  {topicData[activeTopic].title}
                </h3>
                <p
                  style={{
                    fontSize: ".9rem",
                    color: "rgba(242,237,228,.7)",
                    lineHeight: 1.85,
                    maxWidth: 580,
                    marginBottom: "1.8rem",
                  }}
                >
                  {topicData[activeTopic].body}
                </p>
                <Link
                  href={`/articles?topic=${activeTopic}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".4rem",
                    padding: ".6rem 1.5rem",
                    background: "#8B1A1A",
                    color: "#F2EDE4",
                    borderRadius: 3,
                    fontSize: ".75rem",
                    fontWeight: 600,
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    transition: "background .2s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background =
                      "#A82020")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background =
                      "#8B1A1A")
                  }
                >
                  Explore articles →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ BOOK ECOSYSTEMS GRID ═════════════════════════════ */}
      <section style={{ background: "#EDE8DE", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
            className="two-col"
          >
            {bookEcosystems.map((book) => (
              <Link
                key={book.href}
                href={book.href}
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  background: book.bg,
                  borderRadius: 14,
                  padding: "2rem",
                  textDecoration: "none",
                  transition: "transform .2s, box-shadow .2s",
                  alignItems: "flex-start",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    "translateY(-3px)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "0 16px 48px rgba(0,0,0,.2)";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "none";
                }}
              >
                <div style={{ flexShrink: 0, width: 100 }}>
                  <Image
                    src={book.image}
                    alt={book.alt}
                    width={100}
                    height={140}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,.3)",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: ".04em",
                      marginBottom: ".6rem",
                    }}
                  >
                    {book.title}
                  </h3>
                  <p
                    style={{
                      fontSize: ".75rem",
                      color: "rgba(255,255,255,.8)",
                      lineHeight: 1.6,
                      marginBottom: "1rem",
                    }}
                  >
                    {book.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: ".3rem",
                      marginBottom: "1.2rem",
                    }}
                  >
                    {book.features.map((f) => (
                      <span
                        key={f}
                        style={{
                          fontSize: ".72rem",
                          color: "rgba(255,255,255,.9)",
                          fontWeight: 500,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <span
                    style={{ fontSize: ".8rem", color: "#fff", fontWeight: 600 }}
                  >
                    Enter the ecosystem →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NEWSLETTER CTA ═══════════════════════════════════ */}
      <section
        style={{
          background: "#8B1A1A",
          padding: "6rem 2.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(2.6rem,5vw,4rem)",
              fontWeight: 600,
              color: "#F2EDE4",
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            Join Our
            <br />
            Newsletter
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "rgba(242,237,228,.85)",
              lineHeight: 1.8,
              marginBottom: "2.5rem",
              fontWeight: 500,
            }}
          >
            A weekly note from Maher — field reports from 100+ countries,
            lessons from four decades of building, and the one idea most likely
            to move you in the seven days ahead.
          </p>
          {submitted ? (
            <p
              style={{
                color: "rgba(242,237,228,.9)",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              ✓ You&apos;re in. Watch your inbox.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                gap: ".75rem",
                maxWidth: 420,
                margin: "0 auto",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: ".9rem 1.5rem",
                  background: "#F2EDE4",
                  border: "none",
                  borderRadius: 999,
                  fontSize: ".95rem",
                  fontWeight: 500,
                  color: "#0D0D0D",
                  fontFamily: "var(--body)",
                  outline: "none",
                }}
              />
              <button
                onClick={() => email && setSubmitted(true)}
                style={{
                  padding: ".9rem 2.2rem",
                  background: "#0D0D0D",
                  color: "#F2EDE4",
                  border: "none",
                  borderRadius: 999,
                  fontSize: ".82rem",
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background .2s",
                }}
                onMouseOver={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "#1A1A1A")
                }
                onMouseOut={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "#0D0D0D")
                }
              >
                Join
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .two-col {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </>
  );
}
