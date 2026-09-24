import { sectors } from "./data";
import { state } from "./state";

export function healthcareChart() {
  const values: number[] = sectors.healthcare.chart[state.healthPeriod];
  const width = 580; const height = 210;
  const points = values.map((value, i) => `${38 + i * 82},${170 - value * 1.35}`).join(" ");
  const area = `38,170 ${points} 530,170`;
  const labels = state.healthPeriod === "DAILY" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : state.healthPeriod === "WEEKLY" ? ["W1", "W2", "W3", "W4", "W5", "W6", "W7"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return `<div class="chart-wrap"><svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Service demand chart"><line class="chart-grid" x1="38" y1="35" x2="530" y2="35"/><line class="chart-grid" x1="38" y1="86" x2="530" y2="86"/><line class="chart-grid" x1="38" y1="137" x2="530" y2="137"/><line class="chart-grid" x1="38" y1="170" x2="530" y2="170"/><polygon class="chart-area" points="${area}"/><polyline class="chart-line" points="${points}"/>${values.map((value, i) => `<circle class="chart-point" data-chart-point="${i}" cx="${38 + i * 82}" cy="${170 - value * 1.35}" r="4"/>`).join("")}${labels.map((label, i) => `<text class="chart-label" x="${38 + i * 82}" y="194" text-anchor="middle">${label}</text>`).join("")}<text class="chart-label" x="38" y="26">INDEX</text></svg><div id="chartTooltip" class="chart-tooltip">Select a point to inspect</div></div>`;
}

export function transportSvg() {
  const roads: any[] = sectors.transport.roads;
  return `<div class="chart-wrap transport-map"><svg class="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Illustrative road network"><rect x="0" y="0" width="100" height="100" fill="#f7faf8"/>${[18, 38, 58, 78].map((y) => `<line x1="0" y1="${y}" x2="100" y2="${y + 5}" stroke="#e1e8e4" stroke-width=".7"/>`).join("")}${[20, 45, 70].map((x) => `<line x1="${x}" y1="0" x2="${x + 4}" y2="100" stroke="#e1e8e4" stroke-width=".7"/>`).join("")}${roads.map((road: any, i: number) => `<line data-road="${road.id}" x1="${road.x1}" y1="${road.y1}" x2="${road.x2}" y2="${road.y2}" stroke="${i === 0 ? '#2b6f8a' : '#5f8988'}" stroke-width="${i === 0 ? 2.6 : 2}" stroke-linecap="square" class="road-line"/>`).join("")}</svg><div class="chart-tooltip" id="roadTooltip">Select a road segment</div></div>`;
}
