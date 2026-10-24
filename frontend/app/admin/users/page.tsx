"use client";

import { useState } from "react";

import {
  Badge,
  Btn,
  Card,
  DataTable,
  Input,
  Note,
  PageHeader,
  Pager,
  QueryState,
  Select,
  type Column,
} from "@/components/admin/ui";

import { useAction, useAsync } from "@/hooks/use-async";
import { getUser as getSessionUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";

import {
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  updateUser,
} from "@/services/admin.service";

import type { AdminUser, AdminUserCreate } from "@/types/admin";
import type { Role } from "@/types/auth";
import Link from "next/link";

const EMPTY_FORM: AdminUserCreate = {
  email: "",
  full_name: "",
  password: "",
  role: "user",
};

export default function UsersPage() {
  const me = getSessionUser();

  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState("");

  const [page, setPage] = useState(1);
  const [showNew, setShowNew] = useState(false);

  const [form, setForm] = useState<AdminUserCreate>(EMPTY_FORM);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const { data, loading, error, reload } = useAsync(
    () =>
      listUsers({
        q: q || undefined,
        role: role ? (role as Role) : undefined,
        is_active:
          active === ""
            ? undefined
            : active === "true",
        page,
        size: 15,
      }),
    [q, role, active, page]
  );

  const { run, note } = useAction(reload);

  const columns: Column<AdminUser>[] = [
    {
      header: "User",
      cell: (user) => (
        <div>
          <div className="font-semibold">
            {user.full_name || "—"}
          </div>

          <div style={{ color: "#6F6A5E" }}>
            {user.email}
          </div>
        </div>
      ),
    },

    {
      header: "Role",
      cell: (user) => (
        <Badge tone={user.role === "admin" ? "ink" : "gray"}>
          {user.role}
        </Badge>
      ),
    },

    {
      header: "Status",
      cell: (user) => (
        <Badge tone={user.is_active ? "green" : "red"}>
          {user.is_active ? "Active" : "Disabled"}
        </Badge>
      ),
    },

    {
      header: "Created",
      cell: (user) => fmtDate(user.created_at),
    },

    {
      header: "Last login",
      cell: (user) => fmtDate(user.last_login_at),
    },

    {
      header: "Actions",
      cell: (user) => {
        const isSelf = user.id === me?.id;

        return (
          <div className="flex flex-wrap gap-1">
            <Btn
              disabled={isSelf}
              onClick={() =>
                void run(
                  () =>
                    updateUser(user.id, {
                      is_active: !user.is_active,
                    }),
                  user.is_active
                    ? "User disabled"
                    : "User enabled"
                )
              }
            >
              {user.is_active ? "Disable" : "Enable"}
            </Btn>

            <Btn
              disabled={isSelf}
              onClick={() =>
                void run(
                  () =>
                    updateUser(user.id, {
                      role:
                        user.role === "admin"
                          ? "user"
                          : "admin",
                    }),
                  user.role === "admin"
                    ? "Role changed to user"
                    : "Role changed to admin"
                )
              }
            >
              {user.role === "admin"
                ? "Make user"
                : "Make admin"}
            </Btn>

            <Btn onClick={() => {
             setResetUser(user);
             setNewPassword("");
            }}>Reset password</Btn>

            <Btn
              tone="danger"
              disabled={isSelf}
              onClick={() => {
                const confirmed = window.confirm(
                  `Delete ${user.email}?\n\nThis action cannot be undone.`
                );

                if (!confirmed) return;

                void run(
                  () => deleteUser(user.id),
                  "User deleted"
                );
              }}
            >
              Delete
            </Btn>
          </div>
        );
      },
    },
  ];

  async function handleCreateUser(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await run(
      () => createUser(form),
      "User created successfully"
    );

    setForm(EMPTY_FORM);
    setShowNew(false);
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
      <Link
      href="/admin/dashboard"
      className="inline-block mb-5 text-[10px] underline underline-offset-4 font-medium transition hover:opacity-60"
      style={{ color: "#6F6A5E" }}
    >
      ← Dashboard
    </Link>
      <PageHeader
        title="Users"
        subtitle="Create and manage platform accounts."
      >
        <Btn
          tone="primary"
          onClick={() =>
            setShowNew((current) => !current)
          }
        >
          {showNew ? "Close" : "+ Add user"}
        </Btn>
      </PageHeader>

      {showNew && (
        <Card title="Create new user">
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={handleCreateUser}
          >
            <Input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
            />

            <Input
              placeholder="Full name"
              value={form.full_name ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  full_name: event.target.value,
                })
              }
            />

            <Input
              required
              minLength={8}
              maxLength={72}
              type="password"
              placeholder="Password (8–72)"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value,
                })
              }
            />

            <Select
              value={form.role ?? "user"}
              onChange={(event) =>
                setForm({
                  ...form,
                  role: event.target.value as Role,
                })
              }
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </Select>

            <Btn tone="primary" type="submit">
              Create
            </Btn>
          </form>
        </Card>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
  <Input
    className="w-full sm:w-[280px]"
    placeholder="Search name or email"
    value={draft}
    onChange={(event) => setDraft(event.target.value)}
    onKeyDown={(event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        setQ(draft);
        setPage(1);
      }
    }}
  />

  <Btn
    onClick={() => {
      setQ(draft);
      setPage(1);
    }}
  >
    Search
  </Btn>

  <Btn
    disabled={!draft}
    onClick={() => {
      setDraft("");
      setQ("");
      setPage(1);
    }}
  >
    Clear
  </Btn>

  <Select
    value={role}
    onChange={(event) => {
      setRole(event.target.value);
      setPage(1);
    }}
  >
    <option value="">All roles</option>
    <option value="user">user</option>
    <option value="admin">admin</option>
  </Select>

  <Select
    value={active}
    onChange={(event) => {
      setActive(event.target.value);
      setPage(1);
    }}
  >
    <option value="">Any status</option>
    <option value="true">Active</option>
    <option value="false">Disabled</option>
  </Select>
