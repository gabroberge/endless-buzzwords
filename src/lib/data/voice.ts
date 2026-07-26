export const voiceProfiles = [
  {
    id: "grounded",
    label: "Grounded",
    description: "Sounds like you've shipped things.",
  },
  {
    id: "curriculum",
    label: "Adaptive Seniority™",
    description: "Automatically sounds more senior than the source material.",
  },
  {
    id: "pointed",
    label: "Pointed",
    description: "Confident, debate-ready, lightly controversial.",
  },
  {
    id: "desk",
    label: "Brand desk",
    description: "Neutral institutional voice. Built for volume.",
  },
] as const;

export type VoiceId = (typeof voiceProfiles)[number]["id"];

export const bylineModes = [
  { id: "brand", label: "Brand account", note: "No individual byline" },
  { id: "desk", label: "Content desk", note: "Shared editorial attribution" },
  { id: "contributor", label: "Named contributor", note: "Rotating handle, moderate human presence" },
] as const;

export type BylineId = (typeof bylineModes)[number]["id"];

export const authorityTiers = ["Senior", "Staff", "Principal", "Thought Leader"] as const;

export const MAX_AUTHORITY_TIER = authorityTiers.length - 1;
export const MAX_BUZZWORD_COUNT = 5;

export const seniorityLabels = ["Junior", "Mid", "Senior", "Staff", "Principal"] as const;

export const buzzwordPool = [
  "event-driven",
  "idempotent",
  "observability",
  "distributed",
  "scalable",
  "cloud-native",
  "resilient",
  "zero-downtime",
  "platform engineering",
  "developer experience",
  "shift-left",
  "bounded context",
  "eventual consistency",
  "horizontal scaling",
  "operational excellence",
] as const;

export const urgencyPhrases = [
  "Worth deciding before your next deploy.",
  "Most teams get this wrong on the first pass.",
  "This shows up in production more than you'd expect.",
  "Easy to ignore until it becomes a postmortem.",
  "Your feed is quiet on this. Fix that.",
];

export const thoughtLeadershipFrames = [
  "The real shift isn't the tool. It's the operating model.",
  "What separates senior teams here is how they frame the tradeoff.",
  "This is less a technology change than a habits change.",
  "The conversation moved. Most posts haven't caught up.",
];

export const stakesPhrases = [
  "This shows up more often than teams expect.",
  "Worth deciding before the next release train.",
  "A quiet source of recurring support load.",
  "Easy to postpone until it becomes expensive.",
];

export const takeawayStarters = [
  "Takeaway:",
  "If you change one thing:",
  "Practical default:",
  "What to write down:",
];

export const ctaLines = [
  "What would you do differently?",
  "Curious how your team handles this.",
  "Reply with the approach that worked for you.",
  "Save this for the next design review.",
];

export const productionFrames = [
  "I've seen this pattern in production more than once.",
  "After enough incidents, you start recognizing the shape.",
  "In real systems, this rarely looks like the diagram.",
  "Production has a way of simplifying the debate.",
];
