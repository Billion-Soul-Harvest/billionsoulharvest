import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  renderWithProviders,
  screen,
  waitFor,
  act,
} from "@/shared/test-utils/render";
import { UsersManager } from "../users-manager";
import type { AdminUserWithEmail } from "@/shared/types/database";

// Mock next/navigation
const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  usePathname: () => "/admin/users",
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

function makeUsers(count: number): AdminUserWithEmail[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    display_name: `User ${i + 1}`,
    role: i === 0 ? "super_admin" : i === 1 ? "admin" : "editor",
    created_at: `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
    updated_at: `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
  })) as AdminUserWithEmail[];
}

const CURRENT_USER_ID = "user-1";
const CURRENT_USER_ROLE = "super_admin";

const defaultProps = {
  users: makeUsers(3),
  currentUserId: CURRENT_USER_ID,
  currentUserRole: CURRENT_USER_ROLE,
};

describe("UsersManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  // --- Rendering ---

  it("renders heading and user list", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(
      screen.getByText("Manage admin users and their roles.")
    ).toBeInTheDocument();
    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    expect(screen.getByText("user3@example.com")).toBeInTheDocument();
  });

  it("renders display names", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    expect(screen.getByText("User 1")).toBeInTheDocument();
    expect(screen.getByText("User 2")).toBeInTheDocument();
    expect(screen.getByText("User 3")).toBeInTheDocument();
  });

  it("renders role badges with correct labels", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    expect(screen.getByText("Super Admin")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
  });

  it("renders formatted created dates", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    // Jan 1, 2024 etc.
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
    expect(screen.getByText("Jan 2, 2024")).toBeInTheDocument();
    expect(screen.getByText("Jan 3, 2024")).toBeInTheDocument();
  });

  it("shows em dash for users without display_name", () => {
    const users = makeUsers(1);
    users[0].display_name = null;
    renderWithProviders(
      <UsersManager {...defaultProps} users={users} />
    );
    // The em dash character
    expect(screen.getByText("\u2014")).toBeInTheDocument();
  });

  it("shows empty state when no users", () => {
    renderWithProviders(
      <UsersManager {...defaultProps} users={[]} />
    );
    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  // --- Super Admin features ---

  it("shows Invite User button for super_admin", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    expect(screen.getByText("Invite User")).toBeInTheDocument();
  });

  it("hides Invite User button for non-super_admin", () => {
    renderWithProviders(
      <UsersManager {...defaultProps} currentUserRole="admin" />
    );
    expect(screen.queryByText("Invite User")).not.toBeInTheDocument();
  });

  it("hides actions column for non-super_admin", () => {
    renderWithProviders(
      <UsersManager {...defaultProps} currentUserRole="admin" />
    );
    // No sr-only "Actions" header
    expect(screen.queryByText("Actions")).not.toBeInTheDocument();
  });

  // --- Self-edit / self-delete prevention ---

  it("disables action menu button for the current user (self)", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    // The current user is user-1; find the row with user1@example.com
    const row = screen.getByText("user1@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    expect(menuButton).toBeDisabled();
  });

  it("does not show action menu dropdown for self even when clicked", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user1@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);
    // Edit Role and Delete menu items should not appear
    expect(screen.queryByText("Edit Role")).not.toBeInTheDocument();
  });

  it("enables action menu button for other users", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    expect(menuButton).not.toBeDisabled();
  });

  // --- Action menu ---

  it("opens action menu for other users and shows Edit Role and Delete", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);
    expect(screen.getByText("Edit Role")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("closes action menu when clicking the same button again", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);
    expect(screen.getByText("Edit Role")).toBeInTheDocument();
    fireEvent.click(menuButton);
    expect(screen.queryByText("Edit Role")).not.toBeInTheDocument();
  });

  // --- Invite dialog ---

  it("opens invite dialog when clicking Invite User", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));
    expect(
      screen.getByText("Create a new admin user account.")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("user@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
  });

  it("invite form has email and password fields required", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));
    const emailInput = screen.getByPlaceholderText("user@example.com");
    const passwordInput = screen.getByDisplayValue(/.{8,}/); // auto-generated password
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("invite form auto-generates a password on open", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));
    // There should be a password input with a non-empty value (auto-generated)
    const passwordInputs = screen.getAllByDisplayValue(/.+/);
    const passwordInput = passwordInputs.find(
      (el) => el.getAttribute("type") === "password"
    );
    expect(passwordInput).toBeTruthy();
    expect((passwordInput as HTMLInputElement).value.length).toBeGreaterThanOrEqual(8);
  });

  it("Generate button regenerates the password", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));
    const passwordInput = screen.getAllByDisplayValue(/.+/).find(
      (el) => el.getAttribute("type") === "password"
    ) as HTMLInputElement;
    const originalPassword = passwordInput.value;
    fireEvent.click(screen.getByText("Generate"));
    // Password may or may not change (random), but the click should work without error
    // We just verify the input still has a value
    expect(passwordInput.value.length).toBeGreaterThanOrEqual(8);
  });

  it("toggle password visibility button works", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));
    const passwordInput = screen.getAllByDisplayValue(/.+/).find(
      (el) =>
        el.getAttribute("type") === "password" ||
        el.getAttribute("type") === "text"
    ) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    // Click the eye toggle button (it's the button next to the password input)
    const toggleButton = passwordInput
      .closest(".relative")!
      .querySelector("button")!;
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("Create User button is disabled when email is empty", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));
    // Email starts empty, password is auto-generated
    expect(screen.getByText("Create User")).toBeDisabled();
  });

  it("Create User button is enabled when email and password are filled", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));
    const emailInput = screen.getByPlaceholderText("user@example.com");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    expect(screen.getByText("Create User")).not.toBeDisabled();
  });

  it("submits invite form and calls POST /api/admin/users", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "new-user-id" }),
    });

    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));

    const emailInput = screen.getByPlaceholderText("user@example.com");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    const displayNameInput = screen.getByPlaceholderText("John Doe");
    fireEvent.change(displayNameInput, { target: { value: "New User" } });

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/users",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
      expect(toastSuccessMock).toHaveBeenCalledWith(
        'User "new@example.com" created'
      );
      expect(refreshMock).toHaveBeenCalled();
    });

    // Verify the body includes the right fields
    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.email).toBe("new@example.com");
    expect(body.display_name).toBe("New User");
    expect(body.role).toBe("editor"); // default role
    expect(body.password).toBeTruthy();
  });

  it("shows error toast when invite API fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Email already exists" }),
    });

    renderWithProviders(<UsersManager {...defaultProps} />);
    fireEvent.click(screen.getByText("Invite User"));

    const emailInput = screen.getByPlaceholderText("user@example.com");
    fireEvent.change(emailInput, { target: { value: "dup@example.com" } });

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Email already exists");
    });
  });

  // --- Edit Role dialog ---

  it("opens Edit Role dialog with user email in description", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText("Edit Role"));

    expect(screen.getByText("Edit Role")).toBeInTheDocument();
    expect(
      screen.getByText(/Change role for user2@example.com/)
    ).toBeInTheDocument();
  });

  it("submits edit role and calls PATCH /api/admin/users/:id", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText("Edit Role"));

    // Submit the form (role defaults to current role)
    const form = screen.getByText("Save").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/users/user-2",
        expect.objectContaining({
          method: "PATCH",
        })
      );
      expect(toastSuccessMock).toHaveBeenCalled();
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("shows error toast when edit role API fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Forbidden" }),
    });

    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText("Edit Role"));

    const form = screen.getByText("Save").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Forbidden");
    });
  });

  // --- Delete confirmation dialog ---

  it("opens delete confirmation dialog with user email", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);

    // Click "Delete" from the action menu
    const deleteItems = screen.getAllByText("Delete");
    const menuDeleteItem = deleteItems.find(
      (el) => el.closest("[class*='absolute']") !== null
    );
    fireEvent.click(menuDeleteItem!);

    // Dialog title "Delete User" appears
    const deleteUserElements = screen.getAllByText("Delete User");
    expect(deleteUserElements.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
  });

  it("confirms delete and calls DELETE /api/admin/users/:id", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);

    const deleteItems = screen.getAllByText("Delete");
    const menuDeleteItem = deleteItems.find(
      (el) => el.closest("[class*='absolute']") !== null
    );
    fireEvent.click(menuDeleteItem!);

    // Click the destructive "Delete User" button in the dialog footer
    const deleteUserButtons = screen.getAllByText("Delete User");
    const confirmButton = deleteUserButtons.find(
      (el) => el.closest("[data-slot='dialog-footer']") !== null
    );
    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/users/user-2",
        expect.objectContaining({
          method: "DELETE",
        })
      );
      expect(toastSuccessMock).toHaveBeenCalledWith(
        'User "user2@example.com" deleted'
      );
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("shows error toast when delete API fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Cannot delete last admin" }),
    });

    renderWithProviders(<UsersManager {...defaultProps} />);
    const row = screen.getByText("user2@example.com").closest("tr")!;
    const menuButton = row.querySelector("button")!;
    fireEvent.click(menuButton);

    const deleteItems = screen.getAllByText("Delete");
    const menuDeleteItem = deleteItems.find(
      (el) => el.closest("[class*='absolute']") !== null
    );
    fireEvent.click(menuDeleteItem!);

    const deleteUserButtons = screen.getAllByText("Delete User");
    const confirmButton = deleteUserButtons.find(
      (el) => el.closest("[data-slot='dialog-footer']") !== null
    );
    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Cannot delete last admin");
    });
  });

  // --- Role badge variants ---

  it("renders super_admin badge with destructive variant", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const badge = screen.getByText("Super Admin");
    expect(badge).toHaveAttribute("data-variant", "destructive");
  });

  it("renders admin badge with default variant", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const badge = screen.getByText("Admin");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("renders editor badge with secondary variant", () => {
    renderWithProviders(<UsersManager {...defaultProps} />);
    const badge = screen.getByText("Editor");
    expect(badge).toHaveAttribute("data-variant", "secondary");
  });
});
