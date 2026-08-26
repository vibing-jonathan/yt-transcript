from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.celery_client import enqueue_process_video
from app.api.deps import get_db
from app.models.video import Video, VideoStatus
from app.schemas.video import (
    SubmitVideoRequest,
    VideoDetail,
    VideoListResponse,
    VideoStatusOut,
    VideoSummary,
)
from app.utils.youtube_url import InvalidYouTubeUrlError, canonicalize_youtube_url

router = APIRouter()

_ACTIVE_STATUSES = {
    VideoStatus.QUEUED,
    VideoStatus.DOWNLOADING,
    VideoStatus.TRANSCRIBING,
    VideoStatus.SUMMARIZING,
    VideoStatus.COMPLETED,
}


@router.post("/videos", response_model=VideoSummary, status_code=201)
def submit_video(payload: SubmitVideoRequest, response: Response, db: Session = Depends(get_db)):
    try:
        video_id, canonical_url = canonicalize_youtube_url(payload.url)
    except InvalidYouTubeUrlError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    existing = db.execute(select(Video).where(Video.youtube_video_id == video_id)).scalar_one_or_none()

    if existing is not None and existing.status in _ACTIVE_STATUSES:
        response.status_code = 200
        return existing

    if existing is not None and existing.status == VideoStatus.FAILED:
        existing.status = VideoStatus.QUEUED
        existing.error_message = None
        db.commit()
        db.refresh(existing)
        enqueue_process_video(str(existing.id))
        response.status_code = 200
        return existing

    video = Video(youtube_video_id=video_id, youtube_url=canonical_url, status=VideoStatus.QUEUED)
    db.add(video)
    db.commit()
    db.refresh(video)
    enqueue_process_video(str(video.id))
    return video


@router.get("/videos", response_model=VideoListResponse)
def list_videos(
    q: str | None = None,
    status: VideoStatus | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filters = []
    if status is not None:
        filters.append(Video.status == status)
    else:
        filters.append(Video.status == VideoStatus.COMPLETED)

    if q:
        tsquery = func.websearch_to_tsquery("english", q)
        filters.append(Video.search_vector.op("@@")(tsquery))
        order_by = func.ts_rank(Video.search_vector, tsquery).desc()
    else:
        order_by = Video.created_at.desc()

    base_stmt = select(Video).where(*filters)
    total = db.execute(select(func.count()).select_from(base_stmt.subquery())).scalar_one()

    items = (
        db.execute(base_stmt.order_by(order_by).offset((page - 1) * page_size).limit(page_size))
        .scalars()
        .all()
    )

    return VideoListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/videos/{video_id}", response_model=VideoDetail)
def get_video(video_id: str, db: Session = Depends(get_db)):
    video = db.get(Video, video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.get("/videos/{video_id}/status", response_model=VideoStatusOut)
def get_video_status(video_id: str, db: Session = Depends(get_db)):
    video = db.get(Video, video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    return video
