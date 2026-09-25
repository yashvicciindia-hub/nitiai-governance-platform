import { state, update, addAudit } from "./state";
import { sectors, stageNames } from "./data";
import { analyzeDocument } from "./documentAnalysis";

let runToken = 0;

export async function runAnalysis(onToast: (title: string, detail?: string, type?: string) => void) {
  if (!state.file || state.analysis.status === "running") return;
  runToken += 1;
  const token = runToken;
  const sector = sectors[state.sector];
  update(() => {
    state.analysis = { status: "running", progress: 4, stageIndex: 0, findings: [], result: null };
    addAudit("ANALYSIS STARTED", `Client-side document analysis initiated for ${sector.label}.`, "active");
  });
  onToast("Analysis started", `Reading ${state.file.name} in the browser.`);
  try {
    const result = await analyzeDocument(state.file);
    if (token !== runToken) return;
    update(() => {
      state.analysis.stageIndex = 1;
      state.analysis.progress = 55;
      addAudit("TEXT EXTRACTION", result.status === "complete" ? "Readable content extracted in the browser." : result.message || "Document extraction requires review.", result.status === "complete" ? "active" : "info");
    });
    await new Promise((resolve) => window.setTimeout(resolve, 260));
    if (token !== runToken) return;
    update(() => { state.analysis.stageIndex = 3; state.analysis.progress = 78; addAudit("GOVERNANCE SIGNALS", "Rule-based themes and requirements evaluated from extracted content.", "active"); });
    await new Promise((resolve) => window.setTimeout(resolve, 260));
    if (token !== runToken) return;
    update(() => {
      const finding = result.status === "complete" ? { title: result.risks[0] ? "Risk or compliance language requires review" : "Document signals ready for review", category: "CLIENT-SIDE GOVERNANCE SIGNAL", severity: result.risks.length ? "attention" : "info", explanation: result.risks[0] || `Detected ${result.keyTerms.length} recurring terms and ${result.requirements.length} requirement statements from the uploaded document.`, evidence: result.requirements[0] || result.keyTerms.join(" · ") || "No strong repeated terms detected.", recommendation: "Review extracted context, document provenance, and any flagged requirements before taking action.", review: "Human review required; this is deterministic browser-based analysis." , id: `${Date.now()}-finding`, status: "Pending Review" } : { title: "Document requires another format", category: "PROCESSING NOTICE", severity: "info", explanation: result.message || "The selected file could not be analyzed in the browser.", evidence: "No extracted text available", recommendation: "Try another file or convert the document to a supported format.", review: "Human review required.", id: `${Date.now()}-finding`, status: "Review Required" };
      state.analysis = { status: result.status === "complete" ? "complete" : "idle", progress: result.status === "complete" ? 100 : 0, stageIndex: result.status === "complete" ? stageNames.length : -1, findings: [finding], result };
      addAudit(result.status === "complete" ? "ANALYSIS READY" : "PROCESSING NOTICE", result.status === "complete" ? "Browser-based analysis complete; human review recommended." : result.message || "Try another file.", result.status === "complete" ? "complete" : "info");
    });
    onToast(result.status === "complete" ? "Analysis complete" : "Document needs attention", result.status === "complete" ? "Client-side signals are ready for human review." : result.message, result.status === "complete" ? "success" : "warning");
  } catch (error) {
    if (token !== runToken) return;
    update(() => { state.analysis = { status: "idle", progress: 0, stageIndex: -1, findings: [], result: null }; addAudit("DOCUMENT ERROR", error instanceof Error ? error.message : "The document could not be processed.", "error"); });
    onToast("Document could not be processed", error instanceof Error ? error.message : "Try another file.", "error");
  }
}

export function resetRun() {
  runToken += 1;
}
