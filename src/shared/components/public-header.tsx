import { PublicHeaderNav } from "./public-header-nav";

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About BSH", href: "/about" },
      { label: "Leadership", href: "/leadership" },
    ],
  },
  { label: "Initiatives", href: "/initiatives" },
  { label: "Gatherings", href: "/gatherings" },
  { label: "Media", href: "/media" },
  { label: "Connect", href: "/connect" },
];

export async function PublicHeader() {
  return <PublicHeaderNav navItems={navItems} />;
}
