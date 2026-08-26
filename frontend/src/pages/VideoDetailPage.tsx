import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVideo, getVideoStatus } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { SummaryPanel } from "../components/SummaryPanel";
import { TranscriptView } from "../components/TranscriptView";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";
import { usePolling } from "../hooks/usePolling";
import { TERMINAL_STATUSES, type VideoDetail } from "../types/video";

const PLAYER_ELEMENT_ID = "yt-player";

export function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoDetail | null>(null);

  const refetch = useCallback(() => {
    if (!id) return;
    getVideo(id).then(setVideo);
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isTerminal = video ? TERMINAL_STATUSES.includes(video.status) : true;

  usePolling(
    () => {
      if (!id) return;
      getVideoStatus(id).then((s) => {
        setVideo((prev) => (prev ? { ...prev, status: s.status, error_message: s.error_message } : prev));
        if (TERMINAL_STATUSES.includes(s.status)) refetch();
      });
    },
    3000,
    !isTerminal
  );

  const { seekTo } = useYouTubePlayer(PLAYER_ELEMENT_ID, video?.youtube_video_id ?? "");

  if (!video) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link to="/" style={{ fontSize: 14, color: "#2563eb" }}>
        ← Back to library
      </Link>
      <h1 style={{ fontSize: 22, marginTop: 12 }}>{video.title ?? "Processing…"}</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <StatusBadge status={video.status} />
        <span style={{ color: "#6b7280", fontSize: 14 }}>{video.channel_name}</span>
      </div>

      {video.status === "failed" && video.error_message && (
        <p style={{ color: "#dc2626", marginBottom: 16 }}>{video.error_message}</p>
      )}

      <div id={PLAYER_ELEMENT_ID} style={{ aspectRatio: "16 / 9", width: "100%", marginBottom: 24 }} />

      {video.summary && (
        <>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Summary</h2>
          <SummaryPanel summary={video.summary} />
        </>
      )}

      {video.segments.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, margin: "24px 0 8px" }}>Transcript</h2>
          <TranscriptView segments={video.segments} onSeek={seekTo} />
        </>
      )}
    </div>
  );
}
