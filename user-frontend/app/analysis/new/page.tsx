"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  Upload,
  X,
  LoaderCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";

import { createAnalysis } from "@/services/analysis.service";
import { getUserPreferences } from "@/services/settings.service";
import DashboardBackLink from "@/components/layout/dashboard-back-link";
import {
  getKnowledgeDocuments,
  type KnowledgeDocument,
} from "@/services/knowledge.service";

type InputMode = "text" | "file";

export default function NewAnalysisPage() {
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [files, setFiles] = useState<File[]>([]);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<number[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);
  const [outputDetail, setOutputDetail] =
    useState<"concise" | "detailed">("detailed");
const router = useRouter();

const [prompt, setPrompt] = useState("");
const [context, setContext] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
  const timer = window.setTimeout(() => {
    void getKnowledgeDocuments()
      .then(setKnowledgeDocuments)
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error
            ? `Could not load Knowledge Base documents: ${cause.message}`
            : "Could not load Knowledge Base documents.",
        );
      })
      .finally(() => setKnowledgeLoading(false));
    void getUserPreferences()
      .then((preferences) => setOutputDetail(preferences.analysis_detail))
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error
            ? `Could not load analysis preferences: ${cause.message}`
            : "Could not load analysis preferences.",
        );
      });
  }, 0);
  return () => window.clearTimeout(timer);
}, []);

const handleSubmit = async () => {
  setError("");

  if (isSubmitting) return;

  const problem = [
    prompt.trim(),
    context.trim()
      ? `Additional context: ${context.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // Text aur files dono empty hain
  if (!problem && files.length === 0 && selectedKnowledgeIds.length === 0) {
    setError(
      "Enter an analysis request, upload a file, or select an indexed Knowledge Base document."
    );
    return;
  }

  setIsSubmitting(true);

  try {
    
const result = await createAnalysis({
  problem: [
    prompt.trim(),
    context.trim()
      ? `Additional context: ${context.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n"),
  files,
  knowledgeDocumentIds: selectedKnowledgeIds,
  outputDetail,
});


    router.push(`/analysis/${result.id}`);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to start analysis. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const incoming = Array.from(selectedFiles);

    setFiles((current) => [...current, ...incoming]);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* =====================================================
          HEADER
          ===================================================== */}
      <section className="border-b border-[var(--line)] pb-6">
        <DashboardBackLink />

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="signal-dot" />

              <span className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-light)]">
                VELTRIX / NEW ANALYSIS
              </span>
            </div>

            <h1>Start a new analysis.</h1>

            <p className="mt-2 max-w-2xl">
              Give VELTRIX the evidence, question, or information you want
              investigated. The system will observe, reason, verify, and
              produce actionable intelligence.
            </p>
          </div>

          <div className="badge badge-primary shrink-0">
            <Sparkles size={11} />
            AI INTELLIGENCE
          </div>
        </div>
      </section>

      
{/* =====================================================
    ANALYSIS FORM
    ===================================================== */}
