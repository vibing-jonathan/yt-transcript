from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.video import TranscriptSegment, Video, VideoStatus
from app.services import summarization, transcript_parser, transcription, youtube
from app.utils.tempdir import job_temp_dir
from app.worker.celery_app import celery_app


def _set_status(db: Session, video: Video, status: VideoStatus, error_message: str | None = None) -> None:
    video.status = status
    video.error_message = error_message
    if status == VideoStatus.DOWNLOADING:
        video.processing_started_at = datetime.now(UTC)
    if status in (VideoStatus.COMPLETED, VideoStatus.FAILED):
        video.processing_completed_at = datetime.now(UTC)
    db.commit()


@celery_app.task(
    name="app.worker.tasks.process_video",
    bind=True,
    max_retries=2,
    default_retry_delay=30,
    autoretry_for=(youtube.DownloadFailedError,),
)
def process_video(self, video_id: str) -> None:
    db = SessionLocal()
    try:
        video = db.get(Video, video_id)
        if video is None:
            return

        try:
            # A retried/resubmitted job that already has a transcript (e.g. a
            # prior attempt failed at the summarization stage) skips straight
            # to summarizing, so a flaky Gemini call never forces redoing the
            # expensive CPU transcription step.
            if video.transcript_text is None:
                with job_temp_dir(video_id) as tmpdir:
                    _set_status(db, video, VideoStatus.DOWNLOADING)
                    audio_path, meta = youtube.download_audio(video.youtube_video_id, tmpdir)
                    video.title = meta.title
                    video.channel_name = meta.channel_name
                    video.duration_seconds = meta.duration_seconds
                    video.thumbnail_url = meta.thumbnail_url
                    db.commit()

                    _set_status(db, video, VideoStatus.TRANSCRIBING)
                    raw = transcription.transcribe(audio_path)
                    segments = transcript_parser.parse(raw)
                    transcript_text = transcript_parser.flatten(segments)

                    video.transcript_text = transcript_text
                    db.query(TranscriptSegment).filter(TranscriptSegment.video_id == video.id).delete()
                    for seg in segments:
                        db.add(
                            TranscriptSegment(
                                video_id=video.id,
                                segment_index=seg.index,
                                speaker_label=seg.speaker_label,
                                start_seconds=seg.start_seconds,
                                end_seconds=seg.end_seconds,
                                text=seg.text,
                            )
                        )
                    db.commit()

            _set_status(db, video, VideoStatus.SUMMARIZING)
            video.summary = summarization.summarize(video.transcript_text)
            _set_status(db, video, VideoStatus.COMPLETED)
        except Exception as exc:
            db.rollback()
            video = db.get(Video, video_id)
            _set_status(db, video, VideoStatus.FAILED, error_message=str(exc))
            raise
    finally:
        db.close()
