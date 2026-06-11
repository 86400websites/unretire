"use client";
import Link from "next/link";

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(242,237,228,.25)", marginBottom: "1.2rem" }}>{title}</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: ".75rem" }}>
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} style={{ fontSize: ".88rem", color: "rgba(242,237,228,.5)", textDecoration: "none", transition: "color .18s" }}
              onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"}
              onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.5)"}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UnRetireFooter() {
  return (
    <footer style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,.07)", padding: "4rem 2.5rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: "1.2rem" }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 700, color: "#F2EDE4", letterSpacing: ".04em" }}>UN</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "#9A7A6A", letterSpacing: ".04em" }}>RETIRE</span>
            </div>
            <p style={{ fontSize: ".82rem", color: "rgba(242,237,228,.4)", lineHeight: 1.75, maxWidth: 240, marginBottom: "1.5rem" }}>Reboot. Don&apos;t Mute. Design your next chapter with intention, purpose, and joy.</p>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", fontSize: ".7rem", fontFamily: "var(--mono)", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(242,237,228,.3)", textDecoration: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 999, padding: ".35rem .9rem", transition: "color .2s" }}
              onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.65)"}
              onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.3)"}>
              <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                <span style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: "#111" }} />
                <span style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", background: "#8B1A1A" }} />
              </span>
              Part of Half a Life
            </Link>
          </div>
          <FooterCol title="Explore" links={[{ label: "The Book", href: "/unretire/book" }, { label: "Framework", href: "/unretire/framework" }, { label: "Start Here", href: "/unretire/start" }, { label: "Articles", href: "/unretire/articles" }]} />
          <FooterCol title="Journey" links={[{ label: "Journeys", href: "/unretire/journeys" }, { label: "Tools", href: "/unretire/tools" }, { label: "Community", href: "/unretire/community" }, { label: "Course", href: "/unretire/course" }]} />
          <FooterCol title="Connect" links={[{ label: "Newsletter", href: "/unretire/newsletter" }, { label: "Speaking", href: "/unretire/speaking" }, { label: "Contact", href: "/unretire/contact" }]} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontSize: ".75rem", color: "rgba(242,237,228,.2)" }}>© 2026 UnRetire · Maher Kaddoura · Part of Half a Life</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: ".75rem", color: "rgba(242,237,228,.2)", textDecoration: "none", transition: "color .18s" }}
                onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.5)"}
                onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.2)"}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
