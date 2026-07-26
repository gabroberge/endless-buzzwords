import { formats, type FormatId } from "./data/formats";
import {
  banks,
  checklistItems,
  comparisons,
  debugSetups,
  scriptBeats,
  threadBeats,
} from "./data/templates";
import { ctaLines, stakesPhrases, takeawayStarters, type VoiceId } from "./data/voice";
import { topics, topicById } from "./data/topics";

export type Draft = {
  id: string;
  title: string;
  body: string;
  formatId: FormatId;
  topicId: string;
  voiceId: VoiceId;
  channelHint: "linkedin" | "x" | "youtube" | "newsletter";
  signal: number;
  onMessage: number;
  createdAt: string;
};

export type ComposeOptions = {
  topicId?: string;
  formatId?: FormatId;
  voiceId?: VoiceId;
  seed?: number;
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

function pickN<T>(rng: () => number, list: readonly T[], n: number): T[] {
  const copy = [...list];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]!);
  }
  return out;
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function bankFor(topicId: string) {
  return banks[topicId] ?? banks.default!;
}

function voiceWrap(voiceId: VoiceId, body: string, rng: () => number): string {
  if (voiceId === "curriculum") {
    return `Lesson fragment\n\n${body}\n\nPractice: explain this to a teammate in two minutes.`;
  }
  if (voiceId === "pointed") {
    const lines = body.split("\n").filter(Boolean);
    return lines.map((l) => l.replace(/\.$/, "")).join(".\n") + ".";
  }
  if (voiceId === "desk") {
    return `${body}\n\n— Brand desk`;
  }
  if (rng() > 0.55) return `${pick(rng, stakesPhrases)}\n\n${body}`;
  return body;
}

function composeFieldNote(rng: () => number, topicId: string): { title: string; body: string } {
  const b = bankFor(topicId);
  const topic = topicById[topicId]?.label ?? "engineering";
  return {
    title: `Field note · ${topic}`,
    body: [pick(rng, b.openings), "", pick(rng, b.observations), "", pick(rng, b.closers)].join("\n"),
  };
}

function composeQuickTake(rng: () => number, topicId: string): { title: string; body: string } {
  const b = bankFor(topicId);
  return {
    title: "Quick take",
    body: [pick(rng, b.openings), pick(rng, b.tensions), "", pick(rng, b.closers)].join("\n"),
  };
}

function composeComparison(rng: () => number): { title: string; body: string } {
  const c = pick(rng, comparisons);
  return {
    title: `${c.a} vs ${c.b}`,
    body: `Context: ${c.context}.\n\n${c.a} when ownership stays local and the path is request-shaped.\n${c.b} when work can finish out of band and clients can tolerate delay.\n\nNeither is free. Pick the cost you can explain.`,
  };
}

function composeDebug(rng: () => number): { title: string; body: string } {
  const d = pick(rng, debugSetups);
  return {
    title: "Debug prompt",
    body: [d.scene, "", ...d.facts.map((f) => `• ${f}`), "", d.ask].join("\n"),
  };
}

function composeChecklist(rng: () => number, topicId: string): { title: string; body: string } {
  const topic = topicById[topicId]?.label ?? "delivery";
  const items = pickN(rng, checklistItems, 5);
  return {
    title: `Before you ship · ${topic}`,
    body: items.map((item, i) => `${i + 1}. ${item}`).join("\n"),
  };
}

function composeThread(rng: () => number, topicId: string): { title: string; body: string } {
  const b = bankFor(topicId);
  const beats = [
    pick(rng, b.openings),
    ...pickN(rng, threadBeats, 3),
    pick(rng, b.closers),
  ];
  return {
    title: "Thread outline",
    body: beats.map((beat, i) => `${i + 1}/ ${beat}`).join("\n"),
  };
}

function composeScript(rng: () => number, topicId: string): { title: string; body: string } {
  const b = bankFor(topicId);
  return {
    title: "60-second script",
    body: [
      `Hook: ${pick(rng, b.openings)}`,
      `False fix: ${pick(rng, b.tensions)}`,
      `Better check: ${pick(rng, b.observations)}`,
      `Close: ${pick(rng, b.closers)}`,
      "",
      `Pacing cues: ${scriptBeats.slice(0, 3).join(" · ")}`,
    ].join("\n"),
  };
}

function composeCurriculum(rng: () => number, topicId: string): { title: string; body: string } {
  const topic = topicById[topicId]?.label ?? "Systems";
  const b = bankFor(topicId);
  return {
    title: `Curriculum slice · ${topic}`,
    body: [
      `Objective: reason about ${topic.toLowerCase()} under real constraints.`,
      "",
      `Concept: ${pick(rng, b.observations)}`,
      `Common miss: ${pick(rng, b.tensions)}`,
      `Exercise: ${pick(rng, b.closers)}`,
    ].join("\n"),
  };
}

function composeTradeoff(rng: () => number, topicId: string): { title: string; body: string } {
  const b = bankFor(topicId);
  return {
    title: "Tradeoff brief",
    body: [pick(rng, b.tensions), "", `Upside: ${pick(rng, b.observations)}`, `Cost: ${pick(rng, b.openings)}`, "", pick(rng, b.closers)].join("\n"),
  };
}

