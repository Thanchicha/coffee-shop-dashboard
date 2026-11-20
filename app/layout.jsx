import { Cormorant_Garamond, Noto_Serif_Thai, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--f-serif" });
const thaiSerif = Noto_Serif_Thai({ subsets: ["thai"], weight: ["400", "500", "600"], variable: "--f-thai-serif" });
const sans = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["300", "400", "500"], variable: "--f-sans" });

export const metadata = {
  title: "Atelier Crema · แดชบอร์ดร้าน",
  description: "แดชบอร์ดยอดขาย Atelier Crema — กาแฟ ชา และเบเกอรี่",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${serif.variable} ${thaiSerif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
