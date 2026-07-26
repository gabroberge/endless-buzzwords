import type { Draft } from "./content-engine";
import type { ChannelId, PipelineItem, Workspace } from "./storage";

export type ContentLifecycle = "draft" | "queued" | "published";

export function channelForDraft(draft: Draft): ChannelId {
  return draft.channelHint === "x" ? "x" : draft.channelHint === "youtube" ? "youtube" : "linkedin";
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

export function normalizeWorkspace(ws: Workspace): Workspace {
  const mergedDrafts = [...ws.drafts];
  for (const item of ws.published ?? []) {
    if (!mergedDrafts.some((d) => d.id === item.id)) {
      mergedDrafts.push({ ...item, lifecycle: item.lifecycle ?? "published" });
    }
  }

  const drafts = mergedDrafts.map((draft) => ({
    ...draft,
    lifecycle: inferLifecycle(draft.id, ws.pipeline, draft.lifecycle ?? "draft"),
  }));

  return { ...ws, drafts, published: [] };
}

export function getDraftItems(ws: Workspace): Draft[] {
  return ws.drafts.filter((d) => lifecycleOf(d) === "draft");
}

export function getQueuedPipelineItems(ws: Workspace): PipelineItem[] {
  return ws.pipeline
    .filter((p) => p.status === "queued" || p.status === "scheduled")
    .sort((a, b) => +new Date(a.when) - +new Date(b.when));
}

export function getPublishedPipelineItems(ws: Workspace): PipelineItem[] {
  return ws.pipeline
    .filter((p) => p.status === "published")
    .sort((a, b) => +new Date(b.when) - +new Date(a.when));
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
  options: { when?: string; status?: PipelineItem["status"] } = {},
): Workspace {
  const when = options.when ?? new Date(Date.now() + 86400000).toISOString();
  const status = options.status ?? "scheduled";
  const channelId = channelForDraft(draft);
  const queued = { ...draft, lifecycle: "queued" as const };

  return {
    ...ws,
    drafts: upsertContent(ws.drafts, queued),
    pipeline: [
      {
        id: `p_${Date.now()}`,
        draftId: draft.id,
        title: draft.title,
        channelId,
        when,
        status,
      },
      ...ws.pipeline.filter((p) => !(p.draftId === draft.id && p.status !== "published")),
    ],
  };
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
