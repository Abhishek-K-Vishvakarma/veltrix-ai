"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, FileText, LoaderCircle, Plus, Trash2 } from "lucide-react";
import UserLayout from "@/components/layout/user-layout";
import { getDocuments, type StoredDocument } from "@/services/knowledge.service";
import { getAnalysesPage, type Analysis } from "@/services/analysis.service";
import {
  addProjectResource,
  getProject,
  removeProjectResource,
  updateProject,
  type ProjectDetail,
  type ProjectResource,
} from "@/services/projects.service";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!Number.isInteger(projectId) || projectId < 1) {
      setError("Invalid project.");
      setLoading(false);
      return;
    }
    setError("");
    try {
      const [detail, documentPage, analysisPage] = await Promise.all([
        getProject(projectId),
        getDocuments(1, 100),
        getAnalysesPage(undefined, 1, 100),
      ]);
      setProject(detail);
      setName(detail.name);
      setDescription(detail.description);
      setDocuments(documentPage.items);
      setAnalyses(analysisPage.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load project.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const availableDocuments = useMemo(() => {
    const attached = new Set(project?.documents.map((item) => item.id) ?? []);
    return documents.filter((item) => !attached.has(item.id));
  }, [documents, project?.documents]);
  const availableAnalyses = useMemo(() => {
    const attached = new Set(project?.analyses.map((item) => item.id) ?? []);
    return analyses.filter((item) => !attached.has(Number(item.id)));
  }, [analyses, project?.analyses]);

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!project) return;
    setBusy(true);
    setError("");
    try {
      await updateProject(project.id, { name: name.trim(), description: description.trim() });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update project.");
    } finally {
      setBusy(false);
    }
  }

  async function attach(kind: "analyses" | "documents", resourceId: number) {
    if (!project) return;
    setBusy(true);
    setError("");
    try {
      setProject(await addProjectResource(project.id, kind, resourceId));
      if (kind === "documents") setSelectedDocument("");
      else setSelectedAnalysis("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add item to project.");
    } finally {
      setBusy(false);
    }
  }

  async function detach(kind: "analyses" | "documents", resourceId: number) {
    if (!project) return;
    setBusy(true);
    setError("");
    try {
      await removeProjectResource(project.id, kind, resourceId);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove item from project.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <UserLayout><div className="flex items-center justify-center gap-2 p-10 text-sm text-[var(--muted)]"><LoaderCircle size={16} className="animate-spin" />Loading project…</div></UserLayout>;
  }

  if (!project) {
    return <UserLayout><div className="space-y-4"><Link className="btn" href="/projects"><ArrowLeft size={14} />Projects</Link>{error && <div role="alert" className="border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}</div></UserLayout>;
  }

  return (
    <UserLayout>
    <div className="space-y-6">
      <Link className="btn" href="/projects"><ArrowLeft size={14} />All projects</Link>
      <header className="border-b border-[var(--line)] pb-5">
        <p className="mono mb-2 text-[9px] uppercase tracking-[0.14em] text-[var(--muted-light)]">VELTRIX / PROJECTS</p>
        <h1>{project.name}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{project.description || "No description provided."}</p>
      </header>
      {error && <div role="alert" className="border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}

      <form onSubmit={(event) => void saveProject(event)} className="card grid gap-3 p-5 md:grid-cols-[1fr_2fr_auto] md:items-end">
        <label className="text-xs font-medium">Project name<input className="input mt-1" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="text-xs font-medium">Description<input className="input mt-1" maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <button className="btn btn-primary" disabled={busy || !name.trim()} type="submit">Save changes</button>
      </form>

      <section className="grid gap-3 sm:grid-cols-2">
        <ResourceSection
          title="Documents"
          resources={project.documents}
          available={availableDocuments.map((item) => ({ id: item.id, label: item.filename }))}
          selected={selectedDocument}
          onSelect={setSelectedDocument}
          onAdd={() => void attach("documents", Number(selectedDocument))}
          onRemove={(id) => void detach("documents", id)}
          disabled={busy}
        />
        <ResourceSection
          title="Analyses"
          resources={project.analyses}
          available={availableAnalyses.map((item) => ({ id: Number(item.id), label: item.title || `Analysis #${item.id}` }))}
          selected={selectedAnalysis}
          onSelect={setSelectedAnalysis}
          onAdd={() => void attach("analyses", Number(selectedAnalysis))}
          onRemove={(id) => void detach("analyses", id)}
          disabled={busy}
        />
      </section>
    </div>
    </UserLayout>
  );
}

function ResourceSection({
  title,
  resources,
  available,
  selected,
  onSelect,
  onAdd,
  onRemove,
  disabled,
}: {
  title: string;
  resources: ProjectResource[];
  available: { id: number; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  disabled: boolean;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-[var(--line)] p-4">
        <h3>{title} <span className="text-[var(--muted)]">({resources.length})</span></h3>
        <div className="mt-3 flex gap-2">
          <select className="input min-w-0" value={selected} onChange={(event) => onSelect(event.target.value)}>
            <option value="">Add existing {title.toLowerCase()}</option>
            {available.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <button type="button" className="btn btn-primary" onClick={onAdd} disabled={disabled || !selected} aria-label={`Add ${title.toLowerCase()}`}><Plus size={14} /></button>
        </div>
      </div>
      {resources.length === 0 ? (
        <p className="p-5 text-sm text-[var(--muted)]">No {title.toLowerCase()} linked yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)]">
          {resources.map((resource) => (
            <li key={resource.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-2">
                <FileText size={15} className="shrink-0 text-[var(--primary)]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{resource.title || resource.filename}</p>
                  <p className="text-xs text-[var(--muted)]">{resource.status || resource.category || formatDate(resource.created_at)}</p>
                </div>
              </div>
              <button type="button" className="btn" onClick={() => onRemove(resource.id)} disabled={disabled} aria-label={`Remove ${resource.title || resource.filename}`}><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
