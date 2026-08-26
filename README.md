# yt-transcribe

A YouTube-style web platform for browsing a searchable library of video transcriptions and AI-generated summaries. Paste a YouTube link, and the backend downloads the audio, transcribes and diarizes it (speaker-labeled, timestamped), summarizes it with Gemini, and adds it to the library — all asynchronously.

## How it works

1. **Submit** a YouTube URL via the web UI (or `POST /api/videos`).
2. A Celery worker **downloads** the lowest-quality audio track with `yt-dlp`.
3. The worker **transcribes and diarizes** the audio using [`OpenMOSS-Team/MOSS-Transcribe-Diarize`](https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize) (runs on CPU by default; GPU optional, see below).
4. The transcript is **summarized** by the Gemini API.
5. Everything is stored in **Postgres** (title, transcript, speaker-labeled segments, summary), searchable via full-text search.

Playback embeds the original YouTube video — no media is re-hosted.

## Architecture

- **`backend/`** — FastAPI API + Celery worker, sharing one `app/` package but built as two separate Docker images. The API image is lean (no torch/transformers); only the worker image has the ML stack.
- **`frontend/`** — React + Vite + TypeScript SPA: library grid, search, submit-a-link flow, and a video detail page with live status polling and a clickable, speaker-labeled transcript.
- **Postgres** — video metadata, transcript, summary, per-segment speaker/timestamp data, and a generated `tsvector` column for full-text search.
- **Redis** — Celery broker/result backend.

See `docker-compose.yml` for the full service topology.

## Prerequisites

- Docker and Docker Compose
- A [Gemini API key](https://ai.google.dev/gemini-api/docs/api-key)

## Setup

```bash
cp .env.example .env
# then edit .env and set GEMINI_API_KEY=...
```

Start everything:

```bash
docker compose up -d
```

- Frontend: http://localhost:5173
- API: http://localhost:8000 (health check at `/api/health`)

The first run downloads the transcription model (a few GB) from Hugging Face; it's cached in a Docker volume so subsequent starts are fast. Migrations run automatically when the API container starts.

### Note on CPU speed

Transcription runs token-by-token through a 0.9B-parameter model with no GPU acceleration by default, so expect roughly 1:1 wall-clock time to audio length (e.g. ~4 minutes to transcribe a 3.5-minute clip). If a job fails after transcription succeeds (e.g. a transient Gemini error), retrying (resubmitting the same URL) skips straight to summarization rather than re-transcribing.

## GPU support (optional)

If you have an NVIDIA GPU, CUDA, and [`nvidia-container-toolkit`](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) installed:

1. In `.env`, set `USE_GPU=true`.
2. Build and run the worker with the GPU override:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d --build worker
   ```

If `USE_GPU=true` but no CUDA device is found at runtime, the worker logs a warning and falls back to CPU automatically.

## Development

Both `backend/app` and `frontend/src` are bind-mounted into their containers, so most code edits are picked up without a rebuild:

- API: `uvicorn --reload`, so changes apply immediately.
- Worker: restart to pick up changes — `docker compose restart worker` (or recreate if `docker-compose.yml` itself changed: `docker compose up -d worker`).
- Frontend: Vite dev server with hot reload.

Database migrations live in `backend/alembic/versions/`; create a new one with:

```bash
docker compose exec api alembic revision -m "description"
```

## Environment variables

See `.env.example` for the full list (Postgres, Redis/Celery, Gemini, model ID, GPU toggle, frontend/CORS).
