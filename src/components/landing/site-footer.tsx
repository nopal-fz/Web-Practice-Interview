import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-10 font-bold text-mut">
      <div className="wrap flex flex-wrap items-center justify-between gap-4">
        <span className="flex items-center gap-6">
          <b className="text-pri">{SITE_NAME}</b>
          <Link href="/soal" className="transition-colors hover:text-ink">
            Katalog soal
          </Link>
        </span>
        <span>&copy; 2026</span>
      </div>
    </footer>
  );
}