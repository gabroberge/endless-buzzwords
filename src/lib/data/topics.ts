export type Topic = {
  id: string;
  label: string;
  cluster: string;
};

export const topics: Topic[] = [
  { id: "javascript", label: "JavaScript", cluster: "Languages" },
  { id: "typescript", label: "TypeScript", cluster: "Languages" },
  { id: "react", label: "React", cluster: "Interfaces" },
  { id: "angular", label: "Angular", cluster: "Interfaces" },
  { id: "vue", label: "Vue", cluster: "Interfaces" },
  { id: "nodejs", label: "Node.js", cluster: "Services" },
  { id: "apis", label: "API design", cluster: "Services" },
  { id: "sql", label: "SQL", cluster: "Data" },
  { id: "databases", label: "Databases", cluster: "Data" },
  { id: "caching", label: "Caching", cluster: "Performance" },
  { id: "testing", label: "Testing", cluster: "Delivery" },
  { id: "ci", label: "CI/CD", cluster: "Delivery" },
  { id: "observability", label: "Observability", cluster: "Operations" },
  { id: "kubernetes", label: "Kubernetes", cluster: "Platform" },
  { id: "cloud", label: "Cloud architecture", cluster: "Platform" },
  { id: "security", label: "Application security", cluster: "Operations" },
  { id: "system-design", label: "System design", cluster: "Architecture" },
  { id: "distributed", label: "Distributed systems", cluster: "Architecture" },
  { id: "events", label: "Event-driven systems", cluster: "Architecture" },
  { id: "ai-eng", label: "AI engineering", cluster: "Emerging" },
];

export const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));
