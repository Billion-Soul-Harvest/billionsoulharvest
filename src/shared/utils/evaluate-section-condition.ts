import type { SectionCondition } from "@/shared/types/database";

export function evaluateSectionCondition(
  condition: SectionCondition | null | undefined,
  formValues: Record<string, unknown>
): boolean {
  if (!condition) return true;

  const rawValue = formValues[condition.fieldKey];
  const fieldValue = rawValue == null ? "" : String(rawValue);

  // Normalize boolean/truthy comparisons for checkbox fields
  const TRUTHY = new Set(["true", "yes", "1"]);
  const FALSY = new Set(["false", "no", "0", ""]);
  function looseEquals(a: string, b: string): boolean {
    if (a === b) return true;
    const al = a.toLowerCase();
    const bl = b.toLowerCase();
    if (al === bl) return true;
    // Both truthy or both falsy = match
    if (TRUTHY.has(al) && TRUTHY.has(bl)) return true;
    if (FALSY.has(al) && FALSY.has(bl)) return true;
    return false;
  }

  switch (condition.operator) {
    case "equals":
      return looseEquals(fieldValue, condition.value ?? "");
    case "not_equals":
      return !looseEquals(fieldValue, condition.value ?? "");
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
