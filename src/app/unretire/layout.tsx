import { Libre_Baskerville } from "next/font/google";
import UnRetireNav from "./UnRetireNav";
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
    default: "UnRetire — Reboot. Don't Mute.",
    template: "%s · UnRetire",
  },
  description:
    "Design your next chapter with intention. The 5 Mindsets and 7 Practices framework by Maher Kaddoura.",
  openGraph: {
    title: "UnRetire — Reboot. Don't Mute.",
    description:
      "Design your next chapter with intention. The 5 Mindsets and 7 Practices framework by Maher Kaddoura.",
    url: "/unretire",
    siteName: "UnRetire",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UnRetire — Reboot. Don't Mute.",
    description: "Design your next chapter with intention — the 5 Mindsets and 7 Practices framework.",
  },
};

export default function UnRetireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ur-site ${libre.variable}`}>
      <UnRetireNav />
      <main>{children}</main>
      <UnRetireFooter />
    </div>
  );
}
