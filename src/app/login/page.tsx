import LoginForm from "./LoginForm";

export const metadata = {
  title: "Log in",
  description: "Log in to your (Un)Retire account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; intent?: string }>;
}) {
  const { error, intent: rawIntent } = await searchParams;
  const intent =
    rawIntent === "course" || rawIntent === "premium" ? rawIntent : "account";

  const initialError =
    error === "confirmation_failed"
      ? "That confirmation link didn't work or has expired. Please log in, or sign up again."
      : undefined;

  return (
    <section className="bg-white">
      <div className="max-w-md mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-8">
          <p className="eyebrow mb-5">Welcome back</p>
          <h1 className="text-3xl sm:text-4xl">Log in</h1>
          <span className="rule mt-6 mx-auto" aria-hidden="true" />
        </div>
        <div className="card p-8 sm:p-10">
          <LoginForm initialError={initialError} intent={intent} />
        </div>
      </div>
    </section>
  );
}