// ─────────────────────────────────────────────────────────────────────────
// (Un)Retire Course — single source of truth for all course content.
//
// HOW TO USE:
//  • Each module can have an `intro` (an introduction video + a downloadable
//    "deliverable" worksheet) shown before its lessons, and a list of `lessons`
//    (each with a video + optional worksheet PDF).
//  • Add `youtubeId` (the part of a youtu.be/… link after the slash) and
//    `pdfUrl` as content arrives. Modules 2–10 are still placeholders.
//  • COURSE_INTRO_YOUTUBE_ID is the whole-course intro, shown as a free preview
//    on the hub page.
//  • COURSE_UNLOCKED gates the module content. While `false`, modules show their
//    outline but videos/PDFs stay locked. Flip to `true` once payment/access
//    is wired (or to preview locally).
// ─────────────────────────────────────────────────────────────────────────

export const COURSE_UNLOCKED = true;

// Whole-course introduction (free preview on the hub).
// This is the "Welcome" video from the course.
export const COURSE_INTRO_YOUTUBE_ID = "yfADRqlETUU";

export type Lesson = {
  id: string;
  title: string;
  youtubeId?: string;
  pdfUrl?: string;
};

export type ModuleIntro = {
  youtubeId?: string;
  deliverablePdf?: string;
  /**
   * Set by lockedModules() only. The locked outline must look exactly as it
   * did before Known issue 37 was fixed, and buildItems() decides whether to
   * draw the "Introduction" row by asking whether the intro has any content.
   * Once the ids are stripped that test says "no", and the row would silently
   * vanish for every unpaid visitor. This marker says "there IS an intro here,
   * you just may not see what is in it."
   */
  hasContent?: boolean;
};

export type Module = {
  num: number;
  slug: string;
  title: string;
  summary: string;
  intro?: ModuleIntro;
  lessons: Lesson[];
};

