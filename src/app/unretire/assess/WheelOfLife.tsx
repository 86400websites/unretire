"use client";

import { useState } from "react";
import Link from "next/link";

const dims = [
  { name: "Passion & Purpose", practice: "Ignite" },
  { name: "Health & Vitality", practice: "Move" },
  { name: "Relationships", practice: "Connect" },
  { name: "Personal Growth & Creativity", practice: "Grow" },
  { name: "Spirituality & Inner Peace", practice: "Grow" },
  { name: "Fun & Adventure", practice: "Explore" },
  { name: "Money With Meaning", practice: "Optimize" },
  { name: "Contribution & Legacy", practice: "Contribute" },
];

const CX = 200;
const CY = 200;
const R = 150;
const SEG = 360 / dims.length;

const polar = (deg: number, r: number): [number, number] => {
  const t = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(t), CY - r * Math.cos(t)];
};

const wedgePath = (i: number, r: number) => {
  const [x0, y0] = polar(i * SEG, r);
  const [x1, y1] = polar((i + 1) * SEG, r);
  return `M${CX} ${CY} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
};

export default function WheelOfLife() {
  const [scores, setScores] = useState<number[]>(Array(dims.length).fill(5));
  const [revealed, setRevealed] = useState(false);

  const setScore = (i: number, v: number) =>
    setScores((s) => s.map((x, j) => (j === i ? v : x)));

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const ranked = dims
    .map((d, i) => ({ ...d, score: scores[i], i }))
    .sort((a, b) => a.score - b.score);
  const quiet = ranked.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Wheel */}
      <div className="order-2 lg:order-1">
        <svg viewBox="0 0 400 440" className="w-full max-w-[440px] mx-auto" role="img" aria-label="Your Wheel of Life">
          {/* base + guide rings */}
          <circle cx={CX} cy={CY} r={R} fill="#F7F2EC" stroke="#E5E5E5" strokeWidth="1" />
          {[0.25, 0.5, 0.75].map((f) => (
            <circle key={f} cx={CX} cy={CY} r={R * f} fill="none" stroke="#ECE5DB" strokeWidth="1" />
          ))}
          {/* filled wedges */}
          {scores.map((s, i) => (
            <path key={`w${i}`} d={wedgePath(i, (s / 10) * R)} fill="#D05D11" fillOpacity="0.82" />
          ))}
          {/* spokes */}
          {dims.map((_, i) => {
            const [x, y] = polar(i * SEG, R);
            return <line key={`s${i}`} x1={CX} y1={CY} x2={x} y2={y} stroke="#fff" strokeWidth="2" />;
          })}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#D8CFC2" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r="4" fill="#232F3F" />
          {/* numbers */}
          {dims.map((_, i) => {
            const [x, y] = polar(i * SEG + SEG / 2, R + 22);
            return (
              <text key={`n${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill="#232F3F">
                {i + 1}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Sliders */}
      <div className="order-1 lg:order-2">
        <p className="prose-body text-[15px] text-[#666666] leading-[1.7] mb-6">
          Move each slider to where you are <em>today</em> — not where you think you should be. There
          are no wrong answers, only honest ones.
        </p>
        <ul className="space-y-4">
          {dims.map((d, i) => (
            <li key={d.name}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <label htmlFor={`dim-${i}`} className="flex items-center gap-2 text-[14px] text-[#232F3F]">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FAF3EE] text-[#D05D11] text-[11px] font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {d.name}
                </label>
                <span className="text-[14px] font-bold text-[#D05D11] tabular-nums w-6 text-right">{scores[i]}</span>
              </div>
              <input
                id={`dim-${i}`}
                type="range"
                min={1}
                max={10}
                step={1}
                value={scores[i]}
                onChange={(e) => setScore(i, Number(e.target.value))}
                className="w-full accent-[#D05D11] cursor-pointer"
              />
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setRevealed(true)} className="btn btn-crimson w-full mt-7">
          See where I&apos;m muting myself
        </button>
      </div>

      {/* Results */}
      {revealed && (
        <div className="lg:col-span-2 order-3" role="region" aria-label="Your results">
          <div className="card p-8 sm:p-10 mt-2">
            <p className="eyebrow mb-3">Your reflection</p>
            <h3 className="text-2xl sm:text-3xl mb-4">
              {avg >= 7
                ? "You're living a fairly full wheel."
                : avg >= 4.5
                  ? "A few areas are asking for your attention."
                  : "Several areas are ready to be turned back up."}
            </h3>
            <p className="prose-body leading-[1.85] mb-7 max-w-[60ch]">
              This isn&apos;t a score to pass or fail. It&apos;s a snapshot. The lowest spokes
              aren&apos;t weaknesses — they&apos;re the places your next chapter is quietly asking for
              more. Start with one.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {quiet.map((q) => (
                <div key={q.name} className="rounded-2xl bg-[#FBF5F2] border border-[#ECECEC] p-5">
                  <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#888888] mb-1">
                    {q.score}/10
                  </p>
                  <p className="text-[1.05rem] text-[#232F3F] leading-snug mb-2">{q.name}</p>
                  <p className="text-[13px] text-[#666666] leading-snug">
                    Start with the <span className="text-[#D05D11] font-bold">{q.practice}</span> practice.
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/unretire/practice#practices" className="btn btn-crimson">
                Explore the 7 Practices
              </Link>
              <Link href="/unretire/start" className="btn btn-outline">
                Get the Free 14-Day Starter Plan
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
