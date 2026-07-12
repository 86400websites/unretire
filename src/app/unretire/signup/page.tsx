import SignupForm from "./SignupForm";

export const metadata = {
  title: "Create your account",
  description: "Create your UnRetire account to access the course and Premium.",
};

export default function SignupPage() {
  return (
    <section className="bg-white">
      <div className="max-w-md mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-8">
          <p className="eyebrow mb-5">Get started</p>
          <h1 className="text-3xl sm:text-4xl">Create your account</h1>
          <span className="rule mt-6 mx-auto" aria-hidden="true" />
        </div>
        <div className="card p-8 sm:p-10">
          <SignupForm />
        </div>
      </div>
    </section>
  );
}
