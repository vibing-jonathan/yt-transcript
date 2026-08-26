import type { VideoDetail, VideoListResponse, VideoStatusOut, VideoSummary } from "../types/video";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function submitVideo(url: string): Promise<VideoSummary> {
  return request<VideoSummary>("/videos", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function listVideos(params: { q?: string; status?: string; page?: number } = {}): Promise<VideoListResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  const qs = search.toString();
  return request<VideoListResponse>(`/videos${qs ? `?${qs}` : ""}`);
}

export function getVideo(id: string): Promise<VideoDetail> {
  return request<VideoDetail>(`/videos/${id}`);
}

export function getVideoStatus(id: string): Promise<VideoStatusOut> {
  return request<VideoStatusOut>(`/videos/${id}/status`);
}
