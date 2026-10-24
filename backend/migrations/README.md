# Database migrations

This project does not currently use Alembic. Development startup creates new
tables from SQLAlchemy metadata, but `create_all()` does not add columns to an
existing table.

Before deploying the knowledge base changes to an existing PostgreSQL
database, apply `001_knowledge_base.sql` once using the database migration
operator, for example:

```powershell
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/001_knowledge_base.sql
```

The migrations are safe to re-run and do not delete existing data. Apply
`002_projects.sql` after `001_knowledge_base.sql` to add user-owned projects
and their analysis/document associations:

```powershell
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/002_projects.sql
```

Apply `003_user_preferences.sql` to add per-user workspace settings:

```powershell
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/003_user_preferences.sql
```
