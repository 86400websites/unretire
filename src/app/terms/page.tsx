import Link from "next/link";
import LegalPage, { type LegalSection } from "../LegalPage";

export const metadata = {
  title: "Terms of Use",
  description:
    "The terms you agree to when you use (Un)Retire or buy the course or Premium.",
};

/**
 * Known issue 3 — /terms 404'd, and you cannot lawfully take payment without
 * it. Drafted by the build agent under decision D-29 at the owner's explicit
 * instruction, then reviewed by the owner. NOT LEGAL ADVICE.
 *
 * Every product fact below is taken from the code, not assumed:
 *   $99 one-time course + $199/yr Premium   src/app/premium, /learn/course
 *   Premium includes the course             ownsProduct() in lib/auth/entitlements
 *   one download per document               api/book-download route.ts:77-90
 *   watermarked with the buyer's name       api/book-download, pdf-lib stamp
 *   subscription renews until cancelled     Stripe subscription mode
 *
 * TWO DELIBERATE OMISSIONS, both owner decisions rather than oversights:
 *  1. NO governing-law or jurisdiction clause — the owner asked for no country
 *     to be named (2026-08-30). Without one, jurisdiction falls to default
 *     rules, usually the customer's own country.
 *  2. NO fixed refund window. A specific period (\u201c14 days\u201d, \u201c30 days\u201d) is a
 *     COMMERCIAL commitment, not a technical detail, and inventing one would
 *     bind the owner to a promise they never made. The wording below is honest
 *     about that; replace it once the owner sets a policy.
 * Both are flagged in docs/sprint-prompts/S4.5-launch-floor.md.
 */
const sections: LegalSection[] = [
  {
    heading: "Who these terms are with",
    body: [
      "This site is operated by 86400. By using it, or by buying anything on it, you agree to what follows. If you do not agree, please do not use the site.",
      "You can reach us any time at info@unretireproject.com.",
    ],
  },
  {
    heading: "What you can buy",
    body: ["There are two paid products, and they work differently."],
    list: [
      "**The Course \u2014 $99, paid once.** Ten modules and forty-eight lessons, each with a video and a downloadable worksheet. It is yours to keep: there is no renewal and nothing further to pay.",
      "**Premium \u2014 $199 a year.** Includes everything in the course, plus the book and workbook as personalised downloads and the member community. It renews each year until you cancel.",
    ],
  },
  {
    heading: "Your account",
    body: [
      "You need an account to reach anything you have paid for. Keep your password to yourself \u2014 anyone who has it can use what you bought.",
      "Please give a real email address. It is how we send your sign-in and password-reset links, and how we would reach you if something went wrong with a payment.",
    ],
  },
  {
    heading: "What you may and may not do with the material",
    body: [
      "The videos, worksheets, book and workbook are for your own personal use. You are very welcome to use them, print them, and work through them as much as you like.",
    ],
    list: [
      "Please **do not** share your account, or republish, resell or distribute the material.",
      "The book and workbook are watermarked with your name. Each is available as **one download per person**, so keep your copy safe \u2014 if you lose it, email us rather than buying again.",
      "If material is shared publicly, we may end access to the account it came from.",
    ],
  },
  {
    heading: "Payment",
    body: [
      "Payments are handled by Stripe. Your card details go to them, never to us.",
      "Premium renews automatically each year at the price shown when you subscribed. You can cancel at any time \u2014 email us and we will arrange it. When a subscription ends, Premium access ends with it; a course bought outright is unaffected and stays yours.",
    ],
  },
  {
    heading: "Refunds",
    body: [
      "If something has gone wrong \u2014 you were charged twice, you cannot reach what you paid for, or the product is not what was described \u2014 email info@unretireproject.com and we will put it right.",
      "For anything else, get in touch and tell us what happened. We would rather sort it out than have you feel short-changed.",
    ],
  },
  {
    heading: "What this material is, and is not",
    body: [
      "(Un)Retire is educational. It is about designing a life after full-time work: purpose, health, relationships, time and contribution.",
      "It is **not** financial, medical, legal or psychological advice, and it is not a substitute for a professional who knows your circumstances. Decisions you make after reading or watching are your own.",
    ],
  },
  {
    heading: "Availability",
    body: [
      "We aim to keep the site up and the material available, but we cannot promise it will never be interrupted. From time to time we may add, change or retire parts of it.",
      "If we ever had to withdraw something you had paid for, we would contact you and deal with it fairly.",
    ],
  },
  {
    heading: "Changes to these terms",
    body: [
      "If we change these terms we will update the date below. If a change materially affects something you have already bought, we will tell you by email.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="30 August 2026"
      intro="The agreement between you and 86400 when you use this site or buy the course or Premium. Written in plain English on purpose."
      sections={sections}
      footer={
        <>
          Questions? Email{" "}
          <a className="underline" href="mailto:info@unretireproject.com">
            info@unretireproject.com
          </a>
          . See also our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </>
      }
    />
  );
}
