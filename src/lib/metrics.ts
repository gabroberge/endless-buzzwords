import type { Workspace } from "./storage";
import { bylineModes } from "./data/voice";

export type OpsMetrics = {
  cadenceTarget: number;
  publishedThisWeek: number;
  scheduledAheadDays: number;
  coverageBreadth: number;
  onMessageAvg: number;
  signalAvg: number;
  activeChannels: number;
  draftsReady: number;
  bylineLabel: string;
  experienceDensity: "Sparse" | "Moderate" | "Dense";
};

export function computeOpsMetrics(ws: Workspace): OpsMetrics {
  const weekAgo = Date.now() - 7 * 86400000;
  const publishedThisWeek = ws.pipeline.filter(
    (p) => p.status === "published" && new Date(p.when).getTime() >= weekAgo,
  ).length;

  const upcoming = ws.pipeline
    .filter((p) => p.status === "scheduled" || p.status === "queued")
    .map((p) => new Date(p.when).getTime())
    .sort((a, b) => b - a);
  const farthest = upcoming[0] ?? Date.now();
  const scheduledAheadDays = Math.max(0, Math.round((farthest - Date.now()) / 86400000));

  const pool = [...ws.drafts, ...ws.published];
  const onMessageAvg = pool.length
    ? Math.round(pool.reduce((s, d) => s + d.onMessage, 0) / pool.length)
    : 82;
  const signalAvg = pool.length ? Math.round(pool.reduce((s, d) => s + d.signal, 0) / pool.length) : 64;

  const byline = bylineModes.find((b) => b.id === ws.bylineId);

  return {
    cadenceTarget: ws.cadenceTarget,
    publishedThisWeek,
    scheduledAheadDays,
    coverageBreadth: ws.coverage?.breadth ?? 61,
    onMessageAvg,
    signalAvg,
    activeChannels: ws.channels.filter((c) => c.connected).length,
    draftsReady: ws.drafts.length,
    bylineLabel: byline?.label ?? "Brand account",
    // Deliberately ordinary-looking; stays Sparse unless named contributor is chosen
    experienceDensity: ws.bylineId === "contributor" ? "Moderate" : "Sparse",
  };
}
