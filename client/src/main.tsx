import "./index.css";
import { state, subscribe, update, addAudit, clearAnalysis } from "./state";
import { sectors, resources, principles, stageNames } from "./data";
import { ingestFile, removeFile, formatBytes } from "./upload";
import { runAnalysis, resetRun } from "./analysis";
import { reviewFinding } from "./findings";
import { healthcareChart, transportSvg } from "./charts";
import { sendChat } from "./chatbot";
import { pageForPath, sitePages } from "./pages/sitePages";
import { publicSafetyMarkup, scenarioNodes, workflowStages } from "./pages/publicSafetyPage";
import { ecosystem, homeRedesignMarkup, landscape, process } from "./pages/homeRedesign";
import "./publicSafety.css";
import "./homeRedesign.css";
import "./solutions.css";

const root = document.getElementById("root") as HTMLElement;
const esc = (value: unknown) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char] || char));
const icon = (name: string) => {
  const paths: Record<string,string> = { search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', upload: '<path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16"/>', file: '<path d="M6 2h8l4 4v16H6zM14 2v5h5"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>', check: '<path d="m5 12 4 4L19 6"/>', chat: '<path d="M20 15a3 3 0 0 1-3 3H9l-5 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', external: '<path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>' };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
const navItems = sitePages;
let toastStack: HTMLElement;
let environmentSplit = 54;
let selectedRoad = "A-17";
let csvQuery = "";
let csvSortKey = "";
let csvSortAsc = true;

const governanceResources = [
  { id: "ai-governance-readiness", title: "AI Governance Readiness", type: "Framework", category: "AI Governance", sector: "General Governance", topics: ["Risk Management", "Human Oversight", "Accountability"], description: "A structured approach to reviewing data readiness, risk, human oversight, transparency, and accountability before an AI-assisted workflow is used.", overview: "Use this framework to assess whether a governance workflow has the necessary context, safeguards, and review path before AI-supported analysis is relied on.", keyConcepts: ["Data readiness", "Risk review", "Human accountability", "Transparency of use"], practicalConsiderations: ["Confirm who is accountable for review outcomes.", "Document the decision to use AI support and its limits.", "Ensure evidence and rationale remain accessible for review."], related: ["human-oversight", "ai-risk-management", "data-readiness"], isFeatured: true },
  { id: "human-oversight", title: "Human Oversight in AI-Assisted Governance", type: "Guide", category: "Responsible AI", sector: "General Governance", topics: ["Human Oversight", "Accountability", "Verification"], description: "Understanding review responsibility, verification, and escalation in AI-supported workflows.", overview: "Human oversight means responsibility remains with trained professionals who can interpret context, validate assumptions, and intervene when needed.", keyConcepts: ["Review responsibility", "Escalation path", "Verification before action", "Contextual professional judgment"], practicalConsiderations: ["Assign clear reviewers.", "Document escalation triggers.", "Keep review evidence visible as part of the workflow."], related: ["ai-governance-readiness", "ai-risk-assessment", "explainability"], isFeatured: false },
  { id: "explainability", title: "Explainability in Governance Review", type: "Concept", category: "Responsible AI", sector: "General Governance", topics: ["Explainability", "Transparency", "Auditability"], description: "A practical concept for explaining how an AI-assisted output was generated and why it should be reviewed.", overview: "Explainability does not mean exposing technical internals. It means giving people enough context to understand the result and assess its fit for the task.", keyConcepts: ["Understandable output", "Context and limits", "Traceable evidence", "Reviewable reasoning"], practicalConsiderations: ["Explain the system's role in the workflow.", "Document assumptions and data features.", "Keep relevant evidence connected to the reviewed outcome."], related: ["human-oversight", "accountability", "review-mechanism"], isFeatured: false },
  { id: "ai-risk-management", title: "AI Risk Management", type: "Framework", category: "AI Governance", sector: "General Governance", topics: ["Risk Management", "Fairness", "Verification"], description: "A framework for identifying potential risks, capturing uncertainty, and shaping governance decisions before use.", overview: "Risk management is an ongoing governance practice. It helps teams identify where AI may bias results, misread evidence, or create operational harm if used without review.", keyConcepts: ["Risk identification", "Uncertainty management", "Evidence alignment", "Mitigation planning"], practicalConsiderations: ["Review whether the task is suitable for AI assistance.", "Assess legal, ethical, and operational impacts.", "Track review actions and risk mitigations over time."], related: ["ai-governance-readiness", "human-oversight", "data-readiness"], isFeatured: false },
  { id: "data-readiness", title: "Data Readiness & Governance", type: "Checklist", category: "Data Governance", sector: "General Governance", topics: ["Data Governance", "Privacy", "Verification"], description: "Checking whether data is relevant, complete, adequately protected, and fit for AI-assisted support.", overview: "A data-ready process requires a clear understanding of source quality, completeness, sensitivity, and the purpose for which the data is being used.", keyConcepts: ["Data quality", "Completeness", "Protection", "Purpose and fit"], practicalConsiderations: ["Review whether the data is up to date and complete.", "Identify any sensitive or restricted fields.", "Confirm the data matches the intended governance use."], related: ["ai-governance-readiness", "privacy", "data-quality"], isFeatured: false },
  { id: "accountability", title: "Accountability in AI-Assisted Decisions", type: "Guide", category: "Responsible AI", sector: "General Governance", topics: ["Accountability", "Auditability", "Human Oversight"], description: "How responsibility and decision ownership remain clear when AI supports governance workflows.", overview: "Accountability connects the task, the evidence, the decision-maker, and the review trail. It ensures the system remains explainable and governed.", keyConcepts: ["Decision ownership", "Audit trail", "Reviewable process", "Responsible action"], practicalConsiderations: ["Name the accountable role for each decision.", "Record review actions and challenge points.", "Ensure evidence remains connected to decisions."], related: ["human-oversight", "ai-governance-readiness", "audit-trail"], isFeatured: false },
  { id: "ai-risk-assessment", title: "AI Risk Assessment", type: "Governance Tool", category: "Practical Guides", sector: "General Governance", topics: ["Risk Management", "Accountability", "Verification"], description: "A practical governance tool for identifying risk, documenting uncertainty, and clarifying when a workflow needs review.", overview: "An AI risk assessment should identify where errors, bias, or operational harm could arise, and when additional human review is necessary.", keyConcepts: ["Risk categories", "Impact review", "Mitigation planning", "Escalation triggers"], practicalConsiderations: ["Identify where a human reviewer is required.", "Use the assessment to document uncertainty.", "Review results before deployment or adoption."], related: ["ai-risk-management", "ai-governance-readiness", "human-oversight"], isFeatured: false },
  { id: "construction-ai-guidance", title: "Construction AI Guidance", type: "Sector Guide", category: "Sector Guidance", sector: "Construction", topics: ["Risk Management", "Data Governance", "Verification"], description: "Guidance for evaluating building information, plan consistency, and review requirements in construction workflows.", overview: "Construction governance workflows benefit from structured document review, traceability, and clear review thresholds before approvals or follow-up actions.", keyConcepts: ["Document review", "Plan consistency", "Evidence standards", "Review gate"], practicalConsiderations: ["Check for missing supporting documentation.", "Review whether plans align with supporting records.", "Keep human review and evidence records visible."], related: ["data-readiness", "ai-governance-readiness", "human-oversight"], isFeatured: false },
  { id: "healthcare-ai-guidance", title: "Healthcare AI Guidance", type: "Sector Guide", category: "Sector Guidance", sector: "Healthcare", topics: ["Fairness", "Privacy", "Risk Management"], description: "Administrative guidance for reviewing service patterns, resource capacity, and operational changes in a healthcare setting.", overview: "Healthcare AI support should emphasize clear evidence, privacy awareness, and careful human review in operational settings without replacing professional judgment.", keyConcepts: ["Service demand", "Operational context", "Privacy safeguards", "Human review"], practicalConsiderations: ["Review the context behind service patterns.", "Protect sensitive information through access controls.", "Use AI as a support tool, not a substitute for clinical or operational judgment."], related: ["privacy", "ai-risk-assessment", "accountability"], isFeatured: false },
  { id: "agriculture-ai-guidance", title: "Agriculture AI Guidance", type: "Sector Guide", category: "Sector Guidance", sector: "Agriculture", topics: ["Verification", "Risk Management", "Data Governance"], description: "Professional guidance for reviewing indicators, contextual observations, and field conditions in agriculture workflows.", overview: "Agriculture workflows need human verification and contextual evidence because indicators may reflect weather, crop conditions, sensor quality, or operational factors.", keyConcepts: ["Field verification", "Indicator context", "Human review", "Data quality"], practicalConsiderations: ["Validate flagged indications with local observation.", "Review image and sensor context together.", "Document uncertainty before acting on a system output."], related: ["verification", "data-readiness", "ai-risk-management"], isFeatured: false },
  { id: "tax-ai-guidance", title: "Tax & Revenue AI Guidance", type: "Sector Guide", category: "Sector Guidance", sector: "Tax & Revenue", topics: ["Auditability", "Transparency", "Verification"], description: "Support for reviewing revenue anomalies, record consistency, and operational review needs in tax administration workflows.", overview: "An anomaly is not a conclusion. Tax and revenue workflows should pair AI assistance with human analysis, context, and a documented review trail.", keyConcepts: ["Anomaly review", "Record context", "Chain of review", "Evidence retention"], practicalConsiderations: ["Check supporting documents and process history.", "Use AI to surface patterns, not prove an outcome.", "Preserve transparent evidence for audit review."], related: ["audit-trail", "human-oversight", "accountability"], isFeatured: false },
  { id: "transport-ai-guidance", title: "Transport AI Guidance", type: "Sector Guide", category: "Sector Guidance", sector: "Transport", topics: ["Transparency", "Risk Management", "Verification"], description: "Guidance for evaluating corridor performance, congestion patterns, and infrastructure review priorities.", overview: "Transport applications benefit from visible context and clear decision criteria. AI can help highlight patterns, but final decisions remain with responsible operational teams.", keyConcepts: ["Congestion patterns", "Operational context", "Evidence-based review", "Human decision path"], practicalConsiderations: ["Ensure the system role is documented.", "Review network conditions before action.", "Keep the review path transparent for stakeholders."], related: ["transparency", "human-oversight", "ai-governance-readiness"], isFeatured: false },
  { id: "environment-ai-guidance", title: "Environment AI Guidance", type: "Sector Guide", category: "Sector Guidance", sector: "Environment", topics: ["Verification", "Data Governance", "Risk Management"], description: "Structured guidance for evaluating environmental indicators, monitoring signals, and review thresholds.", overview: "Environmental review workflows require context-rich monitoring and clear verification. Indicators may require local evidence and sensor validation to interpret correctly.", keyConcepts: ["Monitoring signal", "Context validation", "Evidence quality", "Human verification"], practicalConsiderations: ["Cross-check signal intensity with local context.", "Review monitoring metadata and timeframe.", "Avoid acting on a signal without review and validation."], related: ["verification", "data-readiness", "ai-risk-management"], isFeatured: false },
  { id: "governance-lifecycle", title: "AI Governance Lifecycle", type: "Guide", category: "AI Governance", sector: "General Governance", topics: ["Risk Management", "Auditability", "Accountability"], description: "A lifecycle view for designing, operating, reviewing, and improving AI-assisted governance workflows.", overview: "A governance lifecycle keeps monitoring, review, and improvement as formal parts of the AI system instead of a one-time approval process.", keyConcepts: ["Lifecycle governance", "Continuous review", "Responsible improvement", "Accountable changes"], practicalConsiderations: ["Plan for ongoing monitoring and review.", "Document workflow changes and assumptions.", "Regularly test whether the system still fits the use case."], related: ["ai-governance-readiness", "audit-trail", "human-oversight"], isFeatured: false },
  { id: "governance-by-design", title: "Governance-by-Design", type: "Concept", category: "Standards & Principles", sector: "General Governance", topics: ["Transparency", "Accountability", "Data Governance"], description: "Designing governance systems so review, evidence, and human responsibility are built into workflows from the start.", overview: "Governance-by-design anchors safeguards in the process itself, rather than layering them on later when an issue has already emerged.", keyConcepts: ["Built-in process design", "Guardrails", "Traceability", "Responsible automation"], practicalConsiderations: ["Define who reviews which decisions.", "Design with escalation and accountability in mind.", "Document system role and decision boundaries clearly."], related: ["ai-governance-readiness", "accountability", "transparency"], isFeatured: false },
  { id: "privacy", title: "Privacy in Governance Intelligence", type: "Guide", category: "Responsible AI", sector: "General Governance", topics: ["Privacy", "Data Governance", "Risk Management"], description: "A concise overview of privacy considerations when using AI to review operational and public-sector information.", overview: "Privacy concerns are not only about data storage. They also reflect whether the right information is being used, with the right safeguards, for the right purpose.", keyConcepts: ["Data minimization", "Access controls", "Purpose limitation", "Retention view"], practicalConsiderations: ["Review what personal or sensitive data is needed.", "Consider who is allowed to view and act on it.", "Limit retention and ensure accountability for access."], related: ["data-readiness", "accountability", "human-oversight"], isFeatured: false },
  { id: "verification", title: "Verification Mechanisms", type: "Checklist", category: "Practical Guides", sector: "General Governance", topics: ["Verification", "Human Oversight", "Auditability"], description: "A checklist for verifying output relevance, source quality, and decision confidence before a governance action.", overview: "Verification is the point where a team confirms that an AI-assisted output is reliable enough for the intended use and that the review path is still valid.", keyConcepts: ["Source checks", "Cross-checking", "Confidence bounds", "Escalation criteria"], practicalConsiderations: ["Confirm evidence matches the finding.", "Check for contradictory or missing information.", "Escalate when confidence is not sufficient for the action."], related: ["human-oversight", "audit-trail", "ai-risk-assessment"], isFeatured: false },
];

const governanceGlossary = [
  { term: "Accountability", definition: "The clear assignment of responsibility for decisions, review actions, and any follow-up steps connected to an AI-assisted governance workflow." },
  { term: "Algorithmic Bias", definition: "A pattern in how an AI-supported system may systematically underperform or unevenly treat people or contexts because of the data, labels, or assumptions it relies on." },
  { term: "Audit Trail", definition: "A record of the information, analysis, decisions, and review actions that help people understand how a result was reached and who validated it." },
  { term: "Data Governance", definition: "The policies, stewardship, quality checks, and access controls that govern how data is used, protected, and reviewed in a governance process." },
  { term: "Explainability", definition: "The ability to provide understandable information about how an AI-assisted system produced an analytical result, supporting appropriate human review." },
  { term: "Fairness", definition: "The practice of examining whether outcomes or decisions are appropriately balanced, context-aware, and not systematically disadvantageous to a particular group or scenario." },
  { term: "Human Oversight", definition: "The requirement that trained people remain accountable for interpretation, review, escalation, and any consequential action tied to an AI-supported result." },
  { term: "Privacy", definition: "The protection of personal or sensitive information through careful data use, access controls, and retention or disclosure decisions appropriate to the context." },
  { term: "Risk Assessment", definition: "The process of identifying where a governance workflow may fail, produce unreliable results, or create operational or ethical harm if used without appropriate safeguards." },
  { term: "Responsible AI", definition: "A broad set of principles, checks, and practices designed to ensure AI is used in a transparent, accountable, fair, and contextual way." },
  { term: "Transparency", definition: "The degree to which a system's purpose, role, limitations, and decision-support logic are understandable to the people who rely on or review it." },
  { term: "Verification", definition: "A deliberate review step that checks whether a result is credible, complete, and suitable for the intended governance action before it is relied on." },
];

const topicOptions = ["Human Oversight", "Explainability", "Accountability", "Transparency", "Privacy", "Fairness", "Risk Management", "Data Governance", "Auditability", "Verification"];
const resourceTypes = ["Guide", "Framework", "Checklist", "Concept", "Sector Guide", "Governance Tool", "Glossary"];
const resourcePageState: {
  search: string;
  category: string;
  sector: string;
  topic: string;
  type: string;
  glossaryLetter: string;
  glossarySearch: string;
  selectedRelationship: string;
  selectedResourceId: string;
  selectedGlossary: string;
  saved: string[];
  read: string[];
  checklist: boolean[];
} = {
  search: "",
  category: "All",
  sector: "All",
  topic: "All",
  type: "All",
  glossaryLetter: "ALL",
  glossarySearch: "",
  selectedRelationship: "AI Governance",
  selectedResourceId: governanceResources[0]?.id || "",
  selectedGlossary: governanceGlossary[0]?.term || "",
  saved: (() => {
    try {
      const value = localStorage.getItem("nitiai-resource-saved");
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  })(),
  read: (() => {
    try {
      const value = localStorage.getItem("nitiai-resource-read");
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  })(),
  checklist: Array(8).fill(false),
};

const aboutWhyCopy = {
  complexity: {
    label: "COMPLEXITY",
    body: "Governance involves policies, documents, records, regulations, and information that can be difficult to process at scale.",
  },
  clarity: {
    label: "CLARITY",
    body: "AI can help structure complex information and make important patterns easier to understand.",
  },
  responsibility: {
    label: "RESPONSIBILITY",
    body: "Technology should support governance professionals rather than remove human judgement and accountability.",
  },
} as const;

const aboutPerspectiveCopy = {
  can: {
    label: "AI CAN",
    body: "Process large amounts of information.",
  },
  should: {
    label: "AI SHOULD",
    body: "Make information easier to understand.",
  },
  must: {
    label: "AI MUST",
    body: "Remain subject to appropriate human review and accountability.",
  },
} as const;

const aboutPrinciplesCopy = {
  Clarity: "Make complex governance information easier to understand.",
  Responsibility: "Keep accountability within the governance process.",
  Transparency: "Make AI-assisted outputs understandable and reviewable.",
  "Human Agency": "Technology should support people responsible for decisions.",
  Context: "AI-assisted insights should be interpreted within their real-world governance context.",
} as const;

const aboutPersonasCopy = {
  citizen: {
    label: "THE CITIZEN",
    body: "Needs information to be understandable and accessible.",
  },
  professional: {
    label: "THE GOVERNANCE PROFESSIONAL",
    body: "Needs structured information that supports analysis and review.",
  },
  institution: {
    label: "THE INSTITUTION",
    body: "Needs processes that remain accountable and traceable.",
  },
} as const;

const aboutFutureCopy = {
  understand: "Turn complexity into clarity.",
  question: "Encourage review rather than blind acceptance.",
  act: "Use technology as an aid to responsible governance.",
} as const;

const persistResourceState = (key: string, value: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage write errors in restricted environments
  }
};

const formatCount = (value: number) => String(value).padStart(2, "0");
const getFilteredResources = () => {
  const query = resourcePageState.search.trim().toLowerCase();
  return governanceResources.filter((resource) => {
    const haystack = [resource.title, resource.description, resource.category, resource.sector, resource.type, resource.topics.join(" "), ...resource.keyConcepts, ...resource.practicalConsiderations].join(" ").toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    const matchesCategory = resourcePageState.category === "All" || resource.category === resourcePageState.category;
    const matchesSector = resourcePageState.sector === "All" || resource.sector === resourcePageState.sector;
    const matchesTopic = resourcePageState.topic === "All" || resource.topics.includes(resourcePageState.topic);
    const matchesType = resourcePageState.type === "All" || resource.type === resourcePageState.type;
    const matchesRelationship = resourcePageState.selectedRelationship === "AI Governance" || resource.topics.includes(resourcePageState.selectedRelationship) || resource.category === resourcePageState.selectedRelationship || resource.title.includes(resourcePageState.selectedRelationship);
    return matchesSearch && matchesCategory && matchesSector && matchesTopic && matchesType && matchesRelationship;
  });
};

const getFilteredGlossary = () => {
  const letter = resourcePageState.glossaryLetter;
  const search = resourcePageState.glossarySearch.trim().toLowerCase();
  return governanceGlossary.filter((item) => {
    const matchesLetter = letter === "ALL" || item.term.charAt(0).toUpperCase() === letter;
    const matchesSearch = !search || item.term.toLowerCase().includes(search) || item.definition.toLowerCase().includes(search);
    return matchesLetter && matchesSearch;
  });
};

const getResourceById = (id: string) => governanceResources.find((resource) => resource.id === id) || governanceResources[0];

const getSavedReferenceList = () => resourcePageState.saved.map((id: string) => getResourceById(id)).filter(Boolean);

const getProgress = () => {
  const total = resourcePageState.checklist.length;
  const checked = resourcePageState.checklist.filter(Boolean).length;
  return { checked, total, percent: total ? Math.round((checked / total) * 100) : 0 };
};

const resetResourceFilters = () => {
  resourcePageState.search = "";
  resourcePageState.category = "All";
  resourcePageState.sector = "All";
  resourcePageState.topic = "All";
  resourcePageState.type = "All";
  resourcePageState.selectedRelationship = "AI Governance";
  resourcePageState.glossaryLetter = "ALL";
  resourcePageState.glossarySearch = "";
  resourcePageState.selectedGlossary = governanceGlossary[0]?.term || "";
  renderResourcePage();
};

const toggleSavedResource = (resourceId: string) => {
  const exists = resourcePageState.saved.includes(resourceId);
  if (exists) {
    resourcePageState.saved = resourcePageState.saved.filter((id: string) => id !== resourceId);
  } else {
    resourcePageState.saved = [...resourcePageState.saved, resourceId];
  }
  persistResourceState("nitiai-resource-saved", resourcePageState.saved);
  renderResourcePage();
};

const toggleReadResource = (resourceId: string) => {
  const exists = resourcePageState.read.includes(resourceId);
  if (exists) {
    resourcePageState.read = resourcePageState.read.filter((id: string) => id !== resourceId);
  } else {
    resourcePageState.read = [...resourcePageState.read, resourceId];
  }
  persistResourceState("nitiai-resource-read", resourcePageState.read);
  renderResourcePage();
};

const openResourceDetail = (resourceId: string) => {
  const resource = getResourceById(resourceId);
  resourcePageState.selectedResourceId = resource.id;
  const related = (resource.related || []).map((relatedId) => getResourceById(relatedId));
  const isSaved = resourcePageState.saved.includes(resource.id);
  const isRead = resourcePageState.read.includes(resource.id);
  const detailHtml = `
    <div class="drawer-kicker">Resource details / ${esc(resource.category)}</div>
    <h2 class="drawer-title">${esc(resource.title)}</h2>
    <!--BODY-->
    <div class="drawer-section">
      <h4>Resource metadata</h4>
      <p><strong>${esc(resource.type)}</strong> · ${esc(resource.category)}<br/>${esc(resource.sector)}<br/>${esc(resource.topics.join(" • "))}</p>
    </div>
    <div class="drawer-section">
      <h4>Overview</h4>
      <p>${esc(resource.overview)}</p>
    </div>
    <div class="drawer-section">
      <h4>Key concepts</h4>
      <ul class="resource-detail-list">${resource.keyConcepts.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
    </div>
    <div class="drawer-section">
      <h4>Practical considerations</h4>
      <ul class="resource-detail-list">${resource.practicalConsiderations.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
    </div>
    <div class="drawer-section">
      <h4>Related knowledge</h4>
      <div class="resource-related-list">${related.map((item) => `<button class="resource-related-item" data-resource-view="${esc(item.id)}">${esc(item.title)}</button>`).join("")}</div>
    </div>
    ${resource.id === "ai-risk-assessment" ? `<div class="drawer-section">
      <h4>Governance Lab</h4>
      <p>Use the Governance Lab to explore an illustrative AI-assisted review workflow.</p>
      <div class="drawer-actions"><button class="btn btn-primary btn-small" data-open-governance-lab="true">Open Governance Lab</button></div>
    </div>` : ""}
    <div class="drawer-actions">
      <button class="btn btn-primary btn-small" data-resource-read="${esc(resource.id)}">${isRead ? "READ ✓" : "MARK AS READ"}</button>
      <button class="btn btn-secondary btn-small" data-resource-save="${esc(resource.id)}">${isSaved ? "SAVED" : "SAVE TO REFERENCE LIST"}</button>
      <button class="btn btn-quiet btn-small" data-action="close-overlay">CLOSE</button>
    </div>
  `;
  renderDrawer(detailHtml);
};

const renderResourcePage = () => {
  const container = document.getElementById("resources-page");
  if (!container) return;

  const filteredResources = getFilteredResources();
  const glossaryTerms = getFilteredGlossary();
  const featureResource = filteredResources.find((resource) => resource.id === "ai-governance-readiness") || filteredResources[0] || governanceResources[0];
  const activeFilterLabels = [
    resourcePageState.category !== "All" ? `CATEGORY: ${resourcePageState.category}` : null,
    resourcePageState.sector !== "All" ? `SECTOR: ${resourcePageState.sector}` : null,
    resourcePageState.topic !== "All" ? `TOPIC: ${resourcePageState.topic}` : null,
    resourcePageState.type !== "All" ? `TYPE: ${resourcePageState.type}` : null,
  ].filter(Boolean);

  const countMetrics = [
    { label: "KNOWLEDGE RESOURCES", value: formatCount(filteredResources.length) },
    { label: "GOVERNANCE GUIDES", value: formatCount(filteredResources.filter((resource) => ["Guide", "Framework", "Concept"].includes(resource.type)).length) },
    { label: "SECTOR GUIDES", value: formatCount(filteredResources.filter((resource) => resource.category === "Sector Guidance").length) },
    { label: "PRACTICAL TOOLS", value: formatCount(filteredResources.filter((resource) => ["Checklist", "Governance Tool"].includes(resource.type)).length) },
  ];

  const progress = getProgress();
  const saved = getSavedReferenceList();
  const alphabet = ["ALL", "A", "B", "C", "D", "E", "F", "G", "H", "I", "P", "R", "T", "V"];

  const detailSection = glossaryTerms.length ? glossaryTerms.map((entry) => `<div class="glossary-item ${resourcePageState.selectedGlossary === entry.term ? "open" : ""}"><button class="glossary-term" data-glossary-term="${esc(entry.term)}">${esc(entry.term)}</button>${resourcePageState.selectedGlossary === entry.term ? `<div class="glossary-definition"><p>${esc(entry.definition)}</p></div>` : ""}</div>`).join("") : `<div class="resource-empty-state"><p>No terms match the current glossary filter.</p><button class="btn btn-quiet btn-small" data-resource-clear="true">CLEAR FILTERS</button></div>`;

  container.innerHTML = `
    <div class="resources-page">
      <header class="resources-header">
        <div class="resources-kicker">NITIAI KNOWLEDGE SYSTEM</div>
        <h1>Governance Knowledge Center</h1>
        <p>Explore AI governance concepts, responsible AI principles, sector guidance, practical checklists, and governance knowledge within NITIAI.</p>
      </header>

      <section class="resources-search-panel">
        <div class="resources-search-row">
          <div class="resources-search-box">
            <span class="resources-search-icon">⌕</span>
            <input id="resources-search" class="resources-search-input" type="search" value="${esc(resourcePageState.search)}" placeholder="Search governance resources, topics, principles..." aria-label="Search governance resources" />
          </div>
          <button class="btn btn-primary btn-small" data-resource-clear="true">CLEAR FILTERS</button>
        </div>
        <div class="resources-filter-row">
          <div class="resource-field">
            <label>CATEGORY</label>
            <select id="resource-category" aria-label="Filter by category">
              ${["All", "AI Governance", "Responsible AI", "Policy & Regulation", "Standards & Principles", "Sector Guidance", "Practical Guides"].map((value) => `<option value="${esc(value)}" ${resourcePageState.category === value ? "selected" : ""}>${esc(value)}</option>`).join("")}
            </select>
          </div>
          <div class="resource-field">
            <label>SECTOR</label>
            <select id="resource-sector" aria-label="Filter by sector">
              ${["All", "Construction", "Healthcare", "Agriculture", "Tax & Revenue", "Transport", "Environment", "General Governance"].map((value) => `<option value="${esc(value)}" ${resourcePageState.sector === value ? "selected" : ""}>${esc(value)}</option>`).join("")}
            </select>
          </div>
          <div class="resource-field">
            <label>TOPIC</label>
            <select id="resource-topic" aria-label="Filter by topic">
              ${["All", ...topicOptions].map((value) => `<option value="${esc(value)}" ${resourcePageState.topic === value ? "selected" : ""}>${esc(value)}</option>`).join("")}
            </select>
          </div>
          <div class="resource-field">
            <label>TYPE</label>
            <select id="resource-type" aria-label="Filter by resource type">
              ${["All", ...resourceTypes].map((value) => `<option value="${esc(value)}" ${resourcePageState.type === value ? "selected" : ""}>${esc(value)}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="resources-active-filters">
          ${activeFilterLabels.length ? activeFilterLabels.map((label) => `<span>${esc(label)}</span>`).join("") : `<span class="empty">NO ACTIVE FILTERS</span>`}
        </div>
      </section>

      <section class="resources-overview">
        ${countMetrics.map((metric) => `
          <div class="resource-metric">
            <strong>${esc(metric.value)}</strong>
            <span>${esc(metric.label)}</span>
          </div>
        `).join("")}
      </section>

      <section class="resources-featured">
        <div class="featured-copy">
          <div class="eyebrow">FEATURED KNOWLEDGE</div>
          <h2>${esc(featureResource.title)}</h2>
          <p>${esc(featureResource.description)}</p>
          <div class="featured-meta">
            <div><span>TYPE</span><strong>${esc(featureResource.type)}</strong></div>
            <div><span>CATEGORY</span><strong>${esc(featureResource.category)}</strong></div>
            <div><span>TOPICS</span><strong>${esc(featureResource.topics.slice(0, 3).join(" • "))}</strong></div>
          </div>
          <button class="btn btn-primary" data-resource-view="${esc(featureResource.id)}">EXPLORE RESOURCE</button>
        </div>
        <div class="featured-panel">
          <div class="featured-panel-header">RESOURCE FRAMEWORK</div>
          <ul>
            ${featureResource.keyConcepts.map((concept) => `<li>${esc(concept)}</li>`).join("")}
          </ul>
        </div>
      </section>

      <section class="resources-topic-explorer">
        <div class="section-header-row resources-section-header">
          <div>
            <div class="eyebrow">TOPIC EXPLORER</div>
            <h3>Governance themes</h3>
          </div>
          <button class="btn btn-quiet btn-small" data-resource-topic="All">VIEW ALL TOPICS</button>
        </div>
        <div class="topic-pills">
          ${topicOptions.map((topic) => `<button class="topic-pill ${resourcePageState.topic === topic ? "active" : ""}" data-resource-topic="${esc(topic)}">${esc(topic)}</button>`).join("")}
        </div>
      </section>

      <section class="resources-library">
        <div class="resources-library-header">
          <div class="eyebrow">RESOURCE LIBRARY</div>
          <div class="showing-count">SHOWING ${filteredResources.length} OF ${governanceResources.length} RESOURCES</div>
        </div>
        ${filteredResources.length ? `
          <div class="resource-grid">
            ${filteredResources.map((resource) => `
              <article class="resource-item ${resourcePageState.selectedResourceId === resource.id ? "selected" : ""}">
                <div class="resource-pill">${esc(resource.type)}</div>
                <h4>${esc(resource.title)}</h4>
                <p>${esc(resource.description)}</p>
                <div class="resource-meta-row">
                  <span>${esc(resource.category)}</span>
                  <span>${esc(resource.sector)}</span>
                </div>
                <div class="resource-topics">${resource.topics.map((topic) => `<span>${esc(topic)}</span>`).join("")}</div>
                <button class="btn btn-primary btn-small" data-resource-view="${esc(resource.id)}">VIEW RESOURCE</button>
              </article>
            `).join("")}
          </div>
        ` : `
          <div class="resource-empty-state">
            <h3>NO MATCHING RESOURCES</h3>
            <p>No knowledge resources match your current search and filters.</p>
            <button class="btn btn-primary btn-small" data-resource-clear="true">CLEAR FILTERS</button>
          </div>
        `}
      </section>

      <section class="resources-relationship">
        <div class="section-header-row resources-section-header">
          <div>
            <div class="eyebrow">RESOURCE RELATIONSHIP EXPLORER</div>
            <h3>Governance connections</h3>
          </div>
        </div>
        <div class="relationship-graph">
          <svg viewBox="0 0 640 260" role="img" aria-label="AI governance relationships">
            <path d="M160 120 L270 120 M340 120 L450 120 M500 120 L560 120 M275 120 L275 65 L340 65" />
            <path d="M275 120 L275 180 L340 180" />
            <path d="M450 120 L450 65 L500 65" />
            <path d="M450 120 L450 180 L500 180" />
          </svg>
          <button class="graph-node active" data-relationship-node="AI Governance" style="left:18px; top:94px;">AI Governance</button>
          <button class="graph-node ${resourcePageState.selectedRelationship === "Privacy" ? "active" : ""}" data-relationship-node="Privacy" style="left:176px; top:60px;">Privacy</button>
          <button class="graph-node ${resourcePageState.selectedRelationship === "Human Oversight" ? "active" : ""}" data-relationship-node="Human Oversight" style="left:176px; top:168px;">Oversight</button>
          <button class="graph-node ${resourcePageState.selectedRelationship === "Accountability" ? "active" : ""}" data-relationship-node="Accountability" style="left:357px; top:94px;">Accountability</button>
          <button class="graph-node ${resourcePageState.selectedRelationship === "Data Governance" ? "active" : ""}" data-relationship-node="Data Governance" style="left:506px; top:48px;">Data</button>
          <button class="graph-node ${resourcePageState.selectedRelationship === "Auditability" ? "active" : ""}" data-relationship-node="Auditability" style="left:506px; top:168px;">Audit</button>
        </div>
      </section>

      <section class="resources-toolkit">
        <div class="section-header-row resources-section-header">
          <div>
            <div class="eyebrow">GOVERNANCE TOOLKIT</div>
            <h3>AI Governance Readiness</h3>
          </div>
          <button class="btn btn-quiet btn-small" data-checklist-reset="true">RESET CHECKLIST</button>
        </div>
        <div class="checklist-panel">
          <div class="checklist-header">
            <div>
              <strong>READINESS</strong>
              <span>${progress.checked} / ${progress.total}</span>
            </div>
            <div class="checklist-status ${progress.percent >= 75 ? "ready" : progress.percent >= 35 ? "partial" : "review"}">${progress.percent >= 75 ? "READY" : progress.percent >= 35 ? "PARTIALLY READY" : "REVIEW REQUIRED"}</div>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${progress.percent}%"></div></div>
          <div class="tool-checklist">
            ${[
              ["Data source identified", "Data quality reviewed"],
              ["Potential risks identified", "Risk categories documented"],
              ["Human reviewer identified", "Escalation mechanism defined"],
              ["AI role documented", "Findings can be explained"]
            ].map(([itemA, itemB], groupIndex) => `
              <div class="checklist-row">
                <label class="checklist-item ${resourcePageState.checklist[groupIndex * 2] ? "checked" : ""}"><input type="checkbox" data-checklist-item="${groupIndex * 2}" ${resourcePageState.checklist[groupIndex * 2] ? "checked" : ""} /><span>${esc(itemA)}</span></label>
                <label class="checklist-item ${resourcePageState.checklist[groupIndex * 2 + 1] ? "checked" : ""}"><input type="checkbox" data-checklist-item="${groupIndex * 2 + 1}" ${resourcePageState.checklist[groupIndex * 2 + 1] ? "checked" : ""} /><span>${esc(itemB)}</span></label>
              </div>
            `).join("") }
          </div>
        </div>
      </section>

      <section class="resources-glossary">
        <div class="section-header-row resources-section-header">
          <div>
            <div class="eyebrow">GOVERNANCE GLOSSARY</div>
            <h3>AI Governance Glossary</h3>
          </div>
        </div>
        <div class="glossary-panel">
          <div class="glossary-controls">
            <input id="glossary-search" class="resources-search-input glossary-input" type="search" value="${esc(resourcePageState.glossarySearch)}" placeholder="Search glossary..." aria-label="Search glossary" />
          </div>
          <div class="alphabet-nav">
            ${alphabet.map((letter) => `<button class="alphabet-button ${resourcePageState.glossaryLetter === letter ? "active" : ""}" data-glossary-letter="${esc(letter)}">${esc(letter)}</button>`).join("")}
          </div>
          <div class="glossary-list">${detailSection}</div>
        </div>
      </section>

      <section class="resources-reference">
        <div class="section-header-row resources-section-header">
          <div>
            <div class="eyebrow">MY REFERENCE LIST</div>
            <h3>Saved knowledge</h3>
          </div>
        </div>
        <div class="reference-panel">
          <div class="reference-count">${saved.length} SAVED</div>
          ${saved.length ? `
            <div class="reference-list">
              ${saved.map((resource: typeof governanceResources[number]) => `
                <div class="reference-item">
                  <button class="reference-title" data-resource-view="${esc(resource.id)}">${esc(resource.title)}</button>
                  <div class="reference-actions">
                    <button class="btn btn-quiet btn-small" data-resource-view="${esc(resource.id)}">OPEN</button>
                    <button class="btn btn-quiet btn-small" data-resource-remove="${esc(resource.id)}">REMOVE</button>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : `<div class="resource-empty-state compact"><p>No saved resources yet.</p><button class="btn btn-primary btn-small" data-resource-clear="true">CLEAR FILTERS</button></div>`}
        </div>
      </section>
    </div>
  `;
};

const renderGlossarySelection = () => {
  const glossaryItem = document.querySelector(`[data-glossary-term="${CSS.escape(resourcePageState.selectedGlossary || "")}"]`);
  if (glossaryItem) glossaryItem.parentElement?.classList.add("open");
};

const toggleChecklistItem = (index: number) => {
  resourcePageState.checklist[index] = !resourcePageState.checklist[index];
  renderResourcePage();
};

const sectorImages: Record<string, string> = {
  construction: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=82",
  healthcare: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=82",
  agriculture: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=82",
  tax: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=82",
  transport: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=82",
  environment: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82",
};

function shell() {
  const homeMarkup = homeRedesignMarkup();
  const [homeBeforeEngine, homeAfterEngine] = homeMarkup.split("<!--GOVERNANCE-IN-MOTION-->");
  root.innerHTML = `<div class="app-shell" style="--network-art:url('https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=82')">
    <header class="topbar" id="topbar"><a class="brand" href="#home" aria-label="NITIAI home"><span class="brand-mark">NI</span><span><span class="brand-name">NITIAI</span><span class="brand-sub">AI governance & intelligence</span></span></a><nav class="nav" aria-label="Primary navigation">${navItems.map((item) => `<a href="#${item.id}" data-nav="${item.id}">${item.label}</a>`).join("")}</nav><div class="nav-actions"><button class="icon-btn" data-action="open-search" aria-label="Open global search">${icon("search")}<span class="search-nav-label">Search</span></button><span class="status-chip"><i class="status-dot"></i>Operational</span><button class="icon-btn mobile-menu" data-action="mobile-menu" aria-label="Open menu">${icon("menu")}</button></div></header>
    <main>
      ${homeBeforeEngine}
      <section class="section section-tight" id="engine"><div class="container engine-wrap"><div class="engine-head"><div><div class="eyebrow">Core product workflow</div><h2 class="section-title">Governance intelligence engine</h2></div><p class="engine-note">Select a stage to inspect what happens between raw input and accountable action.</p></div><div class="engine" id="engineNodes">${["DATA INPUT", "AI ANALYSIS", "PATTERN DETECTION", "FINDINGS", "HUMAN REVIEW", "GOVERNANCE ACTION"].map((label, i) => `<button class="engine-node ${i === 0 ? "active" : ""}" data-engine="${i}"><span class="engine-num">0${i + 1}</span><span class="engine-icon">${i === 0 ? icon("upload") : i === 5 ? icon("check") : icon("arrow")}</span><span class="engine-label">${label}</span></button>`).join("")}</div><div class="engine-detail" id="engineDetail"></div></div></section>
      ${homeAfterEngine}
      <section class="section section-tight"><div class="container"><div class="section-header-row"><div><div class="eyebrow">Operational view</div><h2 class="section-title" style="font-size:28px">Live system metrics</h2></div><span class="mono text-muted" style="font-size:10px">ILLUSTRATIVE / FRONTEND STATE</span></div><div class="metrics" id="metrics"></div></div></section>
      <section class="section" id="solutions"><div class="container"><div class="section-header-row"><div><div class="eyebrow">Sector intelligence</div><h2 class="section-title">AI solutions, in context.</h2><p class="section-lede">One workspace, six domains. Choose a sector to change the input requirements, analysis surface, and evidence model.</p></div><span class="mono text-muted" style="font-size:10px">SECTOR WORKSPACE / 06</span></div><div class="workspace" id="sectorWorkspace"></div></div></section>
      <section class="section" id="policy"><div class="container"><div class="section-header-row"><div><div class="eyebrow">Policy & ethics</div><h2 class="section-title">Principles before automation.</h2><p class="section-lede">Governance is not an afterthought to an AI workflow. Use the principles below to inspect the assumptions that make analysis accountable.</p></div></div><div class="policy-grid"><div class="principles" id="principles"></div><div class="about-note"><div class="eyebrow">Control framework</div><h3 style="margin:12px 0 0;font:800 30px/1.05 var(--display);letter-spacing:-.05em">Evidence should travel with the decision.</h3><p>NITIAI treats explanation, review status, and auditability as first-class product surfaces. A signal that cannot be inspected should not silently become an action.</p><div class="approach"><div class="approach-step">DATA</div><div class="approach-step">AI</div><div class="approach-step">FINDINGS</div><div class="approach-step">HUMAN REVIEW</div><div class="approach-step">ACTION</div></div></div></div></div></section>
      <section class="section" id="resources"><div class="container"><div id="resources-page"></div></div></section>
      <section class="section" id="about"><div class="container"><div class="about-page-shell"><style>
        .about-page-shell { --about-bg: #f8faf9; --about-panel: rgba(255,255,255,.9); --about-panel-strong: #eff3f1; --about-line: rgba(22,39,34,.12); --about-text: #132724; --about-muted: #4f5f5b; --about-accent: #244d58; --about-accent-soft: rgba(36,77,88,.08); --about-ink: #0f1f1d; }
        .about-page-shell * { box-sizing:border-box; }
        .about-page-shell { color:var(--about-text); margin:18px auto 0; max-width:1200px; }
        .about-page-shell .about-identity { display:grid; grid-template-columns:1.2fr .8fr; gap:24px; padding:28px 30px; border:1px solid var(--about-line); background:var(--about-panel); }
        .about-page-shell .eyebrow-tag { font:700 10px/1.1 var(--mono); letter-spacing:.16em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell h2.about-heading { margin:16px 0 12px; font:800 clamp(36px,5vw,64px)/0.96 var(--display); letter-spacing:-.06em; max-width:650px; }
        .about-page-shell .about-copy { max-width:600px; color:var(--about-muted); font-size:15px; line-height:1.8; }
        .about-page-shell .about-flow { margin-top:18px; display:flex; flex-direction:column; gap:8px; max-width:300px; }
        .about-page-shell .about-flow-step { display:flex; align-items:center; justify-content:space-between; gap:16px; border:1px solid var(--about-line); background:var(--about-panel-strong); color:var(--about-text); padding:10px 12px; font:700 10px var(--mono); letter-spacing:.15em; text-transform:uppercase; }
        .about-page-shell .about-flow-step span:last-child { color:var(--about-accent); }
        .about-page-shell .about-visual { border:1px solid var(--about-line); background:linear-gradient(180deg,#f4f9f7,#edf3f1); min-height:280px; display:grid; place-items:center; }
        .about-page-shell .about-stack { width:min(100%,260px); display:flex; flex-direction:column; align-items:center; }
        .about-page-shell .about-stack-item { width:100%; border:1px solid var(--about-line); background:rgba(255,255,255,.75); padding:12px 10px; text-align:center; font:700 10px var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--about-accent); margin:0 0 6px; }
        .about-page-shell .about-stack-item:nth-child(2) { transform:translateX(14px); }
        .about-page-shell .about-stack-item:nth-child(3) { transform:translateX(-14px); }
        .about-page-shell .about-stack-arrow { font-size:14px; color:var(--about-muted); }
        .about-page-shell .about-section { margin-top:22px; padding:26px 30px; border:1px solid var(--about-line); background:var(--about-panel); }
        .about-page-shell .section-row-head { display:flex; justify-content:space-between; align-items:end; gap:18px; margin-bottom:18px; }
        .about-page-shell .section-row-head h3 { margin:6px 0 0; font:800 clamp(26px,3vw,42px)/0.98 var(--display); letter-spacing:-.055em; }
        .about-page-shell .meta-note { font:700 10px var(--mono); letter-spacing:.12em; text-transform:uppercase; color:var(--about-muted); }
        .about-page-shell .about-why-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
        .about-page-shell .about-why-card { cursor:pointer; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:18px 16px; min-height:178px; transition:all .2s ease; }
        .about-page-shell .about-why-card.active { background:var(--about-accent-soft); border-color:rgba(36,77,88,.25); transform:translateY(-1px); }
        .about-page-shell .about-why-card strong { display:block; margin-bottom:10px; font:700 11px var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell .about-why-card p { margin:0; color:var(--about-muted); line-height:1.7; }
        .about-page-shell .about-panel { margin-top:16px; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:18px 18px 16px; }
        .about-page-shell .about-panel strong { display:block; margin-bottom:8px; font:700 10px var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell .about-panel p { margin:0; line-height:1.7; color:var(--about-muted); }
        .about-page-shell .about-philosophy-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-top:8px; }
        .about-page-shell .about-philosophy-card { cursor:pointer; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:18px 16px; min-height:146px; transition:all .2s ease; }
        .about-page-shell .about-philosophy-card.active { background:var(--about-accent); color:#fff; border-color:var(--about-accent); }
        .about-page-shell .about-philosophy-card strong { display:block; margin-bottom:8px; font:700 10px var(--mono); letter-spacing:.14em; text-transform:uppercase; }
        .about-page-shell .about-philosophy-card p { margin:0; line-height:1.6; color:inherit; }
        .about-page-shell .about-philosophy-panel { margin-top:16px; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:18px; }
        .about-page-shell .about-philosophy-panel strong { display:block; margin-bottom:6px; font:700 10px var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell .about-philosophy-panel p { margin:0; color:var(--about-muted); line-height:1.7; }
        .about-page-shell .about-principles-layout { display:grid; grid-template-columns:1.05fr .95fr; gap:16px; }
        .about-page-shell .about-principles-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .about-page-shell .about-principle-card { cursor:pointer; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:14px 16px; transition:all .2s ease; }
        .about-page-shell .about-principle-card.active { background:var(--about-accent-soft); border-color:rgba(36,77,88,.25); }
        .about-page-shell .about-principle-card strong { display:block; margin-bottom:8px; font:700 10px var(--mono); letter-spacing:.12em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell .about-principle-card p { margin:0; color:var(--about-muted); line-height:1.6; }
        .about-page-shell .about-principle-detail { border:1px solid var(--about-line); background:var(--about-panel-strong); padding:18px; min-height:160px; }
        .about-page-shell .about-principle-detail strong { display:block; margin-bottom:8px; font:700 10px var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell .about-principle-detail p { margin:0; color:var(--about-muted); line-height:1.7; }
        .about-page-shell .about-people-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
        .about-page-shell .about-persona-card { cursor:pointer; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:18px 16px; min-height:168px; transition:all .2s ease; }
        .about-page-shell .about-persona-card.active { background:var(--about-accent-soft); border-color:rgba(36,77,88,.25); }
        .about-page-shell .about-persona-card strong { display:block; margin-bottom:8px; font:700 10px var(--mono); letter-spacing:.12em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell .about-persona-card p { margin:0; color:var(--about-muted); line-height:1.6; }
        .about-page-shell .about-persona-detail { margin-top:16px; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:18px; }
        .about-page-shell .about-persona-detail strong { display:block; margin-bottom:8px; font:700 10px var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell .about-persona-detail p { margin:0; color:var(--about-muted); line-height:1.7; }
        .about-page-shell .about-future-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
        .about-page-shell .about-future-card { cursor:pointer; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:15px 16px; transition:all .2s ease; }
        .about-page-shell .about-future-card.active { background:var(--about-accent); color:#fff; border-color:var(--about-accent); }
        .about-page-shell .about-future-card strong { display:block; margin-bottom:10px; font:700 10px var(--mono); letter-spacing:.14em; text-transform:uppercase; }
        .about-page-shell .about-future-card p { margin:0; line-height:1.6; color:inherit; }
        .about-page-shell .about-future-panel { margin-top:16px; border:1px solid var(--about-line); background:var(--about-panel-strong); padding:18px; }
        .about-page-shell .about-future-panel strong { display:block; margin-bottom:8px; font:700 10px var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--about-accent); }
        .about-page-shell .about-future-panel p { margin:0; color:var(--about-muted); line-height:1.7; }
        .about-page-shell .about-final { display:flex; justify-content:space-between; align-items:center; gap:18px; flex-wrap:wrap; padding:22px 0 4px; }
        .about-page-shell .about-final-copy h3 { margin:0 0 8px; font:800 clamp(26px,3vw,38px)/0.98 var(--display); letter-spacing:-.055em; }
        .about-page-shell .about-final-copy p { margin:0; color:var(--about-muted); max-width:560px; line-height:1.7; }
        .about-page-shell .about-final-actions { display:flex; gap:10px; flex-wrap:wrap; }
        .about-page-shell .btn-like { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:1px solid var(--about-line); background:#fff; color:var(--about-ink); padding:11px 16px; font:700 11px var(--mono); letter-spacing:.12em; text-transform:uppercase; text-decoration:none; transition:all .2s ease; }
        .about-page-shell .btn-like.primary { background:var(--about-accent); color:#fff; border-color:var(--about-accent); }
        .about-page-shell .btn-like:hover, .about-page-shell .about-why-card:hover, .about-page-shell .about-philosophy-card:hover, .about-page-shell .about-principle-card:hover, .about-page-shell .about-persona-card:hover, .about-page-shell .about-future-card:hover { transform:translateY(-1px); }
        @media (max-width: 820px) { .about-page-shell .about-identity, .about-page-shell .about-principles-layout { grid-template-columns:1fr; } .about-page-shell .about-why-grid, .about-page-shell .about-philosophy-grid, .about-page-shell .about-people-grid, .about-page-shell .about-future-grid { grid-template-columns:1fr; } .about-page-shell .about-final { align-items:flex-start; } }
      </style>
        <div class="about-identity">
          <div>
            <div class="eyebrow-tag">ABOUT NITIAI</div>
            <h2 class="about-heading">Building a clearer relationship between technology and governance.</h2>
            <p class="about-copy">NITIAI is an exploration of how artificial intelligence can make governance information more accessible, understandable, and accountable without removing the human role at the centre of governance.</p>
            <div class="about-flow" aria-label="Information flow">
              <div class="about-flow-step"><span>Information</span><span>↓</span></div>
              <div class="about-flow-step"><span>Understanding</span><span>↓</span></div>
              <div class="about-flow-step"><span>Accountability</span><span>→</span></div>
            </div>
          </div>
          <div class="about-visual" aria-hidden="true">
            <div class="about-stack">
              <div class="about-stack-item">Information</div>
              <div class="about-stack-arrow">↓</div>
              <div class="about-stack-item">Understanding</div>
              <div class="about-stack-arrow">↓</div>
              <div class="about-stack-item">Accountability</div>
            </div>
          </div>
        </div>

        <div class="about-section">
          <div class="section-row-head">
            <div>
              <div class="eyebrow-tag">WHY NITIAI?</div>
              <h3>Why NITIAI?</h3>
            </div>
            <div class="meta-note">Governance, made legible</div>
          </div>
          <div class="about-why-grid">
            <button class="about-why-card active" data-about-why="complexity" type="button">
              <strong>Complexity</strong>
              <p>Governance involves policies, documents, records, regulations, and information that can be difficult to process at scale.</p>
            </button>
            <button class="about-why-card" data-about-why="clarity" type="button">
              <strong>Clarity</strong>
              <p>AI can help structure complex information and make important patterns easier to understand.</p>
            </button>
            <button class="about-why-card" data-about-why="responsibility" type="button">
              <strong>Responsibility</strong>
              <p>Technology should support governance professionals rather than remove human judgement and accountability.</p>
            </button>
          </div>
          <div class="about-panel" id="about-why-panel">
            <strong>COMPLEXITY</strong>
            <p>Governance involves policies, documents, records, regulations, and information that can be difficult to process at scale.</p>
          </div>
        </div>

        <div class="about-section">
          <div class="section-row-head">
            <div>
              <div class="eyebrow-tag">PHILOSOPHY</div>
              <h3>Technology is only part of the solution.</h3>
            </div>
            <div class="meta-note">NITIAI perspective</div>
          </div>
          <div class="about-philosophy-grid">
            <button class="about-philosophy-card active" data-about-perspective="can" type="button">
              <strong>AI CAN</strong>
              <p>Process large amounts of information.</p>
            </button>
            <button class="about-philosophy-card" data-about-perspective="should" type="button">
              <strong>AI SHOULD</strong>
              <p>Make information easier to understand.</p>
            </button>
            <button class="about-philosophy-card" data-about-perspective="must" type="button">
              <strong>AI MUST</strong>
              <p>Remain subject to appropriate human review and accountability.</p>
            </button>
          </div>
          <div class="about-philosophy-panel" id="about-perspective-panel">
            <strong>AI CAN</strong>
            <p>Processing information at scale is valuable when it improves understanding and supports a better review process.</p>
          </div>
        </div>

        <div class="about-section">
          <div class="section-row-head">
            <div>
              <div class="eyebrow-tag">NITIAI PRINCIPLES</div>
              <h3>What NITIAI stands for</h3>
            </div>
            <div class="meta-note">Interactive principles</div>
          </div>
          <div class="about-principles-layout">
            <div class="about-principles-grid">
              <button class="about-principle-card active" data-about-principle="Clarity" type="button">
                <strong>Clarity</strong>
                <p>Make complex governance information easier to understand.</p>
              </button>
              <button class="about-principle-card" data-about-principle="Responsibility" type="button">
                <strong>Responsibility</strong>
                <p>Keep accountability within the governance process.</p>
              </button>
              <button class="about-principle-card" data-about-principle="Transparency" type="button">
                <strong>Transparency</strong>
                <p>Make AI-assisted outputs understandable and reviewable.</p>
              </button>
              <button class="about-principle-card" data-about-principle="Human Agency" type="button">
                <strong>Human Agency</strong>
                <p>Technology should support people responsible for decisions.</p>
              </button>
              <button class="about-principle-card" data-about-principle="Context" type="button" style="grid-column:1 / -1;">
                <strong>Context</strong>
                <p>AI-assisted insights should be interpreted within their real-world governance context.</p>
              </button>
            </div>
            <div class="about-principle-detail" id="about-principle-copy">
              <strong>Clarity</strong>
              <p>Make complex governance information easier to understand.</p>
            </div>
          </div>
        </div>

        <div class="about-section">
          <div class="section-row-head">
            <div>
              <div class="eyebrow-tag">PEOPLE</div>
              <h3>Designed around the people behind governance.</h3>
            </div>
            <div class="meta-note">Perspective</div>
          </div>
          <div class="about-people-grid">
            <button class="about-persona-card active" data-about-persona="citizen" type="button">
              <strong>The Citizen</strong>
              <p>Needs information to be understandable and accessible.</p>
            </button>
            <button class="about-persona-card" data-about-persona="professional" type="button">
              <strong>The Governance Professional</strong>
              <p>Needs structured information that supports analysis and review.</p>
            </button>
            <button class="about-persona-card" data-about-persona="institution" type="button">
              <strong>The Institution</strong>
              <p>Needs processes that remain accountable and traceable.</p>
            </button>
          </div>
          <div class="about-persona-detail" id="about-persona-copy">
            <strong>The Citizen</strong>
            <p>Needs information to be understandable and accessible.</p>
          </div>
        </div>

        <div class="about-section">
          <div class="section-row-head">
            <div>
              <div class="eyebrow-tag">FUTURE</div>
              <h3>Where AI meets responsible governance.</h3>
            </div>
            <div class="meta-note">Exploration</div>
          </div>
          <p class="about-copy" style="margin:0 0 16px; max-width:760px;">NITIAI explores a future where AI can assist with complexity while governance remains grounded in transparency, accountability, context, and human responsibility.</p>
          <div class="about-future-grid">
            <button class="about-future-card active" data-about-future="understand" type="button">
              <strong>Understand</strong>
              <p>Turn complexity into clarity.</p>
            </button>
            <button class="about-future-card" data-about-future="question" type="button">
              <strong>Question</strong>
              <p>Encourage review rather than blind acceptance.</p>
            </button>
            <button class="about-future-card" data-about-future="act" type="button">
              <strong>Act</strong>
              <p>Use technology as an aid to responsible governance.</p>
            </button>
          </div>
          <div class="about-future-panel" id="about-future-copy">
            <strong>Understand</strong>
            <p>Turn complexity into clarity.</p>
          </div>
        </div>

        <div class="about-final">
          <div class="about-final-copy">
            <div class="eyebrow-tag">EXPLORE NITIAI</div>
            <h3>Explore NITIAI</h3>
            <p>See how these principles translate into interactive governance experiences.</p>
          </div>
          <div class="about-final-actions">
            <button class="btn-like primary" data-nav="solutions" type="button">Explore AI Solutions</button>
            <button class="btn-like" data-nav="ai-in-police" type="button">Explore Governance Lab</button>
          </div>
        </div>
      </div></div></section>
      ${publicSafetyMarkup()}
    </main>
    <footer><div class="container"><div class="footer-grid"><div><div class="footer-brand">NITIAI</div><p class="footer-copy">AI Governance & Intelligence Platform. Built to make evidence, review, and accountability visible.</p></div><div><div class="footer-col-title">Navigation</div><div class="footer-links"><a href="#solutions">AI Solutions</a><a href="#policy">Policy & Ethics</a></div></div><div><div class="footer-col-title">Reference</div><div class="footer-links"><a href="#resources">Resources</a><a href="#about">About</a><a href="#policy">Responsible AI</a></div></div><div><div class="footer-col-title">Commitments</div><div class="footer-links"><a href="#about">Privacy</a><a href="#policy">Human oversight</a><a href="#about">Accessibility</a></div></div></div><div class="footer-bottom"><span>© 2026 NITIAI / illustrative product environment</span><span>DATA → INTELLIGENCE → EVIDENCE → OVERSIGHT → GOVERNANCE</span></div></div></footer>
    <div class="overlay" id="overlay"></div><div class="toast-stack" id="toastStack"></div><button class="chat-launcher" data-action="toggle-chat">${icon("chat")} Governance AI</button><div class="chat-panel" id="chatPanel"></div>
  </div>`;
  toastStack = document.getElementById("toastStack") as HTMLElement;
}

function showPage(id: string) {
  const page = sitePages.find((item) => item.id === id) || sitePages[0];
  document.querySelectorAll("main > section").forEach((section) => {
    const visible = section.id === page.id || (page.id === "home" && (section.id === "engine" || section.hasAttribute("data-home-section")));
    (section as HTMLElement).hidden = !visible;
  });
  document.querySelectorAll(".nav a").forEach((link) => { const navLink = link as HTMLElement; const linkPage = sitePages.find((item) => item.id === navLink.dataset.nav); link.classList.toggle("active", linkPage?.id === page.id); if (linkPage) link.setAttribute("href", linkPage.path); });
  window.scrollTo(0, 0);
}

function navigateTo(id: string) {
  const page = sitePages.find((item) => item.id === id) || sitePages[0];
  if (window.location.pathname !== page.path) window.history.pushState({}, "", page.path);
  showPage(page.id);
}

function toast(title: string, detail = "", type = "") { const node = document.createElement("div"); node.className = `toast ${type}`; node.innerHTML = `<strong>${esc(title)}</strong>${detail ? `<small>${esc(detail)}</small>` : ""}`; toastStack.appendChild(node); window.setTimeout(() => node.remove(), 3600); }

const engineDetails = [
  ["INPUT LAYER", "Files, reports, records, and images enter through a visible ingestion boundary. The system identifies type, size, status, and timestamp before analysis begins.", "Explore AI solutions"],
  ["ANALYSIS LAYER", "A staged process extracts structure, checks completeness, and prepares evidence. Each stage exposes a state: waiting, processing, or complete.", "Inspect stages"],
  ["SIGNAL LAYER", "Pattern detection turns structured information into reviewable signals. Signals are not conclusions; they carry uncertainty and context.", "View patterns"],
  ["EVIDENCE LAYER", "Findings pair a title, severity, explanation, evidence, recommendation, and review requirement so a reviewer can inspect the reasoning.", "View findings"],
  ["REVIEW LAYER", "Human reviewers can mark a finding reviewed, request more information, or flag it for further review. Each action creates an audit event.", "Open review queue"],
  ["ACTION LAYER", "Governance action is the final hand-off: a documented, accountable next step informed by evidence and human judgment.", "Review principles"],
];
function renderEngineDetail(index = 0) { const detail = document.getElementById("engineDetail"); if (!detail) return; detail.innerHTML = `<span class="detail-label">${engineDetails[index][0]}</span><span class="detail-copy">${engineDetails[index][1]}</span><button class="btn btn-quiet btn-small" data-scroll="${index === 5 ? "policy" : "solutions"}">${engineDetails[index][2]} ${icon("arrow")}</button>`; }
function renderMetrics() { const metrics = [{ label: "Sectors", value: "06", context: "Active domains" }, { label: "AI workflows", value: "18", context: "Illustrative paths" }, { label: "Data types", value: "07", context: "PDF · CSV · image" }, { label: "Review queue", value: state.analysis.status === "complete" ? "01" : "02", context: state.analysis.status === "complete" ? "Finding ready" : "Awaiting review" }]; const el = document.getElementById("metrics"); if (el) el.innerHTML = metrics.map((m, i) => `<button class="metric" data-metric="${i}"><span class="metric-label">${m.label}</span><span class="metric-value">${m.value}</span><span class="metric-context">${m.context}</span></button>`).join(""); }
function fileCard() { if (!state.file) return ""; const extension = state.file.name.split(".").pop()?.toUpperCase() || "FILE"; return `<div class="file-card"><div class="file-icon">${esc(extension.slice(0,4))}</div><div><div class="file-name" title="${esc(state.file.name)}">${esc(state.file.name)}</div><div class="file-meta">${esc(state.file.type || extension)} · ${formatBytes(state.file.size)} · ${state.analysis.status === "complete" ? "ANALYSED" : "READY"}</div></div><div class="file-actions"><button class="icon-btn" data-action="preview-file" aria-label="Preview file">${icon("external")}</button><button class="icon-btn" data-action="remove-file" aria-label="Remove file">${icon("close")}</button></div></div>`; }
function imagePreview() { if (!state.file) return `<div class="preview-placeholder">Drop a document to begin browser-based analysis.</div>`; const result = state.analysis.result; if (result?.text) return `<div class="document-analysis-preview"><div class="document-analysis-meta"><strong>${esc(result.fileName)}</strong><span>${esc(result.fileType)} · ${result.wordCount} WORDS · ${result.pageCount ? `${result.pageCount} PAGES` : "TEXT EXTRACTED"}</span></div><div class="document-analysis-text">${esc(result.text.slice(0, 3200))}${result.text.length > 3200 ? "\n\n[Preview truncated]" : ""}</div></div>`; if (state.fileUrl) return `<img src="${state.fileUrl}" alt="Uploaded ${esc(state.file.name)} preview"/>`; if (state.file.name.toLowerCase().endsWith(".csv")) return `<div class="document-preview"><strong>CSV DATA PREVIEW</strong><div class="doc-lines"><i></i><i></i><i></i><i></i><i></i><i></i></div><small class="mono">${state.csvRows.length || "Awaiting"} parsed rows</small></div>`; if (result?.message) return `<div class="document-preview"><strong>DOCUMENT COULD NOT BE PROCESSED</strong><p>${esc(result.message)}</p></div>`; return `<div class="document-preview">${icon("file")}<strong>${esc(state.file.name)}</strong><p>Ready for client-side document analysis.</p></div>`; }
function analysisResultsMarkup() { const result = state.analysis.result; if (!result) return ""; const list = (items: string[], empty = "None detected") => items.length ? `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : `<p class="analysis-empty">${empty}</p>`; return `<div class="analysis-results"><div class="analysis-results-head"><span>CLIENT-SIDE DOCUMENT ANALYSIS</span><small>${result.status === "complete" ? "BROWSER-BASED ANALYSIS COMPLETE" : result.status.toUpperCase()}</small></div><p class="analysis-disclaimer">Results are generated from browser-based text extraction and rule-based analysis. They are illustrative and should be reviewed by a human.</p><div class="analysis-overview"><div><span>FILE</span><b>${esc(result.fileName)}</b></div><div><span>FORMAT</span><b>${esc(result.fileType)}</b></div><div><span>WORDS</span><b>${result.wordCount}</b></div><div><span>LANGUAGE</span><b>${esc(result.language)}</b></div><div><span>SECTIONS</span><b>${result.sections.length}</b></div><div><span>PAGES</span><b>${result.pageCount ?? "-"}</b></div></div><div class="analysis-columns"><section><h4>KEY TERMS</h4>${list(result.keyTerms)}</section><section><h4>IMPORTANT DATES</h4>${list(result.dates)}</section><section><h4>ORGANIZATIONS / ENTITIES</h4>${list(result.entities)}</section><section><h4>GOVERNANCE SIGNALS</h4>${result.signals.filter((signal) => signal.score > 0).slice(0, 6).map((signal) => `<div class="signal-row"><span>${signal.label}</span><i><b style="width:${signal.score}%"></b></i></div>`).join("") || `<p class="analysis-empty">No strong governance themes detected.</p>`}</section></div><div class="analysis-columns"><section><h4>REQUIREMENTS</h4>${list(result.requirements)}</section><section><h4>RISKS / FLAGS</h4>${list(result.risks)}</section><section><h4>ACTION ITEMS</h4>${list(result.actionItems)}</section><section><h4>EVIDENCE CHAIN</h4><div class="analysis-evidence">${result.evidence.map((item) => `<div><i></i><span>${item.label}</span><b>${item.status}</b><small>${esc(item.detail)}</small></div>`).join("")}</div></section></div></div>`; }
function findingList() { const findings = state.analysis.findings.length ? `<div class="finding-list">${state.analysis.findings.map((finding: any) => `<button class="finding-item" data-finding="${esc(finding.id)}"><i class="severity-bar ${finding.severity === "info" ? "info" : ""}"></i><span><span class="finding-title">${esc(finding.title)}</span><span class="finding-sub">${esc(finding.explanation)}</span></span><span class="finding-tag">${esc(finding.status || "Pending Review")}</span><span class="chevron">›</span></button>`).join("")}</div>` : `<div class="empty-state"><div><strong>No findings yet</strong>Upload a document and choose Analyze document to prepare a review queue.</div></div>`; return `${findings}${analysisResultsMarkup()}`; }
function healthcareWorkspace() { const periodButtons = ["DAILY", "WEEKLY", "MONTHLY"].map((p) => `<button class="filter-btn ${state.healthPeriod === p ? "active" : ""}" data-health-period="${p}">${p}</button>`).join(""); return `<div class="panel"><div class="panel-head"><span class="panel-title">Operational pattern</span><span class="mono text-muted" style="font-size:9px">${state.healthPeriod}</span></div><div class="panel-body"><div class="resource-tools">${periodButtons}</div>${healthcareChart()}<div class="mini-grid"><div class="mini-stat"><b>92</b><span>Demand index</span></div><div class="mini-stat"><b>84%</b><span>Utilization</span></div><div class="mini-stat"><b>16%</b><span>Open capacity</span></div></div></div></div>`; }
function taxWorkspace() { const base = state.csvRows.length ? state.csvRows : sectors.tax.rows; const filtered = base.filter((row: any) => Object.values(row).join(" ").toLowerCase().includes(csvQuery.toLowerCase())); const sorted = [...filtered].sort((a: any,b: any) => csvSortKey ? String(a[csvSortKey]).localeCompare(String(b[csvSortKey])) * (csvSortAsc ? 1 : -1) : 0); const keys = Object.keys(sorted[0] || { Record: "", Category: "", Amount: "", Date: "", Status: "" }); return `<div class="panel"><div class="panel-head"><span class="panel-title">Revenue records</span><span class="mono text-muted" style="font-size:9px">${sorted.length} ROWS</span></div><div class="csv-tools"><input class="field" id="csvQuery" value="${esc(csvQuery)}" placeholder="Search records…" aria-label="Search revenue records"/><select class="field" id="csvFilter"><option value="all">All statuses</option><option value="Review">Review</option><option value="Verified">Verified</option><option value="Pending">Pending</option></select><span class="mono text-muted" style="font-size:10px;align-self:center">Select a header to sort</span></div><div class="table-wrap"><table class="data-table"><thead><tr>${keys.map((key) => `<th><button class="text-btn" style="padding:0;font:inherit" data-sort-csv="${esc(key)}">${esc(key)} ${csvSortKey === key ? (csvSortAsc ? "↑" : "↓") : ""}</button></th>`).join("")}</tr></thead><tbody>${sorted.map((row: any) => `<tr>${keys.map((key) => `<td>${esc(row[key])}</td>`).join("")}</tr>`).join("")}</tbody></table></div><div style="padding:12px 16px;color:var(--muted);font-size:11px;border-top:1px solid var(--line)"><strong class="text-amber">POTENTIAL ANOMALY DETECTED</strong> — An anomaly is not proof of fraud. Human investigation is required.</div></div>`; }
function transportWorkspace() { const road = sectors.transport.roads.find((r: any) => r.id === selectedRoad) || sectors.transport.roads[0]; return `<div class="panel"><div class="panel-head"><span class="panel-title">Network schematic</span><span class="mono text-muted" style="font-size:9px">CLICK A ROAD</span></div><div class="panel-body"><div class="resource-tools"><button class="filter-btn ${state.transportMode === "PEAK" ? "active" : ""}" data-transport-mode="PEAK">PEAK</button><button class="filter-btn ${state.transportMode === "OFF-PEAK" ? "active" : ""}" data-transport-mode="OFF-PEAK">OFF-PEAK</button>${["TRAFFIC VOLUME", "CONGESTION", "INFRASTRUCTURE"].map((m) => `<button class="filter-btn ${state.transportMetric === m ? "active" : ""}" data-transport-metric="${m}">${m}</button>`).join("")}</div>${transportSvg()}<div class="mini-grid"><div class="mini-stat"><b>${road.volume}</b><span>Traffic volume</span></div><div class="mini-stat"><b>${road.congestion}</b><span>Congestion</span></div><div class="mini-stat"><b>${road.id}</b><span>Selected road</span></div></div></div></div>`; }
function environmentWorkspace() { return `<div class="panel"><div class="panel-head"><span class="panel-title">Before / after comparison</span><span class="mono text-muted" style="font-size:9px">DRAG SLIDER</span></div><div class="panel-body"><div class="compare" style="position:relative;height:250px;overflow:hidden;background:linear-gradient(135deg,#cfdad2,#e9e0c7 38%,#bacac0 39%,#91b1a3 70%,#72998a);"><div style="position:absolute;inset:0;background:linear-gradient(155deg,#d2ddd2 0 20%,#b9cbb9 21% 35%,#c5bfa2 36% 51%,#739684 52% 74%,#466e5d 75%);opacity:.58;"></div><div class="after-frame" style="position:absolute;inset:0;width:${environmentSplit}%;overflow:hidden;border-right:2px solid #fff;background:linear-gradient(145deg,#c4d0c2 0 20%,#a5b79d 21% 38%,#c4b68e 39% 54%,#6d8e7d 55% 78%,#446b57 79%);"><span style="position:absolute;top:12px;left:12px;color:#fff;background:rgba(16,40,63,.75);padding:5px 7px;font:10px var(--mono)">BEFORE</span></div><span style="position:absolute;top:12px;right:12px;color:#fff;background:rgba(16,40,63,.75);padding:5px 7px;font:10px var(--mono)">AFTER</span><div style="position:absolute;left:58%;top:42%;width:20px;height:20px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 5px rgba(162,79,79,.35);cursor:pointer" data-env-marker="1"></div></div><input id="compareRange" type="range" min="10" max="90" value="${environmentSplit}" style="width:100%;margin:14px 0 5px" aria-label="Before and after comparison slider"/><div class="mini-grid"><div class="mini-stat"><b>Vegetation</b><span>Indicator</span></div><div class="mini-stat"><b>-12%</b><span>Detected change</span></div><div class="mini-stat"><b>Zone 03</b><span>Monitoring area</span></div></div></div></div>`; }
function genericWorkspace() { return `<div class="panel"><div class="panel-head"><span class="panel-title">Evidence chain</span><span class="mono text-muted" style="font-size:9px">ILLUSTRATIVE</span></div><div class="visual-preview"><img src="/manus-storage/nitiai-civic-archive_8c931d4f.jpg" alt="Civic planning documents and building plan" loading="lazy"/></div><div class="panel-body"><div class="checklist">${["Applicant information", "Site information", "Project description", "Structural documentation", "Supporting certificate"].map((item, i) => `<button class="check-row ${i < 3 ? "checked" : ""}" data-check-item="${i}"><i class="check-box">${i < 3 ? icon("check") : ""}</i><span>${item}</span><small class="check-note">${i < 3 ? "IDENTIFIED" : "REVIEW"}</small></button>`).join("")}</div><div class="lab-disclaimer">Potential documentation gap identified. This illustrative result does not issue an actual legal approval.</div></div></div>`; }
function renderSectorWorkspace() { const sector = sectors[state.sector]; const workspace = document.getElementById("sectorWorkspace"); if (!workspace) return; let visual = genericWorkspace(); if (state.sector === "healthcare") visual = healthcareWorkspace(); if (state.sector === "agriculture") visual = `<div class="panel"><div class="panel-head"><span class="panel-title">Field observation</span><span class="mono text-muted" style="font-size:9px">ILLUSTRATIVE</span></div><div class="visual-preview"><img src="/manus-storage/nitiai-agriculture-monitoring_a8fd2948.jpg" alt="Aerial agricultural monitoring image" loading="lazy"/><span style="position:absolute;left:48%;top:42%;width:24px;height:24px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 5px rgba(170,108,24,.35);cursor:pointer" data-env-marker="agri"></span></div><div class="panel-body"><div class="mini-grid"><div class="mini-stat"><b>87%</b><span>Marker confidence</span></div><div class="mini-stat"><b>02</b><span>Zones flagged</span></div><div class="mini-stat"><b>Review</b><span>Verification</span></div></div><div class="lab-disclaimer">Potential crop stress indicator. Verify with field observation, weather context, and sensor readings.</div></div></div>`; if (state.sector === "healthcare") visual = healthcareWorkspace(); if (state.sector === "tax") visual = taxWorkspace(); if (state.sector === "transport") visual = transportWorkspace(); if (state.sector === "environment") visual = environmentWorkspace(); workspace.innerHTML = `<aside class="sector-rail"><div class="rail-label">Sector navigation</div>${Object.entries(sectors).map(([key, item]: any, i) => `<button class="sector-btn ${key === state.sector ? "active" : ""}" data-sector="${key}"><span>${item.label}</span><span class="sector-code">${item.code}</span></button>`).join("")}</aside><div class="workspace-main"><div class="workspace-header"><div><h3 class="workspace-title">${sector.title}</h3><p class="workspace-description">${sector.description}</p></div><div class="workspace-meta"><span>MODULE / ${sector.code}</span><span class="text-green">● FRONTEND READY</span></div></div><div class="workspace-grid"><div><div class="panel"><div class="panel-head"><span class="panel-title">Universal data ingestion</span><span class="mono text-muted" style="font-size:9px">INPUT 01</span></div><div class="panel-body">${state.file ? fileCard() : `<label class="upload-zone" for="fileInput"><input id="fileInput" type="file" hidden accept=".pdf,.doc,.docx,.csv,.jpg,.jpeg,.png"/><span class="upload-icon">${icon("upload")}</span><strong>Drop a file to begin</strong><span>or browse local files</span><small>${sector.accepts}</small></label>`}${state.file ? `<div class="upload-actions"><button class="btn btn-secondary btn-small" data-action="preview-file">Preview</button><button class="btn btn-primary btn-small" data-action="run-analysis" ${state.analysis.status === "running" ? "disabled" : ""}>${state.analysis.status === "running" ? "Processing…" : "Run analysis"} ${icon("arrow")}</button></div>` : ""}</div></div><div class="panel" style="margin-top:12px"><div class="panel-head"><span class="panel-title">Input requirements</span></div><div class="panel-body"><div class="mono text-muted" style="font-size:10px;line-height:1.7">${esc(sector.uploadLabel)}<br/>Accepted formats: ${esc(sector.accepts)}<br/>All results are illustrative and reviewable.</div></div></div></div><div><div class="panel"><div class="panel-head"><span class="panel-title">Input preview</span><span class="mono text-muted" style="font-size:9px">${state.file ? "SELECTED" : "EMPTY"}</span></div><div class="preview-area">${imagePreview()}</div><div class="panel-body">${visual}</div></div></div></div><div style="margin-top:18px"><div class="panel"><div class="panel-head"><span class="panel-title">Findings queue</span><span class="mono text-muted" style="font-size:9px">${state.analysis.findings.length ? "1 READY" : "NO ACTIVE FINDINGS"}</span></div><div class="panel-body">${findingList()}</div></div></div></div>`; }
function renderLab() { const lab = document.getElementById("labGrid"); if (!lab) return; const stages = stageNames.map((name, i) => { const complete = state.analysis.status === "complete" || i < state.analysis.stageIndex; const processing = state.analysis.status === "running" && i === state.analysis.stageIndex; return `<div class="pipeline-stage"><span class="pipeline-num">0${i + 1}</span><span class="pipeline-name">${name}</span><span class="stage-state ${complete ? "complete" : processing ? "processing" : "waiting"}">${complete ? "COMPLETE" : processing ? "PROCESSING" : "WAITING"}</span></div>`; }).join(""); const metricRows = state.analysis.status === "complete" ? [["Documents reviewed", "01"], ["Information extracted", "18"], ["Potential issues", "01"], ["Missing information", "02"], ["Review priority", "Attention"]] : [["Documents reviewed", "—"], ["Information extracted", "—"], ["Potential issues", "—"], ["Missing information", "—"], ["Review priority", "Pending input"]]; lab.innerHTML = `<div class="lab-col"><div class="lab-col-head"><span>01 / Input</span><span>${state.file ? "READY" : "AWAITING"}</span></div><div class="lab-body"><div class="lab-section"><label class="lab-label">Sector</label><select class="lab-select" id="labSector">${Object.entries(sectors).map(([key, item]: any) => `<option value="${key}" ${key === state.sector ? "selected" : ""}>${item.label}</option>`).join("")}</select></div><div class="lab-section"><label class="lab-label">Data type</label><div class="mono text-muted" style="font-size:11px">${state.file ? (state.file.type || state.file.name.split(".").pop()?.toUpperCase()) : "No input selected"}</div></div><div class="lab-section">${state.file ? fileCard() : `<div class="empty-state" style="min-height:100px"><div>Select a file in AI Solutions to pass it into the lab.</div></div>`}</div><button class="btn btn-primary" style="width:100%" data-scroll="solutions">Open input workspace ${icon("arrow")}</button></div></div><div class="lab-col"><div class="lab-col-head"><span>02 / AI engine</span><span>${state.analysis.status === "running" ? "PROCESSING" : state.analysis.status === "complete" ? "COMPLETE" : "IDLE"}</span></div><div class="lab-body"><div class="lab-section"><label class="lab-label">Live processing pipeline</label>${stages}<div class="progress-track"><div class="progress-fill" style="width:${state.analysis.progress}%"></div></div><div class="progress-row"><span>ANALYSIS</span><span>${state.analysis.progress}%</span></div></div><div class="lab-section"><label class="lab-label">Explainability chain</label>${["Input", "Extracted information", "Pattern detected", "Reason for flag", "Human verification"].map((item, i) => `<button class="check-row" data-explain="${i}"><i class="check-box" style="border-radius:50%;background:${i < (state.analysis.status === "complete" ? 4 : 2) ? "var(--blue)" : "transparent"}"></i><span>${item}</span><span style="margin-left:auto;color:var(--muted-2)">›</span></button>`).join("")}</div><div class="lab-disclaimer">Illustrative frontend analysis. No external AI API is connected and no automated decision is issued.</div></div></div><div class="lab-col"><div class="lab-col-head"><span>03 / Output</span><span>${state.analysis.status === "complete" ? "REVIEW READY" : "NO OUTPUT"}</span></div><div class="lab-body"><div class="lab-section">${metricRows.map(([label, value]) => `<div class="output-metric"><span>${label}</span><b>${value}</b></div>`).join("")}<div class="confidence"><span>CONFIDENCE / 78%</span><i></i></div></div><div class="lab-section"><label class="lab-label">Review status</label>${state.analysis.findings.length ? `<div class="evidence-box"><strong>${esc(state.analysis.findings[0].title)}</strong><p style="margin:5px 0 0;font-size:11px">${esc(state.analysis.findings[0].status)}</p></div>` : `<div class="empty-state" style="min-height:100px"><div>Analysis output will appear here.</div></div>`}</div><button class="btn btn-secondary" style="width:100%" data-action="reset">Reset analysis</button></div></div>`; }
function renderAudit() { const el = document.getElementById("auditList"); if (!el) return; el.innerHTML = state.audit.length ? `<div class="panel"><div class="panel-body" style="padding:0">${state.audit.map((event) => `<button class="audit-event" style="width:100%;display:grid;grid-template-columns:10px 180px minmax(0,1fr) auto;gap:12px;align-items:center;padding:14px 16px;background:transparent;border-bottom:1px solid var(--line);text-align:left;cursor:pointer"><i style="width:8px;height:8px;background:${event.kind === "complete" ? "var(--green)" : event.kind === "active" ? "var(--blue)" : "var(--muted-2)"}"></i><strong style="font:10px var(--mono);color:var(--ink-2)">${esc(event.label)}</strong><span style="font-size:11px;color:var(--muted)">${esc(event.detail)}</span><time style="font:9px var(--mono);color:var(--muted-2)">${esc(event.time)}</time></button>`).join("")}</div></div>` : `<div class="empty-state"><div><strong>No activity</strong>Upload an input to begin the audit trail.</div></div>`; }
function renderPrinciples() { const el = document.getElementById("principles"); if (!el) return; el.innerHTML = principles.map(([title, copy]) => `<article class="principle ${state.openPrinciples.includes(title) ? "open" : ""}"><button class="principle-btn" data-principle="${esc(title)}"><span>${esc(title)}</span><span class="plus">+</span></button><div class="principle-copy">${esc(copy)}</div></article>`).join(""); }
function renderResources() { renderResourcePage(); }
function renderChat() { const el = document.getElementById("chatPanel"); if (!el) return; el.classList.toggle("open", state.chatOpen); el.innerHTML = `<div class="chat-head"><div><div class="chat-head-title">Governance AI</div><small>KEYWORD-ASSISTED / ILLUSTRATIVE</small></div><div><button class="icon-btn" style="color:#fff" data-action="delete-chat" aria-label="Delete conversation">${icon("close")}</button><button class="icon-btn" style="color:#fff" data-action="toggle-chat" aria-label="Close chat">${icon("close")}</button></div></div><div class="chat-messages" id="chatMessages">${state.chatMessages.map((m) => `<div class="chat-message ${m.role === "user" ? "user" : ""}">${esc(m.text)}</div>`).join("")}${state.chatTyping ? `<div class="chat-message"><span class="typing"><i></i><i></i><i></i></span></div>` : ""}</div><div class="chat-suggestions">${["How can AI help building approvals?", "How can agriculture use AI?", "What is human oversight?"].map((q) => `<button class="suggestion" data-suggestion="${esc(q)}">${esc(q)}</button>`).join("")}</div><form class="chat-form" id="chatForm"><input class="chat-input" id="chatInput" placeholder="Ask Governance AI…" aria-label="Message Governance AI"/><button class="btn btn-primary btn-small">Send</button></form>`; const messages = document.getElementById("chatMessages"); if (messages) messages.scrollTop = messages.scrollHeight; }
function renderDrawer(content: string) { const overlay = document.getElementById("overlay") as HTMLElement; overlay.className = "overlay open"; overlay.innerHTML = `<aside class="drawer"><div class="drawer-head">${content.split("<!--BODY-->")[0]}<button class="icon-btn" data-action="close-overlay" aria-label="Close">${icon("close")}</button></div><div class="drawer-body">${content.split("<!--BODY-->")[1] || ""}</div></aside>`; }
function openFilePreview() { if (!state.file) return; const isImage = Boolean(state.fileUrl); const body = `<div class="drawer-kicker">Input preview / selected file</div><h2 class="drawer-title">${esc(state.file.name)}</h2><!--BODY--><div class="drawer-section"><h4>File information</h4><p><strong>Type</strong> ${esc(state.file.type || "Unknown")}<br/><strong>Size</strong> ${formatBytes(state.file.size)}<br/><strong>Status</strong> Ready for illustrative analysis<br/><strong>Selected</strong> ${new Date(state.file.lastModified).toLocaleString()}</p></div><div class="drawer-section">${isImage ? `<img src="${state.fileUrl}" alt="Uploaded file preview" style="width:100%;max-height:300px;object-fit:contain;background:#eef2f1"/>` : state.csvRows.length ? `<h4>CSV preview</h4><div class="table-wrap"><table class="data-table"><tbody>${state.csvRows.slice(0,5).map((row) => `<tr>${Object.values(row).map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<div class="document-preview">${icon("file")}<p>Document-style preview metadata is available. Content extraction remains illustrative in this frontend-only environment.</p></div>`}</div><div class="drawer-actions"><button class="btn btn-primary btn-small" data-action="run-analysis">Run analysis</button><button class="btn btn-quiet btn-small" data-action="close-overlay">Close</button></div>`; renderDrawer(body); }
function openFinding(finding: any) { state.selectedFinding = finding; const body = `<div class="drawer-kicker">Finding details / ${esc(finding.category)}</div><h2 class="drawer-title">${esc(finding.title)}</h2><!--BODY--><div class="drawer-section"><h4>Status / severity</h4><p><strong>${esc(finding.status || "Pending Review")}</strong><br/><span class="text-amber">${esc(finding.severity || "Attention")}</span></p></div><div class="drawer-section"><h4>Why was this flagged?</h4><p>${esc(finding.explanation)}</p></div><div class="drawer-section"><h4>Evidence</h4><div class="evidence-box">${esc(finding.evidence)}</div></div><div class="drawer-section"><h4>Recommended verification</h4><p>${esc(finding.recommendation)}</p></div><div class="drawer-section"><h4>Human review required</h4><p>${esc(finding.review)}</p></div><div class="drawer-actions"><button class="btn btn-primary btn-small" data-review="reviewed">Mark reviewed</button><button class="btn btn-secondary btn-small" data-review="requested">Request information</button><button class="btn btn-danger btn-small" data-review="flagged">Flag for further review</button></div>`; renderDrawer(body); toast("Finding opened", finding.title); }
function openResource(resource: any) { renderDrawer(`<div class="drawer-kicker">Resource / ${esc(resource.category)}</div><h2 class="drawer-title">${esc(resource.title)}</h2><!--BODY--><div class="drawer-section"><h4>Organization</h4><p>${esc(resource.org)} · ${esc(resource.year)}</p></div><div class="drawer-section"><h4>Why it matters</h4><p>This reference sits within the NITIAI directory as a starting point for teams designing transparent, accountable AI-assisted workflows.</p></div><div class="drawer-actions"><a class="btn btn-primary btn-small" href="https://${esc(resource.source)}" target="_blank" rel="noreferrer">Open source ${icon("external")}</a></div>`); }
function openHomeLandscape(index: number) { const [title, copy] = landscape[index]; renderDrawer(`<div class="drawer-kicker">Government landscape / ${esc(title)}</div><h2 class="drawer-title">${esc(title)}</h2><!--BODY--><div class="drawer-section"><h4>How AI can help</h4><p>AI can support ${esc(title.toLowerCase())} by helping teams organize information, surface patterns, and retrieve relevant context faster while professionals remain responsible for interpretation and decisions.</p></div><div class="drawer-section"><h4>Context</h4><p>${esc(copy)} NITIAI presents this as an illustrative area of exploration, not a claim about a deployed system or official performance.</p></div><div class="drawer-actions"><button class="btn btn-quiet btn-small" data-action="close-overlay">Close</button></div>`); }
function decorateSectorWorkspace() { const workspace = document.getElementById("sectorWorkspace"); if (!workspace) return; workspace.querySelectorAll("img[src^='/manus-storage']").forEach((image) => { image.setAttribute("src", sectorImages[state.sector]); image.setAttribute("alt", `${sectors[state.sector].label} sector editorial image`); }); const main = workspace.querySelector(".workspace-main"); const grid = main?.querySelector(".workspace-grid"); if (!main || !grid || main.querySelector(".sector-editorial-image")) return; const imagePanel = document.createElement("div"); imagePanel.className = "sector-editorial-image"; imagePanel.innerHTML = `<img src="${sectorImages[state.sector]}" alt="${sectors[state.sector].label} public-sector editorial image" loading="lazy"/><span>${sectors[state.sector].label.toUpperCase()} / ILLUSTRATIVE SECTOR VIEW</span>`; main.insertBefore(imagePanel, grid); }
function updateDynamic() { renderMetrics(); renderSectorWorkspace(); decorateSectorWorkspace(); renderPrinciples(); renderResources(); renderChat(); const systemSector = document.getElementById("systemSector"); if (systemSector) systemSector.textContent = sectors[state.sector].label.toUpperCase(); }

shell(); renderEngineDetail(); updateDynamic();
showPage(pageForPath(window.location.pathname).id);

root.addEventListener("click", (event: Event) => { const target = event.target as HTMLElement; const actionEl = target.closest("[data-action]") as HTMLElement; const scrollEl = target.closest("[data-scroll]") as HTMLElement; const navEl = target.closest("[data-nav]") as HTMLElement; if (scrollEl) navigateTo(scrollEl.dataset.scroll || "home"); if (navEl) { event.preventDefault(); navigateTo(navEl.dataset.nav || "home"); }
  const homeScroll = target.closest("[data-home-scroll]") as HTMLElement; if (homeScroll) document.getElementById(homeScroll.dataset.homeScroll || "home-redesign")?.scrollIntoView({ behavior: "smooth" });
  if (actionEl) { const action = actionEl.dataset.action; if (action === "open-search") openSearch(); if (action === "mobile-menu") document.getElementById("topbar")?.classList.toggle("menu-open"); if (action === "close-overlay") (document.getElementById("overlay") as HTMLElement).className = "overlay"; if (action === "toggle-chat") update(() => { state.chatOpen = !state.chatOpen; }); if (action === "delete-chat") update(() => { state.chatMessages = [{ role: "assistant", text: "Conversation cleared. Governance AI is ready." }]; }); if (action === "preview-file") openFilePreview(); if (action === "remove-file") { removeFile(); toast("Analysis reset", "Selected file and review state cleared."); } if (action === "run-analysis") { (document.getElementById("overlay") as HTMLElement).className = "overlay"; runAnalysis(toast); } if (action === "reset") { resetRun(); clearAnalysis(); toast("Analysis reset", "Workspace returned to its initial state."); } }
  const sector = target.closest("[data-sector]") as HTMLElement; if (sector) update(() => { state.sector = sector.dataset.sector as any; state.selectedFinding = null; });
  const engine = target.closest("[data-engine]") as HTMLElement; if (engine) { document.querySelectorAll(".engine-node").forEach((n) => n.classList.remove("active")); engine.classList.add("active"); renderEngineDetail(Number(engine.dataset.engine)); }
  const finding = target.closest("[data-finding]") as HTMLElement; if (finding) openFinding(state.analysis.findings.find((f: any) => f.id === finding.dataset.finding));
  const review = target.closest("[data-review]") as HTMLElement; if (review) { reviewFinding(review.dataset.review as any, toast); window.setTimeout(() => { (document.getElementById("overlay") as HTMLElement).className = "overlay"; }, 180); }
  const principle = target.closest("[data-principle]") as HTMLElement; if (principle) update(() => { const title = principle.dataset.principle || ""; state.openPrinciples = state.openPrinciples.includes(title) ? state.openPrinciples.filter((p) => p !== title) : [...state.openPrinciples, title]; });
  const aboutWhy = target.closest("[data-about-why]") as HTMLElement; if (aboutWhy) { const key = (aboutWhy.dataset.aboutWhy || "complexity") as keyof typeof aboutWhyCopy; document.querySelectorAll(".about-why-card").forEach((button) => button.classList.toggle("active", button === aboutWhy)); const panel = document.getElementById("about-why-panel"); if (panel) { const item = aboutWhyCopy[key]; panel.innerHTML = `<strong>${item.label}</strong><p>${item.body}</p>`; } }
  const aboutPerspective = target.closest("[data-about-perspective]") as HTMLElement; if (aboutPerspective) { const key = (aboutPerspective.dataset.aboutPerspective || "can") as keyof typeof aboutPerspectiveCopy; document.querySelectorAll(".about-philosophy-card").forEach((button) => button.classList.toggle("active", button === aboutPerspective)); const panel = document.getElementById("about-perspective-panel"); if (panel) { const item = aboutPerspectiveCopy[key]; panel.innerHTML = `<strong>${item.label}</strong><p>${item.body}</p>`; } }
  const aboutPrinciple = target.closest("[data-about-principle]") as HTMLElement; if (aboutPrinciple) { const key = aboutPrinciple.dataset.aboutPrinciple || "Clarity"; document.querySelectorAll(".about-principle-card").forEach((button) => button.classList.toggle("active", button === aboutPrinciple)); const explain = document.getElementById("about-principle-copy"); if (explain) { explain.innerHTML = `<strong>${key}</strong><p>${aboutPrinciplesCopy[key as keyof typeof aboutPrinciplesCopy] || aboutPrinciplesCopy.Clarity}</p>`; } }
  const aboutPersona = target.closest("[data-about-persona]") as HTMLElement; if (aboutPersona) { const key = (aboutPersona.dataset.aboutPersona || "citizen") as keyof typeof aboutPersonasCopy; document.querySelectorAll(".about-persona-card").forEach((button) => button.classList.toggle("active", button === aboutPersona)); const detail = document.getElementById("about-persona-copy"); if (detail) { const item = aboutPersonasCopy[key]; detail.innerHTML = `<strong>${item.label}</strong><p>${item.body}</p>`; } }
  const aboutFuture = target.closest("[data-about-future]") as HTMLElement; if (aboutFuture) { const key = (aboutFuture.dataset.aboutFuture || "understand") as keyof typeof aboutFutureCopy; document.querySelectorAll(".about-future-card").forEach((button) => button.classList.toggle("active", button === aboutFuture)); const detail = document.getElementById("about-future-copy"); if (detail) { detail.innerHTML = `<strong>${key.toUpperCase()}</strong><p>${aboutFutureCopy[key]}</p>`; } }
  const metric = target.closest("[data-metric]") as HTMLElement; if (metric) toast(["Sector coverage", "Workflow inventory", "Accepted input types", "Review queue"][Number(metric.dataset.metric)], ["Six illustrative domains are available.", "Eighteen sample workflows are mapped.", "PDF, documents, CSV, and images are supported.", "Findings remain pending until a reviewer takes action."][Number(metric.dataset.metric)]);
  const resourceRow = target.closest("[data-resource]") as HTMLElement; if (resourceRow) openResource(resources[Number(resourceRow.dataset.resource)]);
  const resourceView = target.closest("[data-resource-view]") as HTMLElement; if (resourceView) { openResourceDetail(resourceView.dataset.resourceView || resourcePageState.selectedResourceId); }
  const resourceSave = target.closest("[data-resource-save]") as HTMLElement; if (resourceSave) { toggleSavedResource(resourceSave.dataset.resourceSave || ""); }
  const resourceRead = target.closest("[data-resource-read]") as HTMLElement; if (resourceRead) { toggleReadResource(resourceRead.dataset.resourceRead || ""); }
  const glossaryTerm = target.closest("[data-glossary-term]") as HTMLElement; if (glossaryTerm) { resourcePageState.selectedGlossary = glossaryTerm.dataset.glossaryTerm || ""; renderResourcePage(); }
  const resourceRemove = target.closest("[data-resource-remove]") as HTMLElement; if (resourceRemove) { resourcePageState.saved = resourcePageState.saved.filter((id: string) => id !== (resourceRemove.dataset.resourceRemove || "")); persistResourceState("nitiai-resource-saved", resourcePageState.saved); renderResourcePage(); }
  const clearFilters = target.closest("[data-resource-clear]") as HTMLElement; if (clearFilters) { resetResourceFilters(); }
  const topicFilter = target.closest("[data-resource-topic]") as HTMLElement; if (topicFilter) { resourcePageState.topic = topicFilter.dataset.resourceTopic || "All"; renderResourcePage(); }
  const relationshipNode = target.closest("[data-relationship-node]") as HTMLElement; if (relationshipNode) { resourcePageState.selectedRelationship = relationshipNode.dataset.relationshipNode || "AI Governance"; renderResourcePage(); }
  const checklistField = target.closest("[data-checklist-item]") as HTMLElement; if (checklistField) { toggleChecklistItem(Number(checklistField.dataset.checklistItem)); }
  const checklistReset = target.closest("[data-checklist-reset]") as HTMLElement; if (checklistReset) { resourcePageState.checklist = Array(8).fill(false); renderResourcePage(); }
  const glossaryLetter = target.closest("[data-glossary-letter]") as HTMLElement; if (glossaryLetter) { resourcePageState.glossaryLetter = glossaryLetter.dataset.glossaryLetter || "ALL"; renderResourcePage(); }
  const openLab = target.closest("[data-open-governance-lab]") as HTMLElement; if (openLab) { navigateTo("ai-in-police"); }
  const filter = target.closest("[data-resource-filter]") as HTMLElement; if (filter) update(() => { state.resourceFilter = filter.dataset.resourceFilter || "All"; });
  const health = target.closest("[data-health-period]") as HTMLElement; if (health) update(() => { state.healthPeriod = health.dataset.healthPeriod as any; });
  const mode = target.closest("[data-transport-mode]") as HTMLElement; if (mode) update(() => { state.transportMode = mode.dataset.transportMode as any; });
  const tmetric = target.closest("[data-transport-metric]") as HTMLElement; if (tmetric) update(() => { state.transportMetric = tmetric.dataset.transportMetric as any; });
  const road = target.closest("[data-road]") as HTMLElement; if (road) { selectedRoad = road.dataset.road || "A-17"; update(() => {}); toast("Road segment selected", `${selectedRoad} is ready for inspection.`); }
  const marker = target.closest("[data-env-marker]") as HTMLElement; if (marker) toast("Monitoring area selected", "Zone 03 shows a potential vegetation change; verification recommended.", "warning");
  const explain = target.closest("[data-explain]") as HTMLElement; if (explain) toast("Evidence step opened", ["Input metadata", "Extracted fields", "Pattern context", "Reasoning context", "Human verification path"][Number(explain.dataset.explain)]);
  const suggestion = target.closest("[data-suggestion]") as HTMLElement; if (suggestion) sendChat(suggestion.dataset.suggestion || "", updateDynamic);
  const check = target.closest("[data-check-item]") as HTMLElement; if (check) toast("Checklist item", "Construction checklist details are shown in the active workspace.");
  const sort = target.closest("[data-sort-csv]") as HTMLElement; if (sort) { const key = sort.dataset.sortCsv || ""; if (csvSortKey === key) csvSortAsc = !csvSortAsc; else { csvSortKey = key; csvSortAsc = true; } updateDynamic(); }
  const workflowStage = target.closest("[data-safety-stage]") as HTMLElement; if (workflowStage) { const index = Number(workflowStage.dataset.safetyStage); document.querySelectorAll(".safety-stage").forEach((node) => node.classList.toggle("active", node === workflowStage)); const detail = document.getElementById("safetyWorkflowDetail"); if (detail) detail.innerHTML = `<span>SELECTED STAGE / ${workflowStages[index][0]}</span><p>${workflowStages[index][1]}</p>`; }
  const scenarioNode = target.closest("[data-safety-node]") as HTMLElement; if (scenarioNode) { const index = Number(scenarioNode.dataset.safetyNode); document.querySelectorAll(".safety-node").forEach((node) => node.classList.toggle("active", node === scenarioNode)); const detail = document.getElementById("safetyScenarioInfo"); if (detail) detail.innerHTML = `<span>SCENARIO / ${scenarioNodes[index][0]}</span><h3>${scenarioNodes[index][0]}</h3><p>${scenarioNodes[index][1]}</p>`; }
  const safetyPrinciple = target.closest("[data-safety-principle]") as HTMLElement; if (safetyPrinciple) { const item = safetyPrinciple.closest(".safety-principle"); if (item) item.classList.toggle("open"); }
  const safetyChecklistItem = target.closest("[data-safety-check]") as HTMLElement; if (safetyChecklistItem) { const item = safetyChecklistItem.closest("button"); if (item) item.classList.toggle("open"); }
  const ecosystemNode = target.closest("[data-home-ecosystem]") as HTMLElement; if (ecosystemNode) { const index = Number(ecosystemNode.dataset.homeEcosystem); document.querySelectorAll(".home-network-node").forEach((node) => node.classList.toggle("active", node === ecosystemNode)); const detail = document.getElementById("homeEcosystemDetail"); if (detail) detail.innerHTML = `<span>SELECTED SYSTEM / ${ecosystem[index][0]}</span><h3>${ecosystem[index][0]}</h3><p>${ecosystem[index][1]}</p>`; }
  const landscapeItem = target.closest("[data-home-landscape]") as HTMLElement; if (landscapeItem) { document.querySelectorAll(".home-landscape-item").forEach((node) => node.classList.toggle("active", node === landscapeItem)); openHomeLandscape(Number(landscapeItem.dataset.homeLandscape)); }
  const landscapeImage = target.closest("[data-home-landscape-image]") as HTMLElement; if (landscapeImage) { event.stopPropagation(); openHomeLandscape(Number(landscapeImage.dataset.homeLandscapeImage)); }
  const processStep = target.closest("[data-home-process]") as HTMLElement; if (processStep) { const index = Number(processStep.dataset.homeProcess); document.querySelectorAll(".home-process-step").forEach((node) => node.classList.toggle("active", node === processStep)); const detail = document.getElementById("homeProcessDetail"); if (detail) detail.innerHTML = `<span>ACTIVE STAGE / ${process[index][0]}</span><p>${process[index][1]}</p>`; }
  const theme = target.closest("[data-home-theme]") as HTMLElement; if (theme) { document.querySelectorAll(".home-theme").forEach((node) => node.classList.toggle("active", node === theme)); document.getElementById("homeThemeField")?.setAttribute("data-active-theme", theme.dataset.homeTheme || "0"); }
  const homePrinciple = target.closest("[data-home-principle]") as HTMLElement; if (homePrinciple) { const item = homePrinciple.closest(".home-principle"); if (item) item.classList.toggle("open"); }
});
root.addEventListener("change", (event: Event) => { const target = event.target as HTMLInputElement | HTMLSelectElement; if (target.id === "fileInput" && (target as HTMLInputElement).files?.[0]) ingestFile((target as HTMLInputElement).files![0], toast); if (target.id === "csvFilter") { csvQuery = target.value === "all" ? csvQuery : `${csvQuery} ${target.value}`.trim(); updateDynamic(); } if (target.id === "compareRange") { environmentSplit = Number(target.value); const frame = document.querySelector(".after-frame") as HTMLElement; if (frame) frame.style.width = `${environmentSplit}%`; } if (target.id === "resource-category") { resourcePageState.category = target.value; renderResourcePage(); } if (target.id === "resource-sector") { resourcePageState.sector = target.value; renderResourcePage(); } if (target.id === "resource-topic") { resourcePageState.topic = target.value; renderResourcePage(); } if (target.id === "resource-type") { resourcePageState.type = target.value; renderResourcePage(); } });
root.addEventListener("input", (event: Event) => { const target = event.target as HTMLInputElement; if (target.id === "resourceQuery") update(() => { state.resourceQuery = target.value; }); if (target.id === "resources-search") { resourcePageState.search = target.value; renderResourcePage(); } if (target.id === "glossary-search") { resourcePageState.glossarySearch = target.value; renderResourcePage(); } if (target.id === "csvQuery") { csvQuery = target.value; const pos = target.selectionStart; renderSectorWorkspace(); const newInput = document.getElementById("csvQuery") as HTMLInputElement; newInput.focus(); if (pos !== null) newInput.setSelectionRange(pos,pos); } if (target.id === "compareRange") { environmentSplit = Number(target.value); const frame = document.querySelector(".after-frame") as HTMLElement; if (frame) frame.style.width = `${environmentSplit}%`; } });
root.addEventListener("dragover", (event: DragEvent) => { const zone = (event.target as HTMLElement).closest(".upload-zone"); if (zone) { event.preventDefault(); zone.classList.add("dragging"); } });
root.addEventListener("dragleave", (event: DragEvent) => { const zone = (event.target as HTMLElement).closest(".upload-zone"); if (zone) zone.classList.remove("dragging"); });
root.addEventListener("drop", (event: DragEvent) => { const zone = (event.target as HTMLElement).closest(".upload-zone"); if (zone && event.dataTransfer?.files?.[0]) { event.preventDefault(); ingestFile(event.dataTransfer.files[0], toast); } });
root.addEventListener("submit", (event: Event) => { const form = event.target as HTMLFormElement; if (form.id === "chatForm") { event.preventDefault(); const input = document.getElementById("chatInput") as HTMLInputElement; if (input?.value) { const message = input.value; input.value = ""; sendChat(message, updateDynamic); } } });

function openSearch() { const overlay = document.getElementById("overlay") as HTMLElement; overlay.className = "overlay open"; overlay.innerHTML = `<div class="search-modal"><div class="search-box">${icon("search")}<input id="globalSearch" class="search-input" placeholder="Search sectors, findings, resources, concepts…" autofocus/><span class="search-hint">ESC</span></div><div class="search-results" id="searchResults"></div></div>`; const input = document.getElementById("globalSearch") as HTMLInputElement; const updateResults = () => { const q = input.value.toLowerCase(); const items = [...Object.values(sectors).map((s: any) => ({ title: s.title, type: `AI Solution / ${s.label}`, target: "solutions" })), ...resources.map((r) => ({ title: r.title, type: `Resource / ${r.org}`, target: "resources" })), { title: "Human Oversight", type: "Governance concept / Policy & Ethics", target: "policy" }].filter((item) => `${item.title} ${item.type}`.toLowerCase().includes(q)); const el = document.getElementById("searchResults"); if (el) el.innerHTML = items.length ? items.map((item) => `<button class="search-result" data-search-target="${item.target}"><span><span class="search-result-title">${esc(item.title)}</span><span class="search-result-type">${esc(item.type)}</span></span>${icon("arrow")}</button>`).join("") : `<div class="search-empty">No matching surfaces. Try “agriculture”, “human oversight”, or “tax”.</div>`; }; input.addEventListener("input", updateResults); updateResults(); }
root.addEventListener("click", (event: Event) => { const target = event.target as HTMLElement; const searchTarget = target.closest("[data-search-target]") as HTMLElement; if (searchTarget) { (document.getElementById("overlay") as HTMLElement).className = "overlay"; navigateTo(searchTarget.dataset.searchTarget || "home"); } });
root.addEventListener("click", (event: Event) => { const link = (event.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement; if (!link) return; const targetId = link.getAttribute("href")?.slice(1) || "home"; if (sitePages.some((page) => page.id === targetId)) { event.preventDefault(); navigateTo(targetId); } });
window.addEventListener("popstate", () => showPage(pageForPath(window.location.pathname).id));
window.addEventListener("keydown", (event) => { if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement as HTMLElement)?.tagName || "")) { event.preventDefault(); openSearch(); } if (event.key === "Escape") { (document.getElementById("overlay") as HTMLElement).className = "overlay"; } });
window.addEventListener("scroll", () => { document.getElementById("topbar")?.classList.toggle("scrolled", window.scrollY > 12); });
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("active", (a as HTMLElement).dataset.nav === entry.target.id)); } }), { rootMargin: "-35% 0px -58% 0px" });
["home", "solutions", "policy", "resources", "about"].forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
document.querySelectorAll(".section").forEach((section) => section.classList.add("motion-reveal"));
const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); } }), { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".motion-reveal").forEach((section) => revealObserver.observe(section));
document.querySelectorAll(".home-section, .home-oversight, .home-principle, .home-explore-card").forEach((section) => { section.classList.add("home-reveal"); revealObserver.observe(section); });
const homeMedia = document.querySelector("[data-home-parallax]") as HTMLElement;
homeMedia?.addEventListener("pointermove", (event) => { const bounds = homeMedia.getBoundingClientRect(); const x = (event.clientX - bounds.left) / bounds.width - .5; const y = (event.clientY - bounds.top) / bounds.height - .5; homeMedia.style.setProperty("--parallax-x", `${x * 10}px`); homeMedia.style.setProperty("--parallax-y", `${y * 10}px`); });
homeMedia?.addEventListener("pointerleave", () => { homeMedia.style.setProperty("--parallax-x", "0px"); homeMedia.style.setProperty("--parallax-y", "0px"); });
document.querySelectorAll("[data-home-landscape-image]").forEach((image) => image.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); openHomeLandscape(Number((image as HTMLElement).dataset.homeLandscapeImage)); }));
subscribe(updateDynamic);
