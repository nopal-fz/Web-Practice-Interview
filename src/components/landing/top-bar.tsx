import { SiteNav } from "@/components/landing/site-nav";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/#mulai", label: "Mulai dari" },
  { href: "/#faq", label: "FAQ" },
];

// Same bar as the landing nav, but pointing back at it instead of dead anchors.
export function TopBar() {
  return <SiteNav links={links} />;
}