function composePostmortem(rng: () => number): { title: string; body: string } {
  const d = pick(rng, debugSetups);
  return {
    title: "Postmortem lite",
    body: [
      `Trigger: ${d.scene}`,
      "",
      "What looked fine:",
      ...d.facts.map((f) => `• ${f}`),
      "",
      "What to institutionalize:",
      "• A check that would have caught it earlier",
      "• An owner for the ambiguous layer",
      "• A customer message drafted before the war room",
    ].join("\n"),
  };
}

function build(formatId: FormatId, topicId: string, rng: () => number) {
  switch (formatId) {
    case "field-note":
      return composeFieldNote(rng, topicId);
    case "quick-take":
      return composeQuickTake(rng, topicId);
    case "comparison":
      return composeComparison(rng);
    case "debug-prompt":
      return composeDebug(rng);
    case "checklist":
      return composeChecklist(rng, topicId);
    case "thread":
      return composeThread(rng, topicId);
    case "short-script":
      return composeScript(rng, topicId);
    case "curriculum-slice":
      return composeCurriculum(rng, topicId);
    case "tradeoff":
      return composeTradeoff(rng, topicId);
    case "postmortem-lite":
      return composePostmortem(rng);
    default:
      return composeFieldNote(rng, topicId);
  }
}

const channelByFormat: Record<FormatId, Draft["channelHint"]> = {
  "field-note": "linkedin",
  "quick-take": "x",
  comparison: "linkedin",
  "debug-prompt": "linkedin",
  checklist: "newsletter",
  thread: "x",
  "short-script": "youtube",
  "curriculum-slice": "newsletter",
  tradeoff: "linkedin",
  "postmortem-lite": "linkedin",
};

export function composeDraft(options: ComposeOptions = {}): Draft {
  const seed = options.seed ?? (Date.now() ^ Math.floor(Math.random() * 1e9));
  const rng = mulberry32(seed);
  const topicId = options.topicId ?? pick(rng, topics).id;
  const formatId = options.formatId ?? pick(rng, formats).id;
  const voiceId = options.voiceId ?? "grounded";

  let { title, body } = build(formatId, topicId, rng);
  body = voiceWrap(voiceId, body, rng);

  return {
    id: `draft_${Date.now().toString(36)}_${Math.floor(rng() * 1e6).toString(36)}`,
    title,
    body,
    formatId,
    topicId,
    voiceId,
    channelHint: channelByFormat[formatId],
    signal: Math.round(52 + rng() * 40),
    onMessage: Math.round(70 + rng() * 25),
    createdAt: new Date().toISOString(),
  };
}

export type TransformAction =
  | "linkedin"
  | "x"
  | "cta"
  | "takeaway"
  | "sharpen"
  | "soften"
  | "stakes";

export function transformDraft(draft: Draft, action: TransformAction): Draft {
  const rng = mulberry32(hashSeed(draft.id + action + draft.body.length));
  let { title, body, channelHint, signal, onMessage } = draft;

  if (action === "linkedin") {
    channelHint = "linkedin";
    body = `${body}\n\n${pick(rng, ctaLines)}`;
    title = draft.title.replace(/^Thread outline$/, "LinkedIn note");
    signal = Math.min(99, signal + 3);
  } else if (action === "x") {
    channelHint = "x";
    const compressed = body
      .split("\n")
      .filter((l) => l.trim())
      .slice(0, 4)
      .join("\n");
    body = compressed.length > 240 ? compressed.slice(0, 237) + "…" : compressed;
    title = "Compressed take";
    signal = Math.min(99, signal + 2);
  } else if (action === "cta") {
    if (!ctaLines.some((c) => body.includes(c))) body = `${body}\n\n${pick(rng, ctaLines)}`;
    signal = Math.min(99, signal + 4);
  } else if (action === "takeaway") {
    if (!/Takeaway:|If you change one thing:|Practical default:|What to write down:/.test(body)) {
      const b = bankFor(draft.topicId);
      body = `${body}\n\n${pick(rng, takeawayStarters)} ${pick(rng, b.closers)}`;
    }
    onMessage = Math.min(99, onMessage + 2);
  } else if (action === "sharpen") {
    body = body
      .replace(/\bmaybe\b/gi, "")
      .replace(/\bperhaps\b/gi, "")
      .replace(/\. /g, ". ")
      .replace(/\n{3,}/g, "\n\n");
    const b = bankFor(draft.topicId);
    if (!body.includes(pick(rng, b.closers))) {
      body = `${body}\n\n${pick(rng, b.closers)}`;
    }
    signal = Math.min(99, signal + 1);
  } else if (action === "soften") {
    body = `One framing that tends to help:\n\n${body}\n\nYour constraints may point elsewhere.`;
    onMessage = Math.max(55, onMessage - 2);
  } else if (action === "stakes") {
    if (!stakesPhrases.some((p) => body.includes(p))) body = `${pick(rng, stakesPhrases)}\n\n${body}`;
    signal = Math.min(99, signal + 5);
  }

  return {
    ...draft,
    title,
    body,
    channelHint,
    signal,
    onMessage,
  };
}

export function draftText(draft: Draft): string {
  return `${draft.title}\n\n${draft.body}`;
}

export { formats, topics };
