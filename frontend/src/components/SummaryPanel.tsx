import { parseSummary } from "../utils/summary";

export function SummaryPanel({ summary }: { summary: string }) {
  const { overview, takeaways } = parseSummary(summary);

  // Fall back to raw text if parsing found nothing structured.
  if (overview.length === 0 && takeaways.length === 0) {
    return <div className="summary__body">{summary}</div>;
  }

  return (
    <div className="summary__body">
      {overview.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {takeaways.length > 0 && (
        <>
          <div className="summary__heading">Key takeaways</div>
          <ul>
            {takeaways.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
