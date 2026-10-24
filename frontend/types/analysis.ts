export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

export interface AnalysisRow {
  id: number; title: string; category: string; input_type: string; status: AnalysisStatus;
  confidence: number | null; processing_time_ms: number | null; created_at: string;
}

export interface AnalysisDetail extends AnalysisRow {
  problem: string; summary: string; error_message: string | null;
  needs_more_evidence: boolean; missing_evidence_message: string;
  evidence: { label: string; value: string; source: string; page: number | null }[];
  calculations: { label: string; expression: string; result: number | null }[];
  findings: { id: number; title: string; description: string; source: string | null; confidence: number | null }[];
  actions: { id: number; action: string; priority: number; is_done: boolean }[];
  reasoning_logs: { id: number; step: string; message: string; status: string; duration_ms: number | null }[];
  evidence_files: { id: number; filename: string; content_type: string; size_bytes: number }[];
}

export interface StepEvent { id: number; step: string; message: string; status: string }