#!/bin/bash
set -e

echo "Waiting for Postgres..."
while ! nc -z postgres 5432; do
  sleep 0.5
done
echo "Postgres is up!"

echo "Running Alembic migrations..."
# IMPORTANT: use python -m so alembic always resolves correctly
python -m alembic upgrade head

echo "Running seed script..."
python seed.py
