export type VideoStatus =
  | "queued"
  | "downloading"
  | "transcribing"
  | "summarizing"
  | "completed"
  | "failed";

export interface VideoSummary {
  id: string;
  youtube_video_id: string;
  title: string | null;
  channel_name: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  status: VideoStatus;
  summary: string | null;
  created_at: string;
}

export interface TranscriptSegment {
  segment_index: number;
  speaker_label: string;
  start_seconds: number;
  end_seconds: number;
  text: string;
}

export interface VideoDetail extends VideoSummary {
  transcript_text: string | null;
  error_message: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  segments: TranscriptSegment[];
}

export interface VideoStatusOut {
  id: string;
  status: VideoStatus;
  error_message: string | null;
  updated_at: string;
}

export interface VideoListResponse {
  items: VideoSummary[];
  total: number;
  page: number;
  page_size: number;
}

export const TERMINAL_STATUSES: VideoStatus[] = ["completed", "failed"];
