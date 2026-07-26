export type CoverageCluster = {
  id: string;
  label: string;
  topics: string[];
};

/** Topic coverage map — what the brand "owns" in public. */
export const coverageClusters: CoverageCluster[] = [
  {
    id: "languages",
    label: "Languages",
    topics: ["JavaScript", "TypeScript", "SQL"],
  },
  {
    id: "interfaces",
    label: "Interfaces",
    topics: ["React", "Vue", "Angular"],
  },
  {
    id: "services",
    label: "Services",
    topics: ["API design", "Node.js", "Auth patterns"],
  },
  {
    id: "data",
    label: "Data",
    topics: ["Postgres", "Caching", "Migrations"],
  },
  {
    id: "platform",
    label: "Platform",
    topics: ["Containers", "Kubernetes", "CI pipelines"],
  },
  {
    id: "architecture",
    label: "Architecture",
    topics: ["Boundaries", "Async workflows", "Failure modes"],
  },
];

/** Rare cluster — appears when regenerating coverage with certain seeds. */
export const easterEggCluster: CoverageCluster = {
  id: "adjacent",
  label: "Adjacent skills",
  topics: ["Soft skills", "Career growth", "Best practices"],
};

export const coverageAudiences = [
  "senior engineers building in public",
  "developer advocates on a posting schedule",
  "technical creators with a content calendar",
  "engineering leads who need to stay visible",
];
