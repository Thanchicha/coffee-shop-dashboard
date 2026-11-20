import { Inter, IBM_Plex_Sans_Thai_Looped, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Inter: clear Latin letters + tabular digits. IBM Plex Sans Thai Looped: easy-to-read Thai.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-latin" });
const thai = IBM_Plex_Sans_Thai_Looped({ subsets: ["thai"], weight: ["400", "500", "600", "700"], variable: "--f-thai" });
// Logo only.
const logo = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"], style: ["normal", "italic"], variable: "--f-logo" });

export const metadata = { title: "Atelier Crema · แดชบอร์ดร้าน", description: "แดชบอร์ดยอดขายร้านกาแฟและเบเกอรี่" };

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${inter.variable} ${thai.variable} ${logo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
