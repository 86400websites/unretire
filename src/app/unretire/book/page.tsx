import Link from "next/link";
import Image from "next/image";

const bookFor = ["You don't want to disappear just because your job title did","You feel financially okay but existentially restless","You still feel useful — but don't know where to apply it","You're allergic to clichés about aging and \"slowing down\"","You want meaning without hustle, and purpose without pressure"];
const chapters = [
  { num: "Chapter 1", title: "Reboot Don't Mute", desc: "Retirement is not the end — it's the most dangerous beginning. The quiet crisis no one talks about." },
  { num: "Chapter 2", title: "The (Un)Retire Framework", desc: "Empowered Mindset × Intentional Practice. How belief and behaviour unlock the next chapter." },
  { num: "Chapter 3", title: "The Five Mindsets", desc: "Freedom, Evolution, Balance, Relevance, Joy — five transformational belief shifts." },
  { num: "Chapter 4", title: "The Seven Practices", desc: "Ignite, Move, Connect, Contribute, Explore, Grow, Optimise — daily practices that make mindsets real." },
  { num: "Chapter 5", title: "The 14-Day Starter Plan", desc: "A practical, day-by-day action plan to build real momentum immediately." },
  { num: "Chapter 6", title: "Life Design Workbook", desc: "Structured exercises to personalise the framework to your own life and aspirations." },
];

export default function BookPage() {
  return (
    <>
      <div style={{ background: "linear-gradient(160deg,#1a0e08 0%,#0f0905 100%)", paddingTop: "calc(70px + 4rem)", paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "#7A3A28", marginBottom: "1rem" }}>The Book</p>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem,5vw,5rem)", fontWeight: 700, color: "#F2EDE4", letterSpacing: ".04em", lineHeight: 1, marginBottom: "1.5rem" }}>
              <span style={{ color: "#8B1A1A" }}>UN</span>RETIRE
            </h1>
            <p style={{ fontSize: ".95rem", color: "rgba(242,237,228,.7)", lineHeight: 1.8, marginBottom: ".5rem" }}>Life after work is just the beginning — step into your next chapter with meaning, balance, and adventure.</p>
            <p style={{ fontSize: ".82rem", color: "rgba(242,237,228,.4)", marginBottom: "2rem" }}>By Maher Kaddoura</p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a href="https://amazon.com" target="_blank" rel="noopener noreferrer" style={{ padding: ".75rem 2rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 4, fontSize: ".8rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none" }}>Buy on Amazon</a>
              <Link href="/unretire/framework" style={{ padding: ".75rem 2rem", background: "rgba(255,255,255,.08)", color: "#F2EDE4", borderRadius: 4, fontSize: ".8rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", textDecoration: "none", border: "1px solid rgba(255,255,255,.15)" }}>Explore Framework</Link>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image src="/assets/images/1.png" alt="UnRetire book cover" width={260} height={360} style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,.7))" }} />
          </div>
        </div>
      </div>

      <section style={{ background: "#F2EDE4", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem" }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#7A3A28", marginBottom: ".75rem" }}>About the Book</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 400, color: "#0D0D0D", lineHeight: 1.15, marginBottom: "1.2rem" }}>A Different Kind of Promise</h2>
            <p style={{ fontSize: ".9rem", color: "#5C5248", lineHeight: 1.9, marginBottom: "1rem" }}>Retirement is the only major life transition we prepare for financially — but avoid emotionally. We plan the numbers, but when the day finally arrives, many people find themselves strangely unprepared. Not because they lack money. But because they lack <em>meaning</em>.</p>
            <div style={{ background: "#1C1917", padding: "1.5rem 2rem", borderLeft: "3px solid #7A3A28", borderRadius: "0 10px 10px 0" }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1.05rem", color: "#F2EDE4", fontStyle: "italic", lineHeight: 1.65 }}>&ldquo;Retirement, done wrong, doesn&apos;t feel like freedom. It feels like drift.&rdquo;</p>
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 400, color: "#0D0D0D", marginBottom: "1rem" }}>This book is for you if:</h3>
            {bookFor.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", padding: ".75rem 0", borderBottom: "1px solid #D9CEBD" }}>
                <span style={{ color: "#7A3A28", fontWeight: 600, flexShrink: 0 }}>—</span>
                <p style={{ fontSize: ".88rem", color: "#5C5248", lineHeight: 1.7, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#EDE8DF", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#7A3A28", marginBottom: ".75rem", textAlign: "center" }}>Table of Contents</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 400, color: "#0D0D0D", textAlign: "center", marginBottom: "3rem" }}>What&apos;s Inside</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
            {chapters.map(ch => (
              <div key={ch.num} style={{ background: "#fff", border: "1px solid #D9CEBD", borderRadius: 10, padding: "1.8rem" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", color: "#9A9080", marginBottom: ".5rem" }}>{ch.num}</p>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "#0D0D0D", marginBottom: ".6rem" }}>{ch.title}</h3>
                <p style={{ fontSize: ".82rem", color: "#9A9080", lineHeight: 1.75 }}>{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#0D0807", padding: "5rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 400, color: "#F2EDE4", marginBottom: "1rem" }}>Get Your Copy</h2>
          <p style={{ fontSize: ".9rem", color: "rgba(242,237,228,.6)", marginBottom: "2rem", lineHeight: 1.8 }}>Available on Amazon worldwide. Also available in the Emirati Edition.</p>
          <a href="https://amazon.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: ".9rem 2.5rem", background: "#8B1A1A", color: "#F2EDE4", borderRadius: 4, fontSize: ".82rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}>Buy on Amazon →</a>
        </div>
      </section>
    </>
  );
}
