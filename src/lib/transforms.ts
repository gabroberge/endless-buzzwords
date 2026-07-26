import type { Draft, TransformAction } from "./content-engine";
import { banks } from "./data/templates";
import { topicById } from "./data/topics";
import {
  MAX_AUTHORITY_TIER,
  MAX_BUZZWORD_COUNT,
  authorityTiers,
  buzzwordPool,
  ctaLines,
  productionFrames,
  thoughtLeadershipFrames,
  urgencyPhrases,
} from "./data/voice";

function bankFor(topicId: string) {
  return banks[topicId] ?? banks.default!;
}

export type DraftFlags = {
  urgency: boolean;
  thoughtLeadership: boolean;
  interview: boolean;
  roadmap: boolean;
  tradeoff: boolean;
  controversial: boolean;
  production: boolean;
  linkedin: boolean;
  x: boolean;
};

export const emptyDraftFlags = (): DraftFlags => ({
  urgency: false,
  thoughtLeadership: false,
  interview: false,
  roadmap: false,
  tradeoff: false,
  controversial: false,
  production: false,
  linkedin: false,
  x: false,
});

export function normalizeDraftFlags(flags?: Partial<DraftFlags>): DraftFlags {
  return { ...emptyDraftFlags(), ...flags };
}

export function authorityLabel(tier: number): string {
  return authorityTiers[Math.min(MAX_AUTHORITY_TIER, Math.max(0, tier))]!;
}

export type TransformOutcome = {
  draft: Draft;
  applied: boolean;
  terminal: boolean;
  message: string;
};

export type ControlState = {
  disabled: boolean;
  label: string;
  hint?: string;
};

function pick<T>(list: readonly T[], index: number): T {
  return list[index % list.length]!;
}

function buzzwordForIndex(index: number): string {
  return buzzwordPool[index % buzzwordPool.length]!;
}

function applyAuthorityStep(topic: string, title: string, body: string, nextTier: number) {
  if (nextTier === 1) {
    return {
      title: title.replace(/^Quick take$/, "Senior take").replace(/^Field note/, "Senior field note"),
      body: `In production at scale, ${topic.toLowerCase()} stops being theoretical.\n\n${body}`,
    };
  }
  if (nextTier === 2) {
    return {
      title: title.replace(/^Senior take$/, "Staff take").replace(/^Senior field note/, "Staff field note"),
      body: `What separates staff engineers on ${topic.toLowerCase()} is how they frame ambiguity before the incident.\n\n${body}`,
    };
  }
  return {
    title: `Thought leadership · ${topic}`,
    body: `${pick(thoughtLeadershipFrames, 0)}\n\n${body}`,
  };
}

function injectBuzzwordPhrase(topic: string, body: string, count: number): string {
  const word = buzzwordForIndex(count - 1);
  const lines = body.split("\n").filter((line) => line.trim());
  const topicLabel = topic.toLowerCase();

  switch (count) {
    case 1:
      return [lines[0] ?? "", `Lens: ${word} constraints in ${topicLabel}.`, ...lines.slice(1)].join("\n");
    case 2:
      return [lines[0] ?? "", `The ${word} layer is where ${topicLabel} surprises most teams.`, ...lines.slice(1)].join("\n");
    case 3:
      return `${body}\n\nPressure-test this against ${word} requirements before you ship.`;
    case 4:
      return `${body}\n\nOperating model: ${word}, ownership, measurable outcomes.`;
    case 5:
      return `${body}\n\nSemantic note: ${word}, platform thinking, and operational excellence — in that order.`;
    default:
      return body;
  }
}

export function getTransformControlState(draft: Draft, action: TransformAction): ControlState {
  const tier = draft.authorityTier ?? 0;
  const buzzwords = draft.buzzwordCount ?? 0;
  const flags = normalizeDraftFlags(draft.flags);

  switch (action) {
    case "senior":
      if (tier >= MAX_AUTHORITY_TIER) {
        return { disabled: true, label: "Maximum authority reached", hint: "Maximum authority reached" };
      }
      return { disabled: false, label: "Make it more senior" };
    case "buzzwords":
      if (buzzwords >= MAX_BUZZWORD_COUNT) {
        return { disabled: true, label: "Semantic saturation reached", hint: "Semantic saturation reached" };
      }
      return { disabled: false, label: "Add buzzwords" };
    case "urgency":
      return flags.urgency
        ? { disabled: true, label: "Urgency already applied", hint: "Urgency already applied" }
        : { disabled: false, label: "Add urgency" };
    case "thought-leadership":
      return flags.thoughtLeadership
        ? { disabled: true, label: "Thought leadership applied", hint: "Thought leadership applied" }
        : { disabled: false, label: "Make it thought leadership" };
    case "interview":
      return flags.interview
        ? { disabled: true, label: "Already an interview question", hint: "Already an interview question" }
        : { disabled: false, label: "Turn into interview question" };
    case "roadmap":
      return flags.roadmap
        ? { disabled: true, label: "Already a roadmap", hint: "Already repackaged as roadmap" }
        : { disabled: false, label: "Repackage as roadmap" };
    case "tradeoff":
      return flags.tradeoff
        ? { disabled: true, label: "Tradeoff already added", hint: "Tradeoff already added" }
        : { disabled: false, label: "Add a tradeoff" };
    case "controversial":
      return flags.controversial
        ? { disabled: true, label: "Controversy already added", hint: "Controversy already added" }
        : { disabled: false, label: "Make it controversial" };
    case "production":
      return flags.production
        ? { disabled: true, label: "Production framing applied", hint: "Production framing applied" }
        : { disabled: false, label: "Add production framing" };
    case "linkedin":
      return flags.linkedin
        ? { disabled: true, label: "LinkedIn variant created", hint: "LinkedIn variant already created" }
        : { disabled: false, label: "Repackage for LinkedIn" };
    case "x":
      return flags.x
        ? { disabled: true, label: "X variant created", hint: "X variant already created" }
        : { disabled: false, label: "Compress for X" };
    default:
      return { disabled: false, label: action };
  }
}

