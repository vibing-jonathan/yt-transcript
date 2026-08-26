import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: { videoId: string; events?: { onReady?: () => void } }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  seekTo(seconds: number, allowSeekAhead: boolean): void;
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT) return Promise.resolve();
  if (!apiLoadPromise) {
    apiLoadPromise = new Promise((resolve) => {
      window.onYouTubeIframeAPIReady = () => resolve();
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return apiLoadPromise;
}

export function useYouTubePlayer(elementId: string, videoId: string) {
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeIframeApi().then(() => {
      if (cancelled || !window.YT) return;
      playerRef.current = new window.YT.Player(elementId, { videoId });
    });
    return () => {
      cancelled = true;
      playerRef.current = null;
    };
  }, [elementId, videoId]);

  function seekTo(seconds: number) {
    playerRef.current?.seekTo(seconds, true);
  }

  return { seekTo };
}
