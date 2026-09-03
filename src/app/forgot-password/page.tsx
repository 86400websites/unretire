import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: "Reset your password",
  description: "Request a link to reset your (Un)Retire account password.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="bg-white">
      <div className="max-w-md mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-8">
          <p className="eyebrow mb-5">Account</p>
          <h1 className="text-3xl sm:text-4xl">Reset your password</h1>
          <span className="rule mt-6 mx-auto" aria-hidden="true" />
          <p className="lede mt-6">
            Enter your email and we&apos;ll send you a link to set a new
            password.
          </p>
        </div>
        <div className="card p-8 sm:p-10">
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
