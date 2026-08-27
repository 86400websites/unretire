import Link from "next/link";
import Image from "next/image";
import DiscoveryForm from "./DiscoveryForm";
import FaqAccordion from "./FaqAccordion";

export const metadata = {
  title: "For Organisations",
  description:
    "(Un)Retire for organisations — two programs built on the (Un)Retire book and framework that prepare your people for retirement emotionally, not just financially.",
};

const fourWeek: [string, string, string][] = [
  ["Week 1", "Reboot.", "Face the drift honestly. Set the baseline."],
  ["Week 2", "Reframe.", "Install the five mindsets."],
  ["Week 3", "Rebuild.", "Put the seven practices to work."],
  ["Week 4", "Redesign.", "Lock in the 90-day plan and the next chapter."],
];
const halfDay: [string, string, string][] = [
  ["Session 1", "The 5 Mindsets.", "Change how they think."],
  ["Session 2", "The 7 Practices.", "Change what they do."],
  ["Lunch", "", "The room keeps talking. That is the point."],
];
const faqs: [string, string][] = [
  [
    "Who is it actually for?",
    "Anyone approaching retirement — and the HR and leadership teams preparing them. Buyers and their people both find themselves in it.",
  ],
  [
    "In person or online?",
    "The four-week series runs either way. The half-day is best in person — the room does real work that a screen can't.",
  ],
  [
    "How many people per group?",
    "12–25 per cohort for the series. 15–30 for the half-day intensive, drawn from one company.",
  ],
  [
    "Can we start small?",
    "Yes. Start with a morning. Grow into a month. Many organisations do exactly that.",
  ],
  [
    "How do we begin?",
    "One discovery call. We map the program to your team from there.",
  ],
];

