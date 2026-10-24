"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, FileText, LoaderCircle, RefreshCw, Trash2, Upload } from "lucide-react";
import UserLayout from "@/components/layout/user-layout";
import {
  deleteKnowledgeDocument,
  getKnowledgeDocuments,
  indexKnowledgeDocument,
  uploadKnowledgeDocument,
  type KnowledgeDocument,
} from "@/services/knowledge.service";

function formatSize(size: number) {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setError("");
      setDocuments(await getKnowledgeDocuments());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function onUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      await uploadKnowledgeDocument(file);
      setNotice(`${file.name} uploaded. Index it to make it searchable.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onIndex(document: KnowledgeDocument) {
    setBusyId(document.id);
    setError("");
    setNotice("");
    try {
      await indexKnowledgeDocument(document.id);
      setNotice(`${document.filename} is indexed and ready for chat.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Indexing failed.");
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(document: KnowledgeDocument) {
    if (!window.confirm(`Delete ${document.filename}? Its indexed content will also be removed.`)) return;
    setBusyId(document.id);
    setError("");
    try {
      await deleteKnowledgeDocument(document.id);
      setDocuments((items) => items.filter((item) => item.id !== document.id));
      setNotice(`${document.filename} deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete document.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mono mb-2 text-[10px] uppercase tracking-[.14em] text-[var(--muted-light)]">VELTRIX / KNOWLEDGE</p>
            <h1>Your knowledge base.</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">Upload and index your documents so VELTRIX can search them and answer with citations.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/chat" className="btn">Open AI chat <ArrowUpRight size={14} /></Link>
            <button className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <LoaderCircle className="animate-spin" size={14} /> : <Upload size={14} />}
              Upload document
            </button>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".pdf,.txt,.csv,.docx,.png,.jpg,.jpeg,.webp"
              onChange={(event) => void onUpload(event.target.files?.[0])}
            />
          </div>
        </header>

        {error && <div role="alert" className="border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}
        {notice && <div role="status" className="border border-[var(--line)] bg-[var(--success-soft)] p-3 text-sm text-[var(--success)]">{notice}</div>}

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <div>
              <h3>Your documents</h3>
              <p className="mt-1 text-xs text-[var(--muted)]">{documents.length} document{documents.length === 1 ? "" : "s"} · PDF, DOCX, TXT, CSV, PNG, JPG, WEBP · 10 MB max each</p>
            </div>
            <button className="btn" onClick={() => void refresh()} aria-label="Refresh documents"><RefreshCw size={14} /></button>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 p-8 text-sm text-[var(--muted)]"><LoaderCircle className="animate-spin" size={16} />Loading your documents…</div>
          ) : documents.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="mx-auto text-[var(--muted-light)]" size={28} />
              <h3 className="mt-3">No documents yet</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Upload a document, then index it to use it in AI chat.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {documents.map((document) => (
                <li key={document.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <FileText className="shrink-0 text-[var(--primary)]" size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--ink)]">{document.filename}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {document.content_type.split("/").pop()?.toUpperCase()} · {formatSize(document.size_bytes)} · {new Date(document.created_at).toLocaleDateString()}
                    </p>
                    {document.indexing_error && <p className="mt-1 text-xs text-[var(--danger)]">{document.indexing_error}</p>}
                  </div>
                  <span className={`badge ${document.indexing_status === "indexed" ? "badge-success" : document.indexing_status === "processing" ? "badge-primary" : document.indexing_status === "failed" ? "badge-danger" : ""}`}>
                    {document.indexing_status === "not_indexed" ? "Not indexed" : document.indexing_status[0].toUpperCase() + document.indexing_status.slice(1)}
                  </span>
                  <button className="btn" disabled={busyId === document.id || uploading} onClick={() => void onIndex(document)}>
                    {busyId === document.id ? <LoaderCircle className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                    {document.indexing_status === "indexed" ? "Re-index" : "Index for AI"}
                  </button>
                  <button className="btn" aria-label={`Delete ${document.filename}`} disabled={busyId === document.id} onClick={() => void onDelete(document)}>
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </UserLayout>
  );
}
