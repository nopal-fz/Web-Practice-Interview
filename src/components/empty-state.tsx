import type { ReactNode } from "react";
import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="panel px-5 py-8 text-center text-sm">
      <p className="font-medium text-[var(--fg)]">{title}</p>
      {description && <p className="mt-1 leading-relaxed text-[var(--fg-muted)]">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-ghost mt-4 px-4 py-3 sm:py-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}