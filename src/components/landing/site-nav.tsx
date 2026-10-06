"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/site";

type Props = {
  links: { href: string; label: string }[];
  showCta?: boolean;
};

// Client component to own the two scroll cases Next's Link does not cover: the
// wordmark must return to the top when already on the landing, and a cross-page
// navigation must not inherit the previous page's scroll offset.
export function SiteNav({ links, showCta = false }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Jump is instant, not smooth: a smooth scroll from a previous click can still
  // be running and would overwrite the anchor position, so the click looks dead.
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="wrap flex h-[72px] items-center gap-8">
        <Link
          href="/"
          onClick={(event) => {
            setOpen(false);
            if (pathname !== "/") return;
            event.preventDefault();
            window.scrollTo(0, 0);
            // Must drop the hash too. Scrolling to the top while the URL still
            // reads "#tentang" leaves the next click on that same anchor a no-op,
            // which is what made the nav look dead.
            if (window.location.hash) {
              window.history.replaceState(null, "", window.location.pathname);
            }
          }}
          className="font-display text-[26px] font-bold tracking-[-0.5px] text-pri"
        >
          {SITE_NAME}
        </Link>

        <div className="hidden gap-7 font-extrabold text-mut md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        {showCta && (
          <Link href="/soal" className="btn btn-sm max-sm:hidden">
            Mulai latihan
          </Link>
        )}

        {/* Without this the nav links are display:none below md, so there is no
            route to any section on a phone. */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="inline-flex size-10 items-center justify-center rounded border border-line md:hidden"
        >
          {/* Explicit tops: without them all three bars stack on the same offset. */}
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 top-0 block h-0.5 w-5 bg-ink transition-transform ${
                open ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[5px] block h-0.5 w-5 bg-ink transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[10px] block h-0.5 w-5 bg-ink transition-transform ${
                open ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-bg md:hidden">
          <div className="wrap flex flex-col py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-extrabold text-ink last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/soal"
              onClick={() => setOpen(false)}
              className="btn my-4"
            >
              Mulai latihan
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}