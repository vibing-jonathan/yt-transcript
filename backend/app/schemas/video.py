import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.video import VideoStatus


class SubmitVideoRequest(BaseModel):
    url: str


class TranscriptSegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    segment_index: int
    speaker_label: str
    start_seconds: float
    end_seconds: float
    text: str


class VideoSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    youtube_video_id: str
    title: str | None
    channel_name: str | None
    duration_seconds: int | None
    thumbnail_url: str | None
    status: VideoStatus
    summary: str | None = None
    created_at: datetime


class VideoDetail(VideoSummary):
    transcript_text: str | None
    error_message: str | None
    processing_started_at: datetime | None
    processing_completed_at: datetime | None
    segments: list[TranscriptSegmentOut]


class VideoStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: VideoStatus
    error_message: str | None
    updated_at: datetime


class VideoListResponse(BaseModel):
    items: list[VideoSummary]
    total: int
    page: int
    page_size: int
