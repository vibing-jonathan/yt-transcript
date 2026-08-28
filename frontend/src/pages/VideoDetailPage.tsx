import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVideo, getVideoStatus } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { MetaRow } from "../components/MetaRow";
import { ProcessingStepper } from "../components/ProcessingStepper";
import { StatusBadge } from "../components/StatusBadge";
import { SummaryPanel } from "../components/SummaryPanel";
import { TranscriptView } from "../components/TranscriptView";
import { ChevronLeftIcon } from "../components/icons";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";
import { usePolling } from "../hooks/usePolling";
import { formatDate, formatLength } from "../utils/format";
import { TERMINAL_STATUSES, type VideoDetail } from "../types/video";

const PLAYER_ELEMENT_ID = "yt-player";

export function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoDetail | null>(null);

  const refetch = useCallback(() => {
    if (!id) return;
    getVideo(id).then(setVideo).catch(() => undefined);
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isTerminal = video ? TERMINAL_STATUSES.includes(video.status) : true;

  usePolling(
    () => {
      if (!id) return;
      getVideoStatus(id)
        .then((s) => {
          setVideo((prev) =>
            prev ? { ...prev, status: s.status, error_message: s.error_message } : prev,
          );
          if (TERMINAL_STATUSES.includes(s.status)) refetch();
        })
        .catch(() => undefined);
    },
    3000,
    !isTerminal,
  );

  const isCompleted = video?.status === "completed";
  const { seekTo } = useYouTubePlayer(
    PLAYER_ELEMENT_ID,
    isCompleted ? video?.youtube_video_id ?? "" : "",
  );

  const speakerCount = useMemo(
    () => (video ? new Set(video.segments.map((s) => s.speaker_label)).size : 0),
    [video],
  );

  if (!video) {
    return (
      <>
        <AppHeader />
        <main className="container">
          <p className="center-note">Loading…</p>
        </main>
      </>
    );
  }

  const processing = !TERMINAL_STATUSES.includes(video.status);

  return (
    <>
      <AppHeader />
      <main className="container detail">
        <Link to="/" className="detail__back">
          <ChevronLeftIcon />
          Library
        </Link>

        <h1 className="detail__title">{video.title ?? "Processing…"}</h1>

        <MetaRow
          className="detail__meta"
          items={[
            <StatusBadge status={video.status} />,
            video.channel_name && <b>{video.channel_name}</b>,
            <span>{formatDate(video.created_at)}</span>,
            video.duration_seconds != null && <span>{formatLength(video.duration_seconds)}</span>,
            speakerCount > 0 && (
              <span>
                {speakerCount} speaker{speakerCount === 1 ? "" : "s"}
              </span>
            ),
          ]}
        />

        {video.status === "failed" && video.error_message && (
          <p className="detail__error">{video.error_message}</p>
        )}

        {processing ? (
          <ProcessingStepper status={video.status} />
        ) : isCompleted ? (
          <div className="player">
            <div id={PLAYER_ELEMENT_ID} />
          </div>
        ) : null}

        {(video.summary || video.segments.length > 0) && (
          <div className="detail__grid">
            <div className="summary">
              <h2>Summary</h2>
              {video.summary ? (
                <SummaryPanel summary={video.summary} />
              ) : (
                <p className="muted">Not summarized yet.</p>
              )}
            </div>

            <div className="transcript">
              <div className="transcript__head">
                <h2>Transcript</h2>
                {video.segments.length > 0 && (
                  <span className="transcript__hint">click a timestamp to jump</span>
                )}
              </div>
              <TranscriptView segments={video.segments} onSeek={isCompleted ? seekTo : undefined} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
