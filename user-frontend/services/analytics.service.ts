import { apiGet } from "@/services/api";

export interface AnalyticsBucket {
  date: string;
  label: string;
  count: number;
}

export interface AnalyticsCount {
  label: string;
  count: number;
}

export interface AnalyticsData {
  total_analyses: number;
  completed_analyses: number;
  partial_analyses: number;
  failed_analyses: number;
  success_rate: number;
  average_confidence: number | null;
  average_processing_time_ms: number | null;
  confidence_distribution: AnalyticsCount[];
  activity: AnalyticsBucket[];
  granularity: "day" | "month";
  input_mix: AnalyticsCount[];
  evidence_backed_count: number;
  actionable_count: number;
}

export interface AnalyticsPeriod {
  startDate: string;
  endDate: string;
}

export async function getAnalytics(
  period: AnalyticsPeriod | null,
): Promise<AnalyticsData> {
  const params = new URLSearchParams();
  if (period) {
    params.set("start_date", period.startDate);
    params.set("end_date", period.endDate);
  }
  const query = params.size ? `?${params.toString()}` : "";
  return apiGet<AnalyticsData>(`/analytics${query}`);
}
