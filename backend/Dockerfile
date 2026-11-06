FROM python:3.11-slim

# System standard components check update execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Ensure proper location binary linking mappings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TESSERACT_CMD=/usr/bin/tesseract

COPY requirements.txt requirements-ai.txt ./
RUN pip install --no-cache-dir -r requirements.txt -r requirements-ai.txt

COPY . .

# Complete permissions access for backend structure validation
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

EXPOSE 8000

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
