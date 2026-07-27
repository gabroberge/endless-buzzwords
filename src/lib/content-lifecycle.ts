import { composeDraft } from "./content-engine";
import type { Draft } from "./content-engine";
import type { Channel, ChannelId, PipelineItem, Workspace } from "./storage";

export type ContentLifecycle = "draft" | "queued" | "published";

export function getConnectedChannels(ws: Workspace): Channel[] {
  return ws.channels.filter((c) => c.connected);
}

export function isChannelConnected(ws: Workspace, channelId: ChannelId): boolean {
  return ws.channels.some((c) => c.id === channelId && c.connected);
}

export function channelLabelForItem(ws: Workspace, channelId: ChannelId): string {
  const channel = ws.channels.find((c) => c.id === channelId);
  return channel?.label ?? channelId;
}

export function lifecycleOf(draft: Draft): ContentLifecycle {
  return draft.lifecycle ?? "draft";
}

export function findContent(ws: Workspace, contentId: string): Draft | undefined {
  return ws.drafts.find((d) => d.id === contentId);
}

export function inferLifecycle(contentId: string, pipeline: PipelineItem[], fallback: ContentLifecycle = "draft"): ContentLifecycle {
  const related = pipeline.filter((p) => p.draftId === contentId);
  if (related.some((p) => p.status === "queued" || p.status === "scheduled")) return "queued";
  if (related.some((p) => p.status === "published")) return "published";
  return fallback;
}

export function getActiveQueueEntries(ws: Workspace, contentId: string): PipelineItem[] {
  return ws.pipeline.filter(
    (p) => p.draftId === contentId && (p.status === "queued" || p.status === "scheduled"),
  );
}

export function hasActiveQueueEntry(ws: Workspace, contentId: string): boolean {
  return getActiveQueueEntries(ws, contentId).length > 0;
}

export function dedupeActivePipeline(pipeline: PipelineItem[]): PipelineItem[] {
  const published = pipeline.filter((p) => p.status === "published");
  const active = pipeline
    .filter((p) => p.status === "queued" || p.status === "scheduled")
    .sort((a, b) => {
      const aQueued = a.status === "queued";
      const bQueued = b.status === "queued";
      if (aQueued && bQueued) return 0;
      if (aQueued) return 1;
      if (bQueued) return -1;
      return +new Date(a.when) - +new Date(b.when);
    });
  const seen = new Set<string>();
  const uniqueActive: PipelineItem[] = [];
  for (const item of active) {
    if (seen.has(item.draftId)) continue;
    seen.add(item.draftId);
    uniqueActive.push(item);
  }
  return [...uniqueActive, ...published];
}

const channelHintByChannel: Record<ChannelId, Draft["channelHint"]> = {
  linkedin: "linkedin",
  x: "x",
  youtube: "youtube",
  facebook: "linkedin",
};

function seedFromId(id: string): number {
  return id.split("").reduce((n, char) => (n * 31 + char.charCodeAt(0)) >>> 0, 0);
}

export function synthesizeContentFromPipeline(item: PipelineItem): Draft {
  const seed = seedFromId(item.draftId);
  const base = composeDraft({ topicId: "apis", formatId: "field-note", voiceId: "desk", seed });
  return {
    ...base,
    id: item.draftId,
    title: item.title,
    channelHint: item.channelId ? (channelHintByChannel[item.channelId] ?? base.channelHint) : base.channelHint,
    createdAt: item.when,
  };
}

function ensurePipelineContent(drafts: Draft[], pipeline: PipelineItem[]): Draft[] {
  const next = [...drafts];
  for (const item of pipeline) {
    if (next.some((draft) => draft.id === item.draftId)) continue;
    next.push(synthesizeContentFromPipeline(item));
  }
  return next;
}

export function normalizeWorkspace(ws: Workspace): Workspace {
  const mergedDrafts = [...ws.drafts];
  for (const item of ws.published ?? []) {
    if (!mergedDrafts.some((d) => d.id === item.id)) {
      mergedDrafts.push({ ...item, lifecycle: item.lifecycle ?? "published" });
    }
  }

  const pipeline = dedupeActivePipeline(ws.pipeline).map((item) =>
    item.status === "queued" ? { ...item, channelId: undefined, when: "" } : item,
  );
  const withContent = ensurePipelineContent(mergedDrafts, pipeline);
  const drafts = withContent.map((draft) => ({
    ...draft,
    lifecycle: inferLifecycle(draft.id, pipeline, draft.lifecycle ?? "draft"),
  }));

  return { ...ws, drafts, published: [], pipeline };
}

export function getDraftItems(ws: Workspace): Draft[] {
  return ws.drafts.filter((d) => lifecycleOf(d) === "draft");
}

export function getQueuedPipelineItems(ws: Workspace): PipelineItem[] {
  return ws.pipeline
    .filter((p) => p.status === "queued" || p.status === "scheduled")
    .sort((a, b) => {
      const aQueued = a.status === "queued";
      const bQueued = b.status === "queued";
      if (aQueued && bQueued) return 0;
      if (aQueued) return 1;
      if (bQueued) return -1;
      return +new Date(a.when) - +new Date(b.when);
    });
}

