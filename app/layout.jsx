// Fonts are bundled from npm (@fontsource) instead of next/font/google,
// so the build never has to download from Google Fonts (that download failed on Vercel).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/ibm-plex-sans-thai-looped/400.css";
import "@fontsource/ibm-plex-sans-thai-looped/500.css";
import "@fontsource/ibm-plex-sans-thai-looped/600.css";
import "@fontsource/ibm-plex-sans-thai-looped/700.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "./globals.css";

export const metadata = { title: "Atelier Crema · แดชบอร์ดร้าน", description: "แดชบอร์ดยอดขายร้านกาแฟและเบเกอรี่" };

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
