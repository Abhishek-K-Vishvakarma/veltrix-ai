"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronRight,
  Globe2,
  KeyRound,
  LockKeyhole,
  LogOut,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";

import { getMe, logout } from "@/services/auth.service";
import {
  changePassword,
  getUserPreferences,
  saveUserPreferences,
  saveUserProfile,
  type UserPreferences,
} from "@/services/settings.service";
import type { AuthUser } from "@/types/auth";
import DashboardBackLink from "@/components/layout/dashboard-back-link";

const defaultPreferences: UserPreferences = {
  theme: "light",
  language: "en",
  analysis_detail: "detailed",
  notifications: {
    analysis_completed: true,
    analysis_failed: true,
    weekly_summary: false,
  },
};

const sections = [
  { id: "profile", label: "Profile", description: "Personal account details", icon: User },
  { id: "appearance", label: "Appearance", description: "Theme and workspace feel", icon: Palette },
  { id: "notifications", label: "Notifications", description: "Your notification preferences", icon: Bell },
  { id: "security", label: "Security", description: "Password and sign-in", icon: ShieldCheck },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getMe(), getUserPreferences()])
      .then(([profile, savedPreferences]) => {
        if (!active) return;
        setUser(profile);
        setFullName(profile.full_name);
        setPreferences(savedPreferences);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load account settings.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function showNotice(message: string) {
    setError(null);
    setNotice(message);
  }

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await saveUserProfile(fullName.trim());
      setUser(updated);
      setFullName(updated.full_name);
      showNotice("Profile information saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePreferences() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await saveUserPreferences(preferences);
      setPreferences(saved);
      window.dispatchEvent(
        new CustomEvent<UserPreferences>("veltrix:preferences-updated", {
          detail: saved,
        }),
      );
      showNotice("Workspace preferences saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save workspace preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showNotice(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setSaving(false);
    }
  }

  function updateNotification(
    key: keyof UserPreferences["notifications"],
    value: boolean,
  ) {
    setPreferences((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: value },
    }));
  }

  function signOut() {
    logout();
    router.replace("/auth/login");
  }

  return (
    <div className="space-y-7">
      <DashboardBackLink />
      <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--primary-soft)] p-6 sm:p-8">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[var(--primary)] opacity-[0.06] blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <span className="signal-dot" />
            <span className="mono text-[9px] uppercase tracking-[0.15em] text-[var(--muted-light)]">
              VELTRIX / SYSTEM / SETTINGS
            </span>
          </div>
          <h1 className="text-4xl tracking-[-0.05em] sm:text-5xl">
            Settings<span className="text-[var(--primary)]">.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Manage your account, personalize the workspace, and update your
            sign-in security.
          </p>
        </div>
      </section>

      {(error || notice) && (
        <div
          role={error ? "alert" : "status"}
          className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${
            error
              ? "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]"
              : "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]"
          }`}
        >
          {error ? <LockKeyhole size={14} /> : <Check size={14} />}
          {error ?? notice}
        </div>
      )}

      <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="card flex gap-2 overflow-x-auto p-2 lg:sticky lg:top-5 lg:flex-col"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            const selected = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSection(section.id);
                  setError(null);
                  setNotice(null);
                }}
                aria-current={selected ? "page" : undefined}
                className={`flex min-w-[170px] flex-1 items-center gap-3 rounded-xl border p-3 text-left transition lg:min-w-0 ${
                  selected
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-transparent hover:border-[var(--line)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-soft)] text-[var(--muted)]"
                  }`}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-[var(--ink)]">
                    {section.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] text-[var(--muted)]">
                    {section.description}
                  </span>
                </span>
                <ChevronRight
                  size={13}
                  className="hidden text-[var(--muted-light)] lg:block"
                />
              </button>
            );
          })}
        </nav>

        <div className="space-y-4">
          {loading ? (
            <section className="card p-8 text-center text-sm text-[var(--muted)]" role="status">
              Loading your account settings…
            </section>
          ) : (
            <>
              {activeSection === "profile" && (
                <section className="card overflow-hidden">
                  <SectionHeader
                    icon={User}
                    title="Profile information"
                    description="Update the name associated with your VELTRIX account."
                    tag={user?.role.toUpperCase() ?? "USER"}
                  />
                  <form onSubmit={handleSaveProfile} className="space-y-5 p-5">
                    <div className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ink)] text-base font-semibold text-[var(--surface)]">
                        {fullName.trim().charAt(0).toUpperCase() || "U"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--ink)]">
                          {fullName || "VELTRIX user"}
                        </p>
                        <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-wider text-[var(--muted-light)]">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-[11px] font-medium text-[var(--ink)]">
                        Full name
                        <input
                          className="input"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          maxLength={120}
                          required
                        />
                      </label>
                      <label className="space-y-2 text-[11px] font-medium text-[var(--ink)]">
                        Email address
                        <input
                          className="input opacity-75"
                          type="email"
                          value={user?.email ?? ""}
                          readOnly
                          aria-describedby="email-note"
                        />
                        <span id="email-note" className="block text-[9px] font-normal text-[var(--muted)]">
                          Email changes are not available yet.
                        </span>
                      </label>
                    </div>
                    <div className="flex justify-end border-t border-[var(--line)] pt-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? "Saving…" : "Save profile"}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {activeSection === "appearance" && (
                <section className="card overflow-hidden">
                  <SectionHeader
                    icon={Palette}
                    title="Appearance & preferences"
                    description="Choose how the VELTRIX workspace looks and how results are presented."
                  />
                  <div className="space-y-5 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ThemeCard
                        selected={preferences.theme === "light"}
                        title="VELTRIX Light"
                        description="A bright, high-contrast workspace."
                        icon={Sun}
                        onClick={() =>
                          setPreferences((current) => ({
                            ...current,
                            theme: "light",
                          }))
                        }
                      />
                      <ThemeCard
                        selected={preferences.theme === "dark"}
                        title="VELTRIX Dark"
                        description="A darker workspace for low-light use."
                        icon={Moon}
                        onClick={() =>
                          setPreferences((current) => ({
                            ...current,
                            theme: "dark",
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-4 border-t border-[var(--line)] pt-5 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--muted)]">
                          <Globe2 size={15} />
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold text-[var(--ink)]">
                            Language
                          </p>
                          <p className="mt-1 text-[9px] text-[var(--muted)]">
                            English · currently available
                          </p>
                        </div>
                      </div>
                      <label className="space-y-2 text-[11px] font-medium text-[var(--ink)]">
                        Default analysis detail
                        <select
                          className="input"
                          value={preferences.analysis_detail}
                          onChange={(event) => {
                            const analysisDetail =
                              event.target.value === "concise"
                                ? "concise"
                                : "detailed";
                            setPreferences((current) => ({
                              ...current,
                              analysis_detail: analysisDetail,
                            }));
                          }}
                        >
                          <option value="concise">Concise</option>
                          <option value="detailed">Detailed</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex justify-end border-t border-[var(--line)] pt-4">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => void handleSavePreferences()}
                        disabled={saving}
                      >
                        {saving ? "Saving…" : "Save preferences"}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === "notifications" && (
                <section className="card overflow-hidden">
                  <SectionHeader
                    icon={Bell}
                    title="Notification preferences"
                    description="Select which events you want enabled in your workspace preferences."
                  />
                  <div className="divide-y divide-[var(--line)]">
                    <NotificationToggle
                      title="Analysis completed"
                      description="When an analysis finishes successfully."
                      checked={preferences.notifications.analysis_completed}
                      onChange={(checked) =>
                        updateNotification("analysis_completed", checked)
                      }
                    />
                    <NotificationToggle
                      title="Analysis needs attention"
                      description="When an analysis fails or needs more evidence."
                      checked={preferences.notifications.analysis_failed}
                      onChange={(checked) =>
                        updateNotification("analysis_failed", checked)
                      }
                    />
                    <NotificationToggle
                      title="Weekly workspace summary"
                      description="A summary preference for weekly activity updates."
                      checked={preferences.notifications.weekly_summary}
                      onChange={(checked) =>
                        updateNotification("weekly_summary", checked)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-lg text-[10px] leading-5 text-[var(--muted)]">
                      These choices are saved to your account. Email and push
                      delivery are not configured in this deployment.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary shrink-0"
                      onClick={() => void handleSavePreferences()}
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Save notifications"}
                    </button>
                  </div>
                </section>
              )}

              {activeSection === "security" && (
                <div className="space-y-4">
                  <section className="card overflow-hidden">
                    <SectionHeader
                      icon={KeyRound}
                      title="Change password"
                      description="Confirm your current password before choosing a new one."
                    />
                    <form onSubmit={handleChangePassword} className="space-y-4 p-5">
                      <label className="block space-y-2 text-[11px] font-medium text-[var(--ink)]">
                        Current password
                        <input
                          className="input"
                          type="password"
                          autoComplete="current-password"
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          required
                        />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-[11px] font-medium text-[var(--ink)]">
                          New password
                          <input
                            className="input"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                          />
                        </label>
                        <label className="space-y-2 text-[11px] font-medium text-[var(--ink)]">
                          Confirm new password
                          <input
                            className="input"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                          />
                        </label>
                      </div>
                      <div className="flex justify-end border-t border-[var(--line)] pt-4">
                        <button className="btn btn-primary" type="submit" disabled={saving}>
                          {saving ? "Updating…" : "Update password"}
                        </button>
                      </div>
                    </form>
                  </section>

                  <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-[var(--primary)]">
                      <LogOut size={16} />
                    </span>
                    <div className="flex-1">
                      <h3 className="text-[12px]">Sign out of this browser</h3>
                      <p className="mt-1 text-[10px] text-[var(--muted)]">
                        Removes this browser’s saved access token.
                      </p>
                    </div>
                    <button type="button" className="btn" onClick={signOut}>
                      Sign out
                    </button>
                  </section>

                  <p className="flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-[10px] leading-5 text-[var(--muted)]">
                    <LockKeyhole size={14} className="mt-0.5 shrink-0 text-[var(--success)]" />
                    Password changes are verified by the API. Existing access
                    tokens expire according to the server’s configured lifetime.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  tag,
}: {
  icon: typeof User;
  title: string;
  description: string;
  tag?: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon size={17} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink)]">{title}</h2>
          <p className="mt-1 text-[10px] text-[var(--muted)]">{description}</p>
        </div>
      </div>
      {tag && <span className="badge badge-primary">{tag}</span>}
    </header>
  );
}

function ThemeCard({
  selected,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: typeof Sun;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-1 ring-[var(--primary)]"
          : "border-[var(--line)] hover:border-[var(--line-strong)]"
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--primary)] shadow-sm">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold text-[var(--ink)]">
          {title}
        </span>
        <span className="mt-1 block text-[9px] text-[var(--muted)]">
          {description}
        </span>
      </span>
      {selected && <Check size={15} className="text-[var(--primary)]" />}
    </button>
  );
}

function NotificationToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[var(--ink)]">{title}</p>
        <p className="mt-1 text-[10px] text-[var(--muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[var(--primary)]" : "bg-[var(--line-strong)]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
