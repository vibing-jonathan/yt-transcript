/** Strip inline markdown (bold, italic, code) from a run of text. */
export function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export interface ParsedSummary {
  overview: string[];
  takeaways: string[];
}

const HEADING_RE = /^(key takeaways|takeaways|key points|overview|summary)$/;

export function parseSummary(raw: string): ParsedSummary {
  const overview: string[] = [];
  const takeaways: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;

    const bullet = t.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      takeaways.push(stripInline(bullet[1]));
      continue;
    }

    const heading = t.replace(/[*#_:]/g, "").trim().toLowerCase();
    if (HEADING_RE.test(heading)) continue;

    overview.push(stripInline(t.replace(/^\d+[.)]\s*/, "")));
  }

  return { overview, takeaways };
}

/** One-line plain-text preview of a summary for list rows. */
export function summaryPreview(summary: string | null): string {
  if (!summary) return "";
  const { overview } = parseSummary(summary);
  const text = (overview.join(" ") || stripInline(summary)).replace(/\s+/g, " ").trim();
  return text;
}
