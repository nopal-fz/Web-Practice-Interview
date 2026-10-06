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
    <div className="card text-center">
      <p className="mb-1.5 font-display text-xl font-bold text-ink">{title}</p>
      {description && <p className="m-0 text-mut">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn-sm mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}