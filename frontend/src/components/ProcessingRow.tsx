import { Link } from "react-router-dom";
import type { VideoSummary, VideoStatus } from "../types/video";
import { StatusBadge } from "./StatusBadge";

const PROGRESS: Record<VideoStatus, number> = {
  queued: 8,
  downloading: 30,
  transcribing: 62,
  summarizing: 88,
  completed: 100,
  failed: 100,
};

const STATUS_LINE: Record<VideoStatus, string> = {
  queued: "Waiting for a worker",
  downloading: "Downloading audio",
  transcribing: "Transcribing & labeling speakers",
  summarizing: "Writing the summary",
  completed: "Done",
  failed: "Failed",
};

export function ProcessingRow({ video }: { video: VideoSummary }) {
  return (
    <Link to={`/videos/${video.id}`} className="processing-row">
      <div className="processing-row__inner">
        <div className="processing-row__thumb">
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt="" />
          ) : (
            <span className="spinner" style={{ color: "#fffdf9" }} />
          )}
        </div>
        <div className="processing-row__body">
          <div className="processing-row__title">{video.title ?? "Fetching video details…"}</div>
          <div className="processing-row__status">
            {STATUS_LINE[video.status]}
            {video.channel_name && <span style={{ color: "#cfc6b4" }}> · </span>}
            {video.channel_name}
          </div>
        </div>
        <StatusBadge status={video.status} />
      </div>
      <div className="processing-row__bar">
        <div className="processing-row__bar-fill" style={{ width: `${PROGRESS[video.status]}%` }} />
      </div>
    </Link>
  );
}
