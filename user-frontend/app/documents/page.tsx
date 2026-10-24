"use client";

import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import UserLayout from "@/components/layout/user-layout";
import {
  deleteKnowledgeDocument,
  getDocuments,
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
  type KnowledgeDocument,
  type StoredDocument,
} from "@/services/knowledge.service";

type FilterType = "all" | "pdf" | "spreadsheets";
type DocumentStatus = KnowledgeDocument["indexing_status"];

interface DocumentItem extends StoredDocument {
  indexing_status: DocumentStatus;
  indexing_error: string | null;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".txt",
  ".csv",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

const fileIconMap = {
  PDF: FileText,
  DOCX: FileText,
  TXT: FileText,
  CSV: FileSpreadsheet,
  PNG: ImageIcon,
  JPG: ImageIcon,
  JPEG: ImageIcon,
  WEBP: ImageIcon,
};

function getFileType(filename: string) {
  return filename.split(".").pop()?.toUpperCase() ?? "FILE";
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function DocumentIcon({ type }: { type: string }) {
  const Icon = fileIconMap[type as keyof typeof fileIconMap] ?? FileText;
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
      <Icon size={16} strokeWidth={1.7} />
    </div>
  );
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const labels: Record<DocumentStatus, string> = {
    not_indexed: "Not indexed",
    processing: "Processing",
    indexed: "Ready",
    failed: "Indexing failed",
  };
  const classes: Record<DocumentStatus, string> = {
    not_indexed: "",
    processing: "badge-primary",
    indexed: "badge-success",
    failed: "badge-danger",
  };

  return (
    <span className={`badge ${classes[status]}`}>
      {status === "indexed" ? (
        <CheckCircle2 size={11} />
      ) : status === "processing" ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary)]" />
      ) : null}
      {labels[status]}
    </span>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError("");
    try {
      const [result, knowledgeDocuments] = await Promise.all([
        getDocuments(requestedPage),
        getKnowledgeDocuments(),
      ]);
      const knowledgeById = new Map<number, KnowledgeDocument>(
        knowledgeDocuments.map((document) => [document.id, document]),
      );
      setDocuments(
        result.items.map((document) => {
          const knowledgeDocument = knowledgeById.get(document.id);
          return {
            ...document,
            indexing_status: knowledgeDocument?.indexing_status ?? "not_indexed",
            indexing_error: knowledgeDocument?.indexing_error ?? null,
          };
        }),
      );
      setTotal(result.total);
      setPage(result.page);
      setPages(result.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(1), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return documents.filter((document) => {
      const type = getFileType(document.filename);
      const matchesSearch = !normalizedSearch
        || document.filename.toLowerCase().includes(normalizedSearch);
      const matchesFilter = filter === "all"
        || (filter === "pdf" && type === "PDF")
        || (filter === "spreadsheets" && type === "CSV");
      return matchesSearch && matchesFilter;
    });
  }, [documents, filter, search]);

  const indexedCount = documents.filter(
    (document) => document.indexing_status === "indexed",
  ).length;
  const storageUsed = documents.reduce(
    (sum, document) => sum + document.size_bytes,
    0,
  );

  async function handleUpload(file?: File) {
    if (!file) return;
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      setError("Unsupported file type. Upload PDF, DOCX, TXT, CSV, PNG, JPG, or WEBP.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("File is larger than the 10 MB upload limit.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");
    try {
      await uploadKnowledgeDocument(file);
      setNotice(`${file.name} uploaded.`);
      await refresh(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the document.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(document: DocumentItem) {
    if (!window.confirm(`Delete ${document.filename}? This also removes its indexed content.`)) {
      return;
    }

    setDeletingId(document.id);
    setError("");
    setNotice("");
    try {
      await deleteKnowledgeDocument(document.id);
      setNotice(`${document.filename} deleted.`);
      await refresh(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the document.");
    } finally {
      setDeletingId(null);
    }
  }

  function renderUploadButton() {
    return (
      <button
        type="button"
        className="btn btn-primary shrink-0"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <LoaderCircle className="animate-spin" size={14} /> : <Upload size={14} />}
        {uploading ? "Uploading…" : "Upload Document"}
      </button>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-7">
        <section className="flex flex-col justify-between gap-5 border-b border-[var(--line)] pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="signal-dot" />
              <span className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-light)]">
                VELTRIX / DOCUMENTS
              </span>
            </div>
            <h1>Documents.</h1>
            <p className="mt-2 max-w-2xl">
              Store and organize the evidence that powers your VELTRIX analyses.
            </p>
          </div>
          {renderUploadButton()}
        </section>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg,.webp"
          onChange={(event) => void handleUpload(event.target.files?.[0])}
        />

        {error && (
          <div role="alert" className="border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="border border-[var(--line)] bg-[var(--success-soft)] p-3 text-sm text-[var(--success)]">
            {notice}
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted-light)]">Documents</span>
              <FileText size={16} strokeWidth={1.7} className="text-[var(--primary)]" />
            </div>
            <div className="text-[27px] font-semibold tracking-[-0.04em] text-[var(--ink)]">
              {loading ? "—" : total}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">Files in your account</div>
          </div>
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted-light)]">Storage</span>
              <FolderOpen size={16} strokeWidth={1.7} className="text-[var(--success)]" />
            </div>
            <div className="text-[27px] font-semibold tracking-[-0.04em] text-[var(--ink)]">
              {loading ? "—" : formatSize(storageUsed)}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">
              {pages > 1 ? "On this page" : "Across your documents"}
            </div>
          </div>
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted-light)]">Indexed</span>
              <CheckCircle2 size={16} strokeWidth={1.7} className="text-[var(--success)]" />
            </div>
            <div className="text-[27px] font-semibold tracking-[-0.04em] text-[var(--ink)]">
              {loading ? "—" : `${indexedCount} / ${documents.length}`}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">Documents ready for AI on this page</div>
          </div>
        </section>

        <section className="card">
          <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={14}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search documents on this page…"
                className="input pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                ["all", "All files"],
                ["pdf", "PDF"],
                ["spreadsheets", "CSV"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`btn ${filter === value ? "btn-primary" : ""}`}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value === "all" && <Filter size={13} />}
                  {label}
                </button>
              ))}
              <button
                type="button"
                className="btn"
                onClick={() => void refresh(page)}
                aria-label="Refresh documents"
                disabled={loading}
              >
                {loading ? <LoaderCircle className="animate-spin" size={14} /> : <RefreshCw size={14} />}
              </button>
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="hidden border-b border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_110px_100px_140px_40px] lg:items-center lg:gap-4">
            <span className="mono text-[9px] uppercase tracking-[0.08em] text-[var(--muted-light)]">Document</span>
            <span className="mono text-[9px] uppercase tracking-[0.08em] text-[var(--muted-light)]">Type</span>
            <span className="mono text-[9px] uppercase tracking-[0.08em] text-[var(--muted-light)]">Size</span>
            <span className="mono text-[9px] uppercase tracking-[0.08em] text-[var(--muted-light)]">Status</span>
            <span />
          </div>

          {loading ? (
            <div className="flex items-center gap-2 p-8 text-sm text-[var(--muted)]">
              <LoaderCircle className="animate-spin" size={16} />
              Loading documents from your account…
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="mx-auto text-[var(--muted-light)]" size={28} />
              <h3 className="mt-3">{documents.length ? "No matching documents" : "No documents yet"}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {documents.length ? "Try another search or file type." : "Upload a document to store it in your account."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {filteredDocuments.map((document) => {
                const type = getFileType(document.filename);
                return (
                  <div key={document.id} className="group px-5 py-4 transition hover:bg-[var(--surface-soft)]">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_110px_100px_140px_40px] lg:items-center lg:gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <DocumentIcon type={type} />
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-medium text-[var(--ink)]">{document.filename}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="mono text-[8px] text-[var(--muted-light)]">DOC-{document.id}</span>
                            <span className="h-1 w-1 bg-[var(--line-strong)]" />
                            <span className="text-[9px] text-[var(--muted-light)]">
                              {new Date(document.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {document.indexing_error && (
                            <p className="mt-1 text-xs text-[var(--danger)]">{document.indexing_error}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-[9px] text-[var(--muted-light)] lg:hidden">TYPE</div>
                        <span className="font-mono text-[9px] text-[var(--text)]">{type}</span>
                      </div>
                      <div>
                        <div className="mb-1 text-[9px] text-[var(--muted-light)] lg:hidden">SIZE</div>
                        <span className="font-mono text-[9px] text-[var(--text)]">{formatSize(document.size_bytes)}</span>
                      </div>
                      <div>
                        <div className="mb-1 text-[9px] text-[var(--muted-light)] lg:hidden">STATUS</div>
                        <StatusBadge status={document.indexing_status} />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          aria-label={`Delete ${document.filename}`}
                          title="Delete document"
                          disabled={deletingId === document.id}
                          onClick={() => void handleDelete(document)}
                          className="flex h-8 w-8 items-center justify-center text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--danger)] disabled:opacity-50"
                        >
                          {deletingId === document.id ? (
                            <LoaderCircle className="animate-spin" size={15} />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3">
              <span className="text-xs text-[var(--muted)]">
                Page {page} of {pages} · {total} documents
              </span>
              <div className="flex gap-2">
                <button type="button" className="btn" disabled={loading || page <= 1} onClick={() => void refresh(page - 1)}>
                  Previous
                </button>
                <button type="button" className="btn" disabled={loading || page >= pages} onClick={() => void refresh(page + 1)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] p-8 text-center transition hover:border-[var(--primary)]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
            <Upload size={18} strokeWidth={1.7} />
          </div>
          <h4 className="mt-4">Add more evidence</h4>
          <p className="mx-auto mt-1 max-w-md text-[10px]">
            Upload documents to use as evidence in future analyses and AI chat.
          </p>
          <div className="mt-5">{renderUploadButton()}</div>
          <div className="mt-4 font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--muted-light)]">
            PDF · DOCX · TXT · CSV · PNG · JPG · WEBP · MAX 10 MB
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
