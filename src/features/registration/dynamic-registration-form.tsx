"use client";

import { useState } from "react";
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
import { howHeardOptions, regionOptions, countryOptions } from "./schema";

interface DynamicRegistrationFormProps {
  registrationConfig: RegistrationConfig;
  eventSlug: string;
  eventStatus?: string;
  inline?: boolean;
}

function buildSchema(config: RegistrationConfig) {
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
    if (field?.visible) {
      shape[key] = field.required
        ? z.string().min(1, `${label} is required`)
        : z.string().optional();
    }
  }

  // Custom fields validation is handled separately
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
  const isRegistrationOpen = !eventStatus || eventStatus === "registration_open";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const schema = buildSchema(registrationConfig);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {},
  });

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

  const { fields } = registrationConfig;

  function validateCustomFields(): boolean {
    const errs: Record<string, string> = {};
    for (const field of registrationConfig.customFields) {
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
    : "border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80";
  const labelClass = inline ? "text-gray-700 font-medium" : "text-amber-900 font-medium";

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

      {/* Region */}
      {fields.region?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Region {fields.region.required && <span className="text-red-500">*</span>}
          </Label>
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
      )}

      {/* Country */}
      {fields.country?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Country {fields.country.required && <span className="text-red-500">*</span>}
          </Label>
          <SearchableSelect
            value={watch("country")}
            onValueChange={(value) => setValue("country", value)}
            options={countryOptions.map((opt) => ({ value: opt, label: opt }))}
            placeholder="Select your country"
            searchPlaceholder="Search countries..."
          />
          {errors.country && <p className="text-red-600 text-xs">{errors.country.message as string}</p>}
        </div>
      )}

      {/* VISA Requirement */}
      {fields.visaRequired?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            VISA Requirement {fields.visaRequired.required && <span className="text-red-500">*</span>}
          </Label>
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
      )}

      {/* Passport Number */}
      {fields.passportNumber?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Passport Number {fields.passportNumber.required && <span className="text-red-500">*</span>}
          </Label>
          <Input {...register("passportNumber")} className={inputClass} placeholder="Your passport number" />
          {errors.passportNumber && <p className="text-red-600 text-xs">{errors.passportNumber.message as string}</p>}
        </div>
      )}

      {/* Phone */}
      {fields.phone?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Phone / WhatsApp Number {fields.phone.required && <span className="text-red-500">*</span>}
          </Label>
          <Input type="tel" {...register("phone")} className={inputClass} placeholder="Country Code + Phone Number" />
          {errors.phone && <p className="text-red-600 text-xs">{errors.phone.message as string}</p>}
        </div>
      )}

      {/* Church / Organization */}
      {fields.churchName?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Organization / Movement / Church {fields.churchName.required && <span className="text-red-500">*</span>}
          </Label>
          <Input {...register("churchName")} className={inputClass} placeholder="Your organization or church" />
          {errors.churchName && <p className="text-red-600 text-xs">{errors.churchName.message as string}</p>}
        </div>
      )}

      {/* Ministry Title / Role */}
      {fields.churchRole?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Ministry Title / Role {fields.churchRole.required && <span className="text-red-500">*</span>}
          </Label>
          <Input {...register("churchRole")} className={inputClass} placeholder="Your ministry title or role" />
          {errors.churchRole && <p className="text-red-600 text-xs">{errors.churchRole.message as string}</p>}
        </div>
      )}

      {/* Referred By */}
      {fields.referredBy?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Referred By (Last Name, First Name) {fields.referredBy.required && <span className="text-red-500">*</span>}
          </Label>
          <Input {...register("referredBy")} className={inputClass} placeholder="Last Name, First Name" />
          {errors.referredBy && <p className="text-red-600 text-xs">{errors.referredBy.message as string}</p>}
        </div>
      )}

      {/* City */}
      {fields.city?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            City {fields.city.required && <span className="text-red-500">*</span>}
          </Label>
          <Input {...register("city")} className={inputClass} placeholder="Your city" />
          {errors.city && <p className="text-red-600 text-xs">{errors.city.message as string}</p>}
        </div>
      )}

      {/* Dietary Requirements */}
      {fields.dietaryRequirements?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Dietary Requirements {fields.dietaryRequirements.required && <span className="text-red-500">*</span>}
          </Label>
          <Input {...register("dietaryRequirements")} className={inputClass} placeholder="Any dietary restrictions" />
          {errors.dietaryRequirements && <p className="text-red-600 text-xs">{errors.dietaryRequirements.message as string}</p>}
        </div>
      )}

      {/* How Did You Hear */}
      {fields.howHeard?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            How did you hear about this event? {fields.howHeard.required && <span className="text-red-500">*</span>}
          </Label>
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
      )}

      {/* Special Needs */}
      {fields.specialNeeds?.visible && (
        <div className="space-y-1.5">
          <Label className={labelClass}>
            Special Needs or Requests {fields.specialNeeds.required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea {...register("specialNeeds")} className={`${inputClass} min-h-[80px]`} placeholder="Any special accommodations" />
          {errors.specialNeeds && <p className="text-red-600 text-xs">{errors.specialNeeds.message as string}</p>}
        </div>
      )}

      {/* Custom Fields */}
      {registrationConfig.customFields.map((field) => (
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
      ))}

      {!isRegistrationOpen && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm text-center">
          Registration is not currently open for this event.
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !isRegistrationOpen}
        className={inline
          ? "w-full font-semibold py-5"
          : "w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-amber-700/25 transition-all duration-200 hover:shadow-xl hover:shadow-amber-700/30 disabled:opacity-50"
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
