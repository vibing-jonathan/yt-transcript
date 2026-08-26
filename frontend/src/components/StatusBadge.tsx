import type { VideoStatus } from "../types/video";

const LABELS: Record<VideoStatus, string> = {
  queued: "Queued",
  downloading: "Downloading",
  transcribing: "Transcribing",
  summarizing: "Summarizing",
  completed: "Completed",
  failed: "Failed",
};

const COLORS: Record<VideoStatus, string> = {
  queued: "#6b7280",
  downloading: "#2563eb",
  transcribing: "#2563eb",
  summarizing: "#2563eb",
  completed: "#16a34a",
  failed: "#dc2626",
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: "#fff",
        backgroundColor: COLORS[status],
      }}
    >
      {LABELS[status]}
    </span>
  );
}
