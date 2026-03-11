FROM python:3.11-slim

WORKDIR /app

# System deps for scientific stack / lightgbm
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential libgomp1 && \
    rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and model bundle
COPY backend ./backend

WORKDIR /app/backend

EXPOSE 8000

# Railway (and most PaaS) provide a PORT env var; bind uvicorn to that.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]