"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  MoreHorizontal,
  CheckCircle2,
  Clock3,
  Database,
  X,
} from "lucide-react";

type Theme = "paper" | "lab";

type DocumentItem = {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "CSV";
  category: "UTILITY" | "DOCUMENT" | "VISUAL" | "GENERAL";
  size: string;
  chunks: number;
  status: "Indexed" | "Processing";
  updated: string;
};

const documents: DocumentItem[] = [
  {
    id: "DOC-001",
    name: "Electricity Tariff Rules",
    type: "PDF",
    category: "UTILITY",
    size: "2.4 MB",
    chunks: 184,
    status: "Indexed",
    updated: "Today",
  },
  {
    id: "DOC-002",
    name: "VELTRIX Reasoning Guidelines",
    type: "DOCX",
    category: "DOCUMENT",
    size: "1.1 MB",
    chunks: 96,
    status: "Indexed",
    updated: "Yesterday",
  },
  {
    id: "DOC-003",
    name: "Device Inspection Manual",
    type: "PDF",
    category: "VISUAL",
    size: "4.8 MB",
    chunks: 241,
    status: "Indexed",
    updated: "2 days ago",
  },
  {
    id: "DOC-004",
    name: "Monthly Expense Dataset",
    type: "CSV",
    category: "GENERAL",
    size: "680 KB",
    chunks: 327,
    status: "Indexed",
    updated: "3 days ago",
  },
  {
    id: "DOC-005",
    name: "Safety Verification Procedures",
    type: "PDF",
    category: "VISUAL",
    size: "3.2 MB",
    chunks: 142,
    status: "Processing",
    updated: "Today",
  },
];

