import Link from "next/link";
import EmailCaptureForm from "./EmailCaptureForm";

export default function EmailCaptureBand({
  showFaq = false,
  heading = "Try the free plan.",
  blurb = "The 14-Day Starter Plan, plus a weekly note on living fully at any age. Written by Maher, not a marketing team.",
}: {
  showFaq?: boolean;
  heading?: string;
  blurb?: string;
}) {
  return (
    <section className="bg-[#D05D11]">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] text-white leading-tight">
          {heading}
        </h2>
        <span className="block w-12 h-[3px] bg-white/80 rounded-full mx-auto mt-6 mb-6" aria-hidden="true" />
        <p className="text-white/90 text-[16px] leading-[1.7] mb-9 max-w-md mx-auto">{blurb}</p>
        <EmailCaptureForm />
        {showFaq && (
          <p className="mt-6 text-[13px] text-white/80">
            Have a question?{" "}
            <Link href="/contact" className="font-bold underline underline-offset-2 hover:text-white">
              Browse the FAQ →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
