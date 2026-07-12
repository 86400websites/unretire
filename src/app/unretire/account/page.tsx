import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export const metadata = {
  title: "Your account",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → send to login. This is the access gate.
  if (!user) {
    redirect("/unretire/login");
  }

  return (
    <section className="bg-white">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="mb-8">
          <p className="eyebrow mb-5">Your account</p>
          <h1 className="text-3xl sm:text-4xl">Welcome back.</h1>
          <span className="rule mt-6" aria-hidden="true" />
        </div>

        <div className="card p-7 sm:p-8 mb-6">
          <p className="text-[13px] font-semibold text-[#9A9080] uppercase tracking-wide mb-2">
            Signed in as
          </p>
          <p className="text-[1.1rem] text-[#14110D]">{user.email}</p>
        </div>

        <div className="card p-7 sm:p-8 mb-8">
          <p className="text-[13px] font-semibold text-[#9A9080] uppercase tracking-wide mb-2">
            Course access
          </p>
          <p className="prose-body text-[15px] leading-[1.7]">
            You don&apos;t have course access yet. Once payments are live, this is
            where your Premium access will appear.
          </p>
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
