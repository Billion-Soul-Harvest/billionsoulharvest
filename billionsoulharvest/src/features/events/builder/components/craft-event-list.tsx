"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
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

export const CraftEventList = ({
  columns = 3,
  maxItems = 6,
  statusFilter = "all",
  cardBg = "rgba(255,255,255,0.05)",
  cardBorder = "rgba(255,255,255,0.1)",
  titleColor = "#ffffff",
  textColor = "#9ca3af",
  gap = 24,
}: CraftEventListProps) => {
  const { connectors: { connect, drag } } = useNode();

  // Builder preview: show placeholder cards
  const placeholders = Array.from({ length: Math.min(maxItems, 6) });

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
        {placeholders.map((_, i) => (
          <div
            key={i}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "140px",
                background: "linear-gradient(135deg, #1e3a5f, #0f2744)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "rgba(41,189,214,0.3)", fontSize: "24px", fontWeight: "bold" }}>BSH</span>
            </div>
            <div style={{ padding: "20px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  background: "rgba(34,197,94,0.2)",
                  color: "#86efac",
                  border: "1px solid rgba(34,197,94,0.3)",
                  marginBottom: "12px",
                }}
              >
                {statusFilter === "past" ? "Completed" : "Registration Open"}
              </div>
              <div style={{ color: titleColor, fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>
                Event Title {i + 1}
              </div>
              <div style={{ color: textColor, fontSize: "13px", marginBottom: "4px" }}>
                January 1, 2026
              </div>
              <div style={{ color: textColor, fontSize: "13px", opacity: 0.7 }}>
                City, Country
              </div>
            </div>
          </div>
        ))}
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
          <Label>Title Color</Label>
          <Input
            type="color"
            value={props.titleColor}
            onChange={(e) => setProp((p: CraftEventListProps) => { p.titleColor = e.target.value; })}
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
    cardBg: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(255,255,255,0.1)",
    titleColor: "#ffffff",
    textColor: "#9ca3af",
    gap: 24,
  },
  related: { settings: EventListSettings },
};