export const modules: Module[] = [
  {
    num: 1,
    slug: "module-1",
    title: "Do the groundwork",
    summary:
      "Switch it off and commit — in writing — to how much of yourself you're bringing.",
    intro: {
      youtubeId: "ilShYAJFc6o",
      deliverablePdf: "/api/course-worksheet?doc=m1-intro",
    },
    lessons: [
      {
        id: "1-1",
        title:
          "What If Retirement Is the Most Dangerous Beginning of Your Life?",
        youtubeId: "r81jMzTX0uI",
        pdfUrl: "/api/course-worksheet?doc=m1-l1",
      },
      {
        id: "1-2",
        title: "Who Are You When the Title Is Gone?",
        youtubeId: "EUaQQ8p0EH8",
        pdfUrl: "/api/course-worksheet?doc=m1-l2",
      },
      {
        id: "1-3",
        title: "Why Is Thinking Differently Never Enough?",
        youtubeId: "N44pfLLWiTw",
        pdfUrl: "/api/course-worksheet?doc=m1-l3",
      },
      {
        id: "1-4",
        title: "How Do You Make Sure You Actually Finish This Course?",
        youtubeId: "mBn6Q77LwAY",
      },
    ],
  },
  {
    num: 2,
    slug: "module-2",
    title: "Stop fading",
    summary:
      "There's a version of retirement where you slowly turn your own volume down — reboot instead.",
    intro: {
      youtubeId: "PChS3Jj5m44",
    },
    lessons: [
      {
        id: "2-1",
        title: "Are You Designing Your Life — or Drifting Through It?",
        youtubeId: "d4ZrqHh6wN4",
      },
      {
        id: "2-2",
        title:
          "What Has Your Retirement Actually Given You — and Quietly Taken?",
        youtubeId: "ATdqtQ0K_8w",
      },
      {
        id: "2-3",
        title: "Where Are You Strong — and Where Are You Empty?",
        youtubeId: "GgJ2_uI2xQA",
      },
      {
        id: "2-4",
        title: "Which of Your Limits Are Real — and Which Are Stories?",
        youtubeId: "baI7KU77Nxo",
      },
      {
        id: "2-5",
        title: "What Are You Refusing to Carry Into the Next Chapter?",
        youtubeId: "gjvOODOF1No",
      },
      {
        id: "2-6",
        title: "Are You Ready to Sign the Decision?",
        youtubeId: "I23rvDTXRjY",
      },
    ],
  },
  {
    num: 3,
    slug: "module-3",
    title: "Find what's gone quiet",
    summary:
      "A full life runs on eight things at once. Map all eight, and find what's missing.",
    intro: {
      youtubeId: "FJic2tnxL-I",
    },
    lessons: [
      {
        id: "3-1",
        title: "What Does Freedom Actually Mean at This Stage of Life?",
        youtubeId: "xcvkbM6EEZk",
      },
      {
        id: "3-2",
        title: "Where Are You Still Living by Old Rules?",
        youtubeId: "P0oKIJ_rdQc",
      },
      {
        id: "3-3",
        title: "What Are You Still Waiting for Permission to Do?",
        youtubeId: "myAHBY7aaig",
      },
      {
        id: "3-4",
        title: "What Are You Going to Stop Doing — and What Replaces It?",
        youtubeId: "z2dlWYZKWL8",
      },
      {
        id: "3-5",
        title: "What Does a Week Designed by You Actually Look Like?",
        youtubeId: "YsSan7Hf-Oc",
      },
    ],
  },
  {
    num: 4,
    slug: "module-4",
    title: "Find a reason to get up",
    summary:
      "The job used to hand you a reason to rise. Now build a reason that's yours.",
    intro: {
      youtubeId: "hiaAbv2_wfU",
    },
    lessons: [
      {
        id: "4-1",
        title: "Are You Still Becoming — or Just Defending What You Were?",
        youtubeId: "dXI9iXf7iGQ",
      },
      {
        id: "4-2",
        title:
          "Who Have You Been — and What Did Those Roles Actually Give You?",
        youtubeId: "Puv3jYDV1ik",
      },
      {
        id: "4-3",
        title: "What Are You Ready to Officially Retire?",
        youtubeId: "_EAusDFnF6k",
      },
      {
        id: "4-4",
        title: "What Is the Title of Your Next Chapter?",
        youtubeId: "JkUzxd-2ack",
      },
      {
        id: "4-5",
        title: "What Will Prove This Chapter Is Real?",
        youtubeId: "tJP807k3Ego",
      },
    ],
  },
  {
    num: 5,
    slug: "module-5",
    title: "Build the energy for it",
    summary:
      "Not a fitness programme — just the energy that makes everything else possible.",
    intro: {
      youtubeId: "spgMA1lT-DY",
    },
    lessons: [
      {
        id: "5-1",
        title: "Why Does Imbalance Follow You Into Retirement?",
        youtubeId: "MZB42J3Ztcw",
      },
      {
        id: "5-2",
        title: "What Does Your Life Actually Look Like Right Now?",
        youtubeId: "PCe1ttAsTRg",
      },
      {
        id: "5-3",
        title: "Does Your Time Actually Reflect Your Values?",
        youtubeId: "uSGbgfm3dMo",
      },
      {
        id: "5-4",
        title: "What Are You Refusing to Let Slip This Week?",
        youtubeId: "0zwEwHKRtQ0",
      },
      {
        id: "5-5",
        title: "How Do You Correct the Drift — Without Filling Every Hour?",
        youtubeId: "XuoyoSpBOdU",
      },
    ],
  },
  {
    num: 6,
    slug: "module-6",
    title: "Rebuild the circle",
    summary:
      "Much of your social life was quietly subcontracted to work. Then work ends. Rebuild a new circle that fits.",
    intro: {
      youtubeId: "7DbpVvYN828",
    },
    lessons: [
      {
        id: "6-1",
        title: "What Are You Actually Looking For — Recognition or Impact?",
        youtubeId: "AEtp2drHH_o",
      },
      {
        id: "6-2",
        title: "What Do You Actually Know That the World Still Needs?",
        youtubeId: "0z9TTH7UNx0",
      },
      {
        id: "6-3",
        title: "Whose Problem Are You Built to Solve?",
        youtubeId: "YUdY9xSq6ds",
      },
      {
        id: "6-4",
        title: "What Vehicle Will Carry Your Contribution?",
        youtubeId: "1Qr35tveVFE",
      },
      {
        id: "6-5",
        title: "What Will You Have Done by Day Ninety?",
        youtubeId: "ZvvVevxxFAo",
      },
    ],
  },
  {
    num: 7,
    slug: "module-7",
    title: "Keep learning. Keep creating.",
    summary:
      "Don't just tick the boxes. Stay curious, make things, keep your mind awake.",
    intro: {
      youtubeId: "8tkbktQsxrI",
    },
    lessons: [
      {
        id: "7-1",
        title: "Why Doesn't Joy Just Arrive When the Calendar Clears?",
        youtubeId: "srFPVGD3NsI",
      },
      {
        id: "7-2",
        title: "What Gives You Energy — and What Quietly Drains It?",
        youtubeId: "fShRUM9fKX4",
      },
      {
        id: "7-3",
        title: "What Three Joy Habits Will You Refuse to Skip?",
        youtubeId: "pgxAp6z7b7Q",
      },
      {
        id: "7-4",
        title: "When Did You Last Do Something for the First Time?",
        youtubeId: "i9iOg35KEsE",
      },
      {
        id: "7-5",
        title: "Which Mindset Will Change Your Next 90 Days the Most?",
        youtubeId: "s1xJuSog7-8",
      },
    ],
  },
  {
    num: 8,
    slug: "module-8",
    title: "Design the joy",
    summary:
      "Joy won't just turn up. Design it in on purpose — and find an anchor deeper than achievement.",
    intro: {
      youtubeId: "Dl0h-jJuKMc",
    },
    lessons: [
      {
        id: "8-1",
        title: "What Will You Now Pour Your Energy Into?",
        youtubeId: "VWUfljAyqCk",
      },
      {
        id: "8-2",
        title: "Are You Resting — or Retreating?",
        youtubeId: "4oKeDYaCXeE",
      },
      {
        id: "8-3",
        title: "Who Truly Knows You Right Now?",
        youtubeId: "FDVdKr5PYAM",
      },
      {
        id: "8-4",
        title: "Where Is Your Wisdom Still Needed?",
        youtubeId: "eyE9A4421Qc",
      },
    ],
  },
  {
    num: 9,
    slug: "module-9",
    title: "Spend it. Pass it on.",
    summary:
      "A working life is spent accumulating. Money, time, hard-won wisdom — put it to work and pass it forward.",
    intro: {
      youtubeId: "EPBMgHoi4HY",
    },
    lessons: [
      {
        id: "9-1",
        title: "When Did You Last Feel Like a Beginner?",
        youtubeId: "vQyVhGhIw2Y",
      },
      {
        id: "9-2",
        title: "What Are You Refusing to Learn?",
        youtubeId: "Y5F4sb2EDf0",
      },
      {
        id: "9-3",
        title: "Where Is Your Life Quietly Leaking?",
        youtubeId: "TvfNsmF5Mzo",
      },
      {
        id: "9-4",
        title: "Which Three Levers Will Carry the Next 90 Days?",
        youtubeId: "sjsye18HSOI",
      },
    ],
  },
  {
    num: 10,
    slug: "module-10",
    title: "Write the 90-day plan",
    summary:
      "It's all together. Leave with a plan in your hand — not a notebook of nice ideas.",
    intro: {
      youtubeId: "vMnHVfjCrQQ",
    },
    lessons: [
      {
        id: "10-1",
        title: "What Will the Next 90 Days Actually Look Like?",
        youtubeId: "pEK6FSSwZT4",
      },
      {
        id: "10-2",
        title: "What Does Your Default Week Look Like?",
        youtubeId: "M5yBm0Zl3NY",
      },
      {
        id: "10-3",
        title: "Will You Hold the Line for Ninety Days?",
        youtubeId: "mb1nW1ru7Rw",
      },
      { id: "10-4", title: "Who Have You Become?", youtubeId: "A2V3ZnGnlPg" },
      { id: "10-5", title: "Will You Sign It?", youtubeId: "gbV0e8SjDuU" },
    ],
  },
];

