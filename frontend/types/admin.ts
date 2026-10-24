import type { Role } from "@/types/auth";

export interface Paginated<T> { items: T[]; total: number; page: number; size: number; pages: number }

export interface AdminUser {
  id: number; email: string; full_name: string; role: Role; is_active: boolean;
  created_at: string; last_login_at: string | null; analysis_count?: number;
}
export interface AdminUserDetail extends AdminUser { analysis_count: number; avg_confidence: number }
export interface AdminUserCreate { email: string; full_name?: string; password: string; role?: Role }
export interface AdminUserUpdate { full_name?: string; role?: Role; is_active?: boolean }

export interface AnalysisRow {
  id: number; title: string; category: string; input_type: string; status: string;
  confidence: number | null; processing_time_ms: number | null; created_at: string;
  user_id: number; user_email: string | null;
}
export interface AnalysisDetail extends AnalysisRow {
  summary: string; error_message: string | null; completed_at: string | null;
  findings: { id: number; title: string; description: string; source: string | null; confidence: number | null }[];
  actions: { id: number; action: string; priority: number; is_done: boolean }[];
  reasoning_logs: { id: number; step: string; message: string; status: string; duration_ms: number | null; created_at: string }[];
  evidence_files: { id: number; filename: string; content_type: string; size_bytes: number }[];
}

export interface DashboardData {
  users: { total: number; active: number; admins: number };
  analyses: { total: number; completed: number; failed: number; in_progress: number };
  avg_confidence: number; avg_processing_ms: number; estimated_time_saved_hours: number;
  analysis_activity: { date: string; count: number }[];
  categories: { category: string; count: number }[];
  recent_analyses: { id: number; title: string; status: string; confidence: number | null; user_email: string | null; created_at: string }[];
  recent_errors: { id: number; action: string; detail: string; created_at: string }[];
}

export interface AiPerformance {
  days: number; total_requests: number; successful: number; failed: number; success_rate: number;
  avg_latency_ms: number; p95_latency_ms: number; total_tokens: number; prompt_tokens: number;
  completion_tokens: number; avg_confidence: number;
  daily: { date: string; requests: number; failures: number; avg_latency_ms: number }[];
}
export interface ModelsInfo {
  provider: string; active_model: string; configured_model: string; api_key_configured: boolean; mock_mode: boolean;
  usage: { model: string; requests: number; success_rate: number; avg_latency_ms: number; total_tokens: number; last_used: string | null }[];
}

export interface LogRow {
  id: number; user_id: number | null; user_email: string | null; action: string; resource: string;
  detail: string; level: "info" | "warning" | "error"; ip: string | null; created_at: string;
}
export interface ErrorMonitoring {
  error_logs: LogRow[];
  failed_analyses: { id: number; title: string; error_message: string | null; user_email: string | null; created_at: string }[];
  total_error_logs: number; total_failed_analyses: number;
}

export interface KnowledgeSourceRow {
  id: number; name: string; source_type: string; status: string; chunk_count: number;
  size_bytes: number; owner_email: string | null; created_at: string;
}

export interface SystemHealth {
  api: string; database: { status: string; latency_ms?: number; detail?: string };
  gemini_configured: boolean; uptime_seconds: number; python: string; platform: string;
}
export interface SystemMetrics {
  counts: Record<"users" | "analyses" | "evidence_files" | "documents" | "knowledge_sources" | "activity_logs", number>;
  storage_bytes: number; storage_mb: number;
}
export interface SystemSettings {
  frontend_url: string; access_token_minutes: number; gemini_model: string; gemini_configured: boolean; upload_dir: string;
}