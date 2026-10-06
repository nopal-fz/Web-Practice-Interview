import type { Metadata } from "next";
import { Figtree, Space_Grotesk } from "next/font/google";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const sans = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Soal Interview ML & AI`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Soal interview Machine Learning dan AI dengan pembahasan bertingkat: rumus, intuition, dan kode yang bisa langsung dijalankan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable}`}>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body>{children}</body>
    </html>
  );
}