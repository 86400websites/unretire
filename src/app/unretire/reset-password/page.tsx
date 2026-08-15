import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Set a new password",
  description: "Choose a new password for your (Un)Retire account.",
};

export default async function ResetPasswordPage() {
  // The user should have arrived here via the recovery link, which set a
  // session in /auth/confirm. If there's no session, the link was invalid or
  // expired — send them to request a fresh one.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/unretire/forgot-password?error=expired");
  }

  return (
    <section className="bg-white">
      <div className="max-w-md mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-8">
          <p className="eyebrow mb-5">Account</p>
          <h1 className="text-3xl sm:text-4xl">Set a new password</h1>
          <span className="rule mt-6 mx-auto" aria-hidden="true" />
          <p className="lede mt-6">Choose a new password for your account.</p>
        </div>
        <div className="card p-8 sm:p-10">
          <ResetPasswordForm />
        </div>
      </div>
    </section>
  );
}
