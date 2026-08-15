import { Libre_Baskerville } from "next/font/google";
import UnRetireNav from "./UnRetireNav";
import { createClient } from "@/lib/supabase/server";
import UnRetireFooter from "./UnRetireFooter";
import "./unretire.css";

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-libre-baskerville",
});

export const metadata = {
  metadataBase: new URL("https://half-a-life.vercel.app"),
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
    url: "/unretire",
    siteName: "(Un)Retire",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "(Un)Retire — Reboot. Don't Mute.",
    description: "Design your next chapter with intention — the 5 Mindsets and 7 Practices framework.",
  },
};

export default async function UnRetireLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div className={`ur-site ${libre.variable}`}>
      <UnRetireNav userEmail={user?.email ?? null} />
      <main>{children}</main>
      <UnRetireFooter />
    </div>
  );
}
