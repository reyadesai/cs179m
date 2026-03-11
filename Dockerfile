FROM python:3.11-slim

WORKDIR /app

# System deps for scientific stack / lightgbm
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential libgomp1 && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files (Railway root is already backend/)
COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]