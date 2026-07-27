export type AppNavItem = {
  path: string;
  label: string;
  match: RegExp;
};

export const appNavItems: AppNavItem[] = [
  { path: "/app", label: "Pipeline", match: /^\/app\/?$/ },
  { path: "/app/compose", label: "Compose", match: /^\/app\/compose/ },
  { path: "/app/library", label: "Library", match: /^\/app\/library/ },
  { path: "/app/coverage", label: "Coverage", match: /^\/app\/coverage/ },
  { path: "/app/channels", label: "Channels", match: /^\/app\/channels/ },
  { path: "/app/brand", label: "Brand", match: /^\/app\/brand/ },
];
