import { state, update, addAudit } from "./state";
import { sectors, stageNames } from "./data";

let runToken = 0;

export function runAnalysis(onToast: (title: string, detail?: string, type?: string) => void) {
  if (!state.file || state.analysis.status === "running") return;
  runToken += 1;
  const token = runToken;
  const sector = sectors[state.sector];
  update(() => {
    state.analysis = { status: "running", progress: 4, stageIndex: 0, findings: [] };
    addAudit("ANALYSIS STARTED", `Illustrative analysis initiated for ${sector.label}.`, "active");
  });
  onToast("Analysis started", `${stageNames.length} stages queued for ${sector.label}.`);
  let index = 0;
  const advance = () => {
    if (token !== runToken) return;
    if (index >= stageNames.length) {
      update(() => {
        state.analysis = { status: "complete", progress: 100, stageIndex: stageNames.length, findings: [{ ...sector.finding, id: `${Date.now()}-finding`, status: "Pending Review" }] };
        addAudit("FINDINGS GENERATED", `1 illustrative finding prepared for human review.`, "complete");
      });
      onToast("Analysis complete", "One finding is ready for human review.", "success");
      return;
    }
    update(() => {
      state.analysis.stageIndex = index;
      state.analysis.progress = Math.max(8, Math.round(((index + .55) / stageNames.length) * 100));
      if (index === 1) addAudit("DATA PROCESSED", "Input structure extracted for review.", "active");
    });
    window.setTimeout(() => {
      if (token !== runToken) return;
      update(() => {
        state.analysis.progress = Math.round(((index + 1) / stageNames.length) * 100);
        state.analysis.stageIndex = index + 1;
      });
      index += 1;
      window.setTimeout(advance, 420);
    }, 480);
  };
  advance();
}

export function resetRun() {
  runToken += 1;
}
