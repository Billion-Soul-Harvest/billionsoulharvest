import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  mockSupabaseClient,
  mockSupabaseResponse,
} from "@/shared/test-utils/mocks";
import {
  renderWithProviders,
  screen,
  waitFor,
  act,
} from "@/shared/test-utils/render";
import { TagsManager } from "../tags-manager";

// Mock next/navigation
const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  usePathname: () => "/admin/tags",
}));

// Mock sonner toast
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

function makeTags(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `tag-${i + 1}`,
    name: `Tag ${i + 1}`,
    created_at: `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
    contact_count: (i + 1) * 10,
  }));
}

const defaultProps = {
  tags: makeTags(3),
  totalCount: 3,
  page: 1,
  pageSize: 25,
  search: "",
  sort: "created_at" as const,
  dir: "desc" as const,
};

describe("TagsManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chainable mock so single() resolves properly
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockImplementation(() =>
      Promise.resolve({
        data: { id: "new-id", name: "Test", created_at: "2024-01-01" },
        error: null,
      })
    );
    mockSupabaseClient.rpc.mockImplementation(() =>
      Promise.resolve({ data: null, error: null })
    );
  });

  // --- Rendering ---

  it("renders heading and tag list", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    expect(screen.getByText("Manage tags")).toBeInTheDocument();
    expect(screen.getByText("Tag 1")).toBeInTheDocument();
    expect(screen.getByText("Tag 2")).toBeInTheDocument();
    expect(screen.getByText("Tag 3")).toBeInTheDocument();
  });

  it("renders total count badge", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders contact counts", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("shows empty state when no tags and no search", () => {
    renderWithProviders(
      <TagsManager {...defaultProps} tags={[]} totalCount={0} />
    );
    expect(
      screen.getByText("No tags yet. Create one to get started.")
    ).toBeInTheDocument();
  });

  it("shows search empty state when no tags with search", () => {
    renderWithProviders(
      <TagsManager {...defaultProps} tags={[]} totalCount={0} search="xyz" />
    );
    expect(
      screen.getByText("No tags match your search.")
    ).toBeInTheDocument();
  });

  // --- Sorting ---

  it("renders ascending sort indicator for the active column", () => {
    renderWithProviders(
      <TagsManager {...defaultProps} sort="name" dir="asc" />
    );
    const nameHeader = screen.getByText(/Name/);
    expect(nameHeader.textContent).toContain("\u2191");
  });

  it("renders descending sort indicator", () => {
    renderWithProviders(
      <TagsManager {...defaultProps} sort="contact_count" dir="desc" />
    );
    const contactsHeader = screen.getByText(/Contacts/);
    expect(contactsHeader.textContent).toContain("\u2193");
  });

  it("does not show sort indicator on inactive columns", () => {
    renderWithProviders(
      <TagsManager {...defaultProps} sort="name" dir="asc" />
    );
    const contactsHeader = screen.getByText("Contacts");
    expect(contactsHeader.textContent).not.toContain("\u2191");
    expect(contactsHeader.textContent).not.toContain("\u2193");
  });

  it("clicking a column header navigates with sort params", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Name"));
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("sort=name")
    );
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("dir=asc")
    );
  });

  it("clicking the active sort column toggles direction", () => {
    renderWithProviders(
      <TagsManager {...defaultProps} sort="name" dir="asc" />
    );
    fireEvent.click(screen.getByText(/Name/));
    // dir=desc is the default value, so the navigate function strips it from the URL
    const call = pushMock.mock.calls[0][0] as string;
    expect(call).toContain("sort=name");
    // dir=desc is default and gets stripped, so verify it is not "asc"
    expect(call).not.toContain("dir=asc");
  });

  // --- Pagination ---

  it("shows pagination info", () => {
    renderWithProviders(
      <TagsManager
        {...defaultProps}
        totalCount={50}
        page={1}
        pageSize={25}
      />
    );
    expect(screen.getByText(/1–25 of 50/)).toBeInTheDocument();
  });

  it("disables First and Prev buttons on page 1", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    expect(screen.getByText("First")).toBeDisabled();
    expect(screen.getByText("Prev")).toBeDisabled();
  });

  it("disables Next and Last buttons on last page", () => {
    renderWithProviders(
      <TagsManager
        {...defaultProps}
        totalCount={3}
        page={1}
        pageSize={25}
      />
    );
    expect(screen.getByText("Next")).toBeDisabled();
    expect(screen.getByText("Last")).toBeDisabled();
  });

  it("enables Next and Last when more pages exist", () => {
    renderWithProviders(
      <TagsManager
        {...defaultProps}
        totalCount={50}
        page={1}
        pageSize={25}
      />
    );
    expect(screen.getByText("Next")).not.toBeDisabled();
    expect(screen.getByText("Last")).not.toBeDisabled();
  });

  it("navigates to next page", () => {
    renderWithProviders(
      <TagsManager
        {...defaultProps}
        totalCount={50}
        page={1}
        pageSize={25}
      />
    );
    fireEvent.click(screen.getByText("Next"));
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("page=2")
    );
  });

  it("shows page indicator text", () => {
    renderWithProviders(
      <TagsManager
        {...defaultProps}
        totalCount={50}
        page={2}
        pageSize={25}
      />
    );
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  // --- Search (debounced) ---

  it("renders search input with initial value", () => {
    renderWithProviders(
      <TagsManager {...defaultProps} search="existing" />
    );
    const searchInput = screen.getByPlaceholderText("Search by tag name");
    expect(searchInput).toHaveValue("existing");
  });

  it("navigates with search after debounce", async () => {
    vi.useFakeTimers();
    renderWithProviders(<TagsManager {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText("Search by tag name");

    fireEvent.change(searchInput, { target: { value: "test" } });

    // Before debounce fires, no navigation yet
    expect(pushMock).not.toHaveBeenCalled();

    // Advance past 300ms debounce
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("search=test")
    );
    vi.useRealTimers();
  });

  it("debounce resets on rapid input changes", () => {
    vi.useFakeTimers();
    renderWithProviders(<TagsManager {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText("Search by tag name");

    fireEvent.change(searchInput, { target: { value: "te" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Not yet
    expect(pushMock).not.toHaveBeenCalled();

    fireEvent.change(searchInput, { target: { value: "test" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Still not yet (only 100ms since last change)
    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    // Now 350ms since last change
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("search=test")
    );
    vi.useRealTimers();
  });

  // --- Select / Deselect ---

  it("selects and deselects individual tags via checkbox", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    const tag1Checkbox = checkboxes[1];

    fireEvent.click(tag1Checkbox);
    expect(tag1Checkbox).toBeChecked();

    fireEvent.click(tag1Checkbox);
    expect(tag1Checkbox).not.toBeChecked();
  });

  it("select-all checks all tags on the page", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    const selectAll = checkboxes[0];

    fireEvent.click(selectAll);
    for (let i = 1; i < checkboxes.length; i++) {
      expect(checkboxes[i]).toBeChecked();
    }
  });

  it("deselect-all unchecks all tags", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    const selectAll = checkboxes[0];

    fireEvent.click(selectAll); // select all
    fireEvent.click(selectAll); // deselect all

    for (let i = 1; i < checkboxes.length; i++) {
      expect(checkboxes[i]).not.toBeChecked();
    }
  });

  it("shows bulk delete button when tags are selected", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    expect(screen.getByText(/Delete selected/)).toBeInTheDocument();
  });

  it("hides bulk delete button when no tags are selected", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    expect(screen.queryByText(/Delete selected/)).not.toBeInTheDocument();
  });

  // --- Create tag flow ---

  it("opens create dialog when clicking Create new tag button", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Create new tag"));
    expect(screen.getByText("Create tag")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter tag name")
    ).toBeInTheDocument();
  });

  it("create submit button is disabled when tag name is empty", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Create new tag"));
    const createButtons = screen.getAllByText("Create");
    const submitButton = createButtons.find(
      (btn) => btn.closest("form") !== null
    );
    expect(submitButton).toBeDisabled();
  });

  it("creates a tag successfully", async () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Create new tag"));

    const input = screen.getByPlaceholderText("Enter tag name");
    fireEvent.change(input, { target: { value: "NewTag" } });

    // Submit via form submission
    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("tags");
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        name: "NewTag",
      });
      expect(toastSuccessMock).toHaveBeenCalledWith('Tag "NewTag" created');
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("shows error toast when create fails (duplicate detection)", async () => {
    mockSupabaseClient.single.mockImplementation(() =>
      Promise.resolve({
        data: null,
        error: { message: "duplicate key" },
      })
    );
    renderWithProviders(<TagsManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Create new tag"));

    const input = screen.getByPlaceholderText("Enter tag name");
    fireEvent.change(input, { target: { value: "Tag 1" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("duplicate key");
    });
  });

  it("disables create button with whitespace-only name", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Create new tag"));

    const input = screen.getByPlaceholderText("Enter tag name");
    fireEvent.change(input, { target: { value: "   " } });

    const createButtons = screen.getAllByText("Create");
    const submitButton = createButtons.find(
      (btn) => btn.closest("form") !== null
    );
    expect(submitButton).toBeDisabled();
  });

  // --- Rename tag flow ---

  it("opens rename dialog via action menu", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.closest("td") !== null);
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByText("Rename"));

    expect(screen.getByText("Rename tag")).toBeInTheDocument();
  });

  it("pre-fills rename input with current tag name", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.closest("td") !== null);
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByText("Rename"));

    expect(screen.getByDisplayValue("Tag 1")).toBeInTheDocument();
  });

  it("renames a tag successfully", async () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.closest("td") !== null);
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByText("Rename"));

    const input = screen.getByDisplayValue("Tag 1");
    fireEvent.change(input, { target: { value: "Renamed Tag" } });

    // Submit via form
    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith("rename_tag", {
        p_old: "Tag 1",
        p_new: "Renamed Tag",
      });
      expect(toastSuccessMock).toHaveBeenCalledWith(
        'Tag renamed to "Renamed Tag"'
      );
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("does not rename if new name matches old name", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.closest("td") !== null);
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByText("Rename"));

    // Submit without changing the value
    const input = screen.getByDisplayValue("Tag 1");
    const form = input.closest("form")!;
    fireEvent.submit(form);

    // rpc should NOT have been called since name is unchanged
    expect(mockSupabaseClient.rpc).not.toHaveBeenCalled();
  });

  // --- Delete tag flow ---

  it("opens delete confirmation dialog via action menu", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.closest("td") !== null);
    fireEvent.click(menuButtons[0]);

    const deleteMenuItems = screen.getAllByText("Delete");
    const deleteMenuItem = deleteMenuItems.find(
      (el) => el.closest("[class*='absolute']") !== null
    );
    fireEvent.click(deleteMenuItem!);

    expect(
      screen.getByText(/This will remove the tag from/)
    ).toBeInTheDocument();
  });

  it("shows contact count in delete confirmation dialog", () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.closest("td") !== null);
    fireEvent.click(menuButtons[0]);

    const deleteMenuItems = screen.getAllByText("Delete");
    const deleteMenuItem = deleteMenuItems.find(
      (el) => el.closest("[class*='absolute']") !== null
    );
    fireEvent.click(deleteMenuItem!);

    // Tag 1 has contact_count of 10
    expect(
      screen.getByText(/This will remove the tag from 10 contacts/)
    ).toBeInTheDocument();
  });

  it("deletes a tag successfully", async () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.closest("td") !== null);
    fireEvent.click(menuButtons[0]);

    const deleteMenuItems = screen.getAllByText("Delete");
    const deleteMenuItem = deleteMenuItems.find(
      (el) => el.closest("[class*='absolute']") !== null
    );
    fireEvent.click(deleteMenuItem!);

    // Find the destructive Delete button in the dialog footer
    const dialogDeleteButtons = screen.getAllByText("Delete");
    const confirmButton = dialogDeleteButtons.find(
      (el) => el.closest("[data-slot='dialog-footer']") !== null
    );
    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    await waitFor(() => {
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith("delete_tag", {
        p_name: "Tag 1",
      });
      expect(toastSuccessMock).toHaveBeenCalledWith('Tag "Tag 1" deleted');
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  // --- Bulk delete ---

  it("opens bulk delete dialog and confirms deletion", async () => {
    renderWithProviders(<TagsManager {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    fireEvent.click(screen.getByText(/Delete selected/));

    expect(
      screen.getByText(/This will remove the selected tags/)
    ).toBeInTheDocument();

    const dialogDeleteButtons = screen.getAllByText("Delete");
    const confirmButton = dialogDeleteButtons.find(
      (el) => el.closest("[data-slot='dialog-footer']") !== null
    );
    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    await waitFor(() => {
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith("delete_tags", {
        p_names: ["Tag 1", "Tag 2"],
      });
      expect(toastSuccessMock).toHaveBeenCalledWith("2 tag(s) deleted");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  // --- Navigation helper strips default values ---

  it("omits default params from URL", () => {
    renderWithProviders(
      <TagsManager
        {...defaultProps}
        sort="name"
        dir="asc"
        page={2}
        pageSize={50}
      />
    );
    fireEvent.click(screen.getByText("First"));
    const call = pushMock.mock.calls[0][0] as string;
    expect(call).toContain("sort=name");
    expect(call).toContain("dir=asc");
    expect(call).toContain("pageSize=50");
    // page=1 is default and gets omitted
    expect(call).not.toContain("page=");
  });

  it("navigates to clean path when all params are defaults", () => {
    renderWithProviders(
      <TagsManager
        {...defaultProps}
        sort="created_at"
        dir="desc"
        page={1}
        pageSize={25}
      />
    );
    fireEvent.click(screen.getByText(/Date created/));
    const call = pushMock.mock.calls[0][0] as string;
    // sort=created_at is default so stripped, dir=asc is not default so stays
    expect(call).toContain("dir=asc");
  });
});
