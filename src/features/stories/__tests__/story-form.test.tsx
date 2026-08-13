import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/shared/test-utils/render";
import { mockSupabaseClient } from "@/shared/test-utils/mocks";
import { StoryForm } from "../story-form";

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

vi.mock("../editor/story-content-editor", () => ({
  StoryContentEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      data-testid="story-content-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("../editor/gallery-editor", () => ({
  GalleryEditor: ({
    images,
    onChange,
  }: {
    images: { url: string; caption?: string }[];
    onChange: (imgs: { url: string; caption?: string }[]) => void;
  }) => <div data-testid="gallery-editor">{images.length} images</div>,
}));

// Stub dnd-kit to avoid JSDOM issues
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
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  sortableKeyboardCoordinates: () => null,
  rectSortingStrategy: {},
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

function getInputByLabel(labelText: string): HTMLInputElement {
  const label = screen.getByText(labelText, {
    selector: "[data-slot='label']",
  });
  const wrapper = label.closest("div")!;
  const input = wrapper.querySelector(
    "input[data-slot='input']"
  ) as HTMLInputElement;
  if (!input) {
    const textarea = wrapper.querySelector(
      "textarea[data-slot='textarea']"
    ) as unknown as HTMLInputElement;
    if (!textarea)
      throw new Error(`No input found for label "${labelText}"`);
    return textarea;
  }
  return input;
}

function renderForm(props: Parameters<typeof StoryForm>[0] = {}) {
  return renderWithProviders(<StoryForm {...props} />);
}

const defaultStory = {
  id: "existing-story-id",
  title: "Existing Story",
  slug: "existing-story",
  description: "A story description",
  author: "Test Author",
  status: "draft" as const,
  published_at: "",
  content_html: "<p>Hello</p>",
  gallery_images: [],
};

/* ------------------------------------------------------------------ */
/*  Step rendering                                                    */
/* ------------------------------------------------------------------ */

