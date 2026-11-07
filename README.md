# VELTRIX AI
Visual Evidence & Logical Thinking for Real-world Intelligence eXecution.
Observe -> Understand -> Reason -> Verify -> Act

## Run backend

The backend's database is selected by `DATABASE_URL`. Copying
`backend/.env.example` creates a local-development configuration that connects
to PostgreSQL on `localhost`; update its username, password, and database name
to match your local PostgreSQL setup. Keep the local database and credentials
available before starting the backend.

For deployment, configure `DATABASE_URL` in the Render service's Environment
settings with the Supabase PostgreSQL connection string. Do not commit the
Supabase URL or credentials. `backend/.env` is ignored by Git, so local
development can use PostgreSQL while Render continues to use Supabase after
code is pushed.

```
cd backend
python -m venv venv
venv\Scripts\activate        # Windows  (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt -r requirements-ai.txt
copy .env.example .env       # Mac/Linux: cp .env.example .env
uvicorn app.main:app --reload
```

`pytesseract` is only a Python wrapper; install the Tesseract executable and
English language data separately. On Windows, install Tesseract and set
`TESSERACT_CMD` to its executable path if it is not on `PATH`. On Linux, install
`tesseract-ocr` and `tesseract-ocr-eng`; the backend uses `tesseract` from
`PATH` by default. Configure `GEMINI_API_KEY` to enable Gemini Vision.

Open http://127.0.0.1:8000/docs

## Run frontend
See frontend/README.md
