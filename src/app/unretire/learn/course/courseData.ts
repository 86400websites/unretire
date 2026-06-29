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
export const COURSE_INTRO_YOUTUBE_ID = "6cUHqODZJ28";

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
    title: "Foundation: Reboot, Don't Mute",
    summary:
      "Treat retirement as a beginning that needs design — not a default that runs on the old rules. Set your engagement commitment, then work through the four foundation lessons.",
    intro: {
      youtubeId: "nIm49kwQLaU",
      deliverablePdf: "/assets/unretire/course/Module1_Deliverable_Worksheet.pdf",
    },
    lessons: [
      { id: "1-1", title: "Why Retirement Is the Most Dangerous Beginning", youtubeId: "UwHZsnL7NTE", pdfUrl: "/assets/unretire/course/Module1_Lesson1_Worksheet.pdf" },
      { id: "1-2", title: "The Identity Gap", youtubeId: "Rse87ZWuH7k", pdfUrl: "/assets/unretire/course/Module1_Lesson2_Worksheet.pdf" },
      { id: "1-3", title: "The Mindset × Practice Equation", youtubeId: "yGjknj7EQk4", pdfUrl: "/assets/unretire/course/Module1_Lesson3_Worksheet.pdf" },
      // Lesson 4 has a video but no worksheet. TODO: confirm the lesson title with Frank.
      { id: "1-4", title: "Lesson 4", youtubeId: "gFFXNGQdU3I" },
    ],
  },
  // ── Modules 2–10: placeholders — replace titles/summaries/lessons and add
  //    intro/youtubeId/pdfUrl as Frank sends each module. ─────────────────
  {
    num: 2, slug: "module-2",
    title: "Reboot, Don't Mute",
    summary: "The core shift: rebooting into your next chapter instead of quietly fading.",
    lessons: [
      { id: "2-1", title: "The quiet crisis no one warns you about" },
      { id: "2-2", title: "Aging vs. diminishing" },
      { id: "2-3", title: "Choosing relevance" },
    ],
  },
  {
    num: 3, slug: "module-3",
    title: "The Wheel of Life",
    summary: "Mapping the eight dimensions of a full life and finding your weakest spoke.",
    lessons: [
      { id: "3-1", title: "The eight spokes" },
      { id: "3-2", title: "Reading your wheel" },
    ],
  },
  {
    num: 4, slug: "module-4",
    title: "Passion & Purpose",
    summary: "Finding a reason to rise that the job no longer hands you.",
    lessons: [
      { id: "4-1", title: "What pulls you forward" },
      { id: "4-2", title: "Designing purpose" },
      { id: "4-3", title: "Igniting passion" },
      { id: "4-4", title: "A direction, not a five-year plan" },
    ],
  },
  {
    num: 5, slug: "module-5",
    title: "Health & Vitality",
    summary: "The energy to live the life you're designing.",
    lessons: [
      { id: "5-1", title: "Vitality as fuel" },
      { id: "5-2", title: "Moving for life, not for looks" },
      { id: "5-3", title: "Small daily habits" },
    ],
  },
  {
    num: 6, slug: "module-6",
    title: "Relationships That Lift You",
    summary: "Rebuilding a circle that raises you after work ends.",
    lessons: [
      { id: "6-1", title: "The circle that lifts you" },
      { id: "6-2", title: "Reconnecting on purpose" },
      { id: "6-3", title: "New connections, later in life" },
    ],
  },
  {
    num: 7, slug: "module-7",
    title: "Growth & Creativity",
    summary: "Staying curious, learning, and making — never just maintaining.",
    lessons: [
      { id: "7-1", title: "Why growth doesn't end" },
      { id: "7-2", title: "Learning something new" },
      { id: "7-3", title: "Creating again" },
    ],
  },
  {
    num: 8, slug: "module-8",
    title: "Fun, Adventure & Inner Peace",
    summary: "Designing joy and finding an anchor deeper than achievement.",
    lessons: [
      { id: "8-1", title: "Joy is designed, not random" },
      { id: "8-2", title: "Novelty and play" },
      { id: "8-3", title: "Adventure at any age" },
      { id: "8-4", title: "Stillness and inner peace" },
    ],
  },
  {
    num: 9, slug: "module-9",
    title: "Money & Contribution with Meaning",
    summary: "From accumulating to using — and passing wisdom forward.",
    lessons: [
      { id: "9-1", title: "Money as a tool, not a scorecard" },
      { id: "9-2", title: "Permission to use it" },
      { id: "9-3", title: "Contribution & legacy" },
    ],
  },
  {
    num: 10, slug: "module-10",
    title: "Your 90-Day Design Plan",
    summary: "Turning everything into a simple, repeatable plan you build on.",
    lessons: [
      { id: "10-1", title: "Putting it together" },
      { id: "10-2", title: "The next 90 days" },
    ],
  },
];

export const getModule = (slug: string) => modules.find((m) => m.slug === slug);
export const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
