FROM python:3.11-slim

WORKDIR /app

# Install deps required for waiting on Postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY . .

# Expose port
EXPOSE 8000

# Combined startup logic
CMD bash -c "\
    echo 'Waiting for Postgres...' && \
    until nc -z postgres 5432; do sleep 0.5; done && \
    echo 'Postgres is up!' && \
    echo 'Running Alembic migrations...' && \
    alembic upgrade head && \
    echo 'Running seed data...' && \
    python seed.py && \
    echo 'Starting FastAPI server...' && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 \
"
