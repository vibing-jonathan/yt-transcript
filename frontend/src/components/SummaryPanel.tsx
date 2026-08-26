export function SummaryPanel({ summary }: { summary: string }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 8, padding: 16, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.5 }}>
      {summary}
    </div>
  );
}
