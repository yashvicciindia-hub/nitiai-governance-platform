export const workflowStages = [
  ["SIGNAL", "An event, report, request, or operational input enters the workflow."],
  ["INFORMATION", "Reports, documents, and relevant context are organized for review."],
  ["AI ANALYSIS", "AI can help structure information, identify patterns, and surface relevant material."],
  ["HUMAN REVIEW", "Qualified professionals verify context, limitations, and appropriate interpretation."],
  ["ACTION", "Professionals determine the next step within their role and applicable process."],
  ["ACCOUNTABILITY", "Actions remain documented, reviewable, and subject to oversight."],
] as const;

const principles = [
  ["HUMAN OVERSIGHT", "AI outputs should support professional review rather than independently determine consequential actions."],
  ["PRIVACY", "Sensitive personal information requires appropriate safeguards and lawful handling."],
  ["LEGAL COMPLIANCE", "Use should be considered against applicable rules, policies, permissions, and due process."],
  ["TRANSPARENCY", "The use and limitations of AI-supported systems should be understandable to relevant stakeholders."],
  ["AUDITABILITY", "Inputs, outputs, review steps, and changes should remain traceable for appropriate review."],
  ["DATA SECURITY", "Public-safety information should be protected through proportionate access and security controls."],
] as const;

const applicationAreas = [
  ["01", "EMERGENCY RESPONSE", "AI-supported information organization and prioritization during time-sensitive situations.", "nitiai-governance-network_65a40b9c.jpg"],
  ["02", "DOCUMENT & CASE INFORMATION", "Assistance with organizing, searching, and summarizing large collections of documents.", "nitiai-civic-archive_8c931d4f.jpg"],
  ["03", "INVESTIGATION SUPPORT", "Information analysis that can help professionals identify relevant connections and patterns for further review.", "nitiai-governance-network_65a40b9c.jpg"],
  ["04", "PUBLIC SAFETY ANALYTICS", "Analysis of operational information to support planning, resource allocation, and service improvement.", "nitiai-agriculture-monitoring_a8fd2948.jpg"],
  ["05", "CITIZEN SERVICES", "AI-assisted information access and communication for public-facing services.", "nitiai-civic-archive_8c931d4f.jpg"],
  ["06", "ADMINISTRATIVE WORKFLOWS", "Reducing repetitive information-processing tasks so professionals can focus on higher-value work.", "nitiai-governance-network_65a40b9c.jpg"],
] as const;

export const scenarioNodes = [
  ["INCIDENT", "An event generates multiple information inputs."],
  ["DATA", "Reports, documents, and operational information are collected."],
  ["CONTEXT", "Relevant history, constraints, and surrounding conditions are considered."],
  ["AI SUPPORT", "AI helps organize and surface relevant information for review."],
  ["HUMAN REVIEW", "Professionals verify information and determine appropriate action."],
] as const;

const landscape = ["EMERGENCY RESPONSE", "POLICING", "DISASTER MANAGEMENT", "CITIZEN SERVICES", "TRAFFIC & MOBILITY", "PUBLIC INFRASTRUCTURE"];
const checklist = ["Purpose clearly defined", "Human oversight established", "Data safeguards considered", "Performance evaluated", "Bias and error risks assessed", "Audit mechanisms established", "Applicable rules considered"];

export const policeSafetyPage = { id: "ai-in-police", path: "/ai-in-police", label: "AI in Police" } as const;

