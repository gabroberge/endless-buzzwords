import { composeDraft } from "./content-engine";
import { normalizeWorkspace } from "./content-lifecycle";
import type { PipelineItem, Workspace } from "./storage";
import { platformChannels, saveWorkspace } from "./storage";

function seedDrafts() {
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
      when: "",
      status: "queued",
    },
  ];
}

/** Opt-in demo desk for development — not used as the production default. */
export function createDemoWorkspace(): Workspace {
  return normalizeWorkspace({
    version: 2,
    brandName: "North Desk",
    voiceId: "desk",
    bylineId: "brand",
    cadenceTarget: 5,
    focusTopics: ["apis", "system-design", "caching", "react"],
    channels: platformChannels.map((c) => ({
      ...c,
      connected: c.id === "linkedin" || c.id === "x",
    })),
    drafts: seedDrafts(),
    published: [],
    pipeline: seedPipeline(),
    coverage: null,
  });
}

/** Persist the demo desk to localStorage (development / screenshots only). */
export function installDemoWorkspace(): Workspace {
  const demo = createDemoWorkspace();
  saveWorkspace(demo);
  return demo;
}
