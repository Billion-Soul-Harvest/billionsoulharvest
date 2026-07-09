"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/client";

interface EventCard {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  country: string | null;
  status: string;
  is_external: boolean;
  external_url: string | null;
  page_content: unknown | null;
}

interface Props {
  columns: number;
  maxItems: number;
  statusFilter: "all" | "upcoming" | "past";
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  textColor: string;
  gap: number;
}

const statusStyles: Record<string, React.CSSProperties> = {
  registration_open: { background: "rgba(34,197,94,0.2)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" },
  published: { background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" },
  completed: { background: "rgba(107,114,128,0.2)", color: "#9ca3af", border: "1px solid rgba(107,114,128,0.3)" },
};

const statusLabels: Record<string, string> = {
  registration_open: "Registration Open",
  published: "Coming Soon",
  completed: "Completed",
};

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function migrateColor(value: string, propName: string): string {
  if (propName === "titleColor" && value === "#ffffff") return "#111827";
  if (propName === "textColor" && value === "#9ca3af") return "#6b7280";
  if (propName === "cardBg" && value === "rgba(255,255,255,0.05)") return "#ffffff";
  if (propName === "cardBorder" && value === "rgba(255,255,255,0.1)") return "#e5e7eb";
  return value;
}

export function EventListCards({ columns, maxItems, statusFilter, cardBg: rawCardBg, cardBorder: rawCardBorder, titleColor: rawTitleColor, textColor: rawTextColor, gap }: Props) {
  const cardBg = migrateColor(rawCardBg, "cardBg");
  const cardBorder = migrateColor(rawCardBorder, "cardBorder");
  const titleColor = migrateColor(rawTitleColor, "titleColor");
  const textColor = migrateColor(rawTextColor, "textColor");
  const [events, setEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const supabase = createClient();
      let query = supabase
        .from("events")
        .select("id, title, slug, description, banner_url, start_date, end_date, city, country, status, is_external, external_url, page_content")
        .in("status", ["published", "registration_open", "completed"]);

      if (statusFilter === "upcoming") {
        query = query.in("status", ["published", "registration_open"]);
      } else if (statusFilter === "past") {
        query = query.eq("status", "completed");
      }

      query = query.order("start_date", { ascending: false }).limit(maxItems);

      const { data } = await query;
      setEvents((data as EventCard[]) ?? []);
      setLoading(false);
    }
    fetchEvents();
  }, [statusFilter, maxItems]);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px` }}>
        {Array.from({ length: Math.min(maxItems, 3) }).map((_, i) => (
          <div key={i} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ height: "140px", background: "linear-gradient(135deg, #1e3a5f, #0f2744)" }} />
            <div style={{ padding: "20px" }}>
              <div style={{ height: "14px", width: "60%", background: "rgba(0,0,0,0.08)", borderRadius: "4px", marginBottom: "12px" }} />
              <div style={{ height: "12px", width: "80%", background: "rgba(0,0,0,0.05)", borderRadius: "4px" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: textColor }}>
        <p style={{ fontSize: "16px" }}>No events available at this time.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px` }}>
      {events.map((event) => {
        const hasPage = !!event.page_content;
        const hasExternalUrl = event.is_external && !!event.external_url;
        const isClickable = hasPage || hasExternalUrl;
        const href = hasExternalUrl ? event.external_url! : `/events/${event.slug}`;

        const cardStyle: React.CSSProperties = {
          display: "block",
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: "16px",
          overflow: "hidden",
          textDecoration: "none",
          transition: "border-color 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          cursor: isClickable ? "pointer" : "default",
        };

        const cardContent = (<>
            <div style={{ height: "140px", background: "linear-gradient(135deg, #1e3a5f, #0f2744)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "rgba(41,189,214,0.3)", fontSize: "24px", fontWeight: "bold" }}>BSH</span>
              )}
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    ...(statusStyles[event.status] ?? statusStyles.completed),
                  }}
                >
                  {statusLabels[event.status] ?? event.status}
                </span>
              </div>

              <div style={{ color: titleColor, fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>
                {event.title}
              </div>

              {event.start_date && (
                <div style={{ color: textColor, fontSize: "13px", marginBottom: "4px" }}>
                  {formatDate(event.start_date)}
                  {event.end_date && ` – ${formatDate(event.end_date)}`}
                </div>
              )}

              {(event.city || event.country) && (
                <div style={{ color: textColor, fontSize: "13px", opacity: 0.7 }}>
                  {[event.city, event.country].filter(Boolean).join(", ")}
                </div>
              )}

              {event.description && (
                <div style={{ color: textColor, fontSize: "12px", marginTop: "12px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {event.description}
                </div>
              )}
            </div>
          </>
        );

        return isClickable ? (
          <Link
            key={event.id}
            href={href}
            target={hasExternalUrl ? "_blank" : undefined}
            rel={hasExternalUrl ? "noopener noreferrer" : undefined}
            style={cardStyle}
          >
            {cardContent}
          </Link>
        ) : (
          <div key={event.id} style={cardStyle}>
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}
