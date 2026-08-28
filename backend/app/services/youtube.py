"""Worker-only: downloads the lowest-quality audio for a video via yt-dlp.

Never import this module from app.api.* — it (transitively, via yt_dlp) is
fine dependency-weight-wise, but it belongs conceptually to the worker
pipeline and keeping the boundary strict avoids accidental coupling.
"""

import logging
import os
from dataclasses import dataclass

import yt_dlp

from app.utils.youtube_url import canonicalize_youtube_url

log = logging.getLogger(__name__)


class DownloadFailedError(RuntimeError):
    pass


@dataclass
class VideoMeta:
    title: str | None
    channel_name: str | None
    duration_seconds: int | None
    thumbnail_url: str | None


def download_audio(video_id: str, dest_dir: str) -> tuple[str, VideoMeta]:
    _, url = canonicalize_youtube_url(f"https://www.youtube.com/watch?v={video_id}")

    ydl_opts = {
        # "bestaudio" (not "worstaudio") so the default sort's language rule
        # applies normally — "worstaudio" reverses the whole sort and would pick
        # a dubbed track over the original on multi-language videos. "lang" keeps
        # the original/default audio; "+size"/"+br" then take the smallest one,
        # so we still get a low-bitrate track for fast transcription.
        "format": "bestaudio/best",
        "format_sort": ["lang", "+size", "+br"],
        "outtmpl": os.path.join(dest_dir, "%(id)s.%(ext)s"),
        "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "wav"}],
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
    except yt_dlp.utils.DownloadError as exc:
        raise DownloadFailedError(f"Failed to download video {video_id}: {exc}") from exc

    picked = (info.get("requested_formats") or [info])[0]
    log.info(
        "audio for %s: format %s, language %s (%s)",
        video_id,
        picked.get("format_id"),
        picked.get("language"),
        picked.get("format_note"),
    )

    audio_path = os.path.join(dest_dir, f"{info['id']}.wav")
    if not os.path.exists(audio_path):
        raise DownloadFailedError(f"Expected extracted audio file not found at {audio_path}")

    meta = VideoMeta(
        title=info.get("title"),
        channel_name=info.get("channel") or info.get("uploader"),
        duration_seconds=int(info["duration"]) if info.get("duration") else None,
        thumbnail_url=info.get("thumbnail") or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
    )
    return audio_path, meta
