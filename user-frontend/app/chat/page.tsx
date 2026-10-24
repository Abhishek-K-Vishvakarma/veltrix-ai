"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Bot, FileText, LoaderCircle, MessageSquarePlus, Send, Sparkles, Trash2, UserRound } from "lucide-react";
import UserLayout from "@/components/layout/user-layout";
import {
  askKnowledge,
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  getKnowledgeDocuments,
  type ConversationDetail,
  type KnowledgeCitation,
  type KnowledgeConversation,
  type KnowledgeDocument,
  type KnowledgeMessage,
} from "@/services/knowledge.service";

export default function KnowledgeChatPage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [conversations, setConversations] = useState<KnowledgeConversation[]>([]);
  const [active, setActive] = useState<ConversationDetail | null>(null);
  const [selected, setSelected] = useState<number[] | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const indexed = documents.filter((document) => document.indexing_status === "indexed");

  const refresh = useCallback(async () => {
    try {
      setError("");
      const [docs, chats] = await Promise.all([getKnowledgeDocuments(), getConversations()]);
      setDocuments(docs);
      setConversations(chats.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load knowledge chat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length, sending]);

  async function openConversation(id: number) {
    setError("");
    try {
      setActive(await getConversation(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load conversation.");
    }
  }

  async function newConversation() {
    setError("");
    try {
      const conversation = await createConversation();
      const detail = await getConversation(conversation.id);
      setConversations((items) => [detail, ...items]);
      setActive(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create conversation.");
    }
  }

  async function removeConversation(id: number) {
    setError("");
    try {
      await deleteConversation(id);
      setConversations((items) => items.filter((item) => item.id !== id));
      if (active?.id === id) setActive(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete conversation.");
    }
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const text = question.trim();
    if (!text || sending) return;
    setQuestion("");
    setSending(true);
    setError("");
    const temporaryUserMessage: KnowledgeMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      citations: [],
      ai_generated: false,
      created_at: new Date().toISOString(),
    };
    setActive((current) => ({
      id: current?.id ?? 0,
      title: current?.title ?? text.slice(0, 200),
      created_at: current?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [...(current?.messages ?? []), temporaryUserMessage],
    }));
    try {
      const result = await askKnowledge({
        question: text,
        document_ids: selected ?? undefined,
        conversation_id: active?.id || undefined,
      });
      const detail = await getConversation(result.conversation_id);
      setActive(detail);
      setConversations((items) => [
        detail,
        ...items.filter((item) => item.id !== detail.id),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The response failed. Retry your question.");
      setQuestion(text);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function toggleDocument(id: number) {
    setSelected((current) => {
      const selectedIds = current ?? indexed.map((document) => document.id);
      return selectedIds.includes(id)
        ? selectedIds.filter((documentId) => documentId !== id)
        : [...selectedIds, id];
    });
  }

  return (
    <UserLayout>
      <section className="flex min-h-[calc(100vh-140px)] flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)] lg:flex-row">
        <aside className="flex w-full flex-col border-b border-[var(--line)] bg-[var(--surface-soft)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
            <div><p className="mono text-[9px] uppercase tracking-widest text-[var(--muted-light)]">VELTRIX</p><h3 className="mt-1">AI Chat</h3></div>
            <button className="btn" aria-label="New conversation" onClick={() => void newConversation()}><MessageSquarePlus size={15} /></button>
          </div>
          <div className="max-h-36 space-y-1 overflow-y-auto p-2 lg:max-h-60">
            {conversations.map((conversation) => (
              <div key={conversation.id} className={`flex items-center gap-1 border ${active?.id === conversation.id ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-transparent"}`}>
                <button className="min-w-0 flex-1 truncate px-2 py-2 text-left text-xs" onClick={() => void openConversation(conversation.id)}>{conversation.title}</button>
                <button className="p-2 text-[var(--muted-light)] hover:text-[var(--danger)]" aria-label={`Delete ${conversation.title}`} onClick={() => void removeConversation(conversation.id)}><Trash2 size={13} /></button>
              </div>
            ))}
            {!loading && conversations.length === 0 && <p className="p-2 text-xs text-[var(--muted)]">Your conversations will appear here.</p>}
          </div>
          <div className="border-t border-[var(--line)] p-3 lg:mt-auto">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold"><FileText size={14} />Use indexed documents</p>
            <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-[var(--text)]">
              <input type="checkbox" checked={selected === null} onChange={() => setSelected(selected === null ? [] : null)} />
              Search all indexed documents
            </label>
            <div className="max-h-36 space-y-2 overflow-y-auto">
              {indexed.map((document) => (
                <label key={document.id} className="flex cursor-pointer items-start gap-2 text-xs text-[var(--muted)]">
                  <input type="checkbox" checked={selected === null || selected.includes(document.id)} onChange={() => toggleDocument(document.id)} />
                  <span className="break-all">{document.filename}</span>
                </label>
              ))}
              {!loading && indexed.length === 0 && <p className="text-xs text-[var(--muted)]">Index documents in your <a className="text-[var(--primary)] underline" href="/knowledge">Knowledge Base</a> first.</p>}
            </div>
          </div>
        </aside>

        <div className="flex min-h-[540px] min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]"><Sparkles size={17} /></div>
            <div><h3>Ask your documents</h3><p className="text-xs text-[var(--muted)]">Answers are grounded in retrieved evidence and include citations.</p></div>
          </header>
          {error && <div role="alert" className="mx-4 mt-3 border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {loading ? <p className="flex items-center gap-2 text-sm text-[var(--muted)]"><LoaderCircle size={15} className="animate-spin" />Loading conversations…</p> : null}
            {!loading && !active?.messages.length && (
              <div className="mx-auto mt-12 max-w-md text-center">
                <Bot className="mx-auto text-[var(--primary)]" size={30} />
                <h3 className="mt-3">Ask a question about your files</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{indexed.length ? "Choose documents or search all indexed documents, then ask a question. VELTRIX will cite its sources." : "Upload and index documents in the Knowledge Base before asking questions."}</p>
              </div>
            )}
            {active?.messages.map((message) => (
              <article key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center ${message.role === "user" ? "bg-[var(--primary)] text-white" : "bg-[var(--primary-soft)] text-[var(--primary)]"}`}>
                  {message.role === "user" ? <UserRound size={15} /> : <Bot size={15} />}
                </div>
                <div className={`max-w-[85%] space-y-2 ${message.role === "user" ? "text-right" : ""}`}>
                  <div className={`whitespace-pre-wrap break-words border px-4 py-3 text-sm ${message.role === "user" ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--text)]"}`}>{message.content}</div>
                  {message.role === "assistant" && <p className="text-[10px] text-[var(--muted-light)]">{message.ai_generated ? "AI answer grounded in retrieved documents" : "Evidence unavailable · no AI-generated answer"}</p>}
                  {message.role === "assistant" && message.citations?.length > 0 && <CitationList citations={message.citations} />}
                </div>
              </article>
            ))}
            {sending && <p className="flex items-center gap-2 text-xs text-[var(--muted)]"><LoaderCircle size={14} className="animate-spin" />Searching evidence and preparing a grounded answer…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={(event) => void sendMessage(event)} className="border-t border-[var(--line)] p-3 sm:p-4">
            <div className="flex items-end gap-2 border border-[var(--line-strong)] bg-[var(--surface)] p-2 focus-within:border-[var(--primary)]">
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={onKeyDown} rows={2} maxLength={4000} placeholder="Ask about your indexed documents… (Enter to send, Shift+Enter for a new line)" className="max-h-40 min-h-12 flex-1 resize-y border-0 bg-transparent p-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted-light)]" />
              <button type="submit" aria-label={error && question.trim() ? "Retry question" : "Send question"} disabled={sending || !question.trim()} className="btn btn-primary mb-1 disabled:opacity-50">{sending ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />}{error && question.trim() ? "Retry" : ""}</button>
            </div>
            <p className="mt-2 text-[10px] text-[var(--muted-light)]">Document text is treated as evidence, not instructions. Verify important answers against the cited source.</p>
          </form>
        </div>
      </section>
    </UserLayout>
  );
}

function CitationList({ citations }: { citations: KnowledgeCitation[] }) {
  return (
    <details className="border border-[var(--line)] bg-[var(--surface)] text-left text-[var(--text)]">
      <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-[var(--primary)]">Sources ({citations.length})</summary>
      <ul className="space-y-2 border-t border-[var(--line)] p-3">
        {citations.map((citation) => (
          <li key={citation.chunk_id} className="text-xs">
            <p className="break-all font-semibold text-[var(--ink)]">{citation.filename}{citation.page_number ? ` · page ${citation.page_number}` : ""}</p>
            <p className="mt-1 line-clamp-3 text-[var(--muted)]">{citation.content}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
