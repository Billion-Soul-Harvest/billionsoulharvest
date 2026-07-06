export type FieldType = "text" | "select" | "array" | "date";

export interface CriteriaDefinition {
  field: string;
  label: string;
  category: string;
  fieldType: FieldType;
  operators: { value: string; label: string }[];
  options?: { value: string; label: string }[];
}

const textOperators = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "starts_with", label: "starts with" },
  { value: "is_blank", label: "is blank" },
  { value: "is_not_blank", label: "is not blank" },
];

const selectOperators = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
];

const arrayOperators = [
  { value: "includes_any", label: "includes any of" },
  { value: "includes_all", label: "includes all of" },
  { value: "not_includes", label: "does not include" },
];

const dateOperators = [
  { value: "is_before", label: "is before" },
  { value: "is_after", label: "is after" },
  { value: "in_last_days", label: "in the last N days" },
];

export const CRITERIA_DEFINITIONS: CriteriaDefinition[] = [
  // Contact profiles (14)
  { field: "first_name", label: "First name", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "last_name", label: "Last name", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "email", label: "Email address", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "phone", label: "Phone", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "city", label: "City", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "state", label: "State", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "country", label: "Country", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "church_name", label: "Church/Organization", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "church_role", label: "Church role", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "job_title", label: "Job title", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "gender", label: "Gender", category: "Contact profiles", fieldType: "select", operators: selectOperators, options: [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ]},
  { field: "age_group", label: "Age group", category: "Contact profiles", fieldType: "select", operators: selectOperators, options: [
    { value: "18-24", label: "18-24" },
    { value: "25-34", label: "25-34" },
    { value: "35-44", label: "35-44" },
    { value: "45-54", label: "45-54" },
    { value: "55-64", label: "55-64" },
    { value: "65+", label: "65+" },
  ]},
  { field: "language", label: "Language", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "birthday", label: "Birthday", category: "Contact profiles", fieldType: "date", operators: dateOperators },

  // Contact type (1)
  { field: "contact_type", label: "Contact type", category: "Contact type", fieldType: "select", operators: selectOperators, options: [
    { value: "pastor", label: "Pastor" },
    { value: "leader", label: "Leader" },
    { value: "donor", label: "Donor" },
    { value: "attendee", label: "Attendee" },
    { value: "subscriber", label: "Subscriber" },
    { value: "other", label: "Other" },
  ]},

  // List membership (1)
  { field: "email_lists", label: "List membership", category: "List membership", fieldType: "array", operators: arrayOperators },

  // Tags (1)
  { field: "tags", label: "Tags", category: "Tags", fieldType: "array", operators: arrayOperators },

  // Sources (2)
  { field: "source", label: "Source", category: "Sources", fieldType: "text", operators: textOperators },
  { field: "referred_by", label: "Referred by", category: "Sources", fieldType: "text", operators: textOperators },

  // Dates (2)
  { field: "created_at", label: "Date added", category: "Dates", fieldType: "date", operators: dateOperators },
  { field: "updated_at", label: "Date modified", category: "Dates", fieldType: "date", operators: dateOperators },
];

export const CATEGORIES = [
  { name: "Contact profiles", icon: "user" },
  { name: "Contact type", icon: "tag" },
  { name: "List membership", icon: "list" },
  { name: "Tags", icon: "tag" },
  { name: "Sources", icon: "link" },
  { name: "Dates", icon: "calendar" },
];

export function getCriteriaByCategory(category: string): CriteriaDefinition[] {
  return CRITERIA_DEFINITIONS.filter((c) => c.category === category);
}

export function getCriterionByField(field: string): CriteriaDefinition | undefined {
  return CRITERIA_DEFINITIONS.find((c) => c.field === field);
}
