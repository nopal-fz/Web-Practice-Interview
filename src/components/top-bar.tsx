import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

// No navbar: this is a single-purpose tool, so there is nowhere else to navigate to.
// Just the product name and the theme toggle.
export function TopBar() {
  return (
    <div className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded bg-primary-accent font-mono text-[11px] font-semibold text-white">
            ML
          </span>
          <span className="font-display text-sm font-semibold text-foreground">LearnML</span>
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}