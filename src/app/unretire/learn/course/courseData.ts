// ─────────────────────────────────────────────────────────────────────────
// (Un)Retire Course — single source of truth for all course content.
//
// HOW TO USE:
//  • Replace the placeholder module/lesson titles + summaries with Frank's
//    real curriculum (10 modules, varying lessons each).
//  • For each lesson, fill in `youtubeId` (the YouTube video ID — the part
//    after "watch?v=") and `pdfUrl` (the companion guide link) as they arrive.
//  • When payment / access control is ready, flip COURSE_UNLOCKED to `true`.
//    While it is `false`, every module shows its outline but the lessons stay
//    locked (no video/PDF revealed).
// ─────────────────────────────────────────────────────────────────────────

export const COURSE_UNLOCKED = false;

export type Lesson = {
  id: string;
  title: string;
  duration?: string; // e.g. "8 min" (optional)
  youtubeId?: string; // e.g. "dQw4w9WgXcQ" — add later
  pdfUrl?: string; // companion guide — add later
};

export type Module = {
  num: number;
  slug: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};

// PLACEHOLDER CONTENT — replace titles/summaries/lessons with the real course.
export const modules: Module[] = [
  {
    num: 1, slug: "module-1",
    title: "Welcome & the (Un)Retire Mindset",
    summary: "Why this chapter is designed, not drifted into — and how to use the course.",
    lessons: [
      { id: "1-1", title: "Welcome: how this course works" },
      { id: "1-2", title: "From drifting to designing" },
    ],
  },
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
