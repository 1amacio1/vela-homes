import type { Metadata, Viewport } from "next";
import { Geologica, Onest, Playfair_Display, Golos_Text } from "next/font/google";
import { Motion } from "@/components/Motion";
import "./globals.css";
import "./intro.css";

const display = Geologica({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});
const text = Onest({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-text",
  display: "swap",
});
/* Шрифты заставки: заставка сохранена без изменений. */
const intro = Playfair_Display({
  subsets: ["cyrillic", "latin"],
  weight: ["600"],
  variable: "--font-intro",
  display: "swap",
});
const introText = Golos_Text({
  subsets: ["cyrillic", "latin"],
  weight: ["600"],
  variable: "--font-intro-text",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VELA — строительство домов по всей России",
  description:
    "Строительство частных домов по всей России с 2005 года. Архитектура, строительство, интерьер и благоустройство.",
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = {
  themeColor: "#0f1012",
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
      className={`${display.variable} ${text.variable} ${intro.variable} ${introText.variable}`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Motion />
      </body>
    </html>
  );
}
