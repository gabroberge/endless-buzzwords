import type { ChannelId } from "../storage";

export type ChannelMeta = {
  monogram: string;
  mark: string;
  desc: string;
};

export const channelMeta: Record<ChannelId, ChannelMeta> = {
  linkedin: {
    monogram: "in",
    mark: "#0a66c2",
    desc: "Ready for maximum professional authority extraction.",
  },
  x: {
    monogram: "X",
    mark: "#101828",
    desc: "Optimized for compressed certainty and unsolicited takes.",
  },
  youtube: {
    monogram: "▶",
    mark: "#cc0000",
    desc: "Convert one thought into several minutes of watch time.",
  },
  facebook: {
    monogram: "f",
    mark: "#1877f2",
    desc: "Extend technical authority into comment sections worldwide.",
  },
};

export function channelMarkHtml(
  channelId: ChannelId,
  options: { className?: string; offline?: boolean } = {},
): string {
  const meta = channelMeta[channelId];
  if (!meta) return "";

  const className = options.className ?? "channel-mark";
  const offlineClass = options.offline ? ` ${className}--offline` : "";

  return `<span class="${className}${offlineClass}" style="--mark:${meta.mark}" aria-hidden="true">${meta.monogram}</span>`;
}
