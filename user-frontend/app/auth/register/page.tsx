"use client";

import Link from "next/link";
import { useState } from "react";
import {
ArrowRight,
Check,
Eye,
EyeOff,
LockKeyhole,
Mail,
ShieldCheck,
Sparkles,
User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LoaderCircle, AlertCircle } from "lucide-react";
import { register, getMe } from "@/services/auth.service";
import { authStore } from "@/store/auth-store";
export default function RegisterPage() {
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const router = useRouter();

const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState("");

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (isSubmitting) return;

  setError("");

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await register({
      full_name: fullName.trim(),
      email: email.trim(),
      password,
    });

    if (response.access_token) {
      const user = response.user ?? await getMe();
      authStore.setUser(user);
      router.replace("/");
    } else {
      router.replace("/auth/login?registered=1");
    }
  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : "Registration failed. Please try again.",
    );
  } finally {
    setIsSubmitting(false);
  }
}
return ( <main className="min-h-screen bg-[var(--bg)]"> <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
{/* Left brand panel */} <section className="relative hidden overflow-hidden border-r border-[var(--line)] bg-[var(--ink)] lg:flex"> <div className="absolute inset-0"> <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" /> <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[var(--signal)] opacity-10 blur-3xl" /> </div>

      <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
        <div>
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
        </div>

        <div className="max-w-xl">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[var(--signal)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
              Build your intelligence workspace
            </span>
          </div>

          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white xl:text-6xl">
            Think deeper.
            <br />
            <span className="text-[var(--signal)]">
              Act with evidence.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-6 text-white/55">
            Create your VELTRIX workspace and turn scattered information
            into verified, actionable intelligence.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "Analyze documents and complex information",
              "Build evidence-backed intelligence",
              "Verify findings before taking action",
              "Keep your work organized in one workspace",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-[11px] text-white/65"
              >
                <div className="flex h-5 w-5 items-center justify-center bg-white/10 text-[var(--signal)]">
                  <Check size={11} strokeWidth={2.2} />
                </div>

                {item}
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

    {/* Register panel */}
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
              VELTRIX / CREATE ACCOUNT
            </span>
          </div>

          <h1 className="text-3xl">Create your workspace.</h1>

          <p className="mt-3 text-sm">
            Start building verified intelligence with VELTRIX.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-[11px] font-medium text-[var(--ink)]"
            >
              Full name
            </label>

            <div className="relative">
              <User
                size={15}
                strokeWidth={1.7}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)]"
              />

              <input
                id="name"
                style={{ paddingLeft: "44px" }}
                name="name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={isSubmitting}
                required
                placeholder="Your full name"
                className="input pl-10"
              />
            </div>
          </div>

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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                required
                placeholder="you@example.com"
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[11px] font-medium text-[var(--ink)]"
            >
              Password
            </label>

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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                required
                placeholder="Create a strong password"
                className="input pl-10 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
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

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-[11px] font-medium text-[var(--ink)]"
            >
              Confirm password
            </label>

            <div className="relative">
              <LockKeyhole
                size={15}
                strokeWidth={1.7}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)]"
              />

              <input
                id="confirm-password"
                style={{ paddingLeft: "44px" }}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSubmitting}
                required
                placeholder="Repeat your password"
                className="input pl-10 pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                {showConfirmPassword ? (
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
              required
              className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]"
            />

            <span className="text-[10px] leading-4 text-[var(--muted)]">
              I agree to the VELTRIX terms of service and privacy policy.
            </span>
          </label>
{error && (
  <div
    role="alert"
    className="flex items-start gap-2 border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]"
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
      Creating account...
    </>
  ) : (
    <>
      Create account
      <ArrowRight size={14} strokeWidth={1.8} />
    </>
  )}
</button>
        </form>

        <div className="mt-7 border border-[var(--line)] bg-[var(--surface-soft)] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
              <ShieldCheck size={14} />
            </div>

            <div>
              <div className="text-[10px] font-semibold text-[var(--ink)]">
                Your workspace starts private
              </div>

              <p className="mt-1 text-[9px] leading-4 text-[var(--muted)]">
                Your analyses, documents, projects, and knowledge sources
                belong to your authenticated workspace.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-7 text-center text-[11px] text-[var(--muted)]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
          >
            Sign in
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
