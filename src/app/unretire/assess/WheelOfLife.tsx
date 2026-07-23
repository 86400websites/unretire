"use client";

import { useState } from "react";

type Spoke = { key: string; tag: string; q: string; sub: string; high: string; low: string };

const SPOKES: Spoke[] = [
  { key: "Passion & Purpose", tag: "S_PASSION",
    q: "I wake up with a reason to get going — something that genuinely pulls me forward.",
    sub: "Not a job. A direction worth your energy.",
    high: "Purpose is your engine, and it's running. The next step is aiming it.",
    low: "When the calendar empties, purpose has to be chosen — it rarely just arrives." },
  { key: "Health & Vitality", tag: "S_HEALTH",
    q: "My energy and body can keep up with the life I actually want to live.",
    sub: "Vitality is the fuel everything else burns.",
    high: "Your body isn't holding you back. Protect that — it compounds.",
    low: "Low energy is easy to mistake for low happiness. Often it's the first thing to fix." },
  { key: "Relationships", tag: "S_RELAT",
    q: "I have people in my life who truly lift me — not just people I happen to see.",
    sub: "A circle that raises you, not one that drains you.",
    high: "A strong circle is rare. It's quietly the best investment you have.",
    low: "Connection drifts silently after work ends. It has to be rebuilt on purpose." },
  { key: "Personal Growth & Creativity", tag: "S_GROWTH",
    q: "I'm still learning, stretching, and making things — not just maintaining.",
    sub: "Growth is expansion, not decline.",
    high: "Curiosity is keeping you young. Keep feeding it new terrain.",
    low: "The danger isn't aging — it's assuming your growth is already complete." },
  { key: "Spirituality & Inner Peace", tag: "S_SPIRIT",
    q: "I feel anchored to something deeper than my achievements and to-do list.",
    sub: "The quiet foundation beneath everything else.",
    high: "You have an anchor. That's what keeps balance steady when life shifts.",
    low: "Without an anchor, balance stays fragile — even when everything looks fine." },
  { key: "Fun & Adventure", tag: "S_FUN",
    q: "My weeks include real novelty, play, and moments that make me feel alive.",
    sub: "Joy isn't random. It's designed.",
    high: "You're protecting joy instead of postponing it. That's the whole game.",
    low: "Joy fades when days become identical. Novelty is the cure, and it's closer than you think." },
  { key: "Money with Meaning", tag: "S_MONEY",
    q: "My money supports the life I want now — it's a tool, not just a scorecard.",
    sub: "From accumulating to using, with intention.",
    high: "You treat money as a tool. That permission is harder to earn than the money itself.",
    low: "Many have the resources but not the permission to use them. That's a shift, not a number." },
  { key: "Contribution & Legacy", tag: "S_CONTRIB",
    q: "I'm passing on wisdom, time, or resources in a way that outlives me.",
    sub: "Usefulness has no expiry date.",
    high: "You're already gifting forward. That's where lasting meaning quietly lives.",
    low: "Wisdom unused doesn't disappear — it just goes unshared. There's still time to change that." },
];

const toLower = (s: string) => s.toLowerCase().replace(/\s*&\s*/g, " and ");

function verdictFor(t: number) {
  if (t >= 64) return "Your wheel is rolling. The work now is protecting it.";
  if (t >= 48) return "A strong wheel with one or two flat spots to firm up.";
  if (t >= 32) return "Your wheel turns — but it's wobbling in a few real places.";
  return "Right now the wheel is dragging. The good news: that's fixable, by design.";
}

// radar geometry
const CX = 180, CY = 180, R = 125, N = SPOKES.length;
const ang = (i: number) => ((-90 + i * (360 / N)) * Math.PI) / 180;
const pt = (i: number, r: number): [number, number] => [CX + Math.cos(ang(i)) * r, CY + Math.sin(ang(i)) * r];

