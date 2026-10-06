import { SiteNav } from "@/components/landing/site-nav";

const links = [
  { href: "/#tentang", label: "Tentang" },
  { href: "/#mulai", label: "Mulai dari" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  return <SiteNav links={links} showCta />;
}