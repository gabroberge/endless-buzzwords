import type { Workspace } from "./storage";
import { bylineModes } from "./data/voice";
import { authorityLabel } from "./transforms";
import { getDraftItems } from "./content-lifecycle";

export type RunwayCoverage = {
  coveredSlots: number;
  runwayDays: number;
};

export type OpsMetrics = {
  cadenceTarget: number;
  publishedThisWeek: number;
  scheduledAheadDays: number;
  runwaySlots: number;
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

function startOfLocalDay(d: Date): Date {
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return day;
}

function addLocalDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return startOfLocalDay(next);
}

function expectedSlotDate(from: Date, cadence: number, slotIndex: number): Date {
  const weekIndex = Math.floor(slotIndex / cadence);
  const slotInWeek = slotIndex % cadence;
  const dayOffset = weekIndex * 7 + Math.floor((slotInWeek * 7) / cadence);
  return addLocalDays(from, dayOffset);
}

export function computeRunwayCoverage(ws: Workspace): RunwayCoverage {
  const cadence = Math.max(1, ws.cadenceTarget);
  const today = startOfLocalDay(new Date());

  const scheduledDays = new Set(
    ws.pipeline
      .filter((p) => p.status === "scheduled" && p.when)
      .map((p) => startOfLocalDay(new Date(p.when)).getTime()),
  );

  let coveredSlots = 0;
  let lastCoveredDate = today;
  const maxSlots = cadence * 12;

  for (let slotIndex = 0; slotIndex < maxSlots; slotIndex++) {
    const slotDate = expectedSlotDate(today, cadence, slotIndex);
    if (!scheduledDays.has(slotDate.getTime())) break;

    coveredSlots++;
    lastCoveredDate = slotDate;
  }

  const runwayDays =
    coveredSlots === 0 ? 0 : Math.round((lastCoveredDate.getTime() - today.getTime()) / 86400000);

  return { coveredSlots, runwayDays };
}

export function computeOpsMetrics(ws: Workspace): OpsMetrics {
  const weekAgo = Date.now() - 7 * 86400000;
  const publishedThisWeek = ws.pipeline.filter(
    (p) => p.status === "published" && new Date(p.when).getTime() >= weekAgo,
  ).length;

  const { coveredSlots, runwayDays } = computeRunwayCoverage(ws);

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
    scheduledAheadDays: runwayDays,
    runwaySlots: coveredSlots,
    coverageBreadth: ws.coverage?.breadth ?? 61,
    onMessageAvg,
    signalAvg,
    activeChannels: ws.channels.filter((c) => c.connected).length,
    draftsReady: draftItems.length,
    bylineLabel: byline?.label ?? "Brand account",
    contentRunway: runwayDays >= 14 ? "Unlimited" : `${runwayDays} days`,
    authorityLevel: authorityLabel(Math.round(seniorityAvg)),
    originalThoughts: 0,
    buzzwordsDeployed,
    seniorContentRatio,
    engagementPotential: signalAvg >= 75 ? "High" : signalAvg >= 60 ? "Medium" : "Low",
    humanReview: ws.bylineId === "contributor" ? "Optional" : "At checkout",
  };
}
