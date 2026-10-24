import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";

export type ProjectStatus = "active" | "archived";

export interface ProjectResource {
  id: number;
  title?: string;
  filename?: string;
  status?: string;
  category?: string;
  content_type?: string;
  size_bytes?: number;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  analysis_count: number;
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  analyses: ProjectResource[];
  documents: ProjectResource[];
}

export interface ProjectsResponse {
  items: Project[];
  total: number;
  active_count: number;
  analysis_count: number;
}

export function getProjects(): Promise<ProjectsResponse> {
  return apiGet("/projects");
}

export function getProject(id: number): Promise<ProjectDetail> {
  return apiGet(`/projects/${id}`);
}

export function createProject(payload: {
  name: string;
  description: string;
}): Promise<Project> {
  return apiPost("/projects", payload);
}

export function updateProject(
  id: number,
  payload: Partial<Pick<Project, "name" | "description" | "status">>,
): Promise<Project> {
  return apiPatch(`/projects/${id}`, payload);
}

export function deleteProject(id: number): Promise<void> {
  return apiDelete(`/projects/${id}`);
}

export function addProjectResource(
  projectId: number,
  kind: "analyses" | "documents",
  resourceId: number,
): Promise<ProjectDetail> {
  return apiPost(`/projects/${projectId}/${kind}/${resourceId}`);
}

export function removeProjectResource(
  projectId: number,
  kind: "analyses" | "documents",
  resourceId: number,
): Promise<void> {
  return apiDelete(`/projects/${projectId}/${kind}/${resourceId}`);
}
