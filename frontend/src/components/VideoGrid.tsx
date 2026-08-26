import type { VideoSummary } from "../types/video";
import { VideoCard } from "./VideoCard";

export function VideoGrid({ videos }: { videos: VideoSummary[] }) {
  if (videos.length === 0) {
    return <p style={{ color: "#6b7280" }}>No videos found.</p>;
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 24,
      }}
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
