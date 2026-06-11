import Link from "next/link";
import Image from "next/image";
export default function AboutPage() {
  return (
    <>
      <div style={{ paddingTop: "calc(var(--topnav-h) + 1rem)", paddingBottom: "1rem", borderBottom: "1px solid #EDE5D8", background: "#F2EDE4" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".75rem", color: "#9A9080", textDecoration: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Home
          </Link>
        </div>
      </div>

      <section style={{ background: "#F2EDE4", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "280px 1fr", gap: "5rem", alignItems: "start" }}>
          {/* Sidebar */}
          <aside style={{ position: "sticky", top: "calc(var(--topnav-h) + 2rem)" }}>
          <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 14, marginBottom: "1.4rem", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.15)", position: "relative" }}>
  <Image src="/assets/images/maher.jpg" alt="Maher Kaddoura" fill style={{ objectFit: "cover" }} />
</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.32rem", fontWeight: 400, marginBottom: ".18rem", color: "#0D0D0D" }}>Half a Life</div>
            <div style={{ fontSize: ".62rem", letterSpacing: ".15em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "1.6rem" }}>Author · Speaker · Platform</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".52rem" }}>
              <Link href="/books" style={{ display: "block", padding: ".65rem 1.2rem", background: "#0D0D0D", color: "#F2EDE4", borderRadius: 8, fontSize: ".8rem", fontWeight: 600, textAlign: "center", textDecoration: "none", letterSpacing: ".05em" }}>Explore the Books</Link>
              <Link href="/speaking" style={{ display: "block", padding: ".65rem 1.2rem", border: "1.5px solid #D9CEBD", color: "#0D0D0D", borderRadius: 8, fontSize: ".8rem", fontWeight: 600, textAlign: "center", textDecoration: "none", letterSpacing: ".05em", background: "transparent" }}>Speaking Inquiries</Link>
            </div>
          </aside>

          {/* Main content */}
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".25em", textTransform: "uppercase", color: "#9A9080", marginBottom: "1.2rem" }}>The Story</p>

            {[
              { heading: "What I Believe", text: "I believe that human beings are designed for more than they usually allow themselves. That the capacity for reinvention, resilience, aliveness, and meaning doesn't diminish with age — it deepens. That the greatest human adventures are often internal: the ones that require us to shed who we were, sit with uncertainty, and build ourselves back into something truer." },
              { heading: "Why I Do This Work", text: "I write, speak, and build platforms because ideas have changed my life — and I have seen them change other lives. The questions at the heart of Half a Life are not abstract. They are urgent, practical, and personal: How do I begin again? How do I rise from this? How do I live with more courage and less regret?" },
              { heading: "What I've Learned", text: "The people who live most fully share certain qualities: they stay curious, they move toward discomfort rather than away from it, they build and maintain genuine relationships, they take action even when uncertain, and they keep renewing their sense of meaning — especially when life has stripped everything else away." },
              { heading: "Why Half a Life Exists", text: "Half a Life is an integrated body of work — books, conversations, tools, journeys, and an AI guide — built to help people navigate the real challenges of a fully lived life. The four books are different entry points into one larger worldview. The podcast deepens the ideas. The tools make the philosophy practical." },
              { heading: "How the Books Connect", text: "UnRetire is the map. Bouncing Forward is the recovery protocol. The Adventure Way is the invitation to go further. The Lucky Zone is the mindset that makes it all possible. Read one or all four — each stands alone, but together they tell one complete story about what it means to live a full human life." },
            ].map((section, i) => (
              <div key={i}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 300, margin: i === 0 ? "0 0 .95rem" : "2.5rem 0 .95rem", color: "#0D0D0D" }}>{section.heading}</h2>
                <p style={{ fontSize: ".9rem", color: "#5C5248", lineHeight: 1.92, marginBottom: "1rem" }}>{section.text}</p>
                {i === 0 && (
                  <div style={{ background: "#1C1917", padding: "1.85rem 2.2rem", margin: "1.8rem 0", borderLeft: "3px solid #8B1A1A", borderRadius: "0 14px 14px 0" }}>
                    <p style={{ color: "#F2EDE4", fontFamily: "var(--serif)", fontSize: "1.04rem", fontStyle: "italic", lineHeight: 1.65 }}>
                      &ldquo;Half a Life is not about having half of everything. It is about being fully present to what you have — and fully alive to what is possible.&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: "2.8rem", paddingTop: "1.8rem", borderTop: "1px solid #D9CEBD" }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#9A9080", marginBottom: ".8rem" }}>Get in touch</p>
              <p style={{ fontSize: ".84rem", color: "#9A9080", marginBottom: "1.1rem" }}>For speaking, media, or simply to say hello —</p>
              <Link href="/contact" style={{ display: "inline-block", padding: ".7rem 1.8rem", background: "#0D0D0D", color: "#F2EDE4", borderRadius: 8, fontSize: ".8rem", fontWeight: 600, textDecoration: "none", letterSpacing: ".05em" }}>Contact</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
