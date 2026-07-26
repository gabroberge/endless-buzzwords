export type SnippetBank = {
  openings: string[];
  observations: string[];
  tensions: string[];
  closers: string[];
};

export const banks: Record<string, SnippetBank> = {
  apis: {
    openings: [
      "Most API reviews spend too long on endpoint naming.",
      "A contract can be correct and still be expensive to evolve.",
      "Pagination debates usually hide a product question.",
    ],
    observations: [
      "Clients absorb ambiguity that the server team never sees.",
      "Versioning policies only matter once a second consumer appears.",
      "Idempotency keys are documentation as much as they are code.",
    ],
    tensions: [
      "Strict schemas improve safety and slow exploratory clients.",
      "GraphQL reduces round trips and concentrates complexity in one layer.",
      "Public APIs inherit every internal naming accident.",
    ],
    closers: [
      "Design the change story before you design the resource model.",
      "If two teams disagree on the contract, the contract is incomplete.",
    ],
  },
  caching: {
    openings: [
      "Cache bugs rarely look like cache bugs at first.",
      "TTL is a product decision dressed as infrastructure.",
      "Hit ratio is a lagging indicator of design quality.",
    ],
    observations: [
      "Invalidation paths are where ownership usually breaks.",
      "Stale reads are tolerable until they aren't, and the threshold is rarely written down.",
      "Edge caches amplify both speed and misunderstanding.",
    ],
    tensions: [
      "Shorter TTLs protect correctness and punish origin load.",
      "Warming strategies help launches and hide cold-path fragility.",
    ],
    closers: [
      "Write the invalidation rule next to the write path.",
      "If you can't explain staleness to support, don't ship the cache.",
    ],
  },
  "system-design": {
    openings: [
      "Capacity planning starts with the question teams avoid naming.",
      "Diagrams age faster than the constraints that produced them.",
      "Most 'scalable' designs are really 'familiar' designs.",
    ],
    observations: [
      "Hot keys appear after the happy-path demo.",
      "Consistency requirements are often borrowed from adjacent systems without review.",
      "Fan-out looks elegant until one consumer becomes the bottleneck.",
    ],
    tensions: [
      "Queues decouple teams and delay failure visibility.",
      "Shared databases reduce duplication and create release coupling.",
    ],
    closers: [
      "Prefer the design you can operate at 2 a.m.",
      "Document the load you refuse to support.",
    ],
  },
  react: {
    openings: [
      "Render cost usually hides in boundaries, not components.",
      "State location predicts the shape of your bugs.",
      "A clean component tree can still be an expensive product.",
    ],
    observations: [
      "Memoization arrives after the ownership model is already wrong.",
      "Server data and UI state get conflated under deadline pressure.",
      "Design systems absorb complexity until no one owns the escape hatches.",
    ],
    tensions: [
      "More client state feels flexible and makes recovery harder.",
      "Suspense boundaries improve UX and complicate error reporting.",
    ],
    closers: [
      "Measure the interaction, not the re-render count alone.",
      "Put unstable props on a short leash.",
    ],
  },
  default: {
    openings: [
      "Shipping cadence and technical clarity are not the same skill.",
      "The interesting failure mode is usually one layer below the alert.",
      "Teams inherit defaults they never consciously chose.",
    ],
    observations: [
      "Naming is where architecture decisions become social.",
      "Ownership gaps look like tooling gaps until you map them.",
      "The second consumer of a system teaches you what the first one forgave.",
    ],
    tensions: [
      "Automation reduces toil and concentrates rare, sharp failures.",
      "Abstractions buy speed and sell debuggability.",
    ],
    closers: [
      "Write down the assumption you are unwilling to revisit.",
      "Optimize for the conversation you want in the next incident.",
    ],
  },
};

export const comparisons = [
  { a: "Sync request/response", b: "Async job + webhook", context: "user-facing export" },
  { a: "Shared library", b: "Internal service", context: "cross-team reuse" },
  { a: "Row-level locks", b: "Optimistic concurrency", context: "inventory updates" },
  { a: "Monolith module", b: "Extracted worker", context: "report generation" },
  { a: "Feature flag", b: "Branch deploy", context: "risky UI change" },
  { a: "Materialized view", b: "On-read aggregation", context: "dashboard latency" },
];

export const checklistItems = [
  "Define the owner of the failure path",
  "Name the consistency promise in one sentence",
  "Decide what support will tell customers",
  "Measure the path users actually wait on",
  "Record the rollback that does not require a meeting",
  "List the second system this will couple to",
  "Confirm logs answer 'what changed' without SSH folklore",
  "Agree which metric means stop shipping",
];

export const debugSetups = [
  {
    scene: "Latency climbed after a routine config change.",
    facts: ["Deploy markers look clean", "Error rate is flat", "Only one region reports it"],
    ask: "Where do you start?",
  },
  {
    scene: "A background worker is falling behind without a traffic spike.",
    facts: ["Queue depth is uneven", "CPU on consumers is modest", "Retries are climbing slowly"],
    ask: "What do you inspect first?",
  },
  {
    scene: "A dashboard number diverges from the warehouse after a schema tweak.",
    facts: ["Ingestion still green", "Only one tenant complains", "The raw table looks intact"],
    ask: "Which layer do you trust least?",
  },
  {
    scene: "Mobile clients see stale profile data after password reset.",
    facts: ["Web clients are fine", "CDN purge ran", "Auth service reports success"],
    ask: "What is your first hypothesis?",
  },
];

export const threadBeats = [
  "Start with the symptom people actually feel.",
  "Separate the constraint from the fashion.",
  "Show the tradeoff without picking a villain.",
  "Offer one concrete default.",
  "Leave room for practitioners to disagree usefully.",
];

export const scriptBeats = [
  "Hook with a concrete failure people recognize.",
  "Name the false fix everyone reaches for.",
  "Show the cheaper check that usually works.",
  "Close with a rule of thumb, not a tool pitch.",
];
