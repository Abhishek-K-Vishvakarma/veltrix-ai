import { apiDelete, apiGet, apiPost } from "@/services/api";

export interface KnowledgeDocument {
  id: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  indexing_status: "not_indexed" | "processing" | "indexed" | "failed";
  indexing_error: string | null;
  indexed_at: string | null;
}

export interface KnowledgeCitation {
  document_id: number;
  filename: string;
  page_number: number | null;
  chunk_id: number;
  content: string;
  score: number;
}

export interface KnowledgeConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  citations: KnowledgeCitation[];
  ai_generated: boolean;
  created_at: string;
}

export interface ConversationDetail extends KnowledgeConversation {
  messages: KnowledgeMessage[];
}

export interface StoredDocument {
  id: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export interface DocumentsPage {
  items: StoredDocument[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export function getDocuments(page = 1, size = 100): Promise<DocumentsPage> {
  return apiGet(`/documents?page=${page}&size=${size}`);
}

export function getKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  return apiGet("/knowledge/documents");
}

export function uploadKnowledgeDocument(file: File): Promise<StoredDocument> {
  const form = new FormData();
  form.append("file", file);
  return apiPost("/documents", form);
}

export function indexKnowledgeDocument(
  documentId: number,
): Promise<KnowledgeDocument> {
  return apiPost(`/knowledge/documents/${documentId}/index`);
}

export function deleteKnowledgeDocument(documentId: number): Promise<void> {
  return apiDelete(`/documents/${documentId}`);
}

export function getConversations(): Promise<{
  items: KnowledgeConversation[];
  total: number;
  page: number;
  size: number;
  pages: number;
}> {
  return apiGet("/knowledge/conversations");
}

export function getConversation(id: number): Promise<ConversationDetail> {
  return apiGet(`/knowledge/conversations/${id}`);
}

export function createConversation(
  title?: string,
): Promise<KnowledgeConversation> {
  return apiPost("/knowledge/conversations", title ? { title } : {});
}

export function deleteConversation(id: number): Promise<void> {
  return apiDelete(`/knowledge/conversations/${id}`);
}

export function askKnowledge(payload: {
  question: string;
  document_ids?: number[];
  conversation_id?: number;
}): Promise<{
  conversation_id: number;
  answer: string;
  ai_generated: boolean;
  citations: KnowledgeCitation[];
}> {
  return apiPost("/knowledge/ask", payload);
}
