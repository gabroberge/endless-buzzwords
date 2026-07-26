import { coverageAudiences, topicEditorialAngles, type CoverageCluster } from "./data/coverage";
import { topicById } from "./data/topics";

export type CoverageMap = {
  id: string;
  title: string;
  audience: string;
  clusters: CoverageCluster[];
  breadth: number;
  refreshedAt: string;
  focusTopicIds: string[];
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)]!;
}

function shuffle<T>(rng: () => number, list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function anglePool(topicId: string): string[] {
  return topicEditorialAngles[topicId] ?? [];
}

function clusterForTopic(rng: () => number, topicId: string): CoverageCluster | null {
  const topic = topicById[topicId];
  if (!topic) return null;

  const pool = anglePool(topicId);
  if (!pool.length) return { id: topicId, label: topic.label, topics: [] };

  const count = Math.min(pool.length, Math.max(3, 3 + Math.floor(rng() * 2)));
  return {
    id: topicId,
    label: topic.label,
    topics: shuffle(rng, [...pool]).slice(0, count),
  };
}

function computeBreadth(clusters: CoverageCluster[], rng: () => number): number {
  const angleCount = clusters.reduce((n, c) => n + c.topics.length, 0);
  if (!clusters.length) return 0;
  return Math.min(98, Math.round(48 + angleCount * 2.4 + clusters.length * 4 + rng() * 6));
}

export function buildCoverage(seed: number, focusTopicIds: string[]): CoverageMap {
  const rng = mulberry32(seed);
  const ids = [...new Set(focusTopicIds)].filter((id) => topicById[id]);
  const clusters = shuffle(rng, ids)
    .map((id) => clusterForTopic(rng, id))
    .filter((c): c is CoverageCluster => c !== null);

  return {
    id: `cov_${Date.now().toString(36)}`,
    title: "Topic runway map",
    audience: pick(rng, coverageAudiences),
    clusters,
    breadth: computeBreadth(clusters, rng),
    refreshedAt: new Date().toISOString(),
    focusTopicIds: ids,
  };
}

export function rebalanceCoverage(map: CoverageMap, seed = Date.now()): CoverageMap {
  const rng = mulberry32(seed);
  const clusters = shuffle(rng, [...map.clusters]).map((cluster) => {
    const pool = anglePool(cluster.id);
    const size = Math.min(pool.length, Math.max(3, cluster.topics.length || 3));
    return {
      ...cluster,
      topics: shuffle(rng, [...pool]).slice(0, size),
    };
  });

  return {
    ...map,
    clusters,
    breadth: Math.min(99, map.breadth + 1),
    refreshedAt: new Date().toISOString(),
    focusTopicIds: map.focusTopicIds,
  };
}

export function isCoverageValid(map: CoverageMap | null | undefined, focusTopicIds: string[]): boolean {
  if (!map?.clusters?.length || !focusTopicIds.length) return false;
  const focusSet = new Set(focusTopicIds);
  if (map.clusters.length !== focusSet.size) return false;
  return map.clusters.every((cluster) => focusSet.has(cluster.id) && cluster.label === topicById[cluster.id]?.label);
}
