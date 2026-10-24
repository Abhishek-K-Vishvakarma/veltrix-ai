
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "@/services/api";

export interface Analysis {
  id: string | number;
  status: string;
  input_type?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  result?: unknown;
  result_json?: unknown;
  error_message?: string | null;
  category?: string;
  summary?: string | null;
  confidence?: number | null;
  processing_time_ms?: number | null;
  needs_more_evidence?: boolean;
  knowledge_document_count?: number;
}

export interface CreateAnalysisPayload {
  problem?: string;
  files?: File[];
  knowledgeDocumentIds?: number[];
  outputDetail?: "concise" | "detailed";
}

export interface AnalysisActionPayload {
  [key: string]: unknown;
}

// 1. Create a new analysis
export async function createAnalysis(
  payload: CreateAnalysisPayload
): Promise<Analysis> {
  const problem = (payload.problem ?? "").trim();
  const files = payload.files ?? [];
  const knowledgeDocumentIds = payload.knowledgeDocumentIds ?? [];
  const outputDetail = payload.outputDetail ?? "detailed";

  if (!problem && files.length === 0 && knowledgeDocumentIds.length === 0) {
    throw new Error("Enter an analysis request, upload a file, or select an indexed Knowledge Base document.");
  }

  const formData = new FormData();

  formData.append("problem", problem);
  formData.append("output_detail", outputDetail);

  files.forEach((file) => {
    formData.append("files", file);
  });
  knowledgeDocumentIds.forEach((id) => {
    formData.append("knowledge_document_ids", String(id));
  });

  return apiPost<Analysis>("/analyses", formData);
}

// 2. Get analysis history
// export function getAnalyses(
//   inputType?: string
// ): Promise<Analysis[]> {
//   const query = inputType
//     ? `?input_type=${encodeURIComponent(inputType)}`
//     : "";

//   return apiGet<Analysis[]>(`/analyses${query}`);
// }

// 3. Get a single analysis
export function getAnalysis(
  id: string | number
): Promise<AnalysisDetail> {
  return apiGet<AnalysisDetail>(`/analyses/${id}`);
}

// 4. Update an action item
export function updateAnalysisAction(
  analysisId: string | number,
  actionId: string | number,
  payload: AnalysisActionPayload
): Promise<unknown> {
  return apiPatch(
    `/analyses/${analysisId}/actions/${actionId}`,
    payload
  );
}


export interface AnalysisEvidence {
  label: string;
  value: string;
  source: string;
  page?: number | null;
  location?: string | null;
  extraction_method?: string | null;
  confidence?: number | null;
  unit?: string | null;
}

export interface AnalysisCalculation {
  label: string;
  expression: string;
  result: number | string | null;
  inputs?: string[];
  unit?: string | null;
}

export interface AnalysisFinding {
  id: number;
  title: string;
  description: string;
  source: string;
  confidence: number;
}

export interface AnalysisAction {
  id: number;
  action: string;
  priority: number;
  is_done: boolean;
}

export interface ReasoningLog {
  id: number;
  step: string;
  message: string;
  status: string;
  duration_ms?: number | null;
}

export interface AnalysisDetail {
  id: number;
  title: string;
  category: string;
  input_type: string;
  status: string;
  confidence: number | null;
  summary: string;
  analysis_type?: string;
  answer?: string;
  reasoning_summary?: string;
  problem: string;
  error_message: string | null;
  missing_evidence_message: string;
  needs_more_evidence: boolean;
  uncertainties?: string[];
  missing_evidence?: string[];
  follow_up_questions?: string[];
  sources?: { filename: string; page?: number | null; reference?: string | null }[];
  provider_status?: string;
  processing_time_ms: number | null;
  created_at: string;
  evidence: AnalysisEvidence[];
  calculations: AnalysisCalculation[];
  findings: AnalysisFinding[];
  actions: AnalysisAction[];
  reasoning_logs: ReasoningLog[];
  evidence_files: {
    id: number;
    filename: string;
    content_type: string;
    size_bytes: number;
  }[];
  knowledge_sources?: {
    document_id: number;
    filename: string;
    chunk_count: number;
    pages: number[];
  }[];
  evidence_source_count?: number;
}

// 5. Delete an analysis
export function deleteAnalysis(
  id: string | number
): Promise<void> {
  return apiDelete<void>(`/analyses/${id}`);
}


export interface AnalysisListResponse {
  items: Analysis[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

type AnalysisListApiResponse = Analysis[] | AnalysisListResponse;

export async function getAnalysesPage(
  inputType?: string,
  page = 1,
  size = 20
): Promise<AnalysisListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (inputType) {
    params.set("input_type", inputType);
  }

  const response = await apiGet<AnalysisListApiResponse>(
    `/analyses?${params.toString()}`
  );

  // Backward compatibility if the API returns a plain array.
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      page,
      size,
      pages: response.length > 0 ? 1 : 0,
    };
  }

  return response;
}

// Keeps the existing History page API compatible.
export async function getAnalyses(
  inputType?: string
): Promise<Analysis[]> {
  const response = await getAnalysesPage(inputType);
  return response.items;
}



export interface AnalysisStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  pending: number;
}

export function getAnalysisStats(): Promise<AnalysisStats> {
  return apiGet<AnalysisStats>("/analyses/stats");
}

export type InsightType = "OPPORTUNITY" | "RISK" | "TREND" | "RECOMMENDATION";

export interface AnalysisInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number | null;
  source: string | null;
  analysis_id: number;
  analysis_title: string;
  date: string | null;
}

export interface AnalysisInsights {
  total: number;
  high_confidence_count: number;
  risk_count: number;
  opportunity_count: number;
  featured: AnalysisInsight | null;
  items: AnalysisInsight[];
}

export function getAnalysisInsights(): Promise<AnalysisInsights> {
  return apiGet<AnalysisInsights>("/analyses/insights");
}
