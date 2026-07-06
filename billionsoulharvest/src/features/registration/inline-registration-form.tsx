"use client";

import { DynamicRegistrationForm } from "./dynamic-registration-form";
import type { RegistrationConfig } from "@/shared/types/database";

interface Props {
  registrationConfig: RegistrationConfig;
  eventSlug: string;
  style?: React.CSSProperties;
}

export function InlineRegistrationForm({ registrationConfig, eventSlug, style }: Props) {
  return (
    <div style={style}>
      <DynamicRegistrationForm
        registrationConfig={registrationConfig}
        eventSlug={eventSlug}
        inline
      />
    </div>
  );
}
