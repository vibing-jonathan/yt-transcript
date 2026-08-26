"""Minimal Celery client for the API process to enqueue jobs.

Deliberately does NOT import app.worker.celery_app / app.worker.tasks — those
transitively import transformers/torch via app.services.transcription, which
must never end up in the lean API image. Tasks are enqueued by name.
"""

from celery import Celery

from app.config import settings

celery_client = Celery(
    "yt_transcribe_client",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

PROCESS_VIDEO_TASK_NAME = "app.worker.tasks.process_video"


def enqueue_process_video(video_id: str) -> None:
    celery_client.send_task(PROCESS_VIDEO_TASK_NAME, args=[video_id])