export default function WheelOfLife() {
  const [screen, setScreen] = useState<"intro" | "quiz" | "building" | "results">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(SPOKES.length).fill(null));

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const choose = (v: number) => setAnswers((a) => a.map((x, i) => (i === current ? v : x)));
  const start = () => { setCurrent(0); setScreen("quiz"); };
  const back = () => { if (current > 0) setCurrent((c) => c - 1); };
  const build = () => { setScreen("building"); setTimeout(() => setScreen("results"), 1700); };
  const next = () => {
    if (answers[current] == null) return;
    if (current < SPOKES.length - 1) setCurrent((c) => c + 1);
    else build();
  };
  const restart = () => {
    setAnswers(Array(SPOKES.length).fill(null));
    setCurrent(0);
    setStatus("idle");
    setEmail("");
    setFirstName("");
    setScreen("intro");
  };

  // results
  const raw = answers.map((a) => a ?? 0);
  const total = raw.reduce((a, b) => a + b, 0) * 2; // 5-point scale -> /80
  let hi = 0, lo = 0;
  raw.forEach((v, idx) => { if (v > raw[hi]) hi = idx; if (v < raw[lo]) lo = idx; });
  const brightest = SPOKES[hi];
  const weakest = SPOKES[lo];

  // Each answer is on a 5-point scale; doubled it gives a score out of 10
  // per spoke (and /80 overall). Keyed by each spoke's Mailchimp merge tag
  // so the mapping can never drift out of sync with SPOKES.
  const spokeScores: Record<string, number> = Object.fromEntries(
    SPOKES.map((s, i) => [s.tag, raw[i] * 2])
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          tag: "wheel-of-life",
          mergeFields: {
            WEAKEST: weakest.key,
            WEAKLOW: toLower(weakest.key),
            BRIGHTEST: brightest.key,
            SCORE: total,
            ...spokeScores,
          },
        }),
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else { setErrorMsg(data.error || "Something went wrong. Please try again."); setStatus("error"); }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const inputClass =
    "flex-1 min-w-0 bg-white rounded-full px-5 py-3 text-[15px] text-[#232F3F] placeholder-[#9A9080] outline-none border border-[#E5DED4] focus:border-[#D05D11] focus:ring-2 focus:ring-[#D05D11]/20";

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── INTRO ── */}
      {screen === "intro" && (
        <div className="card p-8 sm:p-10 text-center max-w-2xl mx-auto">
          <p className="eyebrow mb-5">8 questions · about 2 minutes · honest, not graded</p>
          <p className="prose-body text-[17px] leading-[1.85] mb-8 max-w-[52ch] mx-auto">
            Most people plan their retirement on a spreadsheet. Almost no one designs it for meaning.
            This short check shows you which parts of your life are thriving — and which are running on
            empty.
          </p>
          <button type="button" onClick={start} className="btn btn-crimson">Check my wheel →</button>
        </div>
      )}

      {/* ── QUIZ ── */}
      {screen === "quiz" && (
        <div className="card p-8 sm:p-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[12px] font-bold tracking-[0.14em] text-[#9A9080] tabular-nums">
              {String(current + 1).padStart(2, "0")} / 08
            </span>
            <div className="flex-1 h-[3px] bg-[#ECE5DB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D05D11] rounded-full transition-all duration-300"
                style={{ width: `${(current / SPOKES.length) * 100}%` }}
              />
            </div>
          </div>

          <p className="eyebrow mb-3">{SPOKES[current].key}</p>
          <h3 className="text-2xl sm:text-[1.9rem] leading-[1.3] mb-2">{SPOKES[current].q}</h3>
          <p className="prose-body text-[15px] text-[#666666] mb-8">{SPOKES[current].sub}</p>

          <div className="flex justify-between text-[12px] text-[#9A9080] mb-2">
            <span>Rarely true</span>
            <span>Completely true</span>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => choose(v)}
                aria-label={`Rate ${v} of 5`}
                className={`aspect-square rounded-xl border text-[18px] font-bold transition-all ${
                  answers[current] === v
                    ? "bg-[#D05D11] border-[#D05D11] text-white"
                    : "bg-white border-[#E5DED4] text-[#232F3F] hover:border-[#D05D11]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={back} className={`btn btn-outline ${current === 0 ? "invisible" : ""}`}>
              ← Back
            </button>
            <button
              type="button"
              onClick={next}
              disabled={answers[current] == null}
              className="btn btn-crimson disabled:opacity-50"
            >
              {current === SPOKES.length - 1 ? "See my wheel →" : "Next →"}
            </button>
          </div>
        </div>
      )}

      {/* ── BUILDING ── */}
      {screen === "building" && (
        <div className="card p-8 sm:p-10 text-center max-w-2xl mx-auto">
          <div className="w-10 h-10 mx-auto mb-6 rounded-full border-2 border-[#ECE5DB] border-t-[#D05D11] animate-spin" />
          <p className="prose-body text-[#666666]">Mapping your wheel…</p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === "results" && (
        <div role="region" aria-label="Your results">
          <div className="text-center mb-8">
            <p className="eyebrow mb-5">Your Wheel of Life</p>
            <div className="text-[3.5rem] leading-none text-[#D05D11] mb-3">
              {total}
              <span className="text-[1.1rem] text-[#9A9080]">/80</span>
            </div>
            <p className="text-xl sm:text-2xl leading-[1.4] text-[#232F3F] max-w-[40ch] mx-auto">
              {verdictFor(total)}
            </p>
          </div>

          {/* radar wheel */}
          <div className="mb-6">
            <svg viewBox="0 0 360 360" className="w-full max-w-[400px] mx-auto" role="img" aria-label="Your Wheel of Life result">
              <circle cx={CX} cy={CY} r={R} fill="#F7F2EC" stroke="#E2D9CC" strokeWidth={1.4} />
              {[0.25, 0.5, 0.75].map((f) => (
                <circle key={f} cx={CX} cy={CY} r={R * f} fill="none" stroke="#E2D9CC" strokeWidth={1} />
              ))}
              {SPOKES.map((_, i) => {
                const [x, y] = pt(i, R);
                return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#E2D9CC" strokeWidth={1} />;
              })}
              <polygon
                points={raw.map((v, i) => pt(i, (v / 5) * R).map((n) => n.toFixed(1)).join(",")).join(" ")}
                fill="#D05D11"
                fillOpacity={0.18}
                stroke="#D05D11"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {raw.map((v, i) => {
                const [x, y] = pt(i, (v / 5) * R);
                return <circle key={i} cx={x} cy={y} r={3} fill="#D05D11" />;
              })}
              <circle cx={CX} cy={CY} r={3} fill="#232F3F" />
              {SPOKES.map((_, i) => {
                const [x, y] = pt(i, R + 18);
                return (
                  <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="700" fill="#232F3F">
                    {i + 1}
                  </text>
                );
              })}
            </svg>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 max-w-xl mx-auto mt-2 text-[12px] text-[#666666]">
              {SPOKES.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="font-bold text-[#D05D11]">{i + 1}</span>
                  <span className="leading-snug">{s.key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* brightest + weakest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="card p-6">
              <p className="eyebrow mb-2" style={{ color: "#3F7E54" }}>Brightest spoke</p>
              <h3 className="text-xl mb-2">{brightest.key}</h3>
              <p className="prose-body text-[14px] text-[#666666] leading-[1.7]">{brightest.high}</p>
            </div>
            <div className="card p-6">
              <p className="eyebrow mb-2">Weakest spoke</p>
              <h3 className="text-xl mb-2">{weakest.key}</h3>
              <p className="prose-body text-[14px] text-[#666666] leading-[1.7]">{weakest.low}</p>
            </div>
          </div>

          {/* teaser */}
          <div className="rounded-2xl bg-[#FBF5F2] border border-[#ECECEC] p-6 sm:p-8 mb-8 text-center">
            <p className="eyebrow mb-3">What this score doesn&apos;t tell you</p>
            <h3 className="text-xl sm:text-2xl leading-[1.4] mb-4 max-w-[44ch] mx-auto">
              Knowing where the wheel wobbles is the easy part. Knowing what to do about it is the work.
            </h3>
            <p className="prose-body text-[15px] text-[#666666] leading-[1.7] max-w-[54ch] mx-auto">
              Each spoke maps to a specific mindset and practice in the (Un)Retire system — the small,
              deliberate shifts that bring a weak area back to life.
            </p>
          </div>

          {/* email gate */}
          <div className="card p-6 sm:p-8 mb-6">
            {status === "success" ? (
              <div>
                <p className="eyebrow mb-2">You&apos;re in</p>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.7] max-w-[55ch]">
                  ✓ Check your inbox — a personal reading of your{" "}
                  <span className="text-[#232F3F] font-semibold">{weakest.key}</span> result is on its
                  way, followed by a short series on bringing that spoke back to life.
                </p>
              </div>
            ) : (
              <>
                <p className="eyebrow mb-2">Get your free Wheel breakdown</p>
                <h3 className="text-xl sm:text-2xl mb-2">A personal reading of your {weakest.key} result</h3>
                <p className="prose-body text-[15px] text-[#666666] leading-[1.7] mb-5 max-w-[55ch]">
                  Enter your email and we&apos;ll send a personal reading — plus a short series on
                  strengthening your weakest spoke, drawn straight from the (Un)Retire framework.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                  <label htmlFor="ur-wheel-first" className="sr-only">First name</label>
                  <input id="ur-wheel-first" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inputClass} />
                  <label htmlFor="ur-wheel-email" className="sr-only">Email address</label>
                  <input id="ur-wheel-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputClass} />
                  <button type="submit" disabled={status === "loading"} className="btn btn-crimson whitespace-nowrap disabled:opacity-60">
                    {status === "loading" ? "Sending…" : "Send it to me"}
                  </button>
                </form>
                {status === "error" && <p className="text-[13px] text-[#B91C1C] mt-2">{errorMsg}</p>}
                <p className="text-[12px] text-[#999999] mt-2">No spam. Unsubscribe anytime.</p>
              </>
            )}
          </div>

          <div className="text-center">
            <button type="button" onClick={restart} className="pill-link">↺ Retake the assessment</button>
            <p className="prose-body text-[13px] text-[#9A9080] mt-6 max-w-[48ch] mx-auto">
              The wheel isn&apos;t about perfection. It&apos;s a compass — it just tells you where to look next.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
