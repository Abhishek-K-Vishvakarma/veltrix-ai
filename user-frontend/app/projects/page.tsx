"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FolderKanban,
  LoaderCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import UserLayout from "@/components/layout/user-layout";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type Project,
  type ProjectsResponse,
} from "@/services/projects.service";

function ProjectStatusBadge({ status }: { status: Project["status"] }) {
  return status === "archived" ? (
    <span className="badge"><Clock3 size={11} />Archived</span>
  ) : (
    <span className="badge badge-success"><CheckCircle2 size={11} />Active</span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function ProjectsPage() {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      setData(await getProjects());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const projects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.items ?? []).filter((project) =>
      `${project.name} ${project.description}`.toLowerCase().includes(query),
    );
  }, [data?.items, search]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createProject({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      setShowCreate(false);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(project: Project) {
    const status = project.status === "active" ? "archived" : "active";
    setError("");
    try {
      await updateProject(project.id, { status });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update project.");
    }
  }

  async function handleDelete(project: Project) {
    if (!window.confirm(`Delete "${project.name}"? This only removes the project and its links, not the analyses or documents.`)) return;
    setError("");
    try {
      await deleteProject(project.id);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete project.");
    }
  }

  const totalProjects = data?.total ?? 0;
  const activeProjects = data?.active_count ?? 0;
  const analyses = data?.analysis_count ?? 0;

  return (
    <UserLayout>
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 border-b border-[var(--line)] pb-6 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="signal-dot" />
            <span className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-light)]">VELTRIX / PROJECTS</span>
          </div>
          <h1>Projects.</h1>
          <p className="mt-2 max-w-2xl">Organize analyses and documents into focused intelligence workspaces.</p>
        </div>
        <button type="button" className="btn btn-primary shrink-0" onClick={() => setShowCreate((open) => !open)}>
          {showCreate ? <X size={14} /> : <Plus size={14} />}
          {showCreate ? "Cancel" : "New Project"}
        </button>
      </section>

      {error && <div role="alert" className="border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}

      {showCreate && (
        <form onSubmit={(event) => void handleCreate(event)} className="card grid gap-3 p-5 md:grid-cols-[1fr_2fr_auto] md:items-end">
          <label className="text-xs font-medium text-[var(--ink)]">
            Project name
            <input className="input mt-1" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--ink)]">
            Description
            <input className="input mt-1" maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={saving || !name.trim()}>
            {saving && <LoaderCircle size={14} className="animate-spin" />}
            Create project
          </button>
        </form>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Projects" value={loading ? "—" : totalProjects} note="Total workspaces" icon={<FolderKanban size={16} className="text-[var(--primary)]" />} />
        <SummaryCard label="Active" value={loading ? "—" : activeProjects} note="Active workspaces" icon={<Sparkles size={16} className="text-[var(--success)]" />} />
        <SummaryCard label="Analyses" value={loading ? "—" : analyses} note="Assigned across your projects" icon={<BarChart3 size={16} className="text-[var(--signal)]" />} />
      </section>

      <section className="card">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)]" />
            <input type="search" placeholder="Search projects..." className="input pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <span className="mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted-light)]">{projects.length} PROJECT{projects.length === 1 ? "" : "S"}</span>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-[var(--muted)]"><LoaderCircle size={16} className="animate-spin" />Loading projects…</div>
      ) : projects.length === 0 ? (
        <section className="border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] p-8 text-center">
          <FolderKanban className="mx-auto text-[var(--muted-light)]" size={24} />
          <h3 className="mt-3">{search ? "No matching projects" : "No projects yet"}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{search ? "Try another search." : "Create a workspace to organize your analyses and documents."}</p>
          {!search && <button type="button" className="btn btn-primary mt-4" onClick={() => setShowCreate(true)}><Plus size={13} />Create project</button>}
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]"><FolderKanban size={18} /></div>
                <button type="button" className="btn" onClick={() => void handleStatus(project)}>{project.status === "active" ? "Archive" : "Restore"}</button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <h3>{project.name}</h3>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="mt-2 min-h-10 text-sm text-[var(--muted)]">{project.description || "No description provided."}</p>
              <div className="mt-4 grid grid-cols-2 border-y border-[var(--line)] py-3">
                <div><div className="mono text-[8px] uppercase text-[var(--muted-light)]">Analyses</div><div className="mt-1 text-sm font-semibold">{project.analysis_count}</div></div>
                <div className="border-l border-[var(--line)] pl-4"><div className="mono text-[8px] uppercase text-[var(--muted-light)]">Documents</div><div className="mt-1 text-sm font-semibold">{project.document_count}</div></div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div><div className="mono text-[8px] uppercase text-[var(--muted-light)]">Last updated</div><div className="mt-1 text-xs text-[var(--muted)]">{formatDate(project.updated_at)}</div></div>
                <div className="flex items-center gap-2">
                  <button type="button" className="btn" aria-label={`Delete ${project.name}`} onClick={() => void handleDelete(project)}><Trash2 size={14} /></button>
                  <Link href={`/projects/${project.id}`} className="btn" aria-label={`Open ${project.name}`}><ArrowUpRight size={14} />Open</Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
    </UserLayout>
  );
}

function SummaryCard({ label, value, note, icon }: { label: string; value: number | string; note: string; icon: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between"><span className="mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted-light)]">{label}</span>{icon}</div>
      <div className="text-[27px] font-semibold tracking-[-0.04em] text-[var(--ink)]">{value}</div>
      <div className="mt-1 text-[10px] text-[var(--muted)]">{note}</div>
    </div>
  );
}
