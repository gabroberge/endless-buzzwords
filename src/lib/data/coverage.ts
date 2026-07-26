export type CoverageCluster = {
  /** Brand focus topic id */
  id: string;
  /** Brand focus topic label */
  label: string;
  /** Editorial angles — depth, not additional claimed expertise */
  topics: string[];
};

/** Editorial angles per Brand focus topic. Never introduce other technologies here. */
export const topicEditorialAngles: Record<string, string[]> = {
  javascript: [
    "Module boundaries",
    "Runtime tradeoffs",
    "Async mental models",
    "Bundle size pressure",
    "Legacy coexistence",
  ],
  typescript: [
    "Type boundaries",
    "Inference limits",
    "API surface typing",
    "Gradual adoption",
    "Strictness tradeoffs",
  ],
  react: ["Component boundaries", "State ownership", "Rendering", "Hooks", "Composition patterns"],
  angular: ["Change detection", "Module boundaries", "Template contracts", "Dependency injection", "Zone tradeoffs"],
  vue: ["Reactivity boundaries", "Component contracts", "State ownership", "Composition API", "Template clarity"],
  nodejs: ["Event loop pressure", "I/O boundaries", "Process isolation", "Memory ceilings", "Startup latency"],
  apis: ["Contract evolution", "Versioning", "Error semantics", "Backward compatibility", "Request shaping"],
  sql: ["Query plans", "Index tradeoffs", "Migration risk", "Consistency boundaries", "Hot path queries"],
  databases: ["Schema evolution", "Connection pooling", "Replication lag", "Backup posture", "Ownership boundaries"],
  caching: ["Invalidation", "Cache boundaries", "Staleness", "Hot paths", "TTL tradeoffs"],
  testing: ["Flake sources", "Boundary coverage", "Fixture drift", "Contract tests", "Release confidence"],
  ci: ["Pipeline latency", "Deploy gates", "Rollback posture", "Environment parity", "Change blast radius"],
  observability: ["Signal vs noise", "Cardinality limits", "Alert fatigue", "Trace boundaries", "SLO framing"],
  kubernetes: ["Pod scheduling", "Control plane load", "Resource limits", "Rollout strategy", "Namespace boundaries"],
  cloud: ["Cost boundaries", "Region failover", "Managed vs owned", "Capacity planning", "Vendor lock-in"],
  security: ["Threat modeling", "Auth boundaries", "Secret rotation", "Supply chain risk", "Least privilege"],
  "system-design": ["Failure modes", "Boundaries", "Scaling tradeoffs", "Coupling", "Capacity planning"],
  distributed: ["Consistency tradeoffs", "Partition behavior", "Idempotency", "Clock skew", "Ownership lines"],
  events: ["Delivery semantics", "Ordering guarantees", "Consumer lag", "Schema evolution", "Replay strategy"],
  "ai-eng": ["Prompt boundaries", "Evaluation drift", "Cost ceilings", "Human review gates", "Output guardrails"],
};

export const coverageAudiences = [
  "senior engineers building in public",
  "developer advocates on a posting schedule",
  "technical creators with a content calendar",
  "engineering leads who need to stay visible",
];
