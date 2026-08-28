import type { VideoStatus } from "../types/video";
import { CheckIcon } from "./icons";

const LABELS: Record<VideoStatus, string> = {
  queued: "Queued",
  downloading: "Downloading",
  transcribing: "Transcribing",
  summarizing: "Summarizing",
  completed: "Transcribed",
  failed: "Failed",
};

type Tone = "ok" | "progress" | "danger" | "neutral";

const TONES: Record<VideoStatus, Tone> = {
  queued: "neutral",
  downloading: "progress",
  transcribing: "progress",
  summarizing: "progress",
  completed: "ok",
  failed: "danger",
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  const tone = TONES[status];
  return (
    <span className={`status-chip status-chip--${tone}`}>
      {status === "completed" && <CheckIcon size={12} />}
      {LABELS[status]}
    </span>
  );
}
