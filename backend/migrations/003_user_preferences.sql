CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferences JSON NOT NULL DEFAULT
        '{"theme":"light","language":"en","analysis_detail":"detailed","notifications":{"analysis_completed":true,"analysis_failed":true,"weekly_summary":false}}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_user_preferences_user_id
    ON user_preferences (user_id);
