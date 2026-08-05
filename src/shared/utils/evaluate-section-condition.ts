import type { SectionCondition } from "@/shared/types/database";

export function evaluateSectionCondition(
  condition: SectionCondition | null | undefined,
  formValues: Record<string, unknown>
): boolean {
  if (!condition) return true;

  const rawValue = formValues[condition.fieldKey];
  const fieldValue = rawValue == null ? "" : String(rawValue);

  switch (condition.operator) {
    case "equals":
      return fieldValue === (condition.value ?? "");
    case "not_equals":
      return fieldValue !== (condition.value ?? "");
    case "contains":
      return fieldValue.toLowerCase().includes((condition.value ?? "").toLowerCase());
    case "not_empty":
      return fieldValue.trim().length > 0;
    case "is_empty":
      return fieldValue.trim().length === 0;
    default:
      return true;
  }
}
