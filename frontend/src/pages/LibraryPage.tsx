import { useCallback, useEffect, useRef, useState } from "react";
import { listVideos } from "../api/client";
import { AppHeader } from "../components/AppHeader";
import { EmptyLibrary } from "../components/EmptyLibrary";
import { ProcessingRow } from "../components/ProcessingRow";
import { SearchBar } from "../components/SearchBar";
import { VideoList } from "../components/VideoList";
import { usePolling } from "../hooks/usePolling";
import type { VideoSummary } from "../types/video";

export function LibraryPage() {
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState<VideoSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const prevProcessing = useRef(0);

  const fetchCompleted = useCallback(() => {
    return listVideos({ q: query || undefined })
      .then((res) => {
        setVideos(res.items);
        setTotal(res.total);
      })
      .catch(() => undefined);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listVideos({ q: query || undefined })
      .then((res) => {
        if (cancelled) return;
        setVideos(res.items);
        setTotal(res.total);
      })
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const pollProcessing = useCallback(() => {
    listVideos({ status: "processing" })
      .then((res) => {
        setProcessing(res.items);
        if (res.items.length < prevProcessing.current) fetchCompleted();
        prevProcessing.current = res.items.length;
      })
      .catch(() => undefined);
  }, [fetchCompleted]);

  useEffect(() => {
    pollProcessing();
  }, [pollProcessing]);
  usePolling(pollProcessing, 5000, true);

  const searching = query.trim().length > 0;
  const showEmpty = loaded && !searching && videos.length === 0 && processing.length === 0;

  return (
    <>
      <AppHeader>
        <SearchBar onSearch={setQuery} variant="header" />
      </AppHeader>

      {showEmpty ? (
        <EmptyLibrary onSearch={setQuery} />
      ) : (
        <main className="container page">
          <div className="section-head">
            <div className="section-head__title">
              <h2>{searching ? "Results" : "Library"}</h2>
              <span className="section-head__count">
                {searching
                  ? `${total} match${total === 1 ? "" : "es"}`
                  : `${total} transcript${total === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>

          {!searching && processing.length > 0 && (
            <div className="stack">
              {processing.map((v) => (
                <ProcessingRow key={v.id} video={v} />
              ))}
            </div>
          )}

          {loading && videos.length === 0 ? (
            <p className="center-note">Loading…</p>
          ) : (
            <VideoList videos={videos} />
          )}
        </main>
      )}
    </>
  );
}
