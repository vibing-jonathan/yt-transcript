import { Link } from "react-router-dom";
import type { VideoSummary } from "../types/video";
import { StatusBadge } from "./StatusBadge";

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoCard({ video }: { video: VideoSummary }) {
  return (
    <Link
      to={`/videos/${video.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={video.thumbnail_url ?? undefined}
          alt={video.title ?? "Untitled video"}
          style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 8, backgroundColor: "#e5e7eb" }}
        />
        {video.duration_seconds != null && (
          <span
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              fontSize: 12,
              padding: "1px 4px",
              borderRadius: 4,
            }}
          >
            {formatDuration(video.duration_seconds)}
          </span>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
          {video.title ?? "Processing…"}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{video.channel_name}</div>
        {video.status !== "completed" && (
          <div style={{ marginTop: 4 }}>
            <StatusBadge status={video.status} />
          </div>
        )}
      </div>
    </Link>
  );
}
