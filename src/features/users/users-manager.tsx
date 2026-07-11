"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, MoreVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { AdminUserWithEmail, AdminRole } from "@/shared/types/database";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function roleBadgeVariant(role: string) {
  switch (role) {
    case "super_admin":
      return "destructive" as const;
    case "admin":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

function roleLabel(role: string) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "editor":
      return "Editor";
    default:
      return role;
  }
}

function generatePassword(length = 16) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

interface UsersManagerProps {
  users: AdminUserWithEmail[];
  currentUserId: string;
  currentUserRole: string;
}

export function UsersManager({
  users,
  currentUserId,
  currentUserRole,
}: UsersManagerProps) {
  const router = useRouter();
  const isSuperAdmin = currentUserRole === "super_admin";

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDisplayName, setInviteDisplayName] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("editor");
  const [invitePassword, setInvitePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Edit role dialog
  const [editUser, setEditUser] = useState<AdminUserWithEmail | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>("editor");

  // Delete dialog
  const [deleteUser, setDeleteUser] = useState<AdminUserWithEmail | null>(null);

  function openInviteDialog() {
    setInviteEmail("");
    setInviteDisplayName("");
    setInviteRole("editor");
    setInvitePassword(generatePassword());
    setShowPassword(false);
    setInviteOpen(true);
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !invitePassword.trim()) return;
    setSaving(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail.trim(),
        password: invitePassword,
        display_name: inviteDisplayName.trim(),
        role: inviteRole,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to create user");
      setSaving(false);
      return;
    }

    setInviteOpen(false);
    setSaving(false);
    toast.success(`User "${inviteEmail.trim()}" created`);
    router.refresh();
  }

  async function handleEditRole() {
    if (!editUser) return;
    setSaving(true);

    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editRole }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to update role");
      setSaving(false);
      return;
    }

    setEditUser(null);
    setSaving(false);
    toast.success(`Role updated to "${roleLabel(editRole)}"`);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteUser) return;
    setSaving(true);

    const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to delete user");
      setSaving(false);
      return;
    }

    setDeleteUser(null);
    setSaving(false);
    toast.success(`User "${deleteUser.email}" deleted`);
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage admin users and their roles.
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={openInviteDialog}>
            <Plus data-icon="inline-start" />
            Invite User
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Display Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Created
              </th>
              {isSuperAdmin && (
                <th className="px-3 py-3 w-10">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-900">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {u.display_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleBadgeVariant(u.role)}>
                      {roleLabel(u.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(u.created_at)}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-3 py-3 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === u.id ? null : u.id);
                        }}
                        disabled={isSelf}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <MoreVertical className="size-5" />
                      </button>
                      {menuOpen === u.id && !isSelf && (
                        <div
                          className="absolute right-4 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[150px]"
                          onClick={() => setMenuOpen(null)}
                        >
                          <button
                            onClick={() => {
                              setEditRole(u.role as AdminRole);
                              setEditUser(u);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Pencil className="size-4" />
                            Edit Role
                          </button>
                          <button
                            onClick={() => setDeleteUser(u)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={isSuperAdmin ? 5 : 4}
                  className="text-center py-12 text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Create a new admin user account.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInvite();
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInviteEmail(e.target.value)
                }
                required
                placeholder="user@example.com"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Display Name
              </label>
              <Input
                value={inviteDisplayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInviteDisplayName(e.target.value)
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as AdminRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-0.5"
                  onClick={() =>
                    setInvitePassword(generatePassword())
                  }
                >
                  Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={invitePassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInvitePassword(e.target.value)
                  }
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                type="submit"
                disabled={saving || !inviteEmail.trim() || !invitePassword.trim()}
              >
                {saving ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog
        open={editUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Change role for {editUser?.email}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditRole();
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as AdminRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteUser?.email}</strong>? This will permanently remove
              their account and they will no longer be able to log in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
