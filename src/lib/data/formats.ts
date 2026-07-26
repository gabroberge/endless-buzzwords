export type FormatId =
  | "field-note"
  | "quick-take"
  | "comparison"
  | "debug-prompt"
  | "checklist"
  | "thread"
  | "short-script"
  | "curriculum-slice"
  | "tradeoff"
  | "postmortem-lite";

export type Format = {
  id: FormatId;
  label: string;
  blurb: string;
};

export const formats: Format[] = [
  { id: "field-note", label: "Field note", blurb: "A short operational observation." },
  { id: "quick-take", label: "Quick take", blurb: "A confident position in a few lines." },
  { id: "comparison", label: "Comparison", blurb: "Two options, lightly framed." },
  { id: "debug-prompt", label: "Debug prompt", blurb: "A scenario that invites replies." },
  { id: "checklist", label: "Checklist", blurb: "A scannable set of reminders." },
  { id: "thread", label: "Thread outline", blurb: "A multi-beat narrative for social." },
  { id: "short-script", label: "Short script", blurb: "Spoken pacing for video." },
  { id: "curriculum-slice", label: "Lesson fragment", blurb: "Looks educational. Ships fast." },
  { id: "tradeoff", label: "Tradeoff brief", blurb: "Costs and benefits, evenly weighted." },
  { id: "postmortem-lite", label: "Postmortem lite", blurb: "Incident texture without the incident." },
];
