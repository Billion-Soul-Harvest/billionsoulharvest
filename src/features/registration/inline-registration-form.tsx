"use client";

import { DynamicRegistrationForm } from "./dynamic-registration-form";
import type { RegistrationConfig } from "@/shared/types/database";

interface Props {
  registrationConfig: RegistrationConfig;
  eventSlug: string;
  eventStatus?: string;
  style?: React.CSSProperties;
}

export function InlineRegistrationForm({ registrationConfig, eventSlug, eventStatus, style }: Props) {
  return (
    <div style={style}>
      <DynamicRegistrationForm
        registrationConfig={registrationConfig}
        eventSlug={eventSlug}
        eventStatus={eventStatus}
        inline
      />
    </div>
  );
}
