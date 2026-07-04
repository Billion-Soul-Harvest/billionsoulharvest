"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { useEventData } from "../event-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Event Title ─────────────────────────────────────────────

interface EventTitleProps {
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
}

export const CraftEventTitle = ({ fontSize = 48, color = "#ffffff", textAlign = "center" }: EventTitleProps) => {
  const { connectors: { connect, drag } } = useNode();
  const event = useEventData();

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{ fontSize: `${fontSize}px`, color, textAlign, cursor: "grab", maxWidth: "100%", overflowWrap: "break-word" }}
      className="font-[family-name:var(--font-heading)] font-bold"
    >
      {event.title}
    </div>
  );
};

const EventTitleSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as EventTitleProps,
  }));

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Font Size</Label>
        <Input
          type="number"
          value={props.fontSize}
          onChange={(e) => setProp((p: EventTitleProps) => { p.fontSize = parseInt(e.target.value) || 32; })}
        />
      </div>
      <div className="space-y-1">
        <Label>Color</Label>
        <Input
          type="color"
          value={props.color}
          onChange={(e) => setProp((p: EventTitleProps) => { p.color = e.target.value; })}
        />
      </div>
      <div className="space-y-1">
        <Label>Alignment</Label>
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((align) => (
            <Button
              key={align}
              size="sm"
              variant={props.textAlign === align ? "default" : "outline"}
              onClick={() => setProp((p: EventTitleProps) => { p.textAlign = align; })}
              className="flex-1 capitalize"
            >
              {align}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

CraftEventTitle.craft = {
  displayName: "Event Title",
  props: { fontSize: 48, color: "#ffffff", textAlign: "center" as const },
  related: { settings: EventTitleSettings },
};

// ─── Event Dates ─────────────────────────────────────────────

interface EventDatesProps {
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
}

export const CraftEventDates = ({ fontSize = 16, color = "#d1d5db", textAlign = "center" }: EventDatesProps) => {
  const { connectors: { connect, drag } } = useNode();
  const event = useEventData();

  const formatDate = (date: string) =>
    new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{ fontSize: `${fontSize}px`, color, textAlign, cursor: "grab", maxWidth: "100%" }}
    >
      {event.start_date ? (
        <>
          {formatDate(event.start_date)}
          {event.end_date && ` – ${formatDate(event.end_date)}`}
        </>
      ) : (
        "Event dates TBD"
      )}
    </div>
  );
};

const EventDatesSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as EventDatesProps,
  }));

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Font Size</Label>
        <Input
          type="number"
          value={props.fontSize}
          onChange={(e) => setProp((p: EventDatesProps) => { p.fontSize = parseInt(e.target.value) || 16; })}
        />
      </div>
      <div className="space-y-1">
        <Label>Color</Label>
        <Input
          type="color"
          value={props.color}
          onChange={(e) => setProp((p: EventDatesProps) => { p.color = e.target.value; })}
        />
      </div>
    </div>
  );
};

CraftEventDates.craft = {
  displayName: "Event Dates",
  props: { fontSize: 16, color: "#d1d5db", textAlign: "center" as const },
  related: { settings: EventDatesSettings },
};

// ─── Event Location ──────────────────────────────────────────

interface EventLocationProps {
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
}

export const CraftEventLocation = ({ fontSize = 16, color = "#d1d5db", textAlign = "center" }: EventLocationProps) => {
  const { connectors: { connect, drag } } = useNode();
  const event = useEventData();

  const location = [event.location, event.city, event.country].filter(Boolean).join(", ");

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{ fontSize: `${fontSize}px`, color, textAlign, cursor: "grab", maxWidth: "100%" }}
    >
      {location || "Location TBD"}
    </div>
  );
};

const EventLocationSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as EventLocationProps,
  }));

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Font Size</Label>
        <Input
          type="number"
          value={props.fontSize}
          onChange={(e) => setProp((p: EventLocationProps) => { p.fontSize = parseInt(e.target.value) || 16; })}
        />
      </div>
      <div className="space-y-1">
        <Label>Color</Label>
        <Input
          type="color"
          value={props.color}
          onChange={(e) => setProp((p: EventLocationProps) => { p.color = e.target.value; })}
        />
      </div>
    </div>
  );
};

CraftEventLocation.craft = {
  displayName: "Event Location",
  props: { fontSize: 16, color: "#d1d5db", textAlign: "center" as const },
  related: { settings: EventLocationSettings },
};

// ─── Register Button ─────────────────────────────────────────

interface RegisterButtonProps {
  text?: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
}

export const CraftRegisterButton = ({ text = "Register Now", bgColor = "#29BDD6", textColor = "#ffffff", fontSize = 18, paddingX = 32, paddingY = 16, borderRadius = 12 }: RegisterButtonProps) => {
  const { connectors: { connect, drag } } = useNode();
  const event = useEventData();

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{ cursor: "grab", display: "inline-block" }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontSize: `${fontSize}px`,
          padding: `${paddingY}px ${paddingX}px`,
          borderRadius: `${borderRadius}px`,
          fontWeight: 600,
          textAlign: "center",
          opacity: event.status === "registration_open" ? 1 : 0.5,
        }}
      >
        {text}
        {event.status !== "registration_open" && (
          <span className="block text-xs opacity-60 mt-1">Registration not open</span>
        )}
      </div>
    </div>
  );
};

const RegisterButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as RegisterButtonProps,
  }));

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Button Text</Label>
        <Input
          value={props.text}
          onChange={(e) => setProp((p: RegisterButtonProps) => { p.text = e.target.value; })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label>BG Color</Label>
          <Input
            type="color"
            value={props.bgColor}
            onChange={(e) => setProp((p: RegisterButtonProps) => { p.bgColor = e.target.value; })}
          />
        </div>
        <div className="space-y-1">
          <Label>Text Color</Label>
          <Input
            type="color"
            value={props.textColor}
            onChange={(e) => setProp((p: RegisterButtonProps) => { p.textColor = e.target.value; })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label>Font Size</Label>
          <Input
            type="number"
            value={props.fontSize}
            onChange={(e) => setProp((p: RegisterButtonProps) => { p.fontSize = parseInt(e.target.value) || 18; })}
          />
        </div>
        <div className="space-y-1">
          <Label>Radius</Label>
          <Input
            type="number"
            value={props.borderRadius}
            onChange={(e) => setProp((p: RegisterButtonProps) => { p.borderRadius = parseInt(e.target.value) || 12; })}
          />
        </div>
      </div>
    </div>
  );
};

CraftRegisterButton.craft = {
  displayName: "Register Button",
  props: {
    text: "Register Now",
    bgColor: "#29BDD6",
    textColor: "#ffffff",
    fontSize: 18,
    paddingX: 32,
    paddingY: 16,
    borderRadius: 12,
  },
  related: { settings: RegisterButtonSettings },
};