export function publicSafetyMarkup() {
  const editorialImages = [
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80",
  ];
  return `<section class="safety-page" id="ai-in-police">
    <div class="safety-hero">
      <div class="container safety-hero-grid">
        <div class="safety-hero-copy"><div class="safety-kicker">NITIAI / PUBLIC SAFETY</div><h1>AI in Police<br/><span>&amp; Public Safety</span></h1><p>Exploring how artificial intelligence can support public-safety systems, information management, and operational decision-making while keeping people, accountability, and safeguards at the center.</p><div class="safety-scroll"><i></i> SCROLL TO EXPLORE</div></div>
        <div class="safety-hero-image"><img src="${editorialImages[0]}" alt="Public-safety professionals coordinating information"/><div class="safety-image-wash"></div><div class="safety-image-meta"><span>PUBLIC SAFETY</span><span>AI / HUMAN REVIEW</span><span>NITIAI</span></div></div>
      </div>
    </div>
    <section class="safety-section safety-intro"><div class="container"><div class="safety-section-label">01 / PUBLIC SAFETY + AI</div><div class="safety-intro-grid"><h2>Supporting public safety<br/><em>through better information.</em></h2><div class="safety-intro-copy"><p class="safety-lead">Public-safety organizations work with large volumes of information, time-sensitive events, and complex operational processes.</p><span class="safety-rule"></span><p>AI can assist with organizing information, summarizing documents, identifying patterns, supporting information retrieval, and helping professionals access relevant information faster.</p></div></div></div></section>
    <section class="safety-section"><div class="container"><div class="safety-section-label">02 / OPERATIONAL WORKFLOW</div><div class="safety-heading-row"><h2>From signal to<br/><em>human decision.</em></h2><p>Each stage keeps the boundary between information support and accountable action visible.</p></div><div class="safety-workflow" id="safetyWorkflow">${workflowStages.map(([title, copy], index) => `<button class="safety-stage ${index === 0 ? "active" : ""}" data-safety-stage="${index}"><span class="safety-stage-num">0${index + 1}</span><strong>${title}</strong><i>→</i></button>`).join("")}</div><div class="safety-detail" id="safetyWorkflowDetail"><span>SELECTED STAGE / SIGNAL</span><p>${workflowStages[0][1]}</p></div></div></section>
    <section class="safety-section safety-applications"><div class="container"><div class="safety-section-label">03 / APPLICATION AREAS</div><div class="safety-heading-row"><h2>Where AI can support<br/><em>public-safety systems.</em></h2><p>Illustrative areas where better information access can reduce repetitive work and strengthen professional review.</p></div><div class="safety-area-grid">${applicationAreas.map(([number, title, copy], index) => `<article class="safety-area"><div class="safety-area-image"><img src="${editorialImages[index]}" alt="${title.toLowerCase()} editorial view" loading="lazy"/></div><div class="safety-area-body"><span>${number}</span><h3>${title}</h3><p>${copy}</p><i>↗</i></div></article>`).join("")}</div></div></section>
    <section class="safety-section safety-scenario"><div class="container"><div class="safety-section-label">04 / RESPONSE SCENARIO</div><div class="safety-heading-row"><h2>Information moves.<br/><em>People decide.</em></h2><p>A conceptual view of how information can move through a human-in-the-loop public-safety workflow.</p></div><div class="safety-scenario-panel"><div class="safety-scenario-image"><img src="${editorialImages[4]}" alt="Operations team reviewing public-safety information" loading="lazy"/><div class="safety-scenario-nodes">${scenarioNodes.map(([title], index) => `<button class="safety-node ${index === 0 ? "active" : ""}" data-safety-node="${index}"><i></i>${title}</button>`).join("")}</div></div><aside class="safety-scenario-info" id="safetyScenarioInfo"><span>SCENARIO / INCIDENT</span><h3>${scenarioNodes[0][0]}</h3><p>${scenarioNodes[0][1]}</p></aside></div></div></section>
    <section class="safety-section safety-principles"><div class="container"><div class="safety-section-label">05 / RESPONSIBLE DEPLOYMENT</div><div class="safety-intro-grid"><h2>Public safety requires<br/><em>strong safeguards.</em></h2><div class="safety-principles-list">${principles.map(([title, copy], index) => `<article class="safety-principle ${index === 0 ? "open" : ""}"><button data-safety-principle="${index}"><span>${title}</span><i>+</i></button><p>${copy}</p></article>`).join("")}</div></div></div></section>
    <section class="safety-decision"><div class="container"><div class="safety-section-label">AI + HUMAN DECISION MAKING</div><h2>AI can process information.<br/><span>People remain responsible for decisions.</span></h2><div class="safety-sequence">${["DATA", "AI ASSISTANCE", "HUMAN VERIFICATION", "PROFESSIONAL JUDGMENT", "ACCOUNTABLE ACTION"].map((item, index) => `<div class="safety-sequence-step ${index === 0 ? "active" : ""}"><b>${item}</b><i>${index < 4 ? "↓" : ""}</i></div>`).join("")}</div></div></section>
    <section class="safety-section"><div class="container"><div class="safety-section-label">06 / PUBLIC SAFETY LANDSCAPE</div><div class="safety-heading-row"><h2>A connected<br/><em>public-safety ecosystem.</em></h2><p>Public safety depends on systems, services, infrastructure, and people working together.</p></div><div class="safety-landscape">${landscape.map((item, index) => `<button class="safety-landscape-item"><img src="${editorialImages[index]}" alt="${item.toLowerCase()}" loading="lazy"/><span>${item}</span><i>↗</i></button>`).join("")}</div></div></section>
    <section class="safety-section safety-data"><div class="container safety-data-grid"><div><div class="safety-section-label">ILLUSTRATIVE WORKFLOW VIEW</div><h2>Making the workflow<br/><em>visible and reviewable.</em></h2><p>Conceptual stages are shown for interface exploration only. They are not police statistics or operational performance claims.</p></div><div class="safety-bars">${["INFORMATION INTAKE", "DOCUMENT REVIEW", "ANALYSIS", "HUMAN VERIFICATION", "ACTION", "REVIEW"].map((item, index) => `<div class="safety-bar-row"><span>${item}</span><i><b style="--bar-width:${[88, 72, 61, 84, 46, 68][index]}%"></b></i></div>`).join("")}</div></div></section>
    <section class="safety-section safety-checkpoint"><div class="container"><div class="safety-section-label">BEFORE DEPLOYMENT</div><div class="safety-check-grid"><div><h2>A responsible use<br/><em>checkpoint.</em></h2><p>Before an AI-supported workflow is introduced, teams should be able to explain its purpose, limits, and review path.</p></div><div class="safety-checklist">${checklist.map((item, index) => `<button data-safety-check="${index}"><i>0${index + 1}</i><span>${item}</span><b>+</b><small>Consider how this requirement is documented and reviewed.</small></button>`).join("")}</div></div></div></section>
    <section class="safety-closing"><div class="container"><div class="safety-section-label">NITIAI / AI IN PUBLIC SAFETY</div><h2>Technology can support<br/>public safety.<br/><span>Accountability keeps it responsible.</span></h2><p>Explore how AI can assist public-safety systems while keeping human judgment, safeguards, and institutional accountability at the center.</p><div><a class="btn btn-secondary" href="/">Explore Government AI →</a><a class="btn btn-primary" href="/">Explore Responsible AI →</a></div></div></section>
  </section>`;
}
