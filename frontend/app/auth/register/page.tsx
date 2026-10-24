"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth.service";
import { ROUTES } from "@/lib/routes";
import { USER_APP_URL } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    await register({
      name,
      email,
      password,
    });

    router.replace(`${USER_APP_URL}/auth/login`);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center"
              style={{ background: "#14130F" }}
            >
              <span
                className="text-[21px] font-bold"
                style={{ color: "#F6F4EE" }}
              >
                V
              </span>
            </div>

            <div>
              <div className="text-[15px] font-bold tracking-[0.12em]">
                VELTRIX
              </div>

              <div
                className="mt-[2px] text-[8px] uppercase tracking-[0.12em]"
                style={{ color: "#6F6A5E" }}
              >
                Intelligence System
              </div>
            </div>
          </div>

          <div
            className="mb-2 text-[10px] uppercase tracking-[0.14em]"
            style={{ color: "#6F6A5E" }}
          >
            Admin Access
          </div>

          <h1 className="text-[26px] font-semibold tracking-[-0.025em]">
            Create your account.
          </h1>

          <p
            className="mt-1 text-[13px]"
            style={{ color: "#6F6A5E" }}
          >
            Start investigating with VELTRIX.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border bg-white p-5"
          style={{ borderColor: "#E4E0D5" }}
        >
          <div className="mb-4">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em]">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="h-10 w-full border px-3 text-[12px] outline-none"
              style={{ borderColor: "#E4E0D5" }}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-10 w-full border px-3 text-[12px] outline-none"
              style={{ borderColor: "#E4E0D5" }}
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength={8}
              className="h-10 w-full border px-3 text-[12px] outline-none"
              style={{ borderColor: "#E4E0D5" }}
            />
          </div>

          {error && (
            <div
              className="mb-4 border px-3 py-2 text-[10px]"
              style={{
                borderColor: "#FF4A1C",
                color: "#FF4A1C",
                background: "#FFF8F5",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full text-[11px] font-semibold disabled:opacity-50"
            style={{
              background: "#14130F",
              color: "#F6F4EE",
            }}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <div className="mt-5 text-center text-[11px]">
          <span style={{ color: "#6F6A5E" }}>
            Already have an account?
          </span>{" "}
          <button
            onClick={() => router.push(ROUTES.login)}
            className="font-semibold underline underline-offset-4"
          >
            Sign in
          </button>
        </div>
      </div>
    </main>
  );
}