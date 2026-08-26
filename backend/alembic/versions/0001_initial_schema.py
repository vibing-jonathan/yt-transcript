"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

video_status_enum = postgresql.ENUM(
    "queued", "downloading", "transcribing", "summarizing", "completed", "failed",
    name="video_status",
)


def upgrade() -> None:
    video_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "videos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("youtube_video_id", sa.String(length=11), nullable=False),
        sa.Column("youtube_url", sa.Text(), nullable=False),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("channel_name", sa.Text(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("thumbnail_url", sa.Text(), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "queued", "downloading", "transcribing", "summarizing", "completed", "failed",
                name="video_status",
                create_type=False,
            ),
            nullable=False,
            server_default="queued",
        ),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("transcript_text", sa.Text(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column(
            "search_vector",
            postgresql.TSVECTOR(),
            sa.Computed(
                "to_tsvector('english', "
                "coalesce(title, '') || ' ' || coalesce(transcript_text, '') || ' ' || coalesce(summary, ''))",
                persisted=True,
            ),
            nullable=True,
        ),
        sa.Column("processing_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("processing_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("youtube_video_id", name="uq_videos_youtube_video_id"),
    )
    op.create_index("ix_videos_search_vector", "videos", ["search_vector"], postgresql_using="gin")
    op.create_index("ix_videos_created_at", "videos", ["created_at"])
    op.create_index("ix_videos_status", "videos", ["status"])

    op.create_table(
        "transcript_segments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("video_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("videos.id", ondelete="CASCADE"), nullable=False),
        sa.Column("segment_index", sa.Integer(), nullable=False),
        sa.Column("speaker_label", sa.String(length=16), nullable=False),
        sa.Column("start_seconds", sa.Numeric(10, 2), nullable=False),
        sa.Column("end_seconds", sa.Numeric(10, 2), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
    )
    op.create_index("ix_transcript_segments_video_id", "transcript_segments", ["video_id"])


def downgrade() -> None:
    op.drop_table("transcript_segments")
    op.drop_index("ix_videos_status", table_name="videos")
    op.drop_index("ix_videos_created_at", table_name="videos")
    op.drop_index("ix_videos_search_vector", table_name="videos")
    op.drop_table("videos")
    video_status_enum.drop(op.get_bind())
