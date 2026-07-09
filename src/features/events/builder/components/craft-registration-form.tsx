"use client";

import { useNode } from "@craftjs/core";
import { craftRef } from "../craft-utils";
import { useEventData } from "../event-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegistrationConfig } from "@/shared/types/database";

interface CraftRegistrationFormProps {
  backgroundColor?: string;
  textColor?: string;
  labelColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  borderRadius?: number;
  padding?: number;
  width?: number;
}

const DEFAULT_FIELD_LABELS: Record<string, string> = {
  region: "Region",
  country: "Country",
  visaRequired: "VISA Requirement",
  passportNumber: "Passport Number",
  phone: "Phone / WhatsApp Number",
  churchName: "Organization / Movement / Church",
  churchRole: "Ministry Title / Role",
  referredBy: "Referred By",
  city: "City",
  dietaryRequirements: "Dietary Requirements",
  howHeard: "How did you hear about this event?",
  specialNeeds: "Special Needs or Requests",
};

export function CraftRegistrationForm({
  backgroundColor = "#ffffff",
  textColor = "#111827",
  labelColor = "#374151",
  buttonBgColor = "#29BDD6",
  buttonTextColor = "#ffffff",
  borderRadius = 12,
  padding = 32,
  width = 500,
}: CraftRegistrationFormProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  const event = useEventData();
  const config = event.registration_config as RegistrationConfig | null;

  if (!config || !config.enabled) {
    return (
      <div
        ref={craftRef(connect, drag)}
        style={{
          width,
          maxWidth: "100%",
          padding,
          borderRadius,
          backgroundColor: "#f3f4f6",
          textAlign: "center",
          color: "#6b7280",
          border: "2px dashed #d1d5db",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Registration Form</p>
        <p style={{ fontSize: 12 }}>Enable registration in Event Settings to configure fields.</p>
      </div>
    );
  }

  const visibleFields: string[] = [];
  for (const [key, fieldConfig] of Object.entries(config.fields)) {
    if (fieldConfig.visible) visibleFields.push(key);
  }

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        width,
        maxWidth: "100%",
        padding,
        borderRadius,
        backgroundColor,
        color: textColor,
      }}
    >
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Register</p>

      {/* Always-on fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <PreviewField label="First Name" required labelColor={labelColor} />
        <PreviewField label="Last Name" required labelColor={labelColor} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <PreviewField label="Email" required labelColor={labelColor} />
      </div>

      {/* Configurable default fields */}
      {visibleFields.map((key) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <PreviewField
            label={DEFAULT_FIELD_LABELS[key] ?? key}
            required={config.fields[key as keyof typeof config.fields].required}
            labelColor={labelColor}
          />
        </div>
      ))}

      {/* Custom fields */}
      {config.customFields.map((field) => (
        <div key={field.id} style={{ marginBottom: 12 }}>
          <PreviewField label={field.label} required={field.required} labelColor={labelColor} />
        </div>
      ))}

      {/* Submit button preview */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 24px",
          backgroundColor: buttonBgColor,
          color: buttonTextColor,
          borderRadius: 8,
          textAlign: "center",
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        Complete Registration
      </div>
    </div>
  );
}

function PreviewField({ label, required, labelColor }: { label: string; required: boolean; labelColor: string }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 500, color: labelColor, marginBottom: 4 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </p>
      <div
        style={{
          height: 36,
          borderRadius: 6,
          border: "1px solid #d1d5db",
          backgroundColor: "#f9fafb",
        }}
      />
    </div>
  );
}

function CraftRegistrationFormSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CraftRegistrationFormProps,
  }));

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        Configure registration fields in Event Settings. Style controls below.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="reg-bg">Background</Label>
          <Input
            id="reg-bg"
            type="color"
            value={props.backgroundColor}
            onChange={(e) => setProp((p: CraftRegistrationFormProps) => { p.backgroundColor = e.target.value; })}
          />
        </div>
        <div>
          <Label htmlFor="reg-text">Text Color</Label>
          <Input
            id="reg-text"
            type="color"
            value={props.textColor}
            onChange={(e) => setProp((p: CraftRegistrationFormProps) => { p.textColor = e.target.value; })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="reg-label">Label Color</Label>
          <Input
            id="reg-label"
            type="color"
            value={props.labelColor}
            onChange={(e) => setProp((p: CraftRegistrationFormProps) => { p.labelColor = e.target.value; })}
          />
        </div>
        <div>
          <Label htmlFor="reg-btn-bg">Button Color</Label>
          <Input
            id="reg-btn-bg"
            type="color"
            value={props.buttonBgColor}
            onChange={(e) => setProp((p: CraftRegistrationFormProps) => { p.buttonBgColor = e.target.value; })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reg-btn-text">Button Text Color</Label>
        <Input
          id="reg-btn-text"
          type="color"
          value={props.buttonTextColor}
          onChange={(e) => setProp((p: CraftRegistrationFormProps) => { p.buttonTextColor = e.target.value; })}
        />
      </div>

      <div>
        <Label htmlFor="reg-radius">Border Radius</Label>
        <Input
          id="reg-radius"
          type="number"
          value={props.borderRadius}
          onChange={(e) => setProp((p: CraftRegistrationFormProps) => { p.borderRadius = Number(e.target.value); })}
        />
      </div>

      <div>
        <Label htmlFor="reg-padding">Padding</Label>
        <Input
          id="reg-padding"
          type="number"
          value={props.padding}
          onChange={(e) => setProp((p: CraftRegistrationFormProps) => { p.padding = Number(e.target.value); })}
        />
      </div>

      <div>
        <Label htmlFor="reg-width">Width</Label>
        <Input
          id="reg-width"
          type="number"
          value={props.width}
          onChange={(e) => setProp((p: CraftRegistrationFormProps) => { p.width = Number(e.target.value); })}
        />
      </div>
    </div>
  );
}

CraftRegistrationForm.craft = {
  displayName: "Registration Form",
  props: {
    backgroundColor: "#ffffff",
    textColor: "#111827",
    labelColor: "#374151",
    buttonBgColor: "#29BDD6",
    buttonTextColor: "#ffffff",
    borderRadius: 12,
    padding: 32,
    width: 500,
  } satisfies CraftRegistrationFormProps,
  related: {
    settings: CraftRegistrationFormSettings,
  },
};