export default function DocumentsPage() {
  const router = useRouter();

  const [theme, setTheme] = useState<Theme>("paper");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showUpload, setShowUpload] = useState(false);

  const isLab = theme === "lab";

  const colors = {
    bg: isLab ? "#F4F7F6" : "#F6F4EE",
    card: "#FFFFFF",
    sand: isLab ? "#E8EFEC" : "#EFEBDF",
    border: isLab ? "#DCE5E1" : "#E4E0D5",
    ink: isLab ? "#0B1F1C" : "#14130F",
    muted: isLab ? "#5B706B" : "#6F6A5E",
    primary: isLab ? "#0F766E" : "#14130F",
    primaryText: "#F6F4EE",
    signal: isLab ? "#F59E0B" : "#FF4A1C",
    verified: "#0E7C66",
  };

  const routeMap: Record<string, string> = {
    Dashboard: "/admin/dashboard",
    "New Analysis": "/admin/analyses",
    History: "/admin/history",
    Insights: "/admin/insights",
    Analytics: "/admin/analytics",
    Knowledge: "/admin/knowledge",
    Projects: "/admin/projects",
    Documents: "/admin/documents",
    Settings: "/admin/settings",
    Help: "/admin/help",
  };

  const navSections = [
    {
      title: "WORKSPACE",
      items: ["Dashboard", "New Analysis", "History"],
    },
    {
      title: "INTELLIGENCE",
      items: ["Insights", "Analytics", "Knowledge"],
    },
    {
      title: "LIBRARY",
      items: ["Projects", "Documents"],
    },
    {
      title: "SYSTEM",
      items: ["Settings", "Help"],
    },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || doc.category === category;

    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: DocumentItem["type"]) => {
    if (type === "CSV") {
      return <FileSpreadsheet size={18} />;
    }

    if (type === "DOCX") {
      return <FileText size={18} />;
    }

    return <File size={18} />;
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: colors.bg,
        color: colors.ink,
        fontFamily: "var(--font-veltrix-sans)",
      }}
    >
      {/* SIDEBAR */}
      <aside
        className="w-[224px] min-h-screen border-r flex flex-col shrink-0"
        style={{
          background: colors.bg,
          borderColor: colors.border,
        }}
      >
        {/* LOGO */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{
                background: colors.ink,
                color: colors.card,
              }}
            >
              <span className="font-bold text-lg">V</span>
            </div>

            <div>
              <div className="font-bold tracking-[0.18em] text-[15px]">
                VELTRIX
              </div>
              <div
                className="text-[8px] tracking-[0.12em] uppercase"
                style={{ color: colors.muted }}
              >
                Intelligence System
              </div>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="px-3 mt-3 flex-1">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <div
                className="px-3 mb-2 text-[9px] font-semibold tracking-[0.16em]"
                style={{ color: colors.muted }}
              >
                {section.title}
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = item === "Documents";

                  return (
                    <button
                      key={item}
                      onClick={() => router.push(routeMap[item])}
                      className="relative w-full flex items-center text-left px-3 py-2.5 text-[12px] transition-all"
                      style={{
                        background: active ? colors.card : "transparent",
                        border: active
                          ? `1px solid ${colors.border}`
                          : "1px solid transparent",
                        color: active ? colors.ink : colors.muted,
                      }}
                    >
                      {active && (
                        <span
                          className="absolute left-[-1px] top-[-1px] bottom-[-1px] w-[4px]"
                          style={{ background: colors.signal }}
                        />
                      )}

                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* AI STATUS */}
        <div
          className="mx-4 mb-5 p-3 border"
          style={{
            background: colors.card,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: colors.verified }}
            />

            <span className="text-[11px] font-medium">
              AI Online
            </span>
          </div>

          <div
            className="mt-1 text-[9px]"
            style={{ color: colors.muted }}
          >
            Gemini Intelligence Engine
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        {/* HEADER */}
        <header
          className="h-[70px] border-b flex items-center justify-between px-8"
          style={{ borderColor: colors.border }}
        >
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.14em]"
              style={{ color: colors.muted }}
            >
              Library
            </div>

            <h1 className="text-[22px] font-semibold mt-1">
              Documents
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* THEME */}
            <div
              className="flex border"
              style={{ borderColor: colors.border }}
            >
              <button
                onClick={() => setTheme("paper")}
                className="px-3 py-1.5 text-[10px]"
                style={{
                  background:
                    theme === "paper" ? colors.ink : "transparent",
                  color:
                    theme === "paper"
                      ? colors.primaryText
                      : colors.muted,
                }}
              >
                Paper
              </button>

              <button
                onClick={() => setTheme("lab")}
                className="px-3 py-1.5 text-[10px]"
                style={{
                  background:
                    theme === "lab" ? colors.primary : "transparent",
                  color:
                    theme === "lab"
                      ? colors.primaryText
                      : colors.muted,
                }}
              >
                Lab
              </button>
            </div>

            <button
              onClick={() => router.push("/admin/analyses")}
              className="h-[30px] px-3 text-[12px] border"
              style={{
                background: colors.primary,
                color: colors.primaryText,
                borderColor: colors.primary,
              }}
            >
              New Analysis
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="max-w-[1100px] mx-auto px-8 py-7">
          {/* TOP STATS */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              ["24", "TOTAL DOCUMENTS"],
              ["23", "INDEXED"],
              ["1", "PROCESSING"],
              ["1,842", "TOTAL CHUNKS"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border p-4"
                style={{
                  background: colors.card,
                  borderColor: colors.border,
                }}
              >
                <div
                  className="font-mono text-[22px] font-semibold"
                  style={{ color: colors.ink }}
                >
                  {value}
                </div>

                <div
                  className="mt-1 text-[9px] tracking-[0.12em]"
                  style={{ color: colors.muted }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* SEARCH + FILTER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {["All", "UTILITY", "DOCUMENT", "VISUAL", "GENERAL"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className="h-[30px] px-3 border text-[10px]"
                    style={{
                      background:
                        category === item
                          ? colors.ink
                          : colors.card,
                      color:
                        category === item
                          ? colors.primaryText
                          : colors.muted,
                      borderColor: colors.border,
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <div
              className="w-[260px] h-[32px] border flex items-center px-3 gap-2"
              style={{
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              <Search size={14} style={{ color: colors.muted }} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="flex-1 outline-none bg-transparent text-[11px]"
                style={{ color: colors.ink }}
              />
            </div>
          </div>

          {/* DOCUMENT TABLE */}
          <div
            className="border"
            style={{
              background: colors.card,
              borderColor: colors.border,
            }}
          >
            {/* TABLE HEADER */}
            <div
              className="grid grid-cols-[2fr_0.7fr_0.9fr_0.7fr_0.8fr_0.8fr_40px] px-4 py-3 border-b text-[9px] font-semibold tracking-[0.08em]"
              style={{
                background: colors.sand,
                borderColor: colors.border,
                color: colors.muted,
              }}
            >
              <div>DOCUMENT</div>
              <div>TYPE</div>
              <div>CATEGORY</div>
              <div>SIZE</div>
              <div>CHUNKS</div>
              <div>STATUS</div>
              <div />
            </div>

            {/* ROWS */}
            {filteredDocuments.length === 0 ? (
              <div
                className="p-10 text-center text-[12px]"
                style={{ color: colors.muted }}
              >
                No documents found.
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-[2fr_0.7fr_0.9fr_0.7fr_0.8fr_0.8fr_40px] px-4 py-4 border-b items-center"
                  style={{ borderColor: colors.border }}
                >
                  {/* DOCUMENT */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 flex items-center justify-center"
                      style={{
                        background: colors.sand,
                        color: colors.ink,
                      }}
                    >
                      {getFileIcon(doc.type)}
                    </div>

                    <div>
                      <div className="text-[12px] font-medium">
                        {doc.name}
                      </div>

                      <div
                        className="font-mono text-[9px] mt-0.5"
                        style={{ color: colors.muted }}
                      >
                        {doc.id} · {doc.updated}
                      </div>
                    </div>
                  </div>

                  {/* TYPE */}
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: colors.muted }}
                  >
                    {doc.type}
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <span
                      className="px-2 py-1 text-[8px] font-semibold tracking-[0.08em]"
                      style={{
                        background: colors.sand,
                        color: colors.ink,
                      }}
                    >
                      {doc.category}
                    </span>
                  </div>

                  {/* SIZE */}
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: colors.muted }}
                  >
                    {doc.size}
                  </div>

                  {/* CHUNKS */}
                  <div className="flex items-center gap-1">
                    <Database
                      size={12}
                      style={{ color: colors.muted }}
                    />

                    <span className="font-mono text-[10px]">
                      {doc.chunks}
                    </span>
                  </div>

                  {/* STATUS */}
                  <div>
                    {doc.status === "Indexed" ? (
                      <div
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: colors.verified }}
                      >
                        <CheckCircle2 size={13} />
                        Indexed
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: colors.signal }}
                      >
                        <Clock3 size={13} />
                        Processing
                      </div>
                    )}
                  </div>

                  {/* ACTION */}
                  <button
                    className="w-7 h-7 flex items-center justify-center"
                    style={{ color: colors.muted }}
                    onClick={() =>
                      console.log("Document action:", doc.id)
                    }
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* UPLOAD SECTION */}
          <div className="mt-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium">
                Evidence Library
              </div>

              <div
                className="text-[10px] mt-1"
                style={{ color: colors.muted }}
              >
                Documents can be indexed and used as evidence during
                investigations.
              </div>
            </div>

            <button
              onClick={() => setShowUpload(true)}
              className="h-[30px] px-3 border flex items-center gap-2 text-[11px]"
              style={{
                background: colors.card,
                borderColor: colors.border,
                color: colors.ink,
              }}
            >
              <Upload size={13} />
              Upload Document
            </button>
          </div>

          {/* PRINCIPLE */}
          <div
            className="mt-8 border p-5"
            style={{
              background: colors.sand,
              borderColor: colors.border,
            }}
          >
            <div
              className="text-[9px] tracking-[0.14em] font-semibold"
              style={{ color: colors.signal }}
            >
              VELTRIX PRINCIPLE
            </div>

            <div className="mt-2 text-[14px] font-medium">
              Evidence should strengthen reasoning, not decorate it.
            </div>

            <div
              className="mt-2 font-mono text-[9px] tracking-[0.1em]"
              style={{ color: colors.muted }}
            >
              OBSERVE → UNDERSTAND → REASON → VERIFY → ACT
            </div>
          </div>
        </div>
      </main>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div
            className="w-[440px] border p-6"
            style={{
              background: colors.card,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[16px] font-semibold">
                  Upload Document
                </div>

                <div
                  className="text-[10px] mt-1"
                  style={{ color: colors.muted }}
                >
                  Add evidence to the VELTRIX knowledge library.
                </div>
              </div>

              <button onClick={() => setShowUpload(false)}>
                <X size={17} />
              </button>
            </div>

            <label
              className="mt-6 h-[150px] border border-dashed flex flex-col items-center justify-center cursor-pointer"
              style={{
                borderColor: colors.border,
                background: colors.bg,
              }}
            >
              <Upload size={24} style={{ color: colors.muted }} />

              <div className="mt-3 text-[12px]">
                Choose a document
              </div>

              <div
                className="mt-1 text-[9px]"
                style={{ color: colors.muted }}
              >
                PDF, DOCX or CSV
              </div>

              <input
                type="file"
                accept=".pdf,.docx,.csv"
                className="hidden"
                onChange={(e) => {
                  console.log("Selected file:", e.target.files?.[0]);
                  setShowUpload(false);
                }}
              />
            </label>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowUpload(false)}
                className="h-[30px] px-3 border text-[11px]"
                style={{
                  borderColor: colors.border,
                  color: colors.muted,
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => setShowUpload(false)}
                className="h-[30px] px-3 text-[11px]"
                style={{
                  background: colors.primary,
                  color: colors.primaryText,
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}