export function getPublishedPipelineItems(ws: Workspace): PipelineItem[] {
  return ws.pipeline
    .filter((p) => p.status === "published")
    .sort((a, b) => +new Date(b.when) - +new Date(a.when));
}

export function hasPublishedHistory(ws: Workspace, contentId: string): boolean {
  return ws.pipeline.some((p) => p.draftId === contentId && p.status === "published");
}

export function getLibraryItems(ws: Workspace): Draft[] {
  return [...ws.drafts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function libraryStatusOf(ws: Workspace, draft: Draft): "draft" | "published" {
  return hasPublishedHistory(ws, draft.id) ? "published" : "draft";
}

export function libraryCounts(ws: Workspace) {
  const items = getLibraryItems(ws);
  const published = items.filter((item) => libraryStatusOf(ws, item) === "published").length;
  return {
    total: items.length,
    drafts: items.length - published,
    published,
  };
}

function upsertContent(drafts: Draft[], draft: Draft): Draft[] {
  return [draft, ...drafts.filter((d) => d.id !== draft.id)].slice(0, 50);
}

export function saveToLibrary(ws: Workspace, draft: Draft): Workspace {
  return {
    ...ws,
    drafts: upsertContent(ws.drafts, { ...draft, lifecycle: "draft" }),
  };
}

export function queueContent(
  ws: Workspace,
  draft: Draft,
  options: { channelId?: ChannelId; when?: string | null; status?: PipelineItem["status"] } = {},
): Workspace {
  if (hasActiveQueueEntry(ws, draft.id)) return ws;

  const when = options.when ?? "";
  const hasDate = Boolean(when);
  const status = options.status ?? (hasDate ? "scheduled" : "queued");

  const queued = { ...draft, lifecycle: "queued" as const };

  if (status === "scheduled") {
    const channelId = options.channelId;
    if (!channelId || !hasDate || !isChannelConnected(ws, channelId)) return ws;

    return {
      ...ws,
      drafts: upsertContent(ws.drafts, queued),
      pipeline: dedupeActivePipeline([
        {
          id: `p_${Date.now()}`,
          draftId: draft.id,
          title: draft.title,
          channelId,
          when,
          status: "scheduled",
        },
        ...ws.pipeline,
      ]),
    };
  }

  return {
    ...ws,
    drafts: upsertContent(ws.drafts, queued),
    pipeline: dedupeActivePipeline([
      {
        id: `p_${Date.now()}`,
        draftId: draft.id,
        title: draft.title,
        when: "",
        status: "queued",
      },
      ...ws.pipeline,
    ]),
  };
}

export function schedulePipelineItem(
  ws: Workspace,
  pipelineId: string,
  options: { channelId: ChannelId; when: string },
): Workspace {
  const item = ws.pipeline.find((p) => p.id === pipelineId);
  if (!item || item.status === "published") return ws;
  if (!options.when || !isChannelConnected(ws, options.channelId)) return ws;

  return {
    ...ws,
    pipeline: ws.pipeline.map((p) =>
      p.id === pipelineId
        ? { ...p, channelId: options.channelId, when: options.when, status: "scheduled" as const }
        : p,
    ),
  };
}

export function getAvailableForPipeline(ws: Workspace): Draft[] {
  return getLibraryItems(ws).filter((item) => !hasActiveQueueEntry(ws, item.id));
}

export function publishPipelineItem(ws: Workspace, pipelineId: string): Workspace {
  const item = ws.pipeline.find((p) => p.id === pipelineId);
  if (!item || item.status === "published") return ws;

  const content = findContent(ws, item.draftId);
  return {
    ...ws,
    pipeline: ws.pipeline.map((p) => (p.id === pipelineId ? { ...p, status: "published" as const } : p)),
    drafts: content ? upsertContent(ws.drafts, { ...content, lifecycle: "published" }) : ws.drafts,
  };
}

export function removeFromPipeline(ws: Workspace, pipelineId: string): Workspace {
  const item = ws.pipeline.find((p) => p.id === pipelineId);
  if (!item || item.status === "published") return ws;

  const content = findContent(ws, item.draftId);
  const nextLifecycle = hasPublishedHistory(ws, item.draftId) ? ("published" as const) : ("draft" as const);

  return {
    ...ws,
    pipeline: ws.pipeline.filter((p) => p.id !== pipelineId),
    drafts: content ? upsertContent(ws.drafts, { ...content, lifecycle: nextLifecycle }) : ws.drafts,
  };
}

export function upcomingThisWeekCount(ws: Workspace): number {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return getQueuedPipelineItems(ws).filter((item) => {
    if (item.status !== "scheduled" || !item.when) return false;
    const when = new Date(item.when).getTime();
    return when >= start.getTime() && when < end.getTime();
  }).length;
}

export function publishNextPipelineItem(ws: Workspace): Workspace {
  const next = [...ws.pipeline]
    .sort((a, b) => +new Date(a.when) - +new Date(b.when))
    .find((p) => p.status !== "published");
  if (!next) return ws;

  const content = findContent(ws, next.draftId);
  return {
    ...ws,
    pipeline: ws.pipeline.map((p) => (p.id === next.id ? { ...p, status: "published" as const } : p)),
    drafts: content ? upsertContent(ws.drafts, { ...content, lifecycle: "published" }) : ws.drafts,
  };
}
