import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitVideo } from "../api/client";
import { looksLikeYouTubeUrl } from "../utils/youtubeUrl";
import { SearchIcon, LinkIcon } from "./icons";

type Props = {
  onSearch: (query: string) => void;
  variant?: "header" | "hero";
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchBar({ onSearch, variant = "header", placeholder, autoFocus }: Props) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isUrl = looksLikeYouTubeUrl(value.trim());

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

  const fallbackPlaceholder =
    variant === "hero"
      ? "https://youtube.com/watch?v=…"
      : "Search transcripts, or paste a YouTube link…";

  return (
    <form className={`searchbar searchbar--${variant}`} onSubmit={handleSubmit}>
      <div className="searchbar__field">
        <span className="searchbar__icon">{isUrl ? <LinkIcon /> : <SearchIcon />}</span>
        <input
          className="searchbar__input"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
            if (e.target.value.trim() === "") onSearch("");
          }}
          placeholder={placeholder ?? fallbackPlaceholder}
          aria-label={placeholder ?? fallbackPlaceholder}
        />
      </div>
      <button className="searchbar__btn" type="submit" disabled={submitting}>
        {submitting
          ? "Adding…"
          : variant === "hero"
            ? "Transcribe"
            : isUrl
              ? "Go"
              : "Search"}
      </button>
      {error && <span className="searchbar__error">{error}</span>}
    </form>
  );
}
