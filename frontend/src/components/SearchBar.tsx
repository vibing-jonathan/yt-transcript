import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitVideo } from "../api/client";
import { looksLikeYouTubeUrl } from "../utils/youtubeUrl";

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (looksLikeYouTubeUrl(trimmed)) {
      setSubmitting(true);
      setError(null);
      try {
        const video = await submitVideo(trimmed);
        navigate(`/videos/${video.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit video");
      } finally {
        setSubmitting(false);
      }
    } else {
      onSearch(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search the library, or paste a YouTube link…"
        style={{ flex: 1, padding: "10px 14px", borderRadius: 999, border: "1px solid #d1d5db", fontSize: 14 }}
      />
      <button
        type="submit"
        disabled={submitting}
        style={{ padding: "10px 20px", borderRadius: 999, border: "none", background: "#111827", color: "#fff", fontSize: 14 }}
      >
        {submitting ? "Adding…" : "Go"}
      </button>
      {error && <span style={{ color: "#dc2626", alignSelf: "center", fontSize: 13 }}>{error}</span>}
    </form>
  );
}
