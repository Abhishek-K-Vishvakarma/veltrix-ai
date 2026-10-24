ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS indexing_status VARCHAR(20) NOT NULL DEFAULT 'not_indexed',
    ADD COLUMN IF NOT EXISTS indexing_error TEXT NULL,
    ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMP WITH TIME ZONE NULL;

CREATE INDEX IF NOT EXISTS ix_documents_indexing_status
    ON documents (indexing_status);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    page_number INTEGER NULL,
    content TEXT NOT NULL,
    embedding JSON NOT NULL,
    CONSTRAINT uq_knowledge_chunk_document_index
        UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS ix_knowledge_chunks_document_id
    ON knowledge_chunks (document_id);

CREATE TABLE IF NOT EXISTS knowledge_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT 'New conversation',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_knowledge_conversations_user_id
    ON knowledge_conversations (user_id);

CREATE INDEX IF NOT EXISTS ix_knowledge_conversations_user_updated
    ON knowledge_conversations (user_id, updated_at);

CREATE TABLE IF NOT EXISTS knowledge_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL
        REFERENCES knowledge_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    citations JSON NOT NULL DEFAULT '[]',
    ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE knowledge_messages
    ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS ix_knowledge_messages_conversation_id
    ON knowledge_messages (conversation_id);
