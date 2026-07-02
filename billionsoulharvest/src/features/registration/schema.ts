import { z } from "zod";

export const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  churchName: z.string().optional(),
  churchRole: z
    .enum(["pastor", "leader", "missionary", "member", "other"])
    .default("other"),
  city: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  dietaryRequirements: z.string().optional(),
  howHeard: z.string().optional(),
  specialNeeds: z.string().optional(),
});

export type RegistrationFormData = z.input<typeof registrationSchema>;
export type RegistrationFormOutput = z.output<typeof registrationSchema>;

export const churchRoleOptions = [
  { value: "pastor", label: "Pastor" },
  { value: "leader", label: "Church Leader" },
  { value: "missionary", label: "Missionary" },
  { value: "member", label: "Church Member" },
  { value: "other", label: "Other" },
] as const;

export const howHeardOptions = [
  "Pastor/Church Leader",
  "Social Media",
  "Email",
  "Friend/Family",
  "Website",
  "Conference",
  "Other",
] as const;
