import { Link } from "react-router-dom";
import type { VideoSummary } from "../types/video";
import { formatDuration, formatLength, formatDate } from "../utils/format";
import { summaryPreview } from "../utils/summary";
import { MetaRow } from "./MetaRow";
import { StatusBadge } from "./StatusBadge";

export function VideoListItem({ video }: { video: VideoSummary }) {
  const preview = summaryPreview(video.summary);
  return (
    <Link to={`/videos/${video.id}`} className="video-row">
      <div className="video-row__thumb">
        {video.thumbnail_url && <img src={video.thumbnail_url} alt="" loading="lazy" />}
        {video.duration_seconds != null && (
          <span className="video-row__duration">{formatDuration(video.duration_seconds)}</span>
        )}
      </div>
      <div className="video-row__body">
        <div className="video-row__title">{video.title ?? "Processing…"}</div>
        <MetaRow
          className="video-row__meta"
          items={[
            video.channel_name && <b>{video.channel_name}</b>,
            <span>{formatDate(video.created_at)}</span>,
            video.duration_seconds != null && <span>{formatLength(video.duration_seconds)}</span>,
            video.status !== "completed" && <StatusBadge status={video.status} />,
          ]}
        />
        {preview && <p className="video-row__summary">{preview}</p>}
      </div>
    </Link>
  );
}
