import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegistrationForm from "../RegistrationForm";

export const metadata = {
  title: "Create your account",
  description: "Create your (Un)Retire account to access the course and Premium.",
};

const COPY = {
  course: {
    eyebrow: "The (Un)Retire Course",
    lede: "One quick step — then you'll go straight to secure checkout.",
  },
  premium: {
    eyebrow: "(Un)Retire Premium",
    lede: "One quick step — then you'll go straight to secure checkout.",
  },
  account: {
    eyebrow: "Get started",
    lede: "Save your progress and access your purchases in one place.",
  },
} as const;

type Intent = keyof typeof COPY;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const params = await searchParams;
  const intent: Intent =
    params.intent === "course" || params.intent === "premium"
      ? params.intent
      : "account";

  // Already logged in? No form needed — send them where the intent points.
  // (The buy buttons there go straight to checkout for logged-in users.)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(
      intent === "course"
        ? "/unretire/learn/course"
        : intent === "premium"
          ? "/unretire/premium"
          : "/unretire/account",
    );
  }

  const copy = COPY[intent];

  return (
    <section className="bg-white">
      <div className="max-w-md mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-8">
          <p className="eyebrow mb-5">{copy.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl">Create your account</h1>
          <span className="rule mt-6 mx-auto" aria-hidden="true" />
          <p className="lede mt-6">{copy.lede}</p>
        </div>
        <div className="card p-8 sm:p-10">
          <RegistrationForm intent={intent} />
        </div>
      </div>
    </section>
  );
}