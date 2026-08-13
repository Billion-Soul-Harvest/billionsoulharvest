import { describe, it, expect } from "vitest";
import {
  CRITERIA_DEFINITIONS,
  CATEGORIES,
  getCriteriaByCategory,
  getCriterionByField,
  type CriteriaDefinition,
} from "../criteria-definitions";

describe("CRITERIA_DEFINITIONS", () => {
  it("has the expected total count of definitions", () => {
    expect(CRITERIA_DEFINITIONS).toHaveLength(21);
  });

  it("has no duplicate field names", () => {
    const fields = CRITERIA_DEFINITIONS.map((d) => d.field);
    const uniqueFields = new Set(fields);
    expect(uniqueFields.size).toBe(fields.length);
  });

  it("every definition has required fields", () => {
    for (const def of CRITERIA_DEFINITIONS) {
      expect(def.field).toBeTruthy();
      expect(def.label).toBeTruthy();
      expect(def.category).toBeTruthy();
      expect(def.fieldType).toBeTruthy();
      expect(def.operators.length).toBeGreaterThan(0);
    }
  });

  it("every definition has a valid fieldType", () => {
    const validTypes = ["text", "select", "array", "date"];
    for (const def of CRITERIA_DEFINITIONS) {
      expect(validTypes).toContain(def.fieldType);
    }
  });
});

describe("CATEGORIES", () => {
  const expectedCategories = [
    "Contact profiles",
    "Contact type",
    "List membership",
    "Tags",
    "Sources",
    "Dates",
  ];

  it("has all expected categories", () => {
    const names = CATEGORIES.map((c) => c.name);
    expect(names).toEqual(expectedCategories);
  });

  it("every category has a name and icon", () => {
    for (const cat of CATEGORIES) {
      expect(cat.name).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    }
  });

  it("every category referenced in definitions exists in CATEGORIES", () => {
    const categoryNames = new Set(CATEGORIES.map((c) => c.name));
    const definitionCategories = new Set(
      CRITERIA_DEFINITIONS.map((d) => d.category)
    );
    for (const cat of definitionCategories) {
      expect(categoryNames).toContain(cat);
    }
  });
});

describe("text fields", () => {
  const textDefs = CRITERIA_DEFINITIONS.filter((d) => d.fieldType === "text");
  const expectedOperatorValues = [
    "is",
    "is_not",
    "contains",
    "starts_with",
    "is_blank",
    "is_not_blank",
  ];

  it("has the expected text field definitions", () => {
    const fields = textDefs.map((d) => d.field);
    expect(fields).toContain("first_name");
    expect(fields).toContain("last_name");
    expect(fields).toContain("email");
    expect(fields).toContain("phone");
    expect(fields).toContain("city");
    expect(fields).toContain("state");
    expect(fields).toContain("country");
    expect(fields).toContain("church_name");
    expect(fields).toContain("church_role");
    expect(fields).toContain("job_title");
    expect(fields).toContain("language");
    expect(fields).toContain("source");
    expect(fields).toContain("referred_by");
  });

  it("every text field supports all expected operators", () => {
    for (const def of textDefs) {
      const opValues = def.operators.map((o) => o.value);
      expect(opValues).toEqual(expectedOperatorValues);
    }
  });

  it("text fields do not have options defined", () => {
    for (const def of textDefs) {
      expect(def.options).toBeUndefined();
    }
  });
});

