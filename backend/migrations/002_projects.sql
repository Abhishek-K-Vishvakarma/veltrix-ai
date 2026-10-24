CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_projects_user_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS ix_projects_user_id ON projects (user_id);
CREATE INDEX IF NOT EXISTS ix_projects_user_updated ON projects (user_id, updated_at);

CREATE TABLE IF NOT EXISTS project_analyses (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    analysis_id INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, analysis_id)
);

CREATE TABLE IF NOT EXISTS project_documents (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, document_id)
);