export const getModule = (slug: string) => modules.find((m) => m.slug === slug);
export const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);

/**
 * The locked projection of the course — Known issue 37, half two.
 *
 * `modules` above is the PAID PAYLOAD: 58 video ids and every worksheet link.
 * It used to be imported directly by CoursePlayer, a `"use client"` component,
 * so the whole $99 course shipped in the JavaScript bundle of every visitor —
 * signed out, signed in, paid or not. The padlock in the UI was decoration; the
 * content behind it was already on the visitor's machine.
 *
 * The fix is structural: CoursePlayer no longer imports this file at all. It is
 * handed a `modules` array as a prop, and the SERVER decides which one — the
 * real data for an entitled member, this projection for everyone else.
 *
 * The projection keeps everything the locked outline legitimately shows (module
 * numbers, titles, summaries, lesson titles, and whether a lesson HAS a video
 * or worksheet, so the padlock can be drawn in the right places) and drops
 * every value that is the product itself.
 *
 * Asserted by AC-012: an anonymous visitor's page — HTML and referenced JS
 * chunks — must contain no lesson video id.
 */
export function lockedModules(): Module[] {
  return modules.map((m) => ({
    num: m.num,
    slug: m.slug,
    title: m.title,
    summary: m.summary,
    // `{}` rather than undefined: the row still renders, still shows a padlock,
    // and still says a video exists — it just carries no id.
    intro: m.intro ? { hasContent: true } : undefined,
    lessons: m.lessons.map((l) => ({ id: l.id, title: l.title })),
  }));
}
