import { apiGet } from "@/lib/api";

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

export async function getDashboard(): Promise<DashboardResponse> {
  return apiGet<DashboardResponse>("/admin/dashboard");
}