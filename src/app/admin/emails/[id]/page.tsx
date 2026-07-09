import { notFound } from "next/navigation";
import { createClient } from "@/shared/utils/supabase/server";
import { EmailTemplateEditor } from "@/features/emails/email-template-editor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Email — BSH Admin",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmailTemplatePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("email_template_stats")
    .select("*")
    .eq("id", id)
    .single();

  if (!template) {
    notFound();
  }

  return (
    <div>
      <EmailTemplateEditor template={template as never} />
    </div>
  );
}
