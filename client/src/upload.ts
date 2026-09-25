import { state, update, addAudit } from "./state";

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const parseLine = (line: string) => {
    const cells: string[] = [];
    let current = ""; let quoted = false;
    for (const char of line) {
      if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { cells.push(current.trim()); current = ""; }
      else current += char;
    }
    cells.push(current.trim());
    return cells.map((cell) => cell.replace(/^"|"$/g, ""));
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1, 31).map((line) => Object.fromEntries(parseLine(line).map((value, i) => [headers[i] || `Column ${i + 1}`, value])));
}

export function ingestFile(file: File, onToast: (title: string, detail?: string, type?: string) => void) {
  if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
  const isCSV = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
  const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);
  update(() => {
    state.file = file;
    state.fileUrl = isImage ? URL.createObjectURL(file) : "";
    state.csvRows = [];
    state.analysis = { status: "idle", progress: 0, stageIndex: -1, findings: [], result: null };
    state.selectedFinding = null;
    addAudit("FILE SELECTED", `${file.name} · ${formatBytes(file.size)}`, "info");
  });
  if (isCSV) {
    const reader = new FileReader();
    reader.onload = () => update(() => { state.csvRows = parseCSV(String(reader.result || "")); });
    reader.readAsText(file);
  }
  onToast("File uploaded", `${file.name} is ready for validation.`);
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export function removeFile() {
  if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
  update(() => {
    state.file = null; state.fileUrl = ""; state.csvRows = [];
    state.analysis = { status: "idle", progress: 0, stageIndex: -1, findings: [], result: null };
    state.selectedFinding = null;
    addAudit("ANALYSIS RESET", "Selected input removed from the workspace.", "info");
  });
}
