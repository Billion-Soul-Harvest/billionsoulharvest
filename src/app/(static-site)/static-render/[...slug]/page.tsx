import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { SitePage } from "@/shared/types/database";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string[] }>;
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

export default async function StaticCatchAllPage({ params }: Props) {
  const { slug } = await params;
  const pageSlug = slug.join("/");

  const supabase = await createClient();

  const { data } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", pageSlug)
    .eq("published", true)
    .single();

  if (!data) notFound();

  const page = data as unknown as SitePage;

  return (
    <div>
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-8 text-center">
            {page.title}
          </h1>
          <div className="text-gray-300 leading-relaxed text-center">
            <p>This page is being designed. Check back soon.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
