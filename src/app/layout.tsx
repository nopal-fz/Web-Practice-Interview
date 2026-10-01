import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { TopBar } from "@/components/top-bar";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LearnML: Soal Interview Machine Learning & AI",
    template: "%s | LearnML",
  },
  description:
    "Soal interview Machine Learning, Deep Learning, dan AI Engineer, lengkap dengan pembahasan dan kode.",
};

// Applies data-theme before first paint so a light-mode user never sees a dark flash.
// Deliberately a plain <script> in <head> rather than a component: a <script> rendered
// from inside a React component is never executed on the client.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="dark"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TopBar />
        <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">{children}</main>
      </body>
    </html>
  );
}