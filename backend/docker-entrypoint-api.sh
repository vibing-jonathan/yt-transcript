#!/bin/sh
set -e
export PYTHONPATH="/app:${PYTHONPATH}"
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
