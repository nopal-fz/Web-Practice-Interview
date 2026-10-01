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
    <div className="border-y border-border py-12 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm leading-relaxed text-fg-muted">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-ghost mt-4 px-4 py-2 text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}