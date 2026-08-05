"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { RegistrationConfig } from "@/shared/types/database";
import { DEFAULT_FIELD_ORDER } from "@/shared/types/database";
import { evaluateSectionCondition } from "@/shared/utils/evaluate-section-condition";
import { howHeardOptions, regionOptions, countryOptions } from "./schema";

interface DynamicRegistrationFormProps {
  registrationConfig: RegistrationConfig;
  eventSlug: string;
  eventStatus?: string;
  inline?: boolean;
}

function getHiddenFieldKeys(config: RegistrationConfig, formValues: Record<string, unknown>): Set<string> {
  const hidden = new Set<string>();
  const sections = config.sections ?? [];
  for (const section of sections) {
    if (!evaluateSectionCondition(section.condition, formValues)) {
      for (const key of section.fieldKeys) {
        hidden.add(key);
      }
    }
  }
  return hidden;
}

function buildSchema(config: RegistrationConfig, hiddenKeys: Set<string>) {
  const shape: Record<string, z.ZodTypeAny> = {
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
  };

  const { fields } = config;

  const fieldDefs: Array<{ key: string; field: { visible: boolean; required: boolean }; label: string }> = [
    { key: "region", field: fields.region, label: "Region" },
    { key: "country", field: fields.country, label: "Country" },
    { key: "visaRequired", field: fields.visaRequired, label: "VISA requirement" },
    { key: "passportNumber", field: fields.passportNumber, label: "Passport number" },
    { key: "phone", field: fields.phone, label: "Phone" },
    { key: "churchName", field: fields.churchName, label: "Organization / Church" },
    { key: "churchRole", field: fields.churchRole, label: "Ministry title / role" },
    { key: "referredBy", field: fields.referredBy, label: "Referred by" },
    { key: "city", field: fields.city, label: "City" },
    { key: "dietaryRequirements", field: fields.dietaryRequirements, label: "Dietary requirements" },
    { key: "howHeard", field: fields.howHeard, label: "How did you hear" },
    { key: "specialNeeds", field: fields.specialNeeds, label: "Special needs" },
  ];

  for (const { key, field, label } of fieldDefs) {
    if (field?.visible && !hiddenKeys.has(key)) {
      shape[key] = field.required
        ? z.string().min(1, `${label} is required`)
        : z.string().optional();
    }
  }

  return z.object(shape);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormValues = Record<string, any>;

export function DynamicRegistrationForm({
  registrationConfig,
  eventSlug,
  eventStatus,
  inline = false,
}: DynamicRegistrationFormProps) {
  const isRegistrationOpen = true;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: (values, context, options) => {
      const allValues = { ...values, ...customFieldValues };
      const hidden = getHiddenFieldKeys(registrationConfig, allValues);
      const schema = buildSchema(registrationConfig, hidden);
      return zodResolver(schema)(values, context, options);
    },
    defaultValues: {},
  });

  const allWatchedValues = watch();

  const hiddenKeys = useMemo(
    () => getHiddenFieldKeys(registrationConfig, { ...allWatchedValues, ...customFieldValues }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registrationConfig, JSON.stringify(allWatchedValues), JSON.stringify(customFieldValues)]
  );

  const { fields } = registrationConfig;

  // Compute which fields are in sections and which are unsectioned
  const sections = registrationConfig.sections ?? [];
  const sectionOrder = registrationConfig.sectionOrder ?? sections.map((s) => s.id);
  const sectionedFieldKeys = useMemo(() => {
    const set = new Set<string>();
    for (const section of sections) {
      for (const key of section.fieldKeys) set.add(key);
    }
    return set;
  }, [sections]);

  function validateCustomFields(): boolean {
    const errs: Record<string, string> = {};
    for (const field of registrationConfig.customFields) {
      if (hiddenKeys.has(field.id)) continue;
      if (field.required) {
        const val = customFieldValues[field.id];
        if (field.type === "checkbox") {
          if (!val) errs[field.id] = `${field.label} is required`;
        } else {
          if (!val || (typeof val === "string" && !val.trim())) {
            errs[field.id] = `${field.label} is required`;
          }
        }
      }
    }
    setCustomFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(data: FormValues) {
    if (!validateCustomFields()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const customFields: Record<string, string | boolean> = {};
      for (const field of registrationConfig.customFields) {
        if (hiddenKeys.has(field.id)) continue;
        customFields[field.id] = customFieldValues[field.id] ?? (field.type === "checkbox" ? false : "");
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, customFields, eventSlug }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Registration failed. Please try again.");
        return;
      }

      if (inline) {
        setSuccess(true);
      } else {
        window.location.href = `/register/${eventSlug}/success`;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Registration Confirmed!</h3>
        <p className="text-sm text-gray-600">You will receive a confirmation email shortly.</p>
      </div>
    );
  }

  const inputClass = inline
    ? "border-gray-300 bg-white"
    : "border-[#b4c7ec]/40 focus:border-[#00b8d4] focus:ring-[#00b8d4]/20 bg-white";
  const labelClass = inline ? "text-gray-700 font-medium" : "text-[#0d223f] font-medium";

  const fieldOrder = registrationConfig.fieldOrder ?? DEFAULT_FIELD_ORDER;

  function renderField(key: string) {
    const fieldConfig = fields[key as keyof typeof fields];
    if (!fieldConfig?.visible) return null;
    if (hiddenKeys.has(key)) return null;

    const req = fieldConfig.required && <span className="text-red-500">*</span>;

    switch (key) {
      case "region":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Region {req}</Label>
            <p className="text-xs text-gray-500">Select which continent you are in.</p>
            <SearchableSelect
              value={watch("region")}
              onValueChange={(value) => setValue("region", value)}
              options={regionOptions.map((opt) => ({ value: opt, label: opt }))}
              placeholder="Choose"
              searchPlaceholder="Search regions..."
            />
            {errors.region && <p className="text-red-600 text-xs">{errors.region.message as string}</p>}
          </div>
        );
      case "country":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Country {req}</Label>
            <SearchableSelect
              value={watch("country")}
              onValueChange={(value) => setValue("country", value)}
              options={countryOptions.map((opt) => ({ value: opt, label: opt }))}
              placeholder="Select your country"
              searchPlaceholder="Search countries..."
            />
            {errors.country && <p className="text-red-600 text-xs">{errors.country.message as string}</p>}
          </div>
        );
      case "visaRequired":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>VISA Requirement {req}</Label>
            <p className="text-xs text-gray-500">Do you require a Visa to enter the host country?</p>
            <Select onValueChange={(value: string | null) => { if (value) setValue("visaRequired", value); }}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
            {errors.visaRequired && <p className="text-red-600 text-xs">{errors.visaRequired.message as string}</p>}
          </div>
        );
      case "passportNumber":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Passport Number {req}</Label>
            <Input {...register("passportNumber")} className={inputClass} placeholder="Your passport number" />
            {errors.passportNumber && <p className="text-red-600 text-xs">{errors.passportNumber.message as string}</p>}
          </div>
        );
      case "phone":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Phone / WhatsApp Number {req}</Label>
            <Input type="tel" {...register("phone")} className={inputClass} placeholder="Country Code + Phone Number" />
            {errors.phone && <p className="text-red-600 text-xs">{errors.phone.message as string}</p>}
          </div>
        );
      case "churchName":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Organization / Movement / Church {req}</Label>
            <Input {...register("churchName")} className={inputClass} placeholder="Your organization or church" />
            {errors.churchName && <p className="text-red-600 text-xs">{errors.churchName.message as string}</p>}
          </div>
        );
      case "churchRole":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Ministry Title / Role {req}</Label>
            <Input {...register("churchRole")} className={inputClass} placeholder="Your ministry title or role" />
            {errors.churchRole && <p className="text-red-600 text-xs">{errors.churchRole.message as string}</p>}
          </div>
        );
      case "referredBy":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Referred By (Last Name, First Name) {req}</Label>
            <Input {...register("referredBy")} className={inputClass} placeholder="Last Name, First Name" />
            {errors.referredBy && <p className="text-red-600 text-xs">{errors.referredBy.message as string}</p>}
          </div>
        );
      case "city":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>City {req}</Label>
            <Input {...register("city")} className={inputClass} placeholder="Your city" />
            {errors.city && <p className="text-red-600 text-xs">{errors.city.message as string}</p>}
          </div>
        );
      case "dietaryRequirements":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Dietary Requirements {req}</Label>
            <Input {...register("dietaryRequirements")} className={inputClass} placeholder="Any dietary restrictions" />
            {errors.dietaryRequirements && <p className="text-red-600 text-xs">{errors.dietaryRequirements.message as string}</p>}
          </div>
        );
      case "howHeard":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>How did you hear about this event? {req}</Label>
            <Select onValueChange={(value: string | null) => { if (value) setValue("howHeard", value); }}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {howHeardOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.howHeard && <p className="text-red-600 text-xs">{errors.howHeard.message as string}</p>}
          </div>
        );
      case "specialNeeds":
        return (
          <div key={key} className="space-y-1.5">
            <Label className={labelClass}>Special Needs or Requests {req}</Label>
            <Textarea {...register("specialNeeds")} className={`${inputClass} min-h-[80px]`} placeholder="Any special accommodations" />
            {errors.specialNeeds && <p className="text-red-600 text-xs">{errors.specialNeeds.message as string}</p>}
          </div>
        );
      default:
        return null;
    }
  }

  function renderCustomField(field: typeof registrationConfig.customFields[number]) {
    if (hiddenKeys.has(field.id)) return null;
    return (
      <div key={field.id} className="space-y-1.5">
        <Label className={labelClass}>
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </Label>
        {(field.type === "text" || field.type === "number" || field.type === "email" || field.type === "tel" || field.type === "url" || field.type === "date") && (
          <Input
            type={field.type}
            className={inputClass}
            value={(customFieldValues[field.id] as string) ?? ""}
            onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder}
          />
        )}
        {field.type === "textarea" && (
          <Textarea
            className={`${inputClass} min-h-[80px]`}
            value={(customFieldValues[field.id] as string) ?? ""}
            onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder}
          />
        )}
        {field.type === "select" && (
          <Select onValueChange={(value: string | null) => { if (value) setCustomFieldValues((prev) => ({ ...prev, [field.id]: value })); }}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder={field.placeholder ?? "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {field.type === "checkbox" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!customFieldValues[field.id]}
              onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [field.id]: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">{field.label}</span>
          </label>
        )}
        {customFieldErrors[field.id] && (
          <p className="text-red-600 text-xs">{customFieldErrors[field.id]}</p>
        )}
      </div>
    );
  }

  // Unsectioned default fields: visible fields not assigned to any section
  const unsectionedDefaultFields = fieldOrder.filter(
    (key) => !sectionedFieldKeys.has(key) && fields[key]?.visible && !hiddenKeys.has(key)
  );

  // Unsectioned custom fields
  const unsectionedCustomFields = registrationConfig.customFields.filter(
    (f) => !sectionedFieldKeys.has(f.id) && !hiddenKeys.has(f.id)
  );

  // Ordered sections
  const orderedSections = sectionOrder
    .map((id) => sections.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Always-visible: firstName, lastName, email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className={labelClass}>
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input {...register("firstName")} className={inputClass} placeholder="First name" />
          {errors.firstName && <p className="text-red-600 text-xs">{errors.firstName.message as string}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input {...register("lastName")} className={inputClass} placeholder="Last name" />
          {errors.lastName && <p className="text-red-600 text-xs">{errors.lastName.message as string}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass}>
          Email <span className="text-red-500">*</span>
        </Label>
        <Input type="email" {...register("email")} className={inputClass} placeholder="your@email.com" />
        {errors.email && <p className="text-red-600 text-xs">{errors.email.message as string}</p>}
      </div>

      {/* Unsectioned default fields */}
      {unsectionedDefaultFields.map((key) => renderField(key))}

      {/* Unsectioned custom fields */}
      {unsectionedCustomFields.map((field) => renderCustomField(field))}

      {/* Sections */}
      {orderedSections.map((section) => {
        const visible = evaluateSectionCondition(section.condition, { ...allWatchedValues, ...customFieldValues });
        if (!visible) return null;

        const sectionDefaultFields = section.fieldKeys.filter(
          (key) => key in fields && fields[key as keyof typeof fields]?.visible
        );
        const sectionCustomFields = section.fieldKeys
          .map((key) => registrationConfig.customFields.find((f) => f.id === key))
          .filter((f): f is NonNullable<typeof f> => !!f);

        if (sectionDefaultFields.length === 0 && sectionCustomFields.length === 0) return null;

        return (
          <div key={section.id} className="space-y-4">
            <div className="border-t pt-4">
              <h3 className={`text-lg font-semibold ${inline ? "text-gray-900" : "text-[#0d223f]"}`}>
                {section.title}
              </h3>
              {section.description && (
                <p className="text-sm text-gray-500 mt-1">{section.description}</p>
              )}
            </div>
            {sectionDefaultFields.map((key) => renderField(key))}
            {sectionCustomFields.map((field) => renderCustomField(field))}
          </div>
        );
      })}

      {!isRegistrationOpen && (
        <div className="bg-[#0d223f]/5 border border-[#b4c7ec]/30 text-[#0d223f] px-4 py-3 rounded-lg text-sm text-center">
          Registration is not currently open for this event.
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !isRegistrationOpen}
        className={inline
          ? "w-full font-semibold py-5"
          : "w-full bg-[#0d223f] hover:bg-[#1a3a5c] text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-[#0d223f]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#0d223f]/30 disabled:opacity-50"
        }
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Registering...
          </span>
        ) : (
          "Complete Registration"
        )}
      </Button>
    </form>
  );
}
