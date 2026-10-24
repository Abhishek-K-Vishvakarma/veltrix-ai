import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostForm,
  apiPut,
  qs,
} from "@/lib/api";

import type {
  AdminUser,
  AdminUserCreate,
  AdminUserDetail,
  AdminUserUpdate,
  AiPerformance,
  AnalysisDetail,
  AnalysisRow,
  DashboardData,
  ErrorMonitoring,
  KnowledgeSourceRow,
  LogRow,
  ModelsInfo,
  Paginated,
  SystemHealth,
  SystemMetrics,
  SystemSettings,
} from "@/types/admin";

import type { Role } from "@/types/auth";

// ============================================================
// Dashboard
// ============================================================

export interface DashboardAnalysisStats {
  total: number;
  completed: number;
  failed: number;
  in_progress: number;
}

export interface DashboardUserStats {
  total: number;
  active: number;
  admins: number;
}

export interface DashboardActivity {
  date: string;
  count: number;
}

export interface DashboardCategory {
  name: string;
  value: number;
}

export interface DashboardRecentAnalysis {
  title: string;
  type: string;
  date: string;
  confidence: number;
  status: string;
}

export interface DashboardResponse {
  users: DashboardUserStats;
  analyses: DashboardAnalysisStats;
  avg_confidence: number;
  avg_processing_ms: number;
  estimated_time_saved_hours: number;
  analysis_activity: DashboardActivity[];
  categories: DashboardCategory[];
  recent_analyses: DashboardRecentAnalysis[];
  recent_errors: unknown[];
}

// Keep one dashboard function only.
// Existing dashboard response is preserved.
export const getDashboard = () =>
  apiGet<DashboardResponse>("/admin/dashboard");

// ============================================================
// Users
// ============================================================

type Page = {
  page?: number;
  size?: number;
};

export const listUsers = (
  p: Page & {
    q?: string;
    role?: Role;
    is_active?: boolean;
  } = {}
) =>
  apiGet<Paginated<AdminUser>>(
    `/admin/users${qs(p)}`
  );

export const getUser = (id: number) =>
  apiGet<AdminUserDetail>(
    `/admin/users/${id}`
  );

export const createUser = (body: AdminUserCreate) =>
  apiPost<AdminUser>(
    "/admin/users",
    body
  );

export const updateUser = (
  id: number,
  body: AdminUserUpdate
) =>
  apiPatch<AdminUser>(
    `/admin/users/${id}`,
    body
  );

export const resetUserPassword = (
  id: number,
  new_password: string
) =>
  apiPost<{ message: string }>(
    `/admin/users/${id}/reset-password`,
    { new_password }
  );

export const deleteUser = (id: number) =>
  apiDelete<{ message: string }>(
    `/admin/users/${id}`
  );

// ============================================================
// Analyses
// ============================================================

export const listAnalyses = (
  p: Page & {
    q?: string;
    status?: string;
    category?: string;
    user_id?: number;
  } = {}
) =>
  apiGet<Paginated<AnalysisRow>>(
    `/admin/analyses${qs(p)}`
  );

export const getAnalysis = (id: number) =>
  apiGet<AnalysisDetail>(
    `/admin/analyses/${id}`
  );

export const deleteAnalysis = (id: number) =>
  apiDelete<{ message: string }>(
    `/admin/analyses/${id}`
  );

// Admin creates an analysis
export function createAdminAnalysis(
  problem: string,
  files: File[] = []
) {
  const form = new FormData();

  form.append("problem", problem);

  files.forEach((file) => {
    form.append("files", file);
  });

  return apiPostForm<{
    id: number;
    status: string;
  }>("/admin/analyses", form);
}

// Retry failed analysis
export const retryAnalysis = (id: number) =>
  apiPost<{
    id: number;
    status: string;
  }>(
    `/admin/analyses/${id}/retry`,
    {}
  );

// ============================================================
// AI
// ============================================================

export const getAiPerformance = (days = 7) =>
  apiGet<AiPerformance>(
    `/admin/ai-performance${qs({ days })}`
  );

export const getModels = () =>
  apiGet<ModelsInfo>(
    "/admin/models"
  );

export const setActiveModel = (model: string) =>
  apiPut<{
    active_model: string;
  }>(
    "/admin/models/active",
    { model }
  );

// ============================================================
// Logs
// ============================================================

export const listLogs = (
  p: Page & {
    q?: string;
    level?: string;
    action?: string;
    user_id?: number;
  } = {}
) =>
  apiGet<Paginated<LogRow>>(
    `/admin/logs${qs(p)}`
  );

export const getErrorMonitoring = (
  limit = 30
) =>
  apiGet<ErrorMonitoring>(
    `/admin/logs/errors${qs({ limit })}`
  );

export const cleanupLogs = (
  older_than_days = 30
) =>
  apiDelete<{
    deleted: number;
  }>(
    `/admin/logs${qs({ older_than_days })}`
  );

// ============================================================
// Knowledge Sources
// ============================================================

export const listKnowledgeSources = (
  p: Page & {
    q?: string;
    status?: string;
  } = {}
) =>
  apiGet<Paginated<KnowledgeSourceRow>>(
    `/admin/knowledge-sources${qs(p)}`
  );

export const deleteKnowledgeSource = (
  id: number
) =>
  apiDelete<{
    message: string;
  }>(
    `/admin/knowledge-sources/${id}`
  );

export function uploadKnowledgeSource(
  file: File
) {
  const form = new FormData();

  form.append("file", file);

  return apiPostForm<{
    id: number;
    name: string;
    status: string;
  }>(
    "/admin/knowledge-sources",
    form
  );
}

// ============================================================
// System
// ============================================================

export const getSystemHealth = () =>
  apiGet<SystemHealth>(
    "/admin/system/health"
  );

export const getSystemMetrics = () =>
  apiGet<SystemMetrics>(
    "/admin/system/metrics"
  );

export const getSystemSettings = () =>
  apiGet<SystemSettings>(
    "/admin/system/settings"
  );