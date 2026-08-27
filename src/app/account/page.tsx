import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccess } from "@/lib/auth/entitlements";
import { logout } from "@/app/auth/actions";

export const metadata = { title: "Your account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const { userId, email, products } = await getAccess();
  if (!userId) redirect("/login");

  const hasPremium = products.includes("premium");
  const hasCourse = hasPremium || products.includes("course");

  return (
    <section className="bg-white">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {checkout === "success" && (
          <div className="card p-6 mb-8 bg-[#FAF5F0] border-[#E7D9CC]">
            <p className="text-[15px] text-[#232F3F] leading-[1.6]">
              <span className="font-bold">Payment successful.</span> Welcome —
              your access is ready below.
            </p>
          </div>
        )}

        <div className="mb-8">
          <p className="eyebrow mb-5">Your account</p>
          <h1 className="text-3xl sm:text-4xl">Welcome back.</h1>
          <span className="rule mt-6" aria-hidden="true" />
        </div>

        {/* Signed in */}
        <div className="card p-7 sm:p-8 mb-6">
          <p className="eyebrow mb-2">Signed in as</p>
          <p className="text-[1.1rem] text-[#14110D]">{email}</p>
        </div>

        {/* Access */}
        <div className="card p-7 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <p className="eyebrow">Your access</p>
            {hasPremium ? (
              <span className="px-3 py-1 rounded-full bg-[#F6EDE6] text-[#8B1A1A] text-[11px] font-bold uppercase tracking-wide">
                Premium
              </span>
            ) : hasCourse ? (
              <span className="px-3 py-1 rounded-full bg-[#F6EDE6] text-[#8B1A1A] text-[11px] font-bold uppercase tracking-wide">
                Course
              </span>
            ) : null}
          </div>

          {hasCourse ? (
            <>
              <p className="prose-body text-[15px] leading-[1.7] mb-6">
                {hasPremium
                  ? "You have full Premium access — the complete course and every Premium resource."
                  : "You have access to the (Un)Retire course. Dive in any time."}
              </p>
              <Link href="/learn/course/module-1" className="btn btn-crimson">
                Go to the course →
              </Link>
            </>
          ) : (
            <>
              <p className="prose-body text-[15px] leading-[1.7] mb-6">
                You don&apos;t have course access yet. Unlock the full course,
                or go Premium for the course plus the book, workbook, and
                monthly letter.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/premium" className="btn btn-crimson">
                  Explore Premium
                </Link>
                <Link href="/learn/course" className="btn btn-outline">
                  Buy the course
                </Link>
              </div>
            </>
          )}
        </div>

        <form action={logout}>
          <button type="submit" className="btn btn-outline">
            Log out
          </button>
        </form>
      </div>
    </section>
  );
}
