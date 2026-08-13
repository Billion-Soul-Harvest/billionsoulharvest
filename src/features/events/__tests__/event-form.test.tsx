import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
  within,
} from "@/shared/test-utils/render";
import { mockSupabaseClient } from "@/shared/test-utils/mocks";
import { EventForm } from "../event-form";

/* ------------------------------------------------------------------ */
/*  Mocks                                                             */
/* ------------------------------------------------------------------ */

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh, back: mockBack }),
}));

// Supabase mock is activated by importing mocks.ts (it calls vi.mock internally)

vi.mock("@/shared/components/image-upload", () => ({
  ImageUpload: ({ value }: { value: string; onChange: (url: string) => void }) => (
    <div data-testid="image-upload">{value}</div>
  ),
}));

vi.mock("@/features/events/location-search-input", () => ({
  LocationSearchInput: () => <div data-testid="location-search" />,
}));

vi.mock("@/shared/components/markdown-input", () => ({
  MarkdownInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="markdown-input" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock("@/components/ui/searchable-select", () => ({
  SearchableSelect: () => <div data-testid="searchable-select" />,
}));

vi.mock("@/features/events/templates/event-templates", () => ({
  eventTemplates: [{ id: "conference", name: "Conference", description: "A conference" }],
}));

vi.mock("@/features/events/templates/apply-template", () => ({
  applyTemplate: vi.fn(() => Promise.resolve()),
}));

// Stub dnd-kit to avoid JSDOM issues with pointer events
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
  PointerSensor: class {},
  KeyboardSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
  closestCenter: () => null,
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  sortableKeyboardCoordinates: () => null,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: (arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * The base-ui Label component does not use htmlFor, so getByLabelText
 * won't work. Instead we find the label text, go to the parent wrapper,
 * and grab the input sibling.
 */
function getInputByLabel(labelText: string): HTMLInputElement {
  const label = screen.getByText(labelText, { selector: "[data-slot='label']" });
  const wrapper = label.closest("div")!;
  const input = wrapper.querySelector("input[data-slot='input']") as HTMLInputElement;
  if (!input) throw new Error(`No input found for label "${labelText}"`);
  return input;
}

function renderForm(props: Parameters<typeof EventForm>[0] = {}) {
  return renderWithProviders(<EventForm {...props} />);
}

const defaultEvent = {
  id: "existing-id",
  title: "Existing Event",
  slug: "existing-slug",
  description: "A description",
  location: "Grand Hall",
  address: "123 Main St",
  city: "Springfield",
  region: "IL",
  country: "US",
  postal_code: "62701",
  start_date: "2026-09-01",
  end_date: "2026-09-03",
  event_type: "conference" as const,
  status: "draft" as const,
  max_registrations: "500",
  banner_url: "https://example.com/banner.jpg",
  is_external: false,
  external_url: "",
};

/* ------------------------------------------------------------------ */
/*  slugify (tested via component behaviour)                          */
/* ------------------------------------------------------------------ */

describe("slugify (via component)", () => {
  it("auto-generates slug from title when creating a new event", async () => {
    renderForm();
    const titleInput = getInputByLabel("Title");
    const slugInput = getInputByLabel("Slug");

    await userEvent.type(titleInput, "My Great Event");
    expect(slugInput).toHaveValue("my-great-event");
  });

  it("strips special characters and collapses hyphens", async () => {
    renderForm();
    const titleInput = getInputByLabel("Title");
    const slugInput = getInputByLabel("Slug");

    await userEvent.type(titleInput, "Hello!!! World???");
    expect(slugInput).toHaveValue("hello-world");
  });

  it("handles leading and trailing special chars", async () => {
    renderForm();
    const titleInput = getInputByLabel("Title");
    const slugInput = getInputByLabel("Slug");

    await userEvent.type(titleInput, "---Test---");
    expect(slugInput).toHaveValue("test");
  });

  it("does not auto-generate slug when editing an existing event", async () => {
    renderForm({ event: defaultEvent });

    const titleInput = getInputByLabel("Title");
    const slugInput = getInputByLabel("Slug");

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "New Title");

    // Slug should NOT have changed
    expect(slugInput).toHaveValue("existing-slug");
  });
});

/* ------------------------------------------------------------------ */
/*  Rendering defaults                                                */
/* ------------------------------------------------------------------ */

describe("EventForm renders with defaults", () => {
  it("renders the form section headings", () => {
    renderForm();
    expect(screen.getByText("Gathering Details")).toBeInTheDocument();
    expect(screen.getByText("Banner Image")).toBeInTheDocument();
    expect(screen.getByText("Location & Dates")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders title and slug inputs with empty defaults", () => {
    renderForm();
    expect(getInputByLabel("Title")).toHaveValue("");
    expect(getInputByLabel("Slug")).toHaveValue("");
  });

  it("renders date inputs", () => {
    renderForm();
    expect(getInputByLabel("Start Date")).toBeInTheDocument();
    expect(getInputByLabel("End Date")).toBeInTheDocument();
  });

  it("renders the submit button as 'Create Gathering' for new event", () => {
    renderForm();
    expect(screen.getByRole("button", { name: "Create Gathering" })).toBeInTheDocument();
  });

  it("renders the submit button as 'Update Gathering' when editing", () => {
    renderForm({ event: defaultEvent });
    expect(screen.getByRole("button", { name: "Update Gathering" })).toBeInTheDocument();
  });

  it("renders a Cancel button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders location fields", () => {
    renderForm();
    expect(getInputByLabel("Venue / Location")).toBeInTheDocument();
    expect(getInputByLabel("Address")).toBeInTheDocument();
    expect(getInputByLabel("City")).toBeInTheDocument();
    expect(getInputByLabel("Region")).toBeInTheDocument();
    expect(getInputByLabel("Country")).toBeInTheDocument();
    expect(getInputByLabel("Postal Code")).toBeInTheDocument();
  });

  it("renders max registrations input", () => {
    renderForm();
    expect(getInputByLabel("Max Registrations")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Required field validation (HTML required attr)                    */
/* ------------------------------------------------------------------ */

describe("required field attributes", () => {
  it("title input has required attribute", () => {
    renderForm();
    expect(getInputByLabel("Title")).toBeRequired();
  });

  it("slug input has required attribute", () => {
    renderForm();
    expect(getInputByLabel("Slug")).toBeRequired();
  });

  it("start date is not required", () => {
    renderForm();
    expect(getInputByLabel("Start Date")).not.toBeRequired();
  });

  it("end date is not required", () => {
    renderForm();
    expect(getInputByLabel("End Date")).not.toBeRequired();
  });
});

/* ------------------------------------------------------------------ */
/*  Pre-populated values when editing                                 */
/* ------------------------------------------------------------------ */

describe("pre-populated values", () => {
  it("populates title and slug from event prop", () => {
    renderForm({ event: defaultEvent });
    expect(getInputByLabel("Title")).toHaveValue("Existing Event");
    expect(getInputByLabel("Slug")).toHaveValue("existing-slug");
  });

  it("populates location fields from event prop", () => {
    renderForm({ event: defaultEvent });
    expect(getInputByLabel("Venue / Location")).toHaveValue("Grand Hall");
    expect(getInputByLabel("Address")).toHaveValue("123 Main St");
    expect(getInputByLabel("City")).toHaveValue("Springfield");
  });

  it("populates date fields from event prop", () => {
    renderForm({ event: defaultEvent });
    expect(getInputByLabel("Start Date")).toHaveValue("2026-09-01");
    expect(getInputByLabel("End Date")).toHaveValue("2026-09-03");
  });

  it("populates max registrations from event prop", () => {
    renderForm({ event: defaultEvent });
    expect(getInputByLabel("Max Registrations")).toHaveValue(500);
  });
});

/* ------------------------------------------------------------------ */
/*  Form submission                                                   */
/* ------------------------------------------------------------------ */

describe("form submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up the mock chain so insert().select().single() resolves
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValue({
      data: { id: "new-event-id" },
      error: null,
    });
    mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.eq.mockResolvedValue({ data: {}, error: null });
  });

  it("submits a new event with valid data and navigates", async () => {
    renderForm();

    await userEvent.type(getInputByLabel("Title"), "Test Event");
    expect(getInputByLabel("Slug")).toHaveValue("test-event");

    await userEvent.click(screen.getByRole("button", { name: "Create Gathering" }));

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("events");
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("shows error when insert fails", async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error: { message: "Duplicate slug" },
    });

    renderForm();
    await userEvent.type(getInputByLabel("Title"), "Dup Event");

    await userEvent.click(screen.getByRole("button", { name: "Create Gathering" }));

    await waitFor(() => {
      expect(screen.getByText("Duplicate slug")).toBeInTheDocument();
    });
  });

  it("calls update instead of insert when editing", async () => {
    mockSupabaseClient.eq.mockResolvedValue({ data: {}, error: null });

    renderForm({ event: defaultEvent });

    await userEvent.click(screen.getByRole("button", { name: "Update Gathering" }));

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("events");
      expect(mockSupabaseClient.update).toHaveBeenCalled();
    });
  });

  it("navigates to admin events after successful update", async () => {
    mockSupabaseClient.eq.mockResolvedValue({ data: {}, error: null });

    renderForm({ event: defaultEvent });
    await userEvent.click(screen.getByRole("button", { name: "Update Gathering" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/events");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error when update fails", async () => {
    mockSupabaseClient.eq.mockResolvedValue({
      data: null,
      error: { message: "Update failed" },
    });

    renderForm({ event: defaultEvent });
    await userEvent.click(screen.getByRole("button", { name: "Update Gathering" }));

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument();
    });
  });
});

/* ------------------------------------------------------------------ */
/*  Cancel button                                                     */
/* ------------------------------------------------------------------ */

describe("cancel button", () => {
  it("calls router.back() when Cancel is clicked", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockBack).toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  Slug URL preview                                                  */
/* ------------------------------------------------------------------ */

describe("slug URL preview", () => {
  it("shows URL preview with slug value", async () => {
    renderForm();
    await userEvent.type(getInputByLabel("Title"), "Cool Event");
    expect(screen.getByText(/\/register\/cool-event/)).toBeInTheDocument();
  });

  it("shows placeholder when slug is empty", () => {
    renderForm();
    expect(screen.getByText(/\/register\/\.\.\./)).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Event type and status options                                     */
/* ------------------------------------------------------------------ */

describe("event type options", () => {
  // The Select component uses base-ui which renders combobox triggers.
  // We verify the expected type labels are defined in the component
  // by checking the trigger shows the default value.
  it("defaults to conference event type for new event", () => {
    renderForm();
    // base-ui Select renders the raw value in the trigger and a hidden input
    const gatheringSection = screen.getByText("Gathering Details").closest("div")!;
    const hiddenInputs = gatheringSection.querySelectorAll("input[aria-hidden='true']");
    const eventTypeInput = Array.from(hiddenInputs).find(
      (el) => (el as HTMLInputElement).value === "conference"
    );
    expect(eventTypeInput).toBeTruthy();
  });

  it("defaults to draft status for new event", () => {
    renderForm();
    const settingsSection = screen.getByText("Settings").closest("div")!;
    const hiddenInputs = settingsSection.querySelectorAll("input[aria-hidden='true']");
    const statusInput = Array.from(hiddenInputs).find(
      (el) => (el as HTMLInputElement).value === "draft"
    );
    expect(statusInput).toBeTruthy();
  });
});
