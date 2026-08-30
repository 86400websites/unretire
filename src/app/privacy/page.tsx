import Link from "next/link";
import LegalPage, { type LegalSection } from "../LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description:
    "What (Un)Retire collects, why, who processes it, and how to have it removed.",
};

/**
 * Known issue 3 — /privacy 404'd, and you cannot lawfully take payment without
 * it. Drafted by the build agent under decision D-29 at the owner's explicit
 * instruction, then reviewed by the owner.
 *
 * NOT LEGAL ADVICE. Its value is accuracy: every claim below was checked
 * against the code rather than copied from a template, because a policy that
 * describes flows the site does not have is worse than none — it is a written
 * statement that happens to be untrue. The processors named here are exactly
 * those the site calls, verified in S4.5:
 *   Supabase   src/lib/supabase/*          accounts, sessions, entitlements
 *   Stripe     src/lib/stripe/checkout.ts  payment; card data never touches us
 *   Mailchimp  src/app/api/subscribe       newsletter, assessment, downloads
 *   Formspree  Contact/Community/Enterprise forms
 *   YouTube    lesson and preview embeds
 *   Vercel     hosting and request logs
 *
 * Deliberately contains NO governing-law or jurisdiction clause: the owner
 * asked for no countries to be named (2026-08-30). See the note in
 * docs/sprint-prompts/S4.5-launch-floor.md.
 */
const sections: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      "This site is operated by 86400 (\u201cwe\u201d, \u201cus\u201d). You can reach us at info@unretireproject.com about anything on this page, including a request to see or delete what we hold about you.",
    ],
  },
  {
    heading: "What we collect, and why",
    body: [
      "We only collect what a specific feature needs. Nothing here is sold, and none of it is used for advertising.",
    ],
    list: [
      "**If you create an account:** your email address and a password you choose. The password is stored by our authentication provider as a cryptographic hash \u2014 we never see it and cannot recover it.",
      "**If you buy the course or Premium:** a record that you own it, plus the customer and subscription identifiers our payment provider gives us. **We never see or store your card details.**",
      "**If you join the newsletter, take the assessment, or download a free resource:** your email address, your first name if you give one, and a tag recording which of those it came from. The assessment also sends the scores you produced, so the results email can reflect them.",
      "**If you use the contact, community or enterprise form:** whatever you type into it \u2014 typically your name, email, and message.",
      "**If you download the book or workbook as a Premium member:** a record that you did, so the one-per-person limit can be applied, and the name you enter, which is stamped into your copy.",
      "**Automatically:** ordinary web-server request logs kept by our hosting provider, including IP address and browser type. We use these for security and to keep the site working.",
    ],
  },
  {
    heading: "Who processes it for us",
    body: [
      "We use a small number of established providers. Each receives only what its job requires.",
    ],
    list: [
      "**Supabase** \u2014 accounts, sign-in sessions, and the record of what you have access to.",
      "**Stripe** \u2014 payment processing. You are taken to Stripe's own page to pay, and your card details are handled entirely by them.",
      "**Mailchimp** \u2014 email lists and the messages we send you.",
      "**Formspree** \u2014 delivery of the contact, community and enterprise forms to our inbox.",
      "**YouTube** \u2014 lesson and preview videos are embedded from YouTube, which may set its own cookies when a video loads.",
      "**Vercel** \u2014 hosting and request logs.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We do not use advertising or tracking cookies, and there is no analytics tracking on this site.",
      "The cookies we do set are the ones that make signing in work \u2014 they keep you logged in between pages. Blocking them will prevent you from using an account. Embedded YouTube videos may set cookies of their own when you play one; those are governed by Google's policy, not ours.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Account and purchase records are kept for as long as you have an account, because they are what give you access to something you paid for.",
      "You can unsubscribe from any email using the link in it, which stops us sending you more. If you want your account and its data deleted entirely, email us and we will do it \u2014 note that this also ends access to anything you have bought.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can ask us what we hold about you, ask for it to be corrected, or ask for it to be deleted. Email info@unretireproject.com and we will respond.",
      "Depending on where you live you may have further rights under local law. We will honour any request of this kind regardless of where you are.",
    ],
  },
  {
    heading: "Security",
    body: [
      "The site is served over HTTPS. Pages and files you have paid for are checked on our server on every request, not merely hidden in the interface. Card details never reach our systems.",
      "No system is perfect. If you believe you have found a security problem, please email us rather than posting it publicly, and we will look at it quickly.",
    ],
  },
  {
    heading: "Children",
    body: [
      "This site is intended for adults planning or living their retirement. It is not directed at children, and we do not knowingly collect their information.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "If we change this policy we will update the date below. If a change is significant, we will say so by email to anyone it affects.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="30 August 2026"
      intro="This page explains what this site collects, why it needs it, and who else handles it. It is written to be read, not to be impressive."
      sections={sections}
      footer={
        <>
          Questions about this page? Email{" "}
          <a className="underline" href="mailto:info@unretireproject.com">
            info@unretireproject.com
          </a>
          . See also our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>
          .
        </>
      }
    />
  );
}
