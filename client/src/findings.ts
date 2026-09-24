import { state, update, addAudit } from "./state";

export function reviewFinding(action: "reviewed" | "requested" | "flagged", onToast: (title: string, detail?: string, type?: string) => void) {
  const finding = state.selectedFinding;
  if (!finding) return;
  update(() => {
    if (action === "reviewed") finding.status = "Reviewed";
    if (action === "requested") finding.status = "Information Requested";
    if (action === "flagged") finding.status = "Flagged for Further Review";
    const labels = { reviewed: "HUMAN REVIEW COMPLETED", requested: "ADDITIONAL INFORMATION REQUESTED", flagged: "FINDING ESCALATED" };
    addAudit(labels[action], `${finding.title} · ${finding.status}`, action === "reviewed" ? "complete" : "active");
  });
  const messages = { reviewed: ["Finding reviewed", "Status changed to Reviewed.", "success"], requested: ["Additional information requested", "The finding remains open for follow-up.", "warning"], flagged: ["Finding flagged", "Further review has been requested.", "warning"] } as any;
  onToast(messages[action][0], messages[action][1], messages[action][2]);
}
