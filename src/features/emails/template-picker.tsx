"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Mail, CalendarCheck, Bell, Heart } from "lucide-react";
import { starterTemplates } from "./starter-templates";
import type { StarterTemplate } from "./starter-templates";

const iconMap: Record<string, React.ReactNode> = {
  welcome: <Heart className="w-5 h-5" />,
  "event-invitation": <Mail className="w-5 h-5" />,
  "event-reminder": <Bell className="w-5 h-5" />,
  "post-event-thank-you": <CalendarCheck className="w-5 h-5" />,
};

export function TemplatePicker() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createFromTemplate(template: StarterTemplate | null) {
    setCreating(true);
    try {
      const res = await fetch("/api/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          template
            ? {
                name: template.name,
                subject: template.subject,
                body_html: template.body_html,
                preview_text: template.preview_text,
              }
            : {
                name: "Untitled email",
                subject: "",
                body_html: "",
                preview_text: null,
              }
        ),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/emails/${data.id}`);
      }
    } catch {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/emails">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create an Email</h1>
      </div>

      <p className="text-sm text-gray-500 mb-5">
        Start from a template or create a blank email.
      </p>

      <div className="grid gap-3">
        {/* Blank option */}
        <button
          type="button"
          disabled={creating}
          onClick={() => createFromTemplate(null)}
          className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-4 disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Blank Email</p>
            <p className="text-xs text-gray-500 mt-0.5">Start from scratch with an empty template</p>
          </div>
        </button>

        {/* Starter templates */}
        {starterTemplates.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={creating}
            onClick={() => createFromTemplate(t)}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/30 transition-colors flex items-center gap-4 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
              {iconMap[t.id] || <Mail className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{t.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
            </div>
          </button>
        ))}
      </div>

      {creating && (
        <div className="flex items-center justify-center mt-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-600" />
          <span className="ml-2 text-sm text-gray-500">Creating...</span>
        </div>
      )}
    </div>
  );
}
