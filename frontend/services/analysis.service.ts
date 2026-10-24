import { API_BASE_URL, ApiError, apiDelete, apiGet, apiPatch, apiPostForm, qs } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { Paginated } from "@/types/admin";
import type { AnalysisDetail, AnalysisRow, StepEvent } from "@/types/analysis";

/** Starts an analysis. Returns immediately (status "processing"); then call streamAnalysis(). */
export function createAnalysis(problem: string, files: File[] = []): Promise<AnalysisRow> {
  const form = new FormData();
  form.append("problem", problem);
  files.forEach((f) => form.append("files", f));
  return apiPostForm<AnalysisRow>("/analyses", form);
}

export const listMyAnalyses = (p: { q?: string; status?: string; category?: string; page?: number; size?: number } = {}) =>
  apiGet<Paginated<AnalysisRow>>(`/analyses${qs(p)}`);

export const getAnalysis = (id: number) => apiGet<AnalysisDetail>(`/analyses/${id}`);
export const deleteAnalysis = (id: number) => apiDelete<{ message: string }>(`/analyses/${id}`);
export const toggleAction = (analysisId: number, actionId: number, is_done: boolean) =>
  apiPatch<{ id: number; is_done: boolean }>(`/analyses/${analysisId}/actions/${actionId}`, { is_done });

/** Live pipeline progress (SSE over fetch so the Authorization header can be sent). */
export async function streamAnalysis(
  id: number,
  onStep: (e: StepEvent) => void,
  signal?: AbortSignal
): Promise<"completed" | "failed" | "timeout"> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/analyses/${id}/stream`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  });
  if (!res.ok || !res.body) throw new ApiError(res.status, "Could not open the progress stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const event = /event: (.+)/.exec(chunk)?.[1];
      const data = /data: (.+)/.exec(chunk)?.[1];
      if (!event || !data) continue;
      const json = JSON.parse(data);
      if (event === "step") onStep(json as StepEvent);
      if (event === "done") return json.status as "completed" | "failed" | "timeout";
    }
  }
  return "timeout";
}

/** Download an evidence file as a blob URL (needs the auth header, so <img src> cannot be used directly). */
export async function fetchEvidenceFile(analysisId: number, fileId: number): Promise<string> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/analyses/${analysisId}/files/${fileId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, "Could not load the file");
  return URL.createObjectURL(await res.blob());
}