<section className="card">
  {/* Header */}
  <div className="border-b border-[var(--line)] p-5">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3>Analysis input</h3>
        <p className="mt-1 text-[11px]">
          Describe your problem and upload supporting evidence.
        </p>
      </div>

      <span className="mono hidden text-[9px] uppercase tracking-[0.1em] text-[var(--muted-light)] sm:block">
        STEP 01 / INPUT
      </span>
      <span className="badge hidden sm:inline-flex">
        {outputDetail === "concise" ? "CONCISE OUTPUT" : "DETAILED OUTPUT"}
      </span>
    </div>
  </div>

  <div className="space-y-7 p-5">
    {/* =================================================
        PROBLEM DESCRIPTION
        ================================================= */}
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor="analysis-prompt"
          className="block text-[11px] font-medium text-[var(--ink)]"
        >
          What do you want VELTRIX to analyze?
          <span className="ml-1 text-[var(--muted-light)]">
            (optional if evidence is provided)
          </span>
        </label>

        <span className="shrink-0 text-[10px] text-[var(--muted-light)]">
          {prompt.length} / 5,000
        </span>
      </div>

      <textarea
        id="analysis-prompt"
        className="textarea min-h-[180px] w-full"
        placeholder="Example: Analyze my electricity bill, verify the charges, identify unusual consumption, and suggest actionable next steps."
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        maxLength={5000}
      />

      <p className="mono mt-2 text-[9px] text-[var(--muted-light)]">
        BE SPECIFIC FOR BETTER RESULTS
      </p>
    </div>

    {/* =================================================
        EVIDENCE FILES
        ================================================= */}
    <div className="border-t border-[var(--line)] pt-6">
      <div className="mb-3">
        <label
          htmlFor="analysis-files"
          className="block text-[11px] font-medium text-[var(--ink)]"
        >
          Supporting evidence
          <span className="ml-1 font-normal text-[var(--muted-light)]">
            (optional)
          </span>
        </label>

        <p className="mt-1 text-[11px] text-[var(--muted)]">
          Upload documents, spreadsheets, or images for VELTRIX to investigate.
        </p>
      </div>

      <label
        htmlFor="analysis-files"
        className="group flex min-h-[190px] cursor-pointer flex-col items-center justify-center border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] px-5 py-7 text-center transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center border border-[var(--line)] bg-[var(--surface)] text-[var(--primary)]">
          <Upload size={19} strokeWidth={1.7} />
        </div>

        <div className="text-[13px] font-medium text-[var(--ink)]">
          Click to upload evidence
        </div>

        <div className="mt-1 text-[11px] text-[var(--muted)]">
          Select one or multiple files
        </div>

        <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--muted-light)]">
          PDF · DOCX · CSV · XLSX · PNG · JPG
        </div>

        <input
          id="analysis-files"
          type="file"
          multiple
          className="sr-only"
          accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="mono mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.1em] text-[var(--muted-light)]">
            <span>Selected evidence</span>
            <span>{files.length} file(s)</span>
          </div>

          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-3 border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon size={14} />
                  ) : (
                    <FileText size={14} />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium text-[var(--ink)]">
                    {file.name}
                  </div>

                  <div className="mt-0.5 font-mono text-[8px] text-[var(--muted-light)]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
                className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center text-[var(--muted)] transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="border-t border-[var(--line)] pt-6">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen size={15} className="text-[var(--primary)]" />
        <div>
          <h4>Use indexed Knowledge Base documents</h4>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Select existing indexed documents as analysis evidence. They can be combined with uploaded files.
          </p>
        </div>
      </div>
      {knowledgeLoading ? (
        <p className="flex items-center gap-2 text-xs text-[var(--muted)]"><LoaderCircle size={13} className="animate-spin" />Loading Knowledge Base documents…</p>
      ) : knowledgeDocuments.length === 0 ? (
        <p className="text-xs text-[var(--muted)]">No Knowledge Base documents yet. Upload and index documents in Knowledge first.</p>
      ) : (
        <div className="max-h-60 space-y-2 overflow-y-auto">
          {knowledgeDocuments.map((document) => {
            const indexed = document.indexing_status === "indexed";
            const selected = selectedKnowledgeIds.includes(document.id);
            return (
              <label
                key={document.id}
                className={`flex items-center gap-3 border border-[var(--line)] p-3 ${indexed ? "cursor-pointer bg-[var(--surface)]" : "cursor-not-allowed opacity-60"}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!indexed || isSubmitting}
                  onChange={(event) => {
                    setSelectedKnowledgeIds((current) =>
                      event.target.checked
                        ? [...current, document.id]
                        : current.filter((id) => id !== document.id),
                    );
                  }}
                />
                <FileText size={15} className="shrink-0 text-[var(--primary)]" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{document.filename}</span>
                <span className={`badge ${indexed ? "badge-success" : document.indexing_status === "failed" ? "badge-danger" : ""}`}>
                  {indexed ? "Indexed" : document.indexing_status.replace("_", " ")}
                </span>
              </label>
            );
          })}
        </div>
      )}
      {selectedKnowledgeIds.length > 0 && (
        <p className="mt-2 text-xs text-[var(--muted)]">{selectedKnowledgeIds.length} indexed document(s) selected</p>
      )}
    </div>

    {/* =================================================
        ADDITIONAL CONTEXT
        ================================================= */}
    <div className="border-t border-[var(--line)] pt-6">
      <label
        htmlFor="analysis-context"
        className="mb-2 block text-[11px] font-medium text-[var(--ink)]"
      >
        Additional context
        <span className="ml-1 font-normal text-[var(--muted-light)]">
          (optional)
        </span>
      </label>

      <textarea
        id="analysis-context"
        className="textarea min-h-[100px] w-full"
        placeholder="Add background, dates, constraints, goals, or other relevant details."
        value={context}
        onChange={(event) => setContext(event.target.value)}
      />
    </div>

    {/* =================================================
        ERROR MESSAGE
        ================================================= */}
    {error && (
      <div
        role="alert"
        className="flex items-start gap-2 border border-[var(--danger)] p-3 text-sm text-[var(--danger)]"
      >
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    )}

    {/* =================================================
        ACTIONS
        ================================================= */}
    <div className="flex flex-col-reverse justify-between gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
        <Paperclip size={12} />
        Your evidence will be processed securely.
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard" className="btn">
          Cancel
        </Link>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}

          {isSubmitting ? "Starting Analysis..." : "Start Analysis"}
        </button>
      </div>
    </div>
  </div>
</section>


      {/* =====================================================
          PIPELINE PREVIEW
          ===================================================== */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          ["01", "Observe", "Extract evidence"],
          ["02", "Reason", "Understand context"],
          ["03", "Verify", "Validate findings"],
          ["04", "Act", "Generate action"],
        ].map(([number, title, description]) => (
          <div
            key={number}
            className="border border-[var(--line)] bg-[var(--surface-soft)] p-4"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="mono text-[9px] text-[var(--muted-light)]">
                {number}
              </span>

              <span className="h-1.5 w-1.5 bg-[var(--line-strong)]" />
            </div>

            <div className="text-[12px] font-medium text-[var(--ink)]">
              {title}
            </div>

            <div className="mt-1 text-[10px] text-[var(--muted)]">
              {description}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
