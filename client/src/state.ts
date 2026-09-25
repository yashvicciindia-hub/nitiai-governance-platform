import type { DocumentAnalysis } from "./documentAnalysis";
export type SectorKey = "construction" | "healthcare" | "agriculture" | "tax" | "transport" | "environment";

export const state = {
  sector: "construction" as SectorKey,
  file: null as File | null,
  fileUrl: "",
  csvRows: [] as Record<string, string>[],
  analysis: {
    status: "idle" as "idle" | "running" | "complete",
    progress: 0,
    stageIndex: -1,
    findings: [] as any[],
    result: null as DocumentAnalysis | null,
  },
  selectedFinding: null as any,
  audit: [] as { id: string; label: string; detail: string; time: string; kind: string }[],
  healthPeriod: "WEEKLY" as "DAILY" | "WEEKLY" | "MONTHLY",
  transportMode: "PEAK" as "PEAK" | "OFF-PEAK",
  transportMetric: "CONGESTION" as "TRAFFIC VOLUME" | "CONGESTION" | "INFRASTRUCTURE",
  checklist: [false, false, false, false, false, false],
  openPrinciples: [] as string[],
  resourceFilter: "All",
  resourceQuery: "",
  chatOpen: false,
  chatMessages: [{ role: "assistant", text: "Governance AI is ready. Ask about a sector, a workflow, or responsible oversight." }] as { role: "user" | "assistant"; text: string }[],
  chatTyping: false,
};

const listeners = new Set<() => void>();
export function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
export function notify() { listeners.forEach((listener) => listener()); }
export function update(mutator: () => void) { mutator(); notify(); }
export function now() { return new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"; }
export function addAudit(label: string, detail: string, kind = "info") {
  state.audit.unshift({ id: `${Date.now()}-${Math.random()}`, label, detail, time: now(), kind });
}
export function clearAnalysis() {
  if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
  state.file = null;
  state.fileUrl = "";
  state.csvRows = [];
  state.analysis = { status: "idle", progress: 0, stageIndex: -1, findings: [], result: null };
  state.selectedFinding = null;
  state.audit = [];
}
