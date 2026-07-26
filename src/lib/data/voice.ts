export const voiceProfiles = [
  {
    id: "grounded",
    label: "Grounded",
    description: "Calm, practical, production-aware.",
  },
  {
    id: "curriculum",
    label: "Curriculum",
    description: "Structured as if teaching a cohort.",
  },
  {
    id: "pointed",
    label: "Pointed",
    description: "Clear stance, short sentences, debate-ready.",
  },
  {
    id: "desk",
    label: "Brand desk",
    description: "Neutral institutional voice. Default for high volume.",
  },
] as const;

export type VoiceId = (typeof voiceProfiles)[number]["id"];

export const bylineModes = [
  { id: "brand", label: "Brand account", note: "No individual byline" },
  { id: "desk", label: "Content desk", note: "Shared editorial attribution" },
  { id: "contributor", label: "Named contributor", note: "Rotating instructor handle" },
] as const;

export type BylineId = (typeof bylineModes)[number]["id"];

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
