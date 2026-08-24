import { notFound } from "next/navigation";
import { modules, getModule } from "../courseData";
import CoursePlayer from "../CoursePlayer";
import { hasAccess } from "@/lib/auth/entitlements";

export function generateStaticParams() {
  return modules.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const m = getModule(module);
  if (!m) return { title: "The (Un)Retire Course" };
  return {
    title: `Module ${m.num}: ${m.title} — The (Un)Retire Course`,
    description: m.summary,
  };
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const m = getModule(module);
  if (!m) notFound();

  const unlocked = await hasAccess("course");
  return <CoursePlayer initialSlug={m.slug} unlocked={unlocked} />;
}
