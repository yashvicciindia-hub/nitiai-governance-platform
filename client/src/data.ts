import type { SectorKey } from "./state";

export const sectors: Record<SectorKey, any> = {
  construction: {
    code: "CN-01", label: "Construction", title: "AI Building Plan Review",
    description: "Structured review support for building plans, application documents, site information, and supporting certificates. Findings are illustrative and do not constitute legal approval.",
    uploadLabel: "Building plan, application document, or site record", accepts: "PDF · DOC · DOCX · JPG · PNG",
    metrics: ["6", "2", "1", "Review required"],
    checklist: ["Applicant information", "Site information", "Project description", "Structural documentation", "Supporting certificate"],
    finding: { title: "Potential documentation gap identified", category: "REVIEW REQUIRED", severity: "attention", explanation: "The submitted packet contains the project description, but supporting structural documentation was not detected in the illustrative scan.", evidence: "Packet index: 04 / expected certificate reference absent", recommendation: "Request the structural certificate or confirm the exemption basis.", review: "Human verification required before any governance action." },
  },
  healthcare: {
    code: "HC-02", label: "Healthcare", title: "AI Health Administration",
    description: "Administrative analysis for service demand, operational capacity, and resource utilization. This module is not medical diagnosis and does not evaluate individual clinical decisions.",
    uploadLabel: "Facility report, administrative CSV, or service report", accepts: "CSV · PDF · DOCX",
    metrics: ["12", "84%", "3", "Stable"],
    chart: { DAILY: [28, 35, 32, 44, 48, 39, 52], WEEKLY: [52, 60, 57, 72, 68, 80, 76], MONTHLY: [68, 61, 73, 79, 74, 88, 92] },
    finding: { title: "Capacity pattern merits review", category: "POTENTIAL ANOMALY", severity: "attention", explanation: "The illustrative series shows demand rising faster than reported resource availability across the selected period.", evidence: "Demand index 92 vs resource utilization 84% in the final period", recommendation: "Compare with staffing rosters and planned service windows.", review: "Human review required for context and operational response." },
  },
  agriculture: {
    code: "AG-03", label: "Agriculture", title: "AI Agriculture Intelligence",
    description: "Image and report review for crop conditions, field observations, and agricultural operations. Any visual markers are illustrative indicators, not agronomic diagnosis.",
    uploadLabel: "Crop image, field image, agricultural report, or CSV", accepts: "JPG · JPEG · PNG · PDF · CSV",
    metrics: ["4", "3", "87%", "Illustrative"],
    finding: { title: "Potential crop stress indicator", category: "POTENTIAL ISSUE", severity: "attention", explanation: "A localized color variation was identified in the uploaded image. The signal may reflect crop stress, shadow, or image conditions.", evidence: "Illustrative marker at region 02 / confidence 87%", recommendation: "Verify with field observation, weather context, and sensor readings.", review: "Verification recommended; no automatic agronomic conclusion." },
  },
  tax: {
    code: "TR-04", label: "Tax & Revenue", title: "AI Revenue Intelligence",
    description: "Review revenue records and transaction reports for potential anomalies, missing context, and recurring patterns. An anomaly is not proof of fraud; human investigation is required.",
    uploadLabel: "Revenue CSV, transaction report, or tax document", accepts: "CSV · PDF · DOC · DOCX",
    metrics: ["24", "₹18.4M", "3", "Review required"],
    rows: [
      { Record: "TX-1042", Category: "Permit fee", Amount: "₹245,000", Date: "2026-08-04", Status: "Verified" },
      { Record: "TX-1047", Category: "Property tax", Amount: "₹1,240,000", Date: "2026-08-08", Status: "Review" },
      { Record: "TX-1051", Category: "Service charge", Amount: "₹82,400", Date: "2026-08-11", Status: "Verified" },
      { Record: "TX-1058", Category: "Property tax", Amount: "₹4,900,000", Date: "2026-08-16", Status: "Review" },
      { Record: "TX-1063", Category: "Permit fee", Amount: "₹192,000", Date: "2026-08-20", Status: "Verified" },
      { Record: "TX-1070", Category: "Service charge", Amount: "₹74,900", Date: "2026-08-23", Status: "Pending" },
    ],
    finding: { title: "Potential anomaly detected", category: "POTENTIAL ANOMALY", severity: "attention", explanation: "One record is materially different from the surrounding category range in this illustrative dataset.", evidence: "TX-1058 / category variance +2.8σ from local sample", recommendation: "Review transaction context, adjustment history, and source documentation.", review: "An anomaly is not proof of fraud. Human investigation is required." },
  },
  transport: {
    code: "TP-05", label: "Transport", title: "AI Transport Intelligence",
    description: "Explore a schematic road network to inspect traffic volume, congestion, and infrastructure review status across illustrative corridors.",
    uploadLabel: "Traffic report, route CSV, or infrastructure document", accepts: "CSV · PDF · DOCX",
    metrics: ["18", "62%", "4", "Operational"],
    roads: [
      { id: "A-17", x1: 18, y1: 22, x2: 82, y2: 32, volume: "14,280 / day", congestion: "High", peak: "08:00–10:00", status: "Review required" },
      { id: "B-04", x1: 12, y1: 76, x2: 78, y2: 62, volume: "9,440 / day", congestion: "Moderate", peak: "17:00–19:00", status: "Monitored" },
      { id: "C-22", x1: 50, y1: 12, x2: 42, y2: 88, volume: "7,820 / day", congestion: "Low", peak: "07:00–08:00", status: "Verified" },
    ],
    finding: { title: "Peak-period congestion corridor", category: "INFORMATION IDENTIFIED", severity: "info", explanation: "Corridor A-17 has the highest illustrative volume and shows a peak-period congestion signal.", evidence: "A-17 / 14,280 vehicles per day / high congestion", recommendation: "Review signal timing, lane capacity, and incident history.", review: "Contextual review recommended." },
  },
  environment: {
    code: "EN-06", label: "Environment", title: "AI Environmental Monitoring",
    description: "Compare illustrative before-and-after monitoring frames to inspect environmental indicators, detected change, and monitoring area status.",
    uploadLabel: "Environmental image, monitoring report, sensor CSV, or satellite-style image", accepts: "JPG · PNG · PDF · CSV",
    metrics: ["8", "2", "91%", "Monitoring"],
    finding: { title: "Detected change requires verification", category: "VERIFICATION RECOMMENDED", severity: "attention", explanation: "The comparison shows a visible change in the illustrative monitoring area between the two frames.", evidence: "Zone 03 / vegetation cover delta: -12%", recommendation: "Validate with sensor data, field observations, and acquisition metadata.", review: "Verification recommended before escalation." },
  },
};

