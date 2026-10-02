"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AnalysisMode = "visual" | "document" | "problem";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AnalysisMode>("visual");
  const [problem, setProblem] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    setFiles((current) => [
      ...current,
      ...Array.from(fileList),
    ]);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#F6F4EE",
        color: "#14130F",
        fontFamily:
          'var(--font-instrument-sans), "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className="fixed left-0 top-0 z-30 flex h-screen w-[224px] flex-col border-r"
          style={{
            background: "#F6F4EE",
            borderColor: "#E4E0D5",
          }}
        >
          {/* Logo */}
          <div className="flex h-[82px] items-center px-5">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-3"
            >
              <div
                className="relative flex h-9 w-9 items-center justify-center"
                style={{ background: "#14130F" }}
              >
                <span
                  className="text-[21px] font-bold leading-none"
                  style={{ color: "#F6F4EE" }}
                >
                  V
                </span>

                <span
                  className="absolute right-[5px] top-[5px] h-[6px] w-[6px]"
                  style={{
                    border: "1px solid #FF4A1C",
                  }}
                />

                <span
                  className="absolute bottom-[5px] right-[5px] h-[5px] w-[5px]"
                  style={{ background: "#FF4A1C" }}
                />
              </div>

              <div className="text-left">
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
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 px-3">
            <NavGroup
              label="WORKSPACE"
              items={[
                ["Dashboard", "/admin/dashboard"],
                ["New Analysis", "/admin/new-analysis"],
                ["History", "/admin/history"],
              ]}
              active="New Analysis"
              router={router}
            />

            <NavGroup
              label="INTELLIGENCE"
              items={[
                ["Insights", "/admin/insights"],
                ["Analytics", "/admin/analytics"],
                ["Knowledge", "/admin/knowledge"],
              ]}
              router={router}
            />

            <NavGroup
              label="LIBRARY"
              items={[
                ["Projects", "/admin/projects"],
                ["Documents", "/admin/documents"],
              ]}
              router={router}
            />

            <NavGroup
              label="SYSTEM"
              items={[
                ["Settings", "/admin/settings"],
                ["Help", "/admin/help"],
              ]}
              router={router}
            />
          </nav>

          {/* AI STATUS */}
          <div
            className="mx-3 mb-4 border p-3"
            style={{
              background: "#FFFFFF",
              borderColor: "#E4E0D5",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "#0E7C66" }}
              />

              <span className="text-[11px] font-semibold">
                AI Online
              </span>
            </div>

            <div
              className="mt-1 text-[9px]"
              style={{ color: "#6F6A5E" }}
            >
              Gemini · Multimodal
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="ml-[224px] min-h-screen flex-1">
          <div className="mx-auto max-w-[1100px] px-8 py-[22px]">
            {/* HEADER */}
            <header className="mb-8">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="mb-5 text-[10px] underline underline-offset-4"
                style={{ color: "#6F6A5E" }}
              >
                ← Dashboard
              </button>

              <div
                className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em]"
                style={{ color: "#6F6A5E" }}
              >
                Investigation
              </div>

              <h1 className="text-[27px] font-semibold tracking-[-0.025em]">
                New Analysis
              </h1>

              <p
                className="mt-1 text-[13px]"
                style={{ color: "#6F6A5E" }}
              >
                Give VELTRIX the evidence. We&apos;ll determine what
                matters and what to do next.
              </p>
            </header>

            {/* MODE TABS */}
            <div
              className="mb-5 flex border-b"
              style={{ borderColor: "#E4E0D5" }}
            >
              {[
                ["visual", "Visual"],
                ["document", "Document"],
                ["problem", "Problem"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setMode(value as AnalysisMode)}
                  className="relative px-5 py-3 text-[11px] font-medium"
                  style={{
                    color:
                      mode === value ? "#14130F" : "#6F6A5E",
                  }}
                >
                  {label}

                  {mode === value && (
                    <span
                      className="absolute bottom-[-1px] left-0 h-[2px] w-full"
                      style={{ background: "#FF4A1C" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <section
              className="border"
              style={{
                background: "#FFFFFF",
                borderColor: "#E4E0D5",
              }}
            >
              <div
                className="border-b px-5 py-4"
                style={{ borderColor: "#E4E0D5" }}
              >
                <div className="text-[13px] font-semibold">
                  {mode === "visual"
                    ? "Visual Evidence"
                    : mode === "document"
                      ? "Document Evidence"
                      : "Describe the Problem"}
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{ color: "#6F6A5E" }}
                >
                  {mode === "visual"
                    ? "Upload images containing the evidence you want VELTRIX to inspect."
                    : mode === "document"
                      ? "Upload documents containing information relevant to your investigation."
                      : "Describe the problem clearly. Additional evidence can be added below."}
                </div>
              </div>

              <div className="p-5">
                {/* PROBLEM */}
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder={
                    mode === "problem"
                      ? "Example: Why did my electricity bill increase this month?"
                      : "Optional: Tell VELTRIX what you want to understand..."
                  }
                  className="mb-5 h-[120px] w-full resize-none border p-4 text-[13px] outline-none"
                  style={{
                    borderColor: "#E4E0D5",
                  }}
                />

                {/* UPLOAD */}
                <label
                  className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center border border-dashed text-center transition-colors"
                  style={{
                    borderColor: "#D5D0C4",
                    background: "#F6F4EE",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept={
                      mode === "visual"
                        ? "image/*"
                        : mode === "document"
                          ? ".pdf,.doc,.docx,.csv,.txt"
                          : "*/*"
                    }
                    onChange={(e) =>
                      handleFiles(e.target.files)
                    }
                  />

                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center border text-[18px]"
                    style={{
                      background: "#FFFFFF",
                      borderColor: "#E4E0D5",
                    }}
                  >
                    +
                  </div>

                  <div className="text-[12px] font-semibold">
                    Drop evidence here
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: "#6F6A5E" }}
                  >
                    or click to browse files
                  </div>
                </label>

                {/* FILE LIST */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between border px-4 py-3"
                        style={{
                          borderColor: "#E4E0D5",
                          background: "#FFFFFF",
                        }}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[11px] font-medium">
                            {file.name}
                          </div>

                          <div
                            className="mt-1 font-mono text-[9px]"
                            style={{
                              color: "#6F6A5E",
                              fontFamily:
                                "var(--font-jetbrains-mono), monospace",
                            }}
                          >
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>

                        <button
                          onClick={() => removeFile(index)}
                          className="ml-4 text-[11px]"
                          style={{ color: "#FF4A1C" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ACTION */}
                <div
                  className="mt-5 flex items-center justify-between border-t pt-5"
                  style={{ borderColor: "#E4E0D5" }}
                >
                  <div
                    className="text-[9px]"
                    style={{ color: "#6F6A5E" }}
                  >
                    VELTRIX will extract, reason, verify and generate
                    actions.
                  </div>

                  <button
                    className="h-[32px] px-5 text-[11px] font-semibold"
                    style={{
                      background: "#14130F",
                      color: "#F6F4EE",
                    }}
                    onClick={() => {
                      console.log("Investigation started", {
                        mode,
                        problem,
                        files,
                      });
                    }}
                  >
                    Start Investigation →
                  </button>
                </div>
              </div>
            </section>

            {/* PIPELINE */}
            <section className="mt-5 grid grid-cols-5 gap-2">
              {[
                ["01", "Evidence"],
                ["02", "Extract"],
                ["03", "Reason"],
                ["04", "Verify"],
                ["05", "Action"],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="border p-3"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#E4E0D5",
                  }}
                >
                  <div
                    className="font-mono text-[9px]"
                    style={{
                      color: "#FF4A1C",
                      fontFamily:
                        "var(--font-jetbrains-mono), monospace",
                    }}
                  >
                    {number}
                  </div>

                  <div className="mt-1 text-[10px] font-semibold">
                    {label}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavGroup({
  label,
  items,
  active,
  router,
}: {
  label: string;
  items: [string, string][];
  active?: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="mb-7">
      <div
        className="mb-2 px-3 text-[9px] font-semibold tracking-[0.16em]"
        style={{ color: "#6F6A5E" }}
      >
        {label}
      </div>

      <div className="space-y-[2px]">
        {items.map(([name, path]) => {
          const isActive = active === name;

          return (
            <button
              key={name}
              onClick={() => router.push(path)}
              className="relative flex h-9 w-full items-center gap-3 border px-3 text-left text-[12px]"
              style={{
                background: isActive ? "#FFFFFF" : "transparent",
                borderColor: isActive
                  ? "#E4E0D5"
                  : "transparent",
                color: isActive ? "#14130F" : "#6F6A5E",
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-0 h-full w-[3px]"
                  style={{ background: "#FF4A1C" }}
                />
              )}

              <span className="w-4 text-center text-[13px]">
                {getIcon(name)}
              </span>

              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getIcon(name: string) {
  const icons: Record<string, string> = {
    Dashboard: "▦",
    "New Analysis": "＋",
    History: "◷",
    Insights: "◇",
    Analytics: "▥",
    Knowledge: "⌁",
    Projects: "□",
    Documents: "▤",
    Settings: "⚙",
    Help: "?",
  };

  return icons[name] ?? "·";
}