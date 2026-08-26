from celery import Celery
from celery.signals import worker_process_init

from app.config import settings

celery_app = Celery("yt_transcribe_worker", broker=settings.celery_broker_url, backend=settings.celery_result_backend)

celery_app.conf.update(
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    broker_transport_options={"visibility_timeout": 7200},
    task_track_started=True,
    imports=("app.worker.tasks",),
)


@worker_process_init.connect
def preload_model(**kwargs):
    from app.services import transcription

    transcription._load()
