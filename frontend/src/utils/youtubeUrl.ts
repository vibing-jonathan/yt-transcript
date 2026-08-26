const YOUTUBE_HOST_RE = /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i;

export function looksLikeYouTubeUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return YOUTUBE_HOST_RE.test(url.hostname);
  } catch {
    return false;
  }
}
