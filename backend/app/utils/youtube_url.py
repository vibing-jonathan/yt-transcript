"""Lightweight YouTube URL parsing shared by the API and worker processes.

Kept dependency-free (no yt_dlp import) so the API image never needs to pull
in worker-only packages just to validate/canonicalize a submitted URL.
"""

import re
from urllib.parse import parse_qs, urlparse

VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")


class InvalidYouTubeUrlError(ValueError):
    pass


def extract_video_id(url: str) -> str:
    """Extract and validate an 11-char YouTube video ID from a URL."""
    parsed = urlparse(url.strip())
    host = (parsed.hostname or "").lower().removeprefix("www.").removeprefix("m.")

    video_id: str | None = None
    if host in ("youtu.be",):
        video_id = parsed.path.lstrip("/").split("/")[0]
    elif host in ("youtube.com", "youtube-nocookie.com"):
        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [None])[0]
        elif parsed.path.startswith("/shorts/"):
            video_id = parsed.path.removeprefix("/shorts/").split("/")[0]
        elif parsed.path.startswith("/embed/"):
            video_id = parsed.path.removeprefix("/embed/").split("/")[0]

    if not video_id or not VIDEO_ID_RE.match(video_id):
        raise InvalidYouTubeUrlError(f"Could not extract a valid YouTube video ID from: {url!r}")

    return video_id


def canonicalize_youtube_url(url: str) -> tuple[str, str]:
    """Return (video_id, canonical_watch_url) for a submitted YouTube URL."""
    video_id = extract_video_id(url)
    return video_id, f"https://www.youtube.com/watch?v={video_id}"


def looks_like_youtube_url(value: str) -> bool:
    try:
        extract_video_id(value)
        return True
    except InvalidYouTubeUrlError:
        return False
