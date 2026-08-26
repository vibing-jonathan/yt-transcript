# yt-transcribe

A YouTube-style library of video transcripts and summaries. Paste in a YouTube link, and it downloads the audio, transcribes it (with speakers labeled), summarizes it with AI, and adds it to a searchable library.

## Quick start

You'll need Docker and a [Gemini API key](https://ai.google.dev/gemini-api/docs/api-key).

```bash
cp .env.example .env   # then edit it: set GEMINI_API_KEY=...
docker compose up -d
```

Open http://localhost:5173, paste in a YouTube link, and watch it process.

The first run downloads the transcription model (a few GB), so it'll take a bit longer to get going — after that it's cached and starts fast. Transcription itself runs on CPU by default, which is slow (roughly real-time — a 4-minute video takes about 4 minutes to transcribe); see below if you have a GPU.

## More details

<details>
<summary>How it works</summary>

1. You submit a YouTube URL.
2. A background worker downloads the audio (lowest quality, audio only).
3. It's transcribed and diarized (speaker-labeled, timestamped) using [`OpenMOSS-Team/MOSS-Transcribe-Diarize`](https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize).
4. The transcript is summarized by Gemini.
5. Everything lands in Postgres, searchable by title, transcript, and summary.

The video itself is never re-hosted — playback embeds the original YouTube player.

**Stack:** FastAPI + Celery worker (backend), React + Vite (frontend), Postgres, Redis. See `docker-compose.yml` for the full picture.
</details>

<details>
<summary>GPU support</summary>

If you have an NVIDIA GPU with CUDA and [`nvidia-container-toolkit`](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html):

1. In `.env`, set `USE_GPU=true`.
2. `docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d --build worker`

Falls back to CPU automatically if no GPU is found at runtime.
</details>

<details>
<summary>Developing</summary>

Code is bind-mounted into the containers, so most changes apply without a rebuild:
- API: hot-reloads automatically.
- Worker: `docker compose restart worker` to pick up changes.
- Frontend: hot-reloads automatically.

New database migration: `docker compose exec api alembic revision -m "description"`.

Full list of environment variables in `.env.example`.
</details>