export function applyTransform(draft: Draft, action: TransformAction): TransformOutcome {
  const control = getTransformControlState(draft, action);
  if (control.disabled) {
    return {
      draft,
      applied: false,
      terminal: true,
      message: control.hint ?? control.label,
    };
  }

  const topic = topicById[draft.topicId]?.label ?? "engineering";
  const flags = normalizeDraftFlags(draft.flags);
  let { title, body, channelHint, signal, onMessage } = draft;
  let authorityTier = draft.authorityTier ?? 0;
  let buzzwordCount = draft.buzzwordCount ?? 0;

  if (action === "senior") {
    const nextTier = authorityTier + 1;
    const next = applyAuthorityStep(topic, title, body, nextTier);
    title = next.title;
    body = next.body;
    authorityTier = nextTier;
    signal = Math.min(99, signal + 4);
    onMessage = Math.min(99, onMessage + 3);
  } else if (action === "buzzwords") {
    buzzwordCount += 1;
    body = injectBuzzwordPhrase(topic, body, buzzwordCount);
    signal = Math.min(99, signal + 2);
  } else if (action === "urgency") {
    flags.urgency = true;
    body = `${pick(urgencyPhrases, buzzwordCount)}\n\n${body}`;
    signal = Math.min(99, signal + 5);
  } else if (action === "thought-leadership") {
    flags.thoughtLeadership = true;
    title = `Thought leadership · ${topic}`;
    body = `${pick(thoughtLeadershipFrames, 1)}\n\n${body}`;
    onMessage = Math.min(99, onMessage + 4);
  } else if (action === "interview") {
    flags.interview = true;
    title = `Interview question · ${topic}`;
    body = [
      `Q: How would you evaluate ${topic.toLowerCase()} tradeoffs in a system you've actually operated?`,
      "",
      "What a strong answer covers:",
      "• The constraint that usually gets hand-waved",
      "• The failure mode teams discover in month two",
      "• The metric you'd watch before calling it done",
      "",
      `Starter context: ${body.split("\n").filter(Boolean)[0] ?? pick(bankFor(draft.topicId).openings, 0)}`,
    ].join("\n");
  } else if (action === "roadmap") {
    flags.roadmap = true;
    const b = bankFor(draft.topicId);
    title = `Roadmap · ${topic}`;
    body = [
      `Phase 1 — Baseline: ${pick(b.openings, 0)}`,
      `Phase 2 — Hardening: ${pick(b.observations, 0)}`,
      `Phase 3 — Scale narrative: ${pick(b.closers, 0)}`,
      "",
      "Same idea. Three quarters of content.",
    ].join("\n");
    signal = Math.min(99, signal + 3);
  } else if (action === "tradeoff") {
    flags.tradeoff = true;
    const b = bankFor(draft.topicId);
    body = `${body}\n\nTradeoff: ${pick(b.tensions, 0)}\nUpside: ${pick(b.observations, 0)}`;
    signal = Math.min(99, signal + 2);
  } else if (action === "controversial") {
    flags.controversial = true;
    body = `Unpopular opinion:\n\n${body}`;
    title = title.replace(/^Quick take$/, "Hot take");
    signal = Math.min(99, signal + 6);
  } else if (action === "production") {
    flags.production = true;
    body = `${pick(productionFrames, 0)}\n\n${body}`;
    authorityTier = Math.min(MAX_AUTHORITY_TIER, authorityTier + 1);
    onMessage = Math.min(99, onMessage + 2);
  } else if (action === "linkedin") {
    flags.linkedin = true;
    channelHint = "linkedin";
    body = `${body}\n\n${pick(ctaLines, 0)}`;
    title = draft.title.replace(/^Thread outline$/, "LinkedIn note");
    signal = Math.min(99, signal + 3);
  } else if (action === "x") {
    flags.x = true;
    channelHint = "x";
    const compressed = body
      .split("\n")
      .filter((l) => l.trim())
      .slice(0, 4)
      .join("\n");
    body = compressed.length > 240 ? compressed.slice(0, 237) + "…" : compressed;
    title = "Compressed take";
    signal = Math.min(99, signal + 2);
  }

  const nextDraft: Draft = {
    ...draft,
    title,
    body,
    channelHint,
    signal,
    onMessage,
    authorityTier,
    buzzwordCount,
    buzzwords: buzzwordCount,
    seniority: authorityTier + 2,
    flags,
  };

  const terminal = getTransformControlState(nextDraft, action).disabled;

  return {
    draft: nextDraft,
    applied: true,
    terminal,
    message: terminal ? (getTransformControlState(nextDraft, action).hint ?? "Limit reached") : "Draft updated",
  };
}
