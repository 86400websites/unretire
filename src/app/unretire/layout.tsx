import { Cormorant_Garamond, DM_Sans, Fira_Code } from "next/font/google";
import UnRetireNav from "./UnRetireNav";
import UnRetireFooter from "./UnRetireFooter";
import "./unretire.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400","500","600","700"], style: ["normal","italic"], display: "swap", variable: "--font-cormorant" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300","400","500","600"], display: "swap", variable: "--font-dm-sans" });
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400","500"], display: "swap", variable: "--font-fira-code" });

export const metadata = {
  title: "UnRetire — Reboot. Don't Mute.",
  description: "Design your next chapter with intention. The 5 Mindsets and 7 Practices framework by Maher Kaddoura.",
};

export default function UnRetireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ur-site ${cormorant.variable} ${dmSans.variable} ${firaCode.variable}`}>
      <UnRetireNav />
      <main>{children}</main>
      <UnRetireFooter />
    </div>
  );
}
