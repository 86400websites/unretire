{/* ── HERO — replace everything from section start to end of hero ── */}
<section
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(145deg,#0D0807 0%,#1A0F08 45%,#0D0807 100%)",
    padding: "0 2.5rem",
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* Background texture */}
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 40%, rgba(139,26,26,.12) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(200,100,30,.06) 0%, transparent 45%)", pointerEvents: "none" }} />

  {/* Giant ghost word */}
  <div style={{ position: "absolute", right: "-5vw", top: "50%", transform: "translateY(-52%)", fontFamily: "var(--serif)", fontSize: "clamp(180px,28vw,360px)", fontWeight: 700, color: "rgba(255,255,255,.025)", lineHeight: 1, letterSpacing: "-.02em", userSelect: "none", pointerEvents: "none" }}>
    REBOOT
  </div>

  <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center", position: "relative", zIndex: 2, padding: "6rem 0" }}>

    {/* Left — text */}
    <div>
      <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(242,237,228,.3)", marginBottom: "2rem", display: "flex", alignItems: "center", gap: ".8rem" }}>
        <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(242,237,228,.3)" }} />
        Life after work is just the beginning
      </p>

      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem,6vw,5.5rem)", fontWeight: 700, lineHeight: .95, color: "#F2EDE4", letterSpacing: ".04em", marginBottom: "2rem" }}>
        <span style={{ color: "#8B1A1A" }}>UN</span>RETIRE
      </h1>

      <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, rgba(139,26,26,.8), transparent)", marginBottom: "2rem" }} />

      <p style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 300, color: "#F2EDE4", lineHeight: 1.35, marginBottom: ".75rem", fontStyle: "italic" }}>
        Reboot. Don&apos;t Mute.
      </p>

      <p style={{ fontSize: ".9rem", color: "rgba(242,237,228,.5)", lineHeight: 1.85, maxWidth: "44ch", marginBottom: "2.5rem", fontWeight: 300 }}>
        Retirement is not a finish line. It&apos;s an inflection point — and the framework to design what comes next starts here.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/unretire/framework"
          style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", padding: ".85rem 2.2rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 3, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", transition: "background .2s" }}
          onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.background = "#A82020"}
          onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.background = "#8B1A1A"}>
          Explore the Framework
        </Link>
        <Link href="/unretire/book"
          style={{ display: "inline-flex", alignItems: "center", padding: ".85rem 2.2rem", background: "transparent", color: "rgba(242,237,228,.6)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 3, fontSize: ".78rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", transition: "all .2s" }}
          onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#F2EDE4"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.35)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(242,237,228,.6)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.15)"; }}>
          The Book
        </Link>
      </div>
    </div>

    {/* Right — book cover */}
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative" }}>
        {/* Glow behind book */}
        <div style={{ position: "absolute", inset: "-20%", background: "radial-gradient(ellipse, rgba(139,26,26,.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Image
          src="/assets/images/1.png"
          alt="UnRetire by Maher Kaddoura"
          width={320}
          height={440}
          style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 32px 64px rgba(0,0,0,.6))" }}
          priority
        />
      </div>
    </div>
  </div>
</section>
