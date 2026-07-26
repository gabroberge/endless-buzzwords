import { coverageAudiences, coverageClusters, easterEggCluster, type CoverageCluster } from "./data/coverage";

export type CoverageMap = {
  id: string;
  title: string;
  audience: string;
  clusters: CoverageCluster[];
  breadth: number;
  refreshedAt: string;
  includesEasterEgg: boolean;
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

export function buildCoverage(seed = Date.now(), withEgg = false): CoverageMap {
  const rng = mulberry32(seed);
  let clusters = coverageClusters.map((c) => ({
    ...c,
    topics: shuffle(rng, [...c.topics]).slice(0, Math.max(2, c.topics.length - (rng() > 0.65 ? 1 : 0))),
  }));

  const includesEasterEgg = withEgg || rng() > 0.92;
  if (includesEasterEgg) {
    clusters = [...clusters.slice(0, 4), easterEggCluster, ...clusters.slice(4)];
  }

  const topicCount = clusters.reduce((n, c) => n + c.topics.length, 0);

  return {
    id: `cov_${Date.now().toString(36)}`,
    title: "Public topic coverage",
    audience: pick(rng, coverageAudiences),
    clusters,
    breadth: Math.min(98, Math.round(55 + topicCount * 1.8 + rng() * 8)),
    refreshedAt: new Date().toISOString(),
    includesEasterEgg,
  };
}

export function rebalanceCoverage(map: CoverageMap): CoverageMap {
  return {
    ...map,
    breadth: Math.min(99, map.breadth + 1),
    refreshedAt: new Date().toISOString(),
    title: map.title,
    clusters: map.clusters.map((c) => ({ ...c })),
  };
}
