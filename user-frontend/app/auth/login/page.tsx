"use client";
import { markWelcomePending } from "@/lib/welcome";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { login } from "@/services/auth.service";
import { authStore } from "@/store/auth-store";

/* ───────────── Background: neural network over the whole window ─────────────
   Everything below is computed from fixed numbers (no Math.random), so the
   server and the browser always render the same SVG. */

const W = 1600;
const H = 900;
const COLS = 9;
const ROWS = 5;

const NODES: [number, number][] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const jx = (((c * 73 + r * 131) % 100) - 50) * 1.5;
    const jy = (((c * 197 + r * 59) % 100) - 50) * 1.3;
    NODES.push([
      Math.round(((c + 0.5) * W) / COLS + jx),
      Math.round(((r + 0.5) * H) / ROWS + jy),
    ]);
  }
}

const EDGES: [number, number][] = (() => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  NODES.forEach((a, i) => {
    NODES.map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1]) }))
      .filter(({ j }) => j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push(i < j ? [i, j] : [j, i]);
        }
      });
  });
  return out;
})();

const PULSES = EDGES.filter((_, i) => i % 4 === 0).slice(0, 12);

const CSS = `
@keyframes lg-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
@keyframes lg-drift-a { to { transform: translate(60px, 40px) scale(1.12) } }
@keyframes lg-drift-b { to { transform: translate(-60px, -40px) scale(1.14) } }
@keyframes lg-spin { to { transform: rotate(360deg) } }
@keyframes lg-spin-r { to { transform: rotate(-360deg) } }
@keyframes lg-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes lg-pulse { 0%,100% { transform: scale(1); opacity: .7 } 50% { transform: scale(1.18); opacity: 1 } }
.lg-float { animation: lg-float 7s ease-in-out infinite }
.lg-drift-a { animation: lg-drift-a 14s ease-in-out infinite alternate }
.lg-drift-b { animation: lg-drift-b 16s ease-in-out infinite alternate }
.lg-spin { animation: lg-spin 120s linear infinite }
.lg-spin-r { animation: lg-spin-r 160s linear infinite }
.lg-in { animation: lg-in .7s ease-out both }
.lg-pulse { animation: lg-pulse 3.2s ease-in-out infinite }

.lg-input { transition: border-color .15s, box-shadow .15s, background .15s }
.lg-input::placeholder { color: rgba(255,255,255,.35) }
.lg-input:focus { outline: none !important; border-color: #67e8f9 !important; background: rgba(255,255,255,.1) !important; box-shadow: 0 0 0 3px rgba(103,232,249,.18) !important }
.lg-input:-webkit-autofill { -webkit-text-fill-color: #fff; caret-color: #fff; box-shadow: 0 0 0 1000px #121a3d inset !important; border-color: rgba(255,255,255,.2) !important }

@media (prefers-reduced-motion: reduce) {
  .lg-float,.lg-drift-a,.lg-drift-b,.lg-spin,.lg-spin-r,.lg-in,.lg-pulse { animation: none !important }
  .lg-dot { display: none }
}
`;

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 46,
  paddingLeft: 44,
  paddingRight: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#ffffff",
  fontSize: 14,
  borderRadius: 0,
};

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
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-10"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, #16224f 0%, #0a0e27 55%, #04060f 100%)",
      }}
    >
      <style>{CSS}</style>

      {/* ───────── Full-window AI background ───────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* aurora */}
        <div className="lg-drift-a absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-violet-600/35 blur-[120px]" />
        <div className="lg-drift-b absolute -bottom-48 -right-32 h-[36rem] w-[36rem] rounded-full bg-cyan-500/25 blur-[130px]" />
        <div className="lg-drift-b absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />

        {/* grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,255,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 50%, #000 0%, transparent 80%)",
            maskImage:
              "radial-gradient(ellipse at 50% 50%, #000 0%, transparent 80%)",
          }}
        />

        {/* slow orbit rings around the form */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 1000 1000"
            className="lg-spin h-[135vmin] w-[135vmin] opacity-70"
            fill="none"
          >
            <circle cx="500" cy="500" r="300" stroke="#a78bfa" strokeOpacity=".16" strokeDasharray="2 10" />
            <circle cx="500" cy="500" r="420" stroke="#22d3ee" strokeOpacity=".14" />
            <circle cx="500" cy="500" r="300" stroke="none" />
            <circle cx="800" cy="500" r="5" fill="#a78bfa" />
            <circle cx="500" cy="80" r="4" fill="#22d3ee" />
            <circle cx="200" cy="500" r="3" fill="#67e8f9" />
          </svg>
          <svg
            viewBox="0 0 1000 1000"
            className="lg-spin-r absolute h-[190vmin] w-[190vmin] opacity-60"
            fill="none"
          >
            <circle cx="500" cy="500" r="480" stroke="#7dd3fc" strokeOpacity=".1" strokeDasharray="4 14" />
            <circle cx="980" cy="500" r="5" fill="#c4b5fd" />
            <circle cx="260" cy="916" r="4" fill="#67e8f9" />
          </svg>
        </div>

        {/* neural network */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="lg-edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {EDGES.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a][0]}
              y1={NODES[a][1]}
              x2={NODES[b][0]}
              y2={NODES[b][1]}
              stroke="url(#lg-edge)"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
          ))}

          {NODES.map(([x, y], i) => (
            <circle
              key={i}
              className="lg-float"
              style={{ animationDelay: `${(i % 7) * 0.6}s` }}
              cx={x}
              cy={y}
              r={i % 5 === 0 ? 4.5 : 2.8}
              fill={i % 3 === 0 ? "#22d3ee" : "#a78bfa"}
              fillOpacity="0.85"
            />
          ))}

          {/* data pulses travelling along the connections */}
          {PULSES.map(([a, b], k) => {
            const path = `M${NODES[a][0]} ${NODES[a][1]} L${NODES[b][0]} ${NODES[b][1]}`;
            return (
              <circle key={`p-${a}-${b}`} className="lg-dot" r="3.2" fill="#a5f3fc">
                <animateMotion
                  dur={`${3 + (k % 4)}s`}
                  begin={`${(k * 0.7).toFixed(1)}s`}
                  repeatCount="indefinite"
                  path={path}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.15;0.85;1"
                  dur={`${3 + (k % 4)}s`}
                  begin={`${(k * 0.7).toFixed(1)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}
        </svg>

        {/* soft scrim behind the form + edge vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(5,8,22,0.72) 0%, rgba(5,8,22,0.35) 32%, transparent 60%), radial-gradient(ellipse at center, transparent 45%, rgba(2,4,12,0.65) 100%)",
          }}
        />
      </div>

      {/* ───────── Centered login ───────── */}
      <div className="lg-in relative w-full max-w-sm">
        {/* The one project logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative">
            <div
              className="lg-pulse absolute -inset-6 rounded-full blur-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.55), rgba(34,211,238,0.5))",
              }}
            />
            <Image
              src="/veltrix-icon.svg"
              alt="Veltrix AI logo"
              width={84}
              height={84}
              priority
              className="relative h-[84px] w-[84px]"
            />
          </div>

          <div
            className="mt-5 text-[22px] font-semibold tracking-[-0.02em]"
            style={{ color: "#ffffff" }}
          >
            VELTRIX{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #c4b5fd, #67e8f9)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              AI
            </span>
          </div>
          <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            Intelligence that connects
          </div>
        </div>

        <div className="mb-8 flex w-full flex-col items-center text-center">
  <h1
    className="w-full whitespace-nowrap font-semibold tracking-[-0.03em]"
    style={{
      color: "#ffffff",
      fontSize: "1.75rem",
      lineHeight: 1.2,
      margin: 0,
    }}
  >
    Welcome back.
  </h1>
  <p
    className="w-full text-xs font-light tracking-wide uppercase"
    style={{
      marginTop: "16px",
      lineHeight: 1.4,
      background: "linear-gradient(90deg, #c4b5fd, #67e8f9)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    }}
  >
    Sign in to continue to your intelligence workspace.
  </p>
</div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[11px] font-medium"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={15}
                strokeWidth={1.7}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45"
              />

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="lg-input"
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[11px] font-medium"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-[10px] font-medium transition hover:text-white"
                style={{ color: "#7dd3fc" }}
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <LockKeyhole
                size={15}
                strokeWidth={1.7}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45"
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="lg-input"
                style={{ ...inputStyle, paddingRight: 44 }}
                disabled={isSubmitting}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white/50 transition hover:text-white"
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
              className="mt-0.5 h-3.5 w-3.5 accent-cyan-400"
            />

            <span
              className="text-[10px] leading-4"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Keep me signed in on this device.
            </span>
          </label>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 text-sm"
              style={{
                background: "rgba(248,113,113,0.12)",
                border: "1px solid rgba(248,113,113,0.4)",
                color: "#fecaca",
              }}
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn group h-12 w-full justify-center border-0 font-semibold shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: "linear-gradient(90deg, #7c5cf5, #22b8e6)",
              color: "#ffffff",
            }}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight
                  size={14}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>

        <p
  className="text-center text-[12px]"
  style={{
    marginTop: "20px",
    color: "rgba(255,255,255,0.6)",
  }}
>
  Don&apos;t have an account?{" "}
  <Link
    href="/auth/register"
    className="font-medium transition hover:text-white"
    style={{ color: "#7dd3fc" }}
  >
    Create one
  </Link>
</p>

        <div className="mt-8 flex items-center justify-center gap-2 text-white/35">
          <ShieldCheck size={12} strokeWidth={1.7} />
          <span className="font-mono text-[8px] uppercase tracking-[0.12em]">
            Secure intelligence workspace
          </span>
        </div>
      </div>
    </main>
  );
}