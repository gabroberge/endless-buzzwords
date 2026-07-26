import type { Workspace } from "./storage";
import { bylineModes } from "./data/voice";
import { authorityLabel } from "./transforms";
import { getDraftItems } from "./content-lifecycle";

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
  contentRunway: string;
  authorityLevel: string;
  originalThoughts: number;
  buzzwordsDeployed: number;
  seniorContentRatio: number;
  engagementPotential: "Low" | "Medium" | "High";
  humanReview: "Required" | "Optional" | "At checkout";
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

  const pool = ws.drafts;
  const draftItems = getDraftItems(ws);
  const onMessageAvg = pool.length
    ? Math.round(pool.reduce((s, d) => s + d.onMessage, 0) / pool.length)
    : 82;
  const signalAvg = pool.length ? Math.round(pool.reduce((s, d) => s + d.signal, 0) / pool.length) : 64;

  const tierOf = (d: (typeof pool)[number]) => d.authorityTier ?? Math.max(0, (d.seniority ?? 2) - 2);
  const buzzOf = (d: (typeof pool)[number]) => d.buzzwordCount ?? d.buzzwords ?? 0;

  const seniorityAvg = pool.length ? pool.reduce((s, d) => s + tierOf(d), 0) / pool.length : 0;
  const seniorCount = pool.filter((d) => tierOf(d) >= 2).length;
  const buzzwordsDeployed = pool.reduce((s, d) => s + buzzOf(d), 0);

  const seniorContentRatio = pool.length ? Math.round((seniorCount / pool.length) * 100) : 68;

  const byline = bylineModes.find((b) => b.id === ws.bylineId);

  return {
    cadenceTarget: ws.cadenceTarget,
    publishedThisWeek,
    scheduledAheadDays,
    coverageBreadth: ws.coverage?.breadth ?? 61,
    onMessageAvg,
    signalAvg,
    activeChannels: ws.channels.filter((c) => c.connected).length,
    draftsReady: draftItems.length,
    bylineLabel: byline?.label ?? "Brand account",
    contentRunway: scheduledAheadDays >= 14 ? "Unlimited" : `${scheduledAheadDays} days`,
    authorityLevel: authorityLabel(Math.round(seniorityAvg)),
    originalThoughts: 0,
    buzzwordsDeployed,
    seniorContentRatio,
    engagementPotential: signalAvg >= 75 ? "High" : signalAvg >= 60 ? "Medium" : "Low",
    humanReview: ws.bylineId === "contributor" ? "Optional" : "At checkout",
  };
}
