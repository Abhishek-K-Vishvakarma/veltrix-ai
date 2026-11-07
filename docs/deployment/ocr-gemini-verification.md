# Production OCR and Gemini Vision verification

## Render environment

Set these on the Render backend service:

- `ENVIRONMENT=production`
- `DATABASE_URL` to the Render PostgreSQL connection string
- `SECRET_KEY` to a generated secret of at least 32 characters
- `GEMINI_API_KEY` to the key from the Google AI project
- `GEMINI_MODEL=gemini-3.1-flash-lite` (change only
  after verifying image input and structured JSON support for the replacement)
- `FRONTEND_URL` to the deployed Vercel origin
- `CORS_ORIGINS` to the allowed Vercel origin(s), comma-separated
- `TESSERACT_CMD=/usr/bin/tesseract` (the Docker image installs Tesseract there;
  this can be omitted to use the Linux `PATH` default)
- `UPLOAD_DIR=/app/uploads` (optional; the container creates this writable
  directory)

Never put Gemini credentials in frontend or Vercel environment variables. The
Docker image installs Tesseract and its English language data; do not use a
Windows executable path on Render. Render supplies `PORT`; the container binds
to it automatically. Set `SECRET_KEY` explicitly; the repository default is
only an invalid development placeholder, and rotating the key invalidates
existing login tokens.

## Vercel environment

For the `frontend` app, set `BACKEND_URL` to the Render backend origin, for
example `https://<render-service>.onrender.com`. This is used by the Next.js
`/api` rewrite and must be available when Vercel builds the app.
`NEXT_PUBLIC_API_URL` is optional; leave it unset when using that rewrite.
If configured for direct browser-to-Render calls, set it to the backend API
base URL and allow the Vercel origin in backend `CORS_ORIGINS`.

## Local checks

Install the Python dependencies and the native Tesseract binary/language data
as described in the root README, then run from the `backend` directory:

```powershell
python -m pytest tests\test_ocr.py tests\test_llm_analysis.py tests\services\test_analysis_persistence.py tests\api\test_analyses.py tests\test_health.py -q
```

Gemini requests in the automated tests are mocked; tests do not consume API
credits. The readable-image OCR integration test skips when Tesseract or the
English language pack is not installed.

## Render redeploy and manual verification

1. Configure the Render service root directory as `backend` and its Dockerfile
   path as `Dockerfile`. Push the code and let Render rebuild. Confirm the
   deploy completes and the service binds to Render's `PORT`.
2. Open `https://<render-service>.onrender.com/api/health`. Confirm:
   - `status` is `ok` and `database.status` is `ok`.
   - `tesseract.available` is `true`, `tesseract.version` is populated, and
     `tesseract.languages` contains `eng`.
   - `gemini.configured` is `true` and `gemini.model` is the configured model.
     `gemini.availability` is intentionally `not_tested`; health checks do not
     make billable provider calls.
3. In Render logs, confirm the startup entry reports Tesseract version and
   installed languages, and that Gemini is configured. Do not copy secrets or
   uploaded contents into support tickets or logs.
4. Sign in to the Vercel app, upload a small clear JPEG or PNG with an analysis
   question, and submit it. Wait for processing, then open the result detail.
5. Confirm the result is `completed` only when Gemini interpretation,
   verification, and the remaining required stages succeed. In the pipeline
   log, `Evidence`, `Extract`, `Reason`, `Verify`, and `Action` should report
   the work actually performed. A Gemini outage should yield `partial`, with
   `Reason` marked failed (or skipped if the key is not configured) and the
   fallback clearly identified.
6. To verify OCR independence, use an image with useful visual content but no
   readable text and ask a specific visual question. A successful Gemini
   response should still contain an AI result; OCR success is not a precondition
   for sending the image.
7. If Gemini fails, inspect the Render log for model, image MIME type, provider
   HTTP status, exception class, and duration. Check the key, model access,
   quota, and outbound connectivity in Render without logging the key itself.

Do not submit sensitive documents as production test data. Health checks verify
configuration and connectivity to PostgreSQL, but test Gemini only through a
deliberate user analysis.
