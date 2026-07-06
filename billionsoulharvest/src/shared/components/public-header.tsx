import { createClient } from "@/shared/utils/supabase/server";
import { PublicHeaderNav } from "./public-header-nav";

export async function PublicHeader() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("site_pages")
    .select("title, slug, is_home, show_in_nav")
    .eq("published", true)
    .eq("show_in_nav", true)
    .order("sort_order");

  const navLinks = (pages ?? []).map((p) => ({
    label: p.title,
    href: p.is_home ? "/" : `/${p.slug}`,
  }));

  return <PublicHeaderNav navLinks={navLinks} />;
}
