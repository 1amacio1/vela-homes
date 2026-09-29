import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Golos_Text } from "next/font/google";
import { Reveal } from "@/components/Motion";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500"],
  style: ["normal"],
  variable: "--font-display",
  display: "swap",
});
const text = Golos_Text({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-text",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VELA — строительство домов по всей России",
  description:
    "Строительство частных домов по всей России с 2005 года. Архитектура, строительство, интерьер и благоустройство.",
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = {
  themeColor: "#0e0f0e",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${text.variable}`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Reveal />
      </body>
    </html>
  );
}
