"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        background: "#0D0D0D",
        borderTop: "1px solid rgba(255,255,255,.07)",
        padding: "4rem 2.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
            gap: "3rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,.07)",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".55rem",
                marginBottom: "1.2rem",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "50%",
                    height: "100%",
                    background:
                      "radial-gradient(circle at 60% 50%,#2a2a2a,#0d0d0d)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: "50%",
                    height: "100%",
                    background: "#8B1A1A",
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  color: "#F2EDE4",
                  letterSpacing: "-.01em",
                }}
              >
                Half{" "}
                <em style={{ color: "#8B1A1A", fontStyle: "italic" }}>
                  a Life
                </em>
              </span>
            </div>
            <p
              style={{
                fontSize: ".82rem",
                color: "rgba(242,237,228,.45)",
                lineHeight: 1.75,
                maxWidth: 240,
                marginBottom: "1.5rem",
              }}
            >
              Faith. Purpose. Growth. Real conversations and practical wisdom
              for the life you were made for.
            </p>
            <div style={{ display: "flex", gap: ".6rem" }}>
              {[
                { href: "https://linkedin.com/in/maherkaddoura", label: "in" },
                { href: "https://instagram.com/maherkaddoura", label: "ig" },
                { href: "https://x.com/maherkaddoura", label: "𝕏" },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".65rem",
                    color: "rgba(242,237,228,.5)",
                    transition: "all .18s",
                    fontFamily: "monospace",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "#8B1A1A";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "#F2EDE4";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "rgba(255,255,255,.15)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(242,237,228,.5)";
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Books */}
          <FooterCol
            title="Books"
            links={[
              { label: "UnRetire", href: "/unretire" },
              { label: "Bouncing Forward", href: "/books/bouncing-forward" },
              { label: "33 Under 33", href: "/books/adventure-way" },
              { label: "The Singapore Way", href: "/books/lucky-zone" },
            ]}
          />

          {/* About */}
          <FooterCol
            title="About"
            links={[
              { label: "About Maher", href: "/about" },
              { label: "Speaking", href: "/speaking" },
              { label: "Contact", href: "/contact" },
            ]}
          />

          {/* Connect */}
          <div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".55rem",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "rgba(242,237,228,.3)",
                marginBottom: "1.2rem",
              }}
            >
              Connect
            </div>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: ".75rem",
              }}
            >
              <li>
                <Link
                  href="/newsletter"
                  style={{
                    fontSize: ".88rem",
                    color: "rgba(242,237,228,.6)",
                    transition: "color .18s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#F2EDE4")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(242,237,228,.6)")
                  }
                >
                  Newsletter
                </Link>
              </li>
              <li>
                <Link
                  href="/newsletter"
                  style={{
                    fontSize: ".88rem",
                    color: "#8B1A1A",
                    fontWeight: 500,
                    transition: "color .18s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#A82020")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#8B1A1A")
                  }
                >
                  Join the Community →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span style={{ fontSize: ".75rem", color: "rgba(242,237,228,.25)" }}>
            © 2026 Half a Life · Maher Kaddoura
          </span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontSize: ".75rem",
                  color: "rgba(242,237,228,.25)",
                  transition: "color .18s",
                }}
                onMouseOver={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(242,237,228,.55)")
                }
                onMouseOut={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(242,237,228,.25)")
                }
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: ".55rem",
          letterSpacing: ".22em",
          textTransform: "uppercase",
          color: "rgba(242,237,228,.3)",
          marginBottom: "1.2rem",
        }}
      >
        {title}
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: ".75rem",
        }}
      >
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              style={{
                fontSize: ".88rem",
                color: "rgba(242,237,228,.6)",
                transition: "color .18s",
              }}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4")
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(242,237,228,.6)")
              }
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
