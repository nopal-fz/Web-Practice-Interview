import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/questions", label: "Soal" },
  { href: "/admin/questions/new", label: "Tambah soal" },
  { href: "/admin/import", label: "Import" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="hairline flex flex-wrap items-center justify-between gap-3 pb-4">
        <nav className="flex flex-wrap gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--fg-muted)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-[var(--fg-soft)] underline-offset-2 hover:text-rose-500 hover:underline"
          >
            Keluar
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}