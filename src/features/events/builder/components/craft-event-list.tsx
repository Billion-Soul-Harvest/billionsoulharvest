"use client";

import { useEffect, useState } from "react";
import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { createClient } from "@/shared/utils/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  external_url: string | null;
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

export interface CraftEventListProps {
  columns?: number;
  maxItems?: number;
  statusFilter?: "all" | "upcoming" | "past";
  cardBg?: string;
  cardBorder?: string;
  titleColor?: string;
  textColor?: string;
  gap?: number;
}

// Migrate old dark-theme defaults to light-theme
function migrateColor(value: string, propName: string): string {
  if (propName === "titleColor" && value === "#ffffff") return "#111827";
  if (propName === "textColor" && value === "#9ca3af") return "#6b7280";
  if (propName === "cardBg" && value === "rgba(255,255,255,0.05)") return "#ffffff";
  if (propName === "cardBorder" && value === "rgba(255,255,255,0.1)") return "#e5e7eb";
  return value;
}

export const CraftEventList = ({
  columns = 3,
  maxItems = 6,
  statusFilter = "all",
  cardBg: rawCardBg = "#ffffff",
  cardBorder: rawCardBorder = "#e5e7eb",
  titleColor: rawTitleColor = "#111827",
  textColor: rawTextColor = "#6b7280",
  gap = 24,
}: CraftEventListProps) => {
  const cardBg = migrateColor(rawCardBg, "cardBg");
  const cardBorder = migrateColor(rawCardBorder, "cardBorder");
  const titleColor = migrateColor(rawTitleColor, "titleColor");
  const textColor = migrateColor(rawTextColor, "textColor");
  const { connectors: { connect, drag } } = useNode();
  const [events, setEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      const supabase = createClient();
      let query = supabase
        .from("events")
        .select("id, title, slug, description, banner_url, start_date, end_date, city, country, status, external_url")
        .in("status", ["published", "registration_open", "completed"]);

      if (statusFilter === "upcoming") {
        query = query.in("status", ["published", "registration_open"]);
      } else if (statusFilter === "past") {
        query = query.eq("status", "completed");
      }

      query = query.order("start_date", { ascending: false }).limit(maxItems);

      const { data } = await query;
      if (!cancelled) {
        setEvents((data as EventCard[]) ?? []);
        setLoading(false);
      }
    }
    setLoading(true);
    fetchEvents();
    return () => { cancelled = true; };
  }, [statusFilter, maxItems]);

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{ cursor: "grab", width: "100%" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {loading
          ? Array.from({ length: Math.min(maxItems, 3) }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ height: "140px", background: "linear-gradient(135deg, #1e3a5f, #0f2744)" }} />
                <div style={{ padding: "20px" }}>
                  <div style={{ height: "14px", width: "60%", background: "rgba(0,0,0,0.08)", borderRadius: "4px", marginBottom: "12px" }} />
                  <div style={{ height: "12px", width: "80%", background: "rgba(0,0,0,0.05)", borderRadius: "4px" }} />
                </div>
              </div>
            ))
          : events.length === 0
            ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: textColor }}>
                <p style={{ fontSize: "14px" }}>No events found.</p>
              </div>
            )
            : events.map((event) => (
              <div
                key={event.id}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    height: "140px",
                    background: "linear-gradient(135deg, #1e3a5f, #0f2744)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "rgba(41,189,214,0.3)", fontSize: "24px", fontWeight: "bold" }}>BSH</span>
                  )}
                </div>
                <div style={{ padding: "20px" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      marginBottom: "12px",
                      ...(statusStyles[event.status] ?? statusStyles.completed),
                    }}
                  >
                    {statusLabels[event.status] ?? event.status}
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
                </div>
              </div>
            ))
        }
      </div>
      <div style={{ textAlign: "center", marginTop: "8px" }}>
        <span style={{ color: textColor, fontSize: "11px", opacity: 0.5 }}>
          Event List — {statusFilter === "all" ? "All events" : statusFilter === "upcoming" ? "Upcoming" : "Past"} (max {maxItems})
        </span>
      </div>
    </div>
  );
};

const EventListSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as CraftEventListProps,
  }));

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Columns</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((n) => (
            <Button
              key={n}
              size="sm"
              variant={props.columns === n ? "default" : "outline"}
              onClick={() => setProp((p: CraftEventListProps) => { p.columns = n; })}
              className="flex-1"
            >
              {n}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <Label>Max Items</Label>
        <Input
          type="number"
          min={1}
          max={20}
          value={props.maxItems}
          onChange={(e) => setProp((p: CraftEventListProps) => { p.maxItems = parseInt(e.target.value) || 6; })}
        />
      </div>
      <div className="space-y-1">
        <Label>Show</Label>
        <Select
          value={props.statusFilter}
          onValueChange={(v) => setProp((p: CraftEventListProps) => { p.statusFilter = v as CraftEventListProps["statusFilter"]; })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upcoming">Upcoming Only</SelectItem>
            <SelectItem value="past">Past Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label>Card BG</Label>
          <Input
            type="color"
            value={props.cardBg}
            onChange={(e) => setProp((p: CraftEventListProps) => { p.cardBg = e.target.value; })}
          />
        </div>
        <div className="space-y-1">
          <Label>Border</Label>
          <Input
            type="color"
            value={props.cardBorder}
            onChange={(e) => setProp((p: CraftEventListProps) => { p.cardBorder = e.target.value; })}
          />
        </div>
        <div className="space-y-1">
          <Label>Title Color</Label>
          <Input
            type="color"
            value={props.titleColor}
            onChange={(e) => setProp((p: CraftEventListProps) => { p.titleColor = e.target.value; })}
          />
        </div>
        <div className="space-y-1">
          <Label>Text Color</Label>
          <Input
            type="color"
            value={props.textColor}
            onChange={(e) => setProp((p: CraftEventListProps) => { p.textColor = e.target.value; })}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Gap (px)</Label>
        <Input
          type="number"
          value={props.gap}
          onChange={(e) => setProp((p: CraftEventListProps) => { p.gap = parseInt(e.target.value) || 24; })}
        />
      </div>
    </div>
  );
};

CraftEventList.craft = {
  displayName: "Event List",
  props: {
    columns: 3,
    maxItems: 6,
    statusFilter: "all" as const,
    cardBg: "#ffffff",
    cardBorder: "#e5e7eb",
    titleColor: "#111827",
    textColor: "#6b7280",
    gap: 24,
  },
  related: { settings: EventListSettings },
};
