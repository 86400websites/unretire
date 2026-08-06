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
export const COURSE_INTRO_YOUTUBE_ID = "uUsQyq5PaTY";

export type Lesson = {
  id: string;
  title: string;
  youtubeId?: string;
  pdfUrl?: string;
};

export type ModuleIntro = {
  youtubeId?: string;
  deliverablePdf?: string;
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
      deliverablePdf: "/assets/unretire/course/Module1_Deliverable_Worksheet.pdf",
    },
    lessons: [
      { id: "1-1", title: "What If Retirement Is the Most Dangerous Beginning of Your Life?", youtubeId: "r81jMzTX0uI", pdfUrl: "/assets/unretire/course/Module1_Lesson1_Worksheet.pdf" },
      { id: "1-2", title: "Who Are You When the Title Is Gone?", youtubeId: "EUaQQ8p0EH8", pdfUrl: "/assets/unretire/course/Module1_Lesson2_Worksheet.pdf" },
      { id: "1-3", title: "Why Is Thinking Differently Never Enough?", youtubeId: "N44pfLLWiTw", pdfUrl: "/assets/unretire/course/Module1_Lesson3_Worksheet.pdf" },
      { id: "1-4", title: "How Do You Make Sure You Actually Finish This Course?", youtubeId: "mBn6Q77LwAY" },
    ],
  },
  // ── Modules 2–10: placeholders — replace titles/summaries/lessons and add
  //    intro/youtubeId/pdfUrl as Frank sends each module. ─────────────────
  {
    num: 2, slug: "module-2",
    title: "Your Baseline: The Truth Before the Design",
    summary: "Before you design the next chapter, tell yourself the truth about where you are now.",
    intro: {
      youtubeId: "2AFHUQsDyr8",
      deliverablePdf: "/assets/unretire/course/Module2_Deliverable_Worksheet.pdf",
    },
    lessons: [
      { id: "2-1", title: "Are You Designing Your Life — or Drifting Through It?", youtubeId: "d4ZrqHh6wN4" },
      { id: "2-2", title: "What Has Your Retirement Actually Given You — and Quietly Taken?", youtubeId: "ATdqtQ0K_8w" },
      { id: "2-3", title: "Where Are You Strong — and Where Are You Empty?", youtubeId: "GgJ2_uI2xQA" },
      { id: "2-4", title: "Which of Your Limits Are Real — and Which Are Stories?", youtubeId: "baI7KU77Nxo" },
      { id: "2-5", title: "What Are You Refusing to Carry Into the Next Chapter?", youtubeId: "gjvOODOF1No" },
      { id: "2-6", title: "Are You Ready to Sign the Decision?", youtubeId: "OtRnwu5MKOM" },
    ],
  },
  {
    num: 3, slug: "module-3",
    title: "Find what's gone quiet",
    summary: "A full life runs on eight things at once. Map all eight, and find what's missing.",
    lessons: [
      { id: "3-1", title: "The eight spokes" },
      { id: "3-2", title: "Reading your wheel" },
    ],
  },
  {
    num: 4, slug: "module-4",
    title: "Find a reason to get up",
    summary: "The job used to hand you a reason to rise. Now build a reason that's yours.",
    lessons: [
      { id: "4-1", title: "What pulls you forward" },
      { id: "4-2", title: "Designing purpose" },
      { id: "4-3", title: "Igniting passion" },
      { id: "4-4", title: "A direction, not a five-year plan" },
    ],
  },
  {
    num: 5, slug: "module-5",
    title: "Build the energy for it",
    summary: "Not a fitness programme — just the energy that makes everything else possible.",
    lessons: [
      { id: "5-1", title: "Vitality as fuel" },
      { id: "5-2", title: "Moving for life, not for looks" },
      { id: "5-3", title: "Small daily habits" },
    ],
  },
  {
    num: 6, slug: "module-6",
    title: "Rebuild the circle",
    summary: "Much of your social life was quietly subcontracted to work. Then work ends. Rebuild a new circle that fits.",
    lessons: [
      { id: "6-1", title: "The circle that lifts you" },
      { id: "6-2", title: "Reconnecting on purpose" },
      { id: "6-3", title: "New connections, later in life" },
    ],
  },
  {
    num: 7, slug: "module-7",
    title: "Keep learning. Keep creating.",
    summary: "Don't just tick the boxes. Stay curious, make things, keep your mind awake.",
    lessons: [
      { id: "7-1", title: "Why growth doesn't end" },
      { id: "7-2", title: "Learning something new" },
      { id: "7-3", title: "Creating again" },
    ],
  },
  {
    num: 8, slug: "module-8",
    title: "Design the joy",
    summary: "Joy won't just turn up. Design it in on purpose — and find an anchor deeper than achievement.",
    lessons: [
      { id: "8-1", title: "Joy is designed, not random" },
      { id: "8-2", title: "Novelty and play" },
      { id: "8-3", title: "Adventure at any age" },
      { id: "8-4", title: "Stillness and inner peace" },
    ],
  },
  {
    num: 9, slug: "module-9",
    title: "Spend it. Pass it on.",
    summary: "A working life is spent accumulating. Money, time, hard-won wisdom — put it to work and pass it forward.",
    lessons: [
      { id: "9-1", title: "Money as a tool, not a scorecard" },
      { id: "9-2", title: "Permission to use it" },
      { id: "9-3", title: "Contribution & legacy" },
    ],
  },
  {
    num: 10, slug: "module-10",
    title: "Write the 90-day plan",
    summary: "It's all together. Leave with a plan in your hand — not a notebook of nice ideas.",
    lessons: [
      { id: "10-1", title: "Putting it together" },
      { id: "10-2", title: "The next 90 days" },
    ],
  },
];

export const getModule = (slug: string) => modules.find((m) => m.slug === slug);
export const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
