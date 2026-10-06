"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { SITE_NAME } from "@/lib/site";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/questions", label: "Soal" },
  { href: "/admin/import", label: "Import" },
];

/** Section match on a segment boundary, so /admin/questions/new keeps "Soal"
 *  lit. "/admin" is the exception: every admin route is its child, so a plain
 *  prefix test would light Dashboard on every page including /admin/import. */
function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="hairline sticky top-0 z-50 bg-bg">
      <div className="wrap flex h-[72px] flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <Link
          href="/admin"
          className="font-display text-[22px] font-bold tracking-[-0.5px] text-pri"
        >
          {SITE_NAME}
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-bold transition-colors ${
                isActive(pathname, link.href)
                  ? "bg-soft text-ink"
                  : "text-mut hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* One global action instead of repeating "Tambah soal" in the nav and
            again in each page header. */}
        <Link href="/admin/questions/new" className="btn-primary px-5 py-3 text-sm">
          Tambah soal
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center px-3 text-sm font-bold text-mut transition-colors hover:text-pri"
          >
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}