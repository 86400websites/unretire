import { notFound } from "next/navigation";
import {
  modules,
  getModule,
  lockedModules,
  COURSE_INTRO_YOUTUBE_ID,
} from "../courseData";
import CoursePlayer from "../CoursePlayer";
import { hasAccess } from "@/lib/auth/entitlements";

export function generateStaticParams() {
  return modules.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const m = getModule(module);
  if (!m) return { title: "The (Un)Retire Course" };
  return {
    title: `Module ${m.num}: ${m.title} — The (Un)Retire Course`,
    description: m.summary,
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const m = getModule(module);
  if (!m) notFound();

  // Known issue 37. The entitlement check always ran here, but its ANSWER was
  // all that reached the browser — the course content itself was imported
  // directly by CoursePlayer, a client component, so every visitor received all
  // 58 lesson video ids and every worksheet link regardless of the answer.
  //
  // Now the answer decides WHICH DATA is sent. An unentitled visitor's browser
  // never receives the paid payload at all, so there is nothing to uncover in
  // devtools, the page source, or the JS bundle. Asserted by AC-011 and AC-012.
  const unlocked = await hasAccess("course");
  return (
    <CoursePlayer
      initialSlug={m.slug}
      unlocked={unlocked}
      modules={unlocked ? modules : lockedModules()}
      courseIntroYoutubeId={COURSE_INTRO_YOUTUBE_ID}
    />
  );
}
