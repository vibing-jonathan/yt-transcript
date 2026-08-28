import { useMemo } from "react";
import type { TranscriptSegment } from "../types/video";
import { formatTimestamp } from "../utils/format";

const SPEAKER_COLORS = ["#3d6a78", "#9a6b3f", "#6a5a86", "#4f7a52", "#a5544a", "#7a6a3d"];

function speakerName(label: string): string {
  const n = label.replace(/^S0*/i, "").replace(/^SPEAKER[_-]?0*/i, "");
  return n ? `Speaker ${n}` : label;
}

export function TranscriptView({
  segments,
  onSeek,
}: {
  segments: TranscriptSegment[];
  onSeek?: (seconds: number) => void;
}) {
  const colorFor = useMemo(() => {
    const order: string[] = [];
    for (const s of segments) if (!order.includes(s.speaker_label)) order.push(s.speaker_label);
    return (label: string) => SPEAKER_COLORS[order.indexOf(label) % SPEAKER_COLORS.length];
  }, [segments]);

  if (segments.length === 0) {
    return <p className="muted">No transcript available.</p>;
  }

  return (
    <div className="transcript__rows">
      {segments.map((seg) => (
        <div key={seg.segment_index} className="transcript__row">
          <button
            className="transcript__time"
            onClick={() => onSeek?.(seg.start_seconds)}
            disabled={!onSeek}
          >
            {formatTimestamp(seg.start_seconds)}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="transcript__speaker" style={{ color: colorFor(seg.speaker_label) }}>
              <span className="transcript__dot" style={{ background: colorFor(seg.speaker_label) }} />
              {speakerName(seg.speaker_label)}
            </div>
            <p className="transcript__text">{seg.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
