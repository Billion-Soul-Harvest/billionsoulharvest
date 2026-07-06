import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { SitePage } from "@/shared/types/database";
import { CraftPageRenderer } from "@/features/events/builder/render";
import Link from "next/link";
import { AdminEditButton } from "@/shared/components/admin-edit-button";

interface Props {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageSlug = slug.join("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("title, meta_title, meta_description")
    .eq("slug", pageSlug)
    .single();

  if (!data) return { title: "Page Not Found" };
  return {
    title: data.meta_title || `${data.title} — Billion Soul Harvest`,
    description: data.meta_description ?? undefined,
  };
}

export default async function CatchAllPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const pageSlug = slug.join("/");

  const supabase = await createClient();

  // Only allow preview if the current user is an admin
  let isPreview = false;
  if (preview === "true") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: admin } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .single();
      isPreview = !!admin;
    }
  }

  let query = supabase
    .from("site_pages")
    .select("*")
    .eq("slug", pageSlug);

  if (!isPreview) {
    query = query.eq("published", true);
  }

  const { data } = await query.single();

  if (!data) notFound();

  const page = data as unknown as SitePage;

  if (!page.page_content) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">This page is under construction.</p>
        <AdminEditButton pageId={page.id} />
      </div>
    );
  }

  const dummyEvent = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: "published",
    start_date: null,
    end_date: null,
    location: null,
    city: null,
    country: null,
    registration_config: null,
  };

  return (
    <div>
      {isPreview && (
        <div className="bg-amber-500 text-amber-950 text-center text-sm font-medium py-2 px-4">
          Preview Mode — This page is not yet published.
          <Link href="/admin/website" className="underline ml-2">Back to Admin</Link>
        </div>
      )}
      <CraftPageRenderer
        content={page.page_content as any}
        event={dummyEvent as any}
        pages={[]}
      />
      <AdminEditButton pageId={page.id} />
    </div>
  );
}
