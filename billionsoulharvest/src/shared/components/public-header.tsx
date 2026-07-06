import { createClient } from "@/shared/utils/supabase/server";
import { PublicHeaderNav } from "./public-header-nav";

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export async function PublicHeader() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("site_pages")
    .select("id, title, slug, is_home, show_in_nav, parent_id, nav_anchor")
    .eq("published", true)
    .eq("show_in_nav", true)
    .order("sort_order");

  const allPages = pages ?? [];

  // Index pages by id for parent lookups
  const pageById = new Map(allPages.map((p) => [p.id, p]));

  // Build hierarchical nav: top-level items with optional children
  const childrenByParent = new Map<string, { label: string; href: string }[]>();
  const childIds = new Set<string>();

  for (const p of allPages) {
    if (p.parent_id) {
      childIds.add(p.id);
      const siblings = childrenByParent.get(p.parent_id) ?? [];

      let href: string;
      if (p.nav_anchor) {
        // Anchor link: scroll to section on the parent page
        const parent = pageById.get(p.parent_id);
        const parentHref = parent?.is_home ? "/" : `/${parent?.slug ?? ""}`;
        href = `${parentHref}#${p.nav_anchor}`;
      } else {
        href = p.is_home ? "/" : `/${p.slug}`;
      }

      siblings.push({ label: p.title, href });
      childrenByParent.set(p.parent_id, siblings);
    }
  }

  const navItems: NavItem[] = allPages
    .filter((p) => !childIds.has(p.id))
    .map((p) => {
      const children = childrenByParent.get(p.id);
      return {
        label: p.title,
        href: p.is_home ? "/" : `/${p.slug}`,
        ...(children ? { children } : {}),
      };
    });

  return <PublicHeaderNav navItems={navItems} />;
}
