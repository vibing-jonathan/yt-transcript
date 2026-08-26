import type { TranscriptSegment } from "../types/video";

function formatTimestamp(seconds: number): string {
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TranscriptView({
  segments,
  onSeek,
}: {
  segments: TranscriptSegment[];
  onSeek?: (seconds: number) => void;
}) {
  if (segments.length === 0) {
    return <p style={{ color: "#6b7280" }}>No transcript available.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 480, overflowY: "auto" }}>
      {segments.map((seg) => (
        <div key={seg.segment_index} style={{ display: "flex", gap: 12, fontSize: 14 }}>
          <button
            onClick={() => onSeek?.(seg.start_seconds)}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              color: "#2563eb",
              cursor: onSeek ? "pointer" : "default",
              padding: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTimestamp(seg.start_seconds)}
          </button>
          <span style={{ fontWeight: 600, flexShrink: 0 }}>Speaker {seg.speaker_label.replace(/^S0*/, "")}</span>
          <span>{seg.text}</span>
        </div>
      ))}
    </div>
  );
}