</div>

      <Note note={note} />

      <QueryState
        loading={loading}
        error={error}
        onRetry={reload}
        hasData={!!data}
      />

      {data && (
        <>
          <DataTable
            columns={columns}
            rows={data.items}
            empty="No users found."
          />

          <Pager
            page={data.page}
            pages={data.pages}
            total={data.total}
            onPage={setPage}
          />
        </>
      )}
      {resetUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div
      className="w-full max-w-md border bg-white p-5 shadow-xl"
      style={{ borderColor: "#E4E0D5" }}
    >
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold">
          Reset Password
        </h2>

        <p
          className="mt-1 text-[12px]"
          style={{ color: "#6F6A5E" }}
        >
          Set a new password for{" "}
          <span className="font-medium">
            {resetUser.email}
          </span>
        </p>
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (newPassword.length < 8) {
            return;
          }

          await run(
            () =>
              resetUserPassword(
                resetUser.id,
                newPassword
              ),
            "Password updated successfully"
          );

          setResetUser(null);
          setNewPassword("");
        }}
      >
        <label className="mb-1 block text-[12px] font-medium">
          New password
        </label>

        <Input
          autoFocus
          required
          minLength={8}
          maxLength={72}
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(event) =>
            setNewPassword(event.target.value)
          }
          className="w-full"
        />

        <p
          className="mt-1 text-[10px]"
          style={{ color: "#6F6A5E" }}
        >
          Password must be between 8 and 72 characters.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Btn
            type="button"
            onClick={() => {
              setResetUser(null);
              setNewPassword("");
            }}
          >
            Cancel
          </Btn>

          <Btn
            type="submit"
            tone="primary"
            disabled={newPassword.length < 8}
          >
            Reset Password
          </Btn>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}
