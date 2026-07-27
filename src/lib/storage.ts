import type { BylineId, VoiceId } from "./data/voice";
import type { Draft } from "./content-engine";
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
  /** Set only when status is scheduled or published. */
  channelId?: ChannelId;
  when: string;
  status: "queued" | "scheduled" | "published";
};

export type Workspace = {
  version: 2;
  brandName: string;
  voiceId: VoiceId | null;
  bylineId: BylineId | null;
  cadenceTarget: number | null;
  focusTopics: string[];
  channels: Channel[];
  drafts: Draft[];
  published: Draft[];
  pipeline: PipelineItem[];
  coverage: CoverageMap | null;
};

const KEY = "endless-buzzwords.workspace.v2";

/** Available platforms — all disconnected until the user connects them. */
export const platformChannels: Channel[] = [
  { id: "linkedin", label: "LinkedIn", connected: false },
  { id: "x", label: "X", connected: false },
  { id: "youtube", label: "YouTube", connected: false },
  { id: "facebook", label: "Facebook", connected: false },
];

/** @deprecated Use platformChannels */
export const defaultChannels = platformChannels;

export function isBrandConfigured(ws: Workspace): boolean {
  return Boolean(
    ws.brandName.trim() ||
      ws.cadenceTarget != null ||
      ws.voiceId ||
      ws.bylineId ||
      ws.focusTopics.length > 0,
  );
}

export function createWorkspace(): Workspace {
  return normalizeWorkspace({
    version: 2,
    brandName: "",
    voiceId: null,
    bylineId: null,
    cadenceTarget: null,
    focusTopics: [],
    channels: structuredClone(platformChannels),
    drafts: [],
    published: [],
    pipeline: [],
    coverage: null,
  });
}

function mergeWorkspace(base: Workspace, saved: Partial<Workspace>): Workspace {
  return {
    ...base,
    ...saved,
    version: 2,
    channels: saved.channels?.length ? saved.channels : base.channels,
    drafts: saved.drafts ?? base.drafts,
    published: saved.published ?? base.published,
    pipeline: saved.pipeline ?? base.pipeline,
    focusTopics: saved.focusTopics ?? base.focusTopics,
    coverage: saved.coverage ?? base.coverage,
  };
}

export function loadWorkspace(): Workspace {
  if (typeof localStorage === "undefined") return createWorkspace();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.removeItem("endless-buzzwords.workspace.v1");
      return createWorkspace();
    }
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    if (parsed?.version !== 2) {
      localStorage.removeItem("endless-buzzwords.workspace.v1");
      return createWorkspace();
    }
    return normalizeWorkspace(mergeWorkspace(createWorkspace(), parsed));
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
