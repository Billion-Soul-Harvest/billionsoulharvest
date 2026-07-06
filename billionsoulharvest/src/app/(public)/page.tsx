import { createClient } from "@/shared/utils/supabase/server";
import { CraftPageRenderer } from "@/features/events/builder/render";
import { AdminEditButton } from "@/shared/components/admin-edit-button";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: sitePage } = await supabase
    .from("site_pages")
    .select("*")
    .eq("is_home", true)
    .eq("published", true)
    .single();

  if (sitePage?.page_content) {
    const dummyEvent = {
      id: sitePage.id,
      title: sitePage.title,
      slug: "home",
      status: "published",
      start_date: null,
      end_date: null,
      location: null,
      city: null,
      country: null,
      registration_config: null,
    };
    return (
      <>
        <CraftPageRenderer
          content={sitePage.page_content as any}
          event={dummyEvent as any}
          pages={[]}
        />
        <AdminEditButton pageId={sitePage.id} />
      </>
    );
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <p className="text-gray-400 text-lg">Home page is being designed. Check back soon.</p>
    </div>
  );
}
