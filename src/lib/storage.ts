import type { BylineId, VoiceId } from "./data/voice";
import { composeDraft, type Draft } from "./content-engine";
import { normalizeWorkspace } from "./content-lifecycle";
import type { CoverageMap } from "./coverage-engine";

export type ChannelId = "youtube" | "linkedin" | "facebook" | "x";

export type Channel = {
  id: ChannelId;
  label: string;
  connected: boolean;
};

export type PipelineItem = {
  id: string;
  draftId: string;
  title: string;
  channelId: ChannelId;
  when: string;
  status: "queued" | "scheduled" | "published";
};

export type Workspace = {
  version: 2;
  brandName: string;
  voiceId: VoiceId;
  bylineId: BylineId;
  cadenceTarget: number;
  focusTopics: string[];
  channels: Channel[];
  drafts: Draft[];
  published: Draft[];
  pipeline: PipelineItem[];
  coverage: CoverageMap | null;
};

const KEY = "endless-buzzwords.workspace.v2";

export const defaultChannels: Channel[] = [
  { id: "linkedin", label: "LinkedIn", connected: true },
  { id: "x", label: "X", connected: true },
  { id: "youtube", label: "YouTube", connected: false },
  { id: "facebook", label: "Facebook", connected: false },
];

function seedDrafts(): Draft[] {
  const specs = [
    { id: "seed1", title: "Field note · API design", topicId: "apis", formatId: "field-note" as const, seed: 1001 },
    { id: "seed2", title: "Sync vs async for exports", topicId: "apis", formatId: "quick-take" as const, seed: 1002 },
    { id: "seed3", title: "Debug prompt · worker lag", topicId: "system-design", formatId: "debug-prompt" as const, seed: 1003 },
    { id: "seed4", title: "60-second script · caching", topicId: "caching", formatId: "short-script" as const, seed: 1004 },
  ];

  return specs.map((spec) => {
    const draft = composeDraft({
      topicId: spec.topicId,
      formatId: spec.formatId,
      voiceId: "desk",
      seed: spec.seed,
    });
    return { ...draft, id: spec.id, title: spec.title };
  });
}

function seedPipeline(): PipelineItem[] {
  const now = Date.now();
  const day = 86400000;
  return [
    {
      id: "p1",
      draftId: "seed1",
      title: "Field note · API design",
      channelId: "linkedin",
      when: new Date(now + day).toISOString(),
      status: "scheduled",
    },
    {
      id: "p2",
      draftId: "seed2",
      title: "Sync vs async for exports",
      channelId: "x",
      when: new Date(now + day).toISOString(),
      status: "scheduled",
    },
    {
      id: "p3",
      draftId: "seed3",
      title: "Debug prompt · worker lag",
      channelId: "linkedin",
      when: new Date(now + day * 2).toISOString(),
      status: "scheduled",
    },
    {
      id: "p4",
      draftId: "seed4",
      title: "60-second script · caching",
      channelId: "youtube",
      when: new Date(now + day * 4).toISOString(),
      status: "queued",
    },
  ];
}

export function createWorkspace(): Workspace {
  return normalizeWorkspace({
    version: 2,
    brandName: "North Desk",
    voiceId: "desk",
    bylineId: "brand",
    cadenceTarget: 5,
    focusTopics: ["apis", "system-design", "caching", "react"],
    channels: structuredClone(defaultChannels),
    drafts: seedDrafts(),
    published: [],
    pipeline: seedPipeline(),
    coverage: null,
  });
}

export function loadWorkspace(): Workspace {
  if (typeof localStorage === "undefined") return createWorkspace();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // migrate away from v1 silently
      localStorage.removeItem("endless-buzzwords.workspace.v1");
      return createWorkspace();
    }
    const parsed = JSON.parse(raw) as Workspace;
    if (parsed?.version !== 2) {
      localStorage.removeItem("endless-buzzwords.workspace.v1");
      return createWorkspace();
    }
    return normalizeWorkspace({ ...createWorkspace(), ...parsed, channels: parsed.channels?.length ? parsed.channels : defaultChannels });
  } catch {
    return createWorkspace();
  }
}

export function saveWorkspace(state: Workspace): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetWorkspace(): Workspace {
  const fresh = createWorkspace();
  saveWorkspace(fresh);
  return fresh;
}

export function updateWorkspace(mutator: (s: Workspace) => Workspace): Workspace {
  const next = mutator(loadWorkspace());
  saveWorkspace(next);
  return next;
}