export const resources = [
  { title: "AI and the public sector: governance considerations", org: "OECD", year: "2024", category: "Policy", source: "oecd.org" },
  { title: "Recommendation on the Ethics of Artificial Intelligence", org: "UNESCO", year: "2021", category: "Standards", source: "unesco.org" },
  { title: "AI Risk Management Framework", org: "NIST", year: "2023", category: "Standards", source: "nist.gov" },
  { title: "Algorithmic accountability in government services", org: "Ada Lovelace Institute", year: "2022", category: "Research", source: "adalovelaceinstitute.org" },
  { title: "Digital public infrastructure and responsible AI", org: "World Bank", year: "2024", category: "Government", source: "worldbank.org" },
  { title: "Human oversight in automated decision systems", org: "Council of Europe", year: "2023", category: "Policy", source: "coe.int" },
];

export const principles = [
  ["Transparency", "People affected by an AI-assisted workflow should be able to understand what information was considered, what the system identified, and where human judgment remains necessary."],
  ["Accountability", "Every finding should be attributable to a reviewable process, a responsible team, and an audit trail that records decisions and changes."],
  ["Privacy", "Data minimization, appropriate access, retention limits, and contextual safeguards are prerequisites for trustworthy governance intelligence."],
  ["Fairness", "Analysis should be checked for uneven impacts, missing context, and patterns that could create barriers for particular groups or regions."],
  ["Human Oversight", "AI findings support responsible reviewers; they do not replace legal authority, professional judgment, or due process."],
];

export const stageNames = ["INPUT VALIDATION", "DATA EXTRACTION", "STRUCTURE ANALYSIS", "PATTERN DETECTION", "FINDING GENERATION", "EXPLANATION GENERATION", "HUMAN REVIEW PREPARATION"];
