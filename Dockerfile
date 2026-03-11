FROM python:3.11-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and model bundle
COPY backend ./backend
COPY lightGBM ./lightGBM

WORKDIR /app/backend

EXPOSE 8000

# Railway (and most PaaS) provide a PORT env var; bind uvicorn to that.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]