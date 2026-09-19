import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s | Bank Soal Interview",
  },
  description:
    "Kumpulan soal interview Data Scientist, AI Engineer, dan ML Engineer, lengkap dengan jawaban untuk latihan mandiri.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: `${SITE_NAME}: latihan soal wawancara data & AI`,
    description:
      "Soal dan pembahasan interview untuk Data Scientist, AI Engineer, dan ML Engineer. Baca soal, jawab sendiri, lalu bandingkan.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description:
      "Soal dan pembahasan interview untuk Data Scientist, AI Engineer, dan ML Engineer.",
  },
};

const themeInit = `(function(){try{var t=localStorage.getItem("theme");var dark=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(dark)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-[var(--border)]">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-baseline gap-1.5">
              <span className="font-display text-base font-semibold tracking-tight">
                Bank Soal
              </span>
              <span className="text-sm font-medium italic text-[var(--accent)]">
                Interview.
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm sm:gap-3">
              <Link
                href="/questions"
                className="rounded-md px-3 py-2 text-gray-600 hover:text-[var(--accent)] dark:text-zinc-300 sm:py-0"
              >
                Semua soal
              </Link>
              <Link
                href="/quiz"
                className="rounded-md px-3 py-2 text-gray-600 hover:text-[var(--accent)] dark:text-zinc-300 sm:py-0"
              >
                Latihan
              </Link>
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-gray-600 hover:text-[var(--accent)] dark:text-zinc-300 sm:py-0"
              >
                Admin
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-[var(--border)]">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 text-xs text-[var(--fg-soft)]">
            Latihan soal interview untuk Data Scientist, AI Engineer, dan ML Engineer.
          </div>
        </footer>
      </body>
    </html>
  );
}