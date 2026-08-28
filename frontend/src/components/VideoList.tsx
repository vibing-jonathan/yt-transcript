import type { VideoSummary } from "../types/video";
import { VideoListItem } from "./VideoListItem";

export function VideoList({ videos }: { videos: VideoSummary[] }) {
  if (videos.length === 0) {
    return <p className="center-note">No transcripts match.</p>;
  }
  return (
    <div className="video-list">
      {videos.map((video) => (
        <VideoListItem key={video.id} video={video} />
      ))}
    </div>
  );
}
