"use client";
import { markWelcomePending } from "@/lib/welcome";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { login } from "@/services/auth.service";
import { authStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
       const response = await login({
    email: email.trim(),
    password,
  });

  let user = response.user ?? null;

  if (!user) {
    user = await (
      await import("@/services/auth.service")
    ).getMe();
  }

  // Admin ko user portal access nahi milega
  if (user.role?.toLowerCase() === "admin") {
    authStore.clearUser();
    setError("Admin accounts cannot access the user portal.");
    return;
  }

  authStore.setUser(user);
     markWelcomePending();
      router.replace("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left brand panel */}
        <section className="relative hidden overflow-hidden border-r border-[var(--line)] bg-[var(--ink)] lg:flex">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          >
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />
            <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[var(--signal)] opacity-10 blur-3xl" />
          </div>

          <svg
            aria-hidden="true"
            viewBox="0 0 360 360"
            fill="none"
            className="pointer-events-none absolute right-[-80px] top-1/2 hidden h-[340px] w-[340px] -translate-y-1/2 opacity-25 xl:block"
          >
            <circle cx="180" cy="180" r="142" stroke="white" strokeOpacity=".08" />
            <circle cx="180" cy="180" r="98" stroke="white" strokeOpacity=".1" />
            <circle cx="180" cy="180" r="52" stroke="white" strokeOpacity=".12" />
            <path
              d="M75 228 126 181 174 206 227 126 286 153"
              stroke="url(#signal-line)"
              strokeWidth="1.5"
            />
            <path
              d="m126 181 13-40m35 65 43 47m10-121 28-36"
              stroke="white"
              strokeOpacity=".2"
              strokeDasharray="3 6"
            />
            <circle cx="75" cy="228" r="5" fill="#ff4a1c" />
            <circle cx="126" cy="181" r="5" fill="#3153ff" />
            <circle cx="174" cy="206" r="6" fill="#ff4a1c" />
            <circle cx="227" cy="126" r="5" fill="#3153ff" />
            <circle cx="286" cy="153" r="4" fill="white" fillOpacity=".8" />
            <circle cx="139" cy="141" r="3" fill="white" fillOpacity=".65" />
            <circle cx="217" cy="253" r="3" fill="white" fillOpacity=".65" />
            <defs>
              <linearGradient
                id="signal-line"
                x1="75"
                y1="228"
                x2="286"
                y2="126"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#ff4a1c" />
                <stop offset="1" stopColor="#3153ff" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-[var(--primary)] text-white">
                <Sparkles size={17} strokeWidth={2} />
              </div>

              <div>
                <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                  VELTRIX
                </div>
                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/40">
                  Intelligence
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[var(--signal)]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                  Evidence-driven intelligence
                </span>
              </div>

              <h1
                className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] xl:text-6xl"
                style={{ color: "var(--signal)" }}
              >
                Verified action out.
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-6 text-white/55">
                VELTRIX helps you investigate information, reason through
                evidence, verify findings, and turn complex data into
                actionable intelligence.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-4 border border-white/10">
                {[
                  ["01", "Observe"],
                  ["02", "Reason"],
                  ["03", "Verify"],
                  ["04", "Act"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="border-r border-white/10 p-3 last:border-r-0"
                  >
                    <div className="font-mono text-[8px] text-white/30">
                      {number}
                    </div>
                    <div className="mt-5 text-[10px] font-medium text-white/70">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/30">
              <ShieldCheck size={13} strokeWidth={1.7} />
              <span className="font-mono text-[8px] uppercase tracking-[0.1em]">
                Secure intelligence workspace
              </span>
            </div>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-[var(--primary)] text-white">
                  <Sparkles size={17} strokeWidth={2} />
                </div>

                <div>
                  <div className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                    VELTRIX
                  </div>
                  <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--muted-light)]">
                    Intelligence
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="signal-dot" />
                <span className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-light)]">
                  VELTRIX / AUTHENTICATION
                </span>
              </div>

              <h1 className="text-3xl">Welcome back.</h1>
              <p className="mt-3 text-sm">
                Sign in to continue to your intelligence workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-medium text-[var(--ink)]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={15}
                    strokeWidth={1.7}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)]"
                  />

                  <input
                    id="email"
                    style={{ paddingLeft: "44px" }}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-medium text-[var(--ink)]"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={15}
                    strokeWidth={1.7}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)]"
                  />

                  <input
                    id="password"
                    style={{ paddingLeft: "44px" }}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="input pl-10 pr-10"
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[var(--muted)] transition hover:text-[var(--ink)]"
                  >
                    {showPassword ? (
                      <EyeOff size={15} strokeWidth={1.7} />
                    ) : (
                      <Eye size={15} strokeWidth={1.7} />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(event) => setKeepSignedIn(event.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]"
                />

                <span className="text-[10px] leading-4 text-[var(--muted)]">
                  Keep me signed in on this device.
                </span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary h-11 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={14} strokeWidth={1.8} />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--line)]" />
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--muted-light)]">
                OR
              </span>
              <div className="h-px flex-1 bg-[var(--line)]" />
            </div>

            <div className="border border-[var(--line)] bg-[var(--surface-soft)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
                  <ShieldCheck size={14} />
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-[var(--ink)]">
                    Protected workspace
                  </div>

                  <p className="mt-1 text-[9px] leading-4 text-[var(--muted)]">
                    Your authentication and intelligence data will be secured
                    through the VELTRIX backend.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-7 text-center text-[11px] text-[var(--muted)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
              >
                Create one
              </Link>
            </p>

            <div className="mt-8 text-center">
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--muted-light)]">
                VELTRIX AI · INTELLIGENCE SYSTEM
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}