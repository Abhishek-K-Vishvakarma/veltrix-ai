FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TESSERACT_CMD=/usr/bin/tesseract

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements-ai.txt ./
RUN pip install --no-cache-dir -r requirements.txt -r requirements-ai.txt
COPY . .
RUN mkdir -p /app/uploads \
    && useradd --create-home --uid 10001 app \
    && chown app:app /app/uploads

USER app
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