function Rows({ items }: { items: [string, string, string][] }) {
  return (
    <div className="space-y-3 mb-6">
      {items.map(([label, theme, desc]) => (
        <div key={label} className="flex gap-4">
          <span className="w-[92px] flex-shrink-0 whitespace-nowrap text-[12px] font-bold text-[#D05D11] uppercase tracking-wide">
            {label}
          </span>
          <span className="flex-1 text-[14px] leading-[1.6]">
            {theme && (
              <span className="font-bold text-[#232F3F]">{theme} </span>
            )}
            <span className="text-[#666666]">{desc}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mb-6">
      {items.map((li) => (
        <li
          key={li}
          className="text-[14px] text-[#4A443B] leading-[1.6] pl-5 relative"
        >
          <span className="absolute left-0 text-[#D05D11]">•</span>
          {li}
        </li>
      ))}
    </ul>
  );
}

export default function EnterprisePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="eyebrow mb-6">(Un)Retire · For Organisations</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
                You planned their pension. Who planned their purpose?
              </h1>
              <span className="rule mt-7 mb-7" aria-hidden="true" />
              <p className="prose-body text-[17px] leading-[1.8] mb-5">
                They gave you thirty years. You gave them a spreadsheet and a
                farewell cake for retirement.
              </p>
              <p className="prose-body text-[17px] leading-[1.8] mb-5">
                Your people will not retire broke. They will retire blank. Not
                because you failed them on the money — because nobody prepared
                them for the morning after.
              </p>
              <p className="lede mb-8">
                That gap is yours to close — and it is the cheapest gap you will
                ever close. One book. One framework. Two programmes. A workforce
                that leaves loyal, stays sharper to the last day, and speaks
                well of you long after.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="#discovery" className="btn btn-crimson">
                  Book a Call →
                </Link>
                <Link href="#programs" className="btn btn-outline">
                  Explore the Programs
                </Link>
              </div>
            </div>
            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden bg-white border border-[#ECE5DB]">
              <Image
                src="/assets/unretire/enterprise/DriftVsDesign.png"
                alt="Drift vs Design — the choice between drifting through retirement and designing it"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── QUOTE (creative pull-quote) ──────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <span
            className="block text-[5rem] sm:text-[6rem] leading-[0.7] text-[#D05D11] mb-2"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="text-3xl sm:text-4xl lg:text-5xl italic text-white leading-[1.3]">
            Aging is inevitable. Diminishing is optional.
          </p>
          <p className="mt-8 text-[13px] uppercase tracking-[0.16em] text-white/60">
            Maher Kaddoura
          </p>
        </div>
      </section>

      {/* ── TWO PROGRAMS ─────────────────────────────────────── */}
      <section id="programs" className="bg-[#FAF5F0] scroll-mt-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="eyebrow mb-5">Two Ways to Deliver It</p>
            <h2 className="text-3xl sm:text-4xl">
              Choose a four-week program, or a morning program.
            </h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
            <p className="lede">
              Same book. Same workbook. Same framework. One question of time.
              Some teams can give the transition room to breathe. Some have a
              morning, not a month. Both send people off designed, not adrift.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-7 sm:p-8">
              <p className="eyebrow mb-3">The Four-Week Series</p>
              <h3 className="text-2xl text-[#14110D] leading-snug mb-2">
                (Un)Retire at Work
              </h3>
              <p className="prose-body text-[15px] leading-[1.7] mb-2">
                For teams who can give the transition room to breathe.
              </p>
              <p className="text-[14px] font-semibold text-[#4A443B] mb-6">
                Four 90-minute workshops. One a week, over four weeks.
              </p>
              <Rows items={fourWeek} />
              <Bullets
                items={[
                  "All five mindsets, all seven practices — with time to settle.",
                  "Drift Check scored three times — see the whole arc.",
                  "Group size: 12–25 per cohort.",
                  "Delivered: in person or live online.",
                ]}
              />
              <p className="text-[14px] italic text-[#837A6E]">
                The trade: depth. Beliefs settle between sessions.
              </p>
            </div>

            <div className="card p-7 sm:p-8">
              <p className="eyebrow mb-3">The Half-Day Intensive</p>
              <h3 className="text-2xl text-[#14110D] leading-snug mb-2">
                (Un)Retire in a Morning
              </h3>
              <p className="prose-body text-[15px] leading-[1.7] mb-2">
                For teams who have a morning, not a month.
              </p>
              <p className="text-[14px] font-semibold text-[#4A443B] mb-6">
                One half-day intensive. Then a shared lunch.
              </p>
              <Rows items={halfDay} />
              <Bullets
                items={[
                  "All five mindsets, all seven practices — in one push.",
                  "Drift Check scored twice — before and after, one morning.",
                  "Group size: 15–30 from one company.",
                  "Delivered: in person preferred — the room is the point.",
                ]}
              />
              <p className="text-[14px] italic text-[#837A6E]">
                The trade: momentum. No gap for good intentions to cool.
              </p>
            </div>
          </div>

          <div className="text-center mt-9">
            <Link href="#discovery" className="btn btn-crimson">
              Book a Call →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRIDGE BAND ──────────────────────────────────────── */}
      <section className="bg-[#D05D11]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-14 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-white leading-[1.35]">
            Whichever you choose, nobody leaves with a notebook of nice ideas.
          </p>
        </div>
      </section>

      {/* ── THE PROBLEM (two-column) ─────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <p className="eyebrow mb-5">The Gap No One Budgets For</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.15]">
                We plan the money. We skip the meaning.
              </h2>
              <span className="rule mt-6" aria-hidden="true" />
            </div>
            <div>
              <p className="prose-body text-[17px] leading-[1.85] mb-6">
                Every company prepares its people for retirement one way.
                Financially.
              </p>
              <p className="prose-body text-[17px] leading-[1.85] mb-6">
                We run the pension numbers. We book the advisor. We hand over
                the paperwork and wish them well.
              </p>
              <p className="prose-body text-[17px] leading-[1.85] mb-6">
                Then the day comes. The title disappears. The calendar empties.
                And a hole opens that no pension can fill.
              </p>
              <p className="text-[17px] italic text-[#D05D11] leading-[1.7]">
                Retirement is the only major transition we prepare for
                financially and avoid emotionally.
              </p>
              <div className="mt-8">
                <Link href="#discovery" className="btn btn-crimson">
                  Book a Call →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALREADY PAYING (cost argument) ───────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] text-white leading-tight mb-7">
            You are already paying for this. Quietly.
          </h2>
          <p className="text-white/75 text-[17px] leading-[1.85] mb-8">
            The cost of an unprepared retirement never shows up as a line on a
            budget. It shows up everywhere else.
          </p>
          <p className="text-white font-bold text-[19px] leading-[1.5] mb-6">
            And here is the part that reaches your bottom line.
          </p>
          <p className="text-white/75 text-[17px] leading-[1.85] mb-6">
            A loyal, capable person deflates within a year of a send-off that
            felt like an afterthought.
          </p>
          <p className="text-white/75 text-[17px] leading-[1.85] mb-6">
            The team watches how it ends, and files the answer: this is how they
            treat you on the way out.
          </p>
          <p className="text-white/75 text-[17px] leading-[1.85] mb-8">
            You know the pension was handled and the person was not — and it has
            never had an owner. Now it can.
          </p>
          <p className="text-[17px] italic text-[#F0A56E] leading-[1.7]">
            Prepare people properly and it reverses — on both sides of that
            table. Knowledge is handed over. Retirement dates get named. People
            leave as advocates, not cautionary tales. And the whole workforce
            learns something better about what it means to grow old inside your
            company.
          </p>
        </div>
      </section>

      {/* ── WHAT THIS ASKS OF YOU ────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <p className="eyebrow mb-5">The Lift on Your Side</p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight mb-7">
            What this asks of you: almost nothing.
          </h2>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            One approval. One named contact on your side. A room, or a link.
          </p>
          <p className="prose-body text-[17px] leading-[1.85] mb-6">
            We handle the design, the facilitation, the materials, the
            scheduling and the closing report. Nobody on your team builds
            anything, chases anyone, or stands at the front. We even draft the
            internal note announcing it, and hand it to you ready to send.
          </p>
          <p className="text-[17px] font-bold text-[#232F3F] leading-[1.6]">
            You approve it once. After that, you receive a report.
          </p>
        </div>
      </section>

      {/* ── FAQ (accordion) ──────────────────────────────────── */}
      <section className="bg-[#FAF5F0] border-y border-[#ECE5DB]">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="mb-8">
            <p className="eyebrow mb-5">Before You Ask</p>
            <h2 className="text-3xl sm:text-4xl">Questions we hear first.</h2>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* ── DISCOVERY FORM ───────────────────────────────────── */}
      <section id="discovery" className="bg-white scroll-mt-24">
        <div className="max-w-xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center mb-8">
            <p className="eyebrow mb-5">Book a Discovery Call</p>
            <h2 className="text-3xl sm:text-4xl">
              One call. We map the program to your team.
            </h2>
            <span className="rule mt-6 mb-6 mx-auto" aria-hidden="true" />
          </div>
          <DiscoveryForm />
        </div>
      </section>

      {/* ── FOOTER LINE ──────────────────────────────────────── */}
      <section className="bg-[#232F3F]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-14 text-center">
          <p className="text-white/70 text-[15px] italic">
            Built on the (Un)Retire book and workbook by Maher Kaddoura.
          </p>
        </div>
      </section>
    </>
  );
}
