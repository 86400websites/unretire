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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
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
