"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  registrationSchema,
  type RegistrationFormData,
  churchRoleOptions,
  howHeardOptions,
} from "./schema";

interface RegistrationFormProps {
  eventSlug: string;
  eventTitle: string;
}

export function RegistrationForm({ eventSlug, eventTitle }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      churchRole: "other",
    },
  });

  async function onSubmit(data: RegistrationFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventSlug }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Registration failed. Please try again.");
        return;
      }

      router.push(`/register/${eventSlug}/success`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-amber-900 font-medium">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            {...register("firstName")}
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-red-600 text-xs">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-amber-900 font-medium">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            {...register("lastName")}
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="text-red-600 text-xs">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-amber-900 font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-600 text-xs">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-amber-900 font-medium">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {/* Church Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="churchName" className="text-amber-900 font-medium">
            Church / Organization
          </Label>
          <Input
            id="churchName"
            {...register("churchName")}
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
            placeholder="Church or organization name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="churchRole" className="text-amber-900 font-medium">
            Your Role
          </Label>
          <Select
            defaultValue="other"
            onValueChange={(value: string | null) => {
              if (value) setValue("churchRole", value as RegistrationFormData["churchRole"]);
            }
            }
          >
            <SelectTrigger className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {churchRoleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-amber-900 font-medium">
            City
          </Label>
          <Input
            id="city"
            {...register("city")}
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
            placeholder="Your city"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country" className="text-amber-900 font-medium">
            Country <span className="text-red-500">*</span>
          </Label>
          <Input
            id="country"
            {...register("country")}
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
            placeholder="Your country"
          />
          {errors.country && (
            <p className="text-red-600 text-xs">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-2">
        <Label htmlFor="dietaryRequirements" className="text-amber-900 font-medium">
          Dietary Requirements
        </Label>
        <Input
          id="dietaryRequirements"
          {...register("dietaryRequirements")}
          className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
          placeholder="Any dietary restrictions or allergies"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="howHeard" className="text-amber-900 font-medium">
          How did you hear about this event?
        </Label>
        <Select onValueChange={(value: string | null) => { if (value) setValue("howHeard", value); }}>
          <SelectTrigger className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {howHeardOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialNeeds" className="text-amber-900 font-medium">
          Special Needs or Requests
        </Label>
        <Textarea
          id="specialNeeds"
          {...register("specialNeeds")}
          className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80 min-h-[80px]"
          placeholder="Any special accommodations you may need"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-amber-700/25 transition-all duration-200 hover:shadow-xl hover:shadow-amber-700/30 disabled:opacity-50"
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

      <p className="text-center text-xs text-amber-700/60">
        By registering, you agree to receive event-related communications from Billion Soul Harvest.
      </p>
    </form>
  );
}
