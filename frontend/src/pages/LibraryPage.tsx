import { useEffect, useState } from "react";
import { listVideos } from "../api/client";
import { SearchBar } from "../components/SearchBar";
import { VideoGrid } from "../components/VideoGrid";
import type { VideoSummary } from "../types/video";

export function LibraryPage() {
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listVideos({ q: query || undefined })
      .then((res) => {
        if (!cancelled) setVideos(res.items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>yt-transcribe</h1>
      <SearchBar onSearch={setQuery} />
      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : <VideoGrid videos={videos} />}
    </div>
  );
}