describe("StoryForm renders with 3 steps", () => {
  it("renders all three step buttons", () => {
    renderForm();
    // "Story Details" appears both in the step button and the section heading
    expect(screen.getAllByText("Story Details").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Story Content")).toBeInTheDocument();
    expect(screen.getByText("Gallery Images")).toBeInTheDocument();
  });

  it("shows step 1 content by default", () => {
    renderForm();
    // Step 1 heading inside the panel
    const headings = screen.getAllByText("Story Details");
    // One in the step button, one as section heading
    expect(headings.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the submit button as 'Create Story' for new story", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: "Create Story" })
    ).toBeInTheDocument();
  });

  it("renders the submit button as 'Update Story' when editing", () => {
    renderForm({ story: defaultStory });
    expect(
      screen.getByRole("button", { name: "Update Story" })
    ).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Step navigation                                                   */
/* ------------------------------------------------------------------ */

describe("step navigation", () => {
  it("navigates to step 2 when clicking Story Content button", async () => {
    renderForm();
    await userEvent.click(screen.getByText("Story Content"));
    expect(screen.getByTestId("story-content-editor")).toBeInTheDocument();
  });

  it("navigates to step 3 when clicking Gallery Images button", async () => {
    renderForm();
    await userEvent.click(screen.getByText("Gallery Images"));
    expect(screen.getByTestId("gallery-editor")).toBeInTheDocument();
  });

  it("navigates forward via Next button", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("story-content-editor")).toBeInTheDocument();
  });

  it("navigates back via Back button", async () => {
    renderForm();
    // Go to step 2
    await userEvent.click(screen.getByText("Story Content"));
    expect(screen.getByTestId("story-content-editor")).toBeInTheDocument();

    // Go back to step 1
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    const headings = screen.getAllByText("Story Details");
    expect(headings.length).toBeGreaterThanOrEqual(2);
  });

  it("does not show Back button on step 1", () => {
    renderForm();
    expect(
      screen.queryByRole("button", { name: "Back" })
    ).not.toBeInTheDocument();
  });

  it("does not show Next button on step 3", async () => {
    renderForm();
    await userEvent.click(screen.getByText("Gallery Images"));
    expect(
      screen.queryByRole("button", { name: "Next" })
    ).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Title required validation                                         */
/* ------------------------------------------------------------------ */

describe("title required validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error when submitting without title", async () => {
    renderForm();
    await userEvent.click(
      screen.getByRole("button", { name: "Create Story" })
    );
    await waitFor(() => {
      expect(
        screen.getByText("Title and Slug are required. Please complete Step 1.")
      ).toBeInTheDocument();
    });
  });
});

/* ------------------------------------------------------------------ */
/*  Slug auto-generation                                              */
/* ------------------------------------------------------------------ */

describe("slug auto-generation", () => {
  it("auto-generates slug from title when creating a new story", async () => {
    renderForm();
    const titleInput = getInputByLabel("Title");
    const slugInput = getInputByLabel("Slug");

    await userEvent.type(titleInput, "My Great Story");
    expect(slugInput).toHaveValue("my-great-story");
  });

  it("strips special characters and collapses hyphens", async () => {
    renderForm();
    const titleInput = getInputByLabel("Title");
    const slugInput = getInputByLabel("Slug");

    await userEvent.type(titleInput, "Hello!!! World???");
    expect(slugInput).toHaveValue("hello-world");
  });

  it("does not auto-generate slug when editing an existing story", async () => {
    renderForm({ story: defaultStory });
    const titleInput = getInputByLabel("Title");
    const slugInput = getInputByLabel("Slug");

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "New Title");
    expect(slugInput).toHaveValue("existing-story");
  });
});

/* ------------------------------------------------------------------ */
/*  Slug URL preview                                                  */
/* ------------------------------------------------------------------ */

describe("slug URL preview", () => {
  it("shows URL preview with slug value", async () => {
    renderForm();
    await userEvent.type(getInputByLabel("Title"), "Cool Story");
    expect(screen.getByText(/\/stories\/cool-story/)).toBeInTheDocument();
  });

  it("shows placeholder when slug is empty", () => {
    renderForm();
    expect(screen.getByText(/\/stories\/\.\.\./)).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Status toggle                                                     */
/* ------------------------------------------------------------------ */

describe("status toggle", () => {
  it("defaults to draft status for new story", () => {
    renderForm();
    const section = screen.getByText("Settings").closest("div")!;
    const hiddenInputs = section.querySelectorAll(
      "input[aria-hidden='true']"
    );
    const statusInput = Array.from(hiddenInputs).find(
      (el) => (el as HTMLInputElement).value === "draft"
    );
    expect(statusInput).toBeTruthy();
  });
});

/* ------------------------------------------------------------------ */
/*  Pre-populated values when editing                                 */
/* ------------------------------------------------------------------ */

describe("pre-populated values", () => {
  it("populates title and slug from story prop", () => {
    renderForm({ story: defaultStory });
    expect(getInputByLabel("Title")).toHaveValue("Existing Story");
    expect(getInputByLabel("Slug")).toHaveValue("existing-story");
  });

  it("populates description from story prop", () => {
    renderForm({ story: defaultStory });
    const desc = getInputByLabel("Description");
    expect(desc).toHaveValue("A story description");
  });

  it("populates author from story prop", () => {
    renderForm({ story: defaultStory });
    expect(getInputByLabel("Author")).toHaveValue("Test Author");
  });
});

/* ------------------------------------------------------------------ */
/*  Form submission                                                   */
/* ------------------------------------------------------------------ */

describe("form submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValue({
      data: { id: "new-story-id" },
      error: null,
    });
    mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.eq.mockResolvedValue({ data: {}, error: null });
  });

  it("submits a new story with valid data and navigates", async () => {
    renderForm();
    await userEvent.type(getInputByLabel("Title"), "Test Story");
    expect(getInputByLabel("Slug")).toHaveValue("test-story");

    await userEvent.click(
      screen.getByRole("button", { name: "Create Story" })
    );

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("stories");
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/stories/edit/new-story-id");
    });
  });

  it("calls update instead of insert when editing", async () => {
    mockSupabaseClient.eq.mockResolvedValue({ data: {}, error: null });

    renderForm({ story: defaultStory });
    await userEvent.click(
      screen.getByRole("button", { name: "Update Story" })
    );

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("stories");
      expect(mockSupabaseClient.update).toHaveBeenCalled();
    });
  });

  it("navigates to admin stories after successful update", async () => {
    mockSupabaseClient.eq.mockResolvedValue({ data: {}, error: null });

    renderForm({ story: defaultStory });
    await userEvent.click(
      screen.getByRole("button", { name: "Update Story" })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/stories");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error when insert fails", async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error: { message: "Duplicate slug" },
    });

    renderForm();
    await userEvent.type(getInputByLabel("Title"), "Dup Story");
    await userEvent.click(
      screen.getByRole("button", { name: "Create Story" })
    );

    await waitFor(() => {
      expect(screen.getByText("Duplicate slug")).toBeInTheDocument();
    });
  });

  it("shows error when update fails", async () => {
    mockSupabaseClient.eq.mockResolvedValue({
      data: null,
      error: { message: "Update failed" },
    });

    renderForm({ story: defaultStory });
    await userEvent.click(
      screen.getByRole("button", { name: "Update Story" })
    );

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument();
    });
  });

  it("sets published_at automatically when status is published", async () => {
    renderForm();
    await userEvent.type(getInputByLabel("Title"), "Published Story");

    // The status defaults to "draft". We need to test that when the payload
    // has status=published, published_at is set. Since the Select component
    // is hard to interact with in tests, we test via an editing scenario
    // where status is already published.
    const publishedStory = {
      ...defaultStory,
      status: "published" as const,
      published_at: "",
    };
    mockSupabaseClient.eq.mockResolvedValue({ data: {}, error: null });

    const { unmount } = renderWithProviders(
      <StoryForm story={publishedStory} />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Update Story" })
    );

    await waitFor(() => {
      expect(mockSupabaseClient.update).toHaveBeenCalled();
      const updateCall = mockSupabaseClient.update.mock.calls[0][0];
      expect(updateCall.status).toBe("published");
      expect(updateCall.published_at).toBeTruthy();
    });

    unmount();
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
