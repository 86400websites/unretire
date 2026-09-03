import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Fira_Code,
  Libre_Baskerville,
} from "next/font/google";
import UnRetireNav from "./UnRetireNav";
import UnRetireFooter from "./UnRetireFooter";
import { createClient } from "@/lib/supabase/server";
import "@/app/globals.css";
import "./unretire.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-fira-code",
});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-libre-baskerville",
});

/**
 * The origin every absolute metadata URL is built from — og:url, og:image,
 * twitter:*, and anything else Next resolves against `metadataBase`.
 *
 * S4.5c: this used to be `NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`, and
 * the deployed Preview was serving `<meta property="og:url"
 * content="http://localhost:3000">` — every share of a Preview page advertised
 * a machine that is not on the internet. `NEXT_PUBLIC_SITE_URL` is a
 * build-time value on Vercel and is not scoped to the Preview environment, so
 * every Preview build fell through to the localhost default. Production has the
 * variable and was unaffected (verified 2026-08-27), which is exactly why it
 * went unnoticed: nothing tested the Preview, because PG-011's assertion was
 * wrapped in an `if` that skipped when the tag was absent.
 *
 * `VERCEL_URL` is the deployment's own hostname, set by the platform at build
 * time and not influenceable by a caller — the same identity `safe-origin.ts`
 * trusts. Falling back to it means a DEPLOYED build can never advertise
 * localhost, whatever the environment variables say, which is Known issue 19's
 * failure mode closed in code rather than in a dashboard. Localhost remains the
 * last resort, where it is correct.
 */
function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: "(Un)Retire — Reboot. Don't Mute.",
    template: "%s · (Un)Retire",
  },
  description:
    "Design your next chapter with intention. The 5 Mindsets and 7 Practices framework by Maher Kaddoura.",
  openGraph: {
    title: "(Un)Retire — Reboot. Don't Mute.",
    description:
      "Design your next chapter with intention. The 5 Mindsets and 7 Practices framework by Maher Kaddoura.",
    url: "/",
    siteName: "(Un)Retire",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "(Un)Retire — Reboot. Don't Mute.",
    description:
      "Design your next chapter with intention — the 5 Mindsets and 7 Practices framework.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${firaCode.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className={`ur-site ${libre.variable}`}>
          <UnRetireNav userEmail={user?.email ?? null} />
          <main>{children}</main>
          <UnRetireFooter />
        </div>
      </body>
    </html>
  );
}