describe("select fields", () => {
  const selectDefs = CRITERIA_DEFINITIONS.filter(
    (d) => d.fieldType === "select"
  );
  const expectedOperatorValues = ["is", "is_not"];

  it("has the expected select field definitions", () => {
    const fields = selectDefs.map((d) => d.field);
    expect(fields).toContain("gender");
    expect(fields).toContain("age_group");
    expect(fields).toContain("contact_type");
  });

  it("every select field supports expected operators", () => {
    for (const def of selectDefs) {
      const opValues = def.operators.map((o) => o.value);
      expect(opValues).toEqual(expectedOperatorValues);
    }
  });

  it("every select field has options defined", () => {
    for (const def of selectDefs) {
      expect(def.options).toBeDefined();
      expect(def.options!.length).toBeGreaterThan(0);
    }
  });

  it("gender has correct options", () => {
    const gender = getCriterionByField("gender")!;
    const optionValues = gender.options!.map((o) => o.value);
    expect(optionValues).toEqual(["Male", "Female"]);
  });

  it("age_group has correct options", () => {
    const ageGroup = getCriterionByField("age_group")!;
    const optionValues = ageGroup.options!.map((o) => o.value);
    expect(optionValues).toEqual([
      "18-24",
      "25-34",
      "35-44",
      "45-54",
      "55-64",
      "65+",
    ]);
  });

  it("contact_type has correct options", () => {
    const contactType = getCriterionByField("contact_type")!;
    const optionValues = contactType.options!.map((o) => o.value);
    expect(optionValues).toEqual([
      "pastor",
      "leader",
      "donor",
      "attendee",
      "subscriber",
      "other",
    ]);
  });
});

describe("array fields", () => {
  const arrayDefs = CRITERIA_DEFINITIONS.filter(
    (d) => d.fieldType === "array"
  );
  const expectedOperatorValues = [
    "includes_any",
    "includes_all",
    "not_includes",
  ];

  it("has the expected array field definitions", () => {
    const fields = arrayDefs.map((d) => d.field);
    expect(fields).toContain("email_lists");
    expect(fields).toContain("tags");
  });

  it("every array field supports expected operators", () => {
    for (const def of arrayDefs) {
      const opValues = def.operators.map((o) => o.value);
      expect(opValues).toEqual(expectedOperatorValues);
    }
  });
});

describe("date fields", () => {
  const dateDefs = CRITERIA_DEFINITIONS.filter((d) => d.fieldType === "date");
  const expectedOperatorValues = ["is_before", "is_after", "in_last_days"];

  it("has the expected date field definitions", () => {
    const fields = dateDefs.map((d) => d.field);
    expect(fields).toContain("birthday");
    expect(fields).toContain("created_at");
    expect(fields).toContain("updated_at");
  });

  it("every date field supports expected operators", () => {
    for (const def of dateDefs) {
      const opValues = def.operators.map((o) => o.value);
      expect(opValues).toEqual(expectedOperatorValues);
    }
  });
});

describe("category counts", () => {
  it("Contact profiles has 14 definitions", () => {
    expect(getCriteriaByCategory("Contact profiles")).toHaveLength(14);
  });

  it("Contact type has 1 definition", () => {
    expect(getCriteriaByCategory("Contact type")).toHaveLength(1);
  });

  it("List membership has 1 definition", () => {
    expect(getCriteriaByCategory("List membership")).toHaveLength(1);
  });

  it("Tags has 1 definition", () => {
    expect(getCriteriaByCategory("Tags")).toHaveLength(1);
  });

  it("Sources has 2 definitions", () => {
    expect(getCriteriaByCategory("Sources")).toHaveLength(2);
  });

  it("Dates has 2 definitions", () => {
    expect(getCriteriaByCategory("Dates")).toHaveLength(2);
  });
});

describe("getCriteriaByCategory", () => {
  it("returns definitions matching the given category", () => {
    const results = getCriteriaByCategory("Tags");
    expect(results).toHaveLength(1);
    expect(results[0].field).toBe("tags");
  });

  it("returns empty array for unknown category", () => {
    expect(getCriteriaByCategory("nonexistent")).toEqual([]);
  });
});

describe("getCriterionByField", () => {
  it("returns the definition for a known field", () => {
    const result = getCriterionByField("email");
    expect(result).toBeDefined();
    expect(result!.label).toBe("Email address");
    expect(result!.fieldType).toBe("text");
  });

  it("returns undefined for an unknown field", () => {
    expect(getCriterionByField("nonexistent")).toBeUndefined();
  });
});
