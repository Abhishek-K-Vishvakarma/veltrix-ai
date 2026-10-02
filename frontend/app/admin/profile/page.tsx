"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = getUser();

    if (!currentUser) {
      router.replace("/auth/login");
      return;
    }

    setUser(currentUser);
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4EE] text-[12px]">
        Loading...
      </div>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#F6F4EE",
        color: "#14130F",
      }}
    >
      <div className="mx-auto max-w-[900px] px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div
              className="mb-1 text-[10px] uppercase tracking-[0.14em]"
              style={{ color: "#6F6A5E" }}
            >
              Admin Console
            </div>

            <h1 className="text-[26px] font-semibold tracking-[-0.025em]">
              Profile
            </h1>

            <p
              className="mt-1 text-[13px]"
              style={{ color: "#6F6A5E" }}
            >
              Your VELTRIX account information.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/dashboard")}
            className="h-[30px] border px-3 text-[11px]"
            style={{
              background: "#FFFFFF",
              borderColor: "#E4E0D5",
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* Profile Card */}
        <section
          className="border"
          style={{
            background: "#FFFFFF",
            borderColor: "#E4E0D5",
          }}
        >
          {/* Profile Header */}
          <div
            className="flex items-center gap-4 border-b px-6 py-6"
            style={{ borderColor: "#E4E0D5" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center text-[20px] font-semibold"
              style={{
                background: "#EFEBDF",
                color: "#14130F",
              }}
            >
              {user.full_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-[18px] font-semibold">
                {user.full_name}
              </h2>

              <p
                className="mt-1 text-[11px]"
                style={{ color: "#6F6A5E" }}
              >
                {user.email}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-6">
            <div className="mb-5 text-[13px] font-semibold">
              Account Information
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Full Name"
                value={user.full_name}
              />

              <InfoRow
                label="Email"
                value={user.email}
              />

              <InfoRow
                label="Role"
                value={user.role}
              />

              <InfoRow
                label="Account Status"
                value={user.is_active ? "Active" : "Disabled"}
              />

              <InfoRow
                label="Created"
                value={formatDate(user.created_at)}
              />

              <InfoRow
                label="Last Login"
                value={
                  user.last_login_at
                    ? formatDate(user.last_login_at)
                    : "Not available"
                }
              />
            </div>
          </div>

          {/* Logout */}
          <div
            className="flex justify-end border-t px-6 py-4"
            style={{ borderColor: "#E4E0D5" }}
          >
            <button
              onClick={logout}
              className="h-[30px] border px-4 text-[11px] font-medium"
              style={{
                background: "#FFFFFF",
                color: "#FF4A1C",
                borderColor: "#E4E0D5",
              }}
            >
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="border p-4"
      style={{
        background: "#F6F4EE",
        borderColor: "#E4E0D5",
      }}
    >
      <div
        className="mb-1 text-[9px] uppercase tracking-[0.12em]"
        style={{ color: "#6F6A5E" }}
      >
        {label}
      </div>

      <div className="text-[12px] font-medium">
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}