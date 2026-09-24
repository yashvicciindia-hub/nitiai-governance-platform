import { state, update } from "./state";

export function assistantReply(message: string) {
  const text = message.toLowerCase();
  if (/(farm|agri|crop|field)/.test(text)) return "For agriculture workflows, NITIAI can organize image, report, and CSV inputs; surface illustrative indicators; and route observations to human verification. It should not substitute for agronomic assessment.";
  if (/(build|construction|permit|approval|plan)/.test(text)) return "Building-plan review can help structure documents, identify missing information, and prepare a traceable review queue. The platform does not issue legal approvals.";
  if (/(tax|revenue|transaction|amount|fraud)/.test(text)) return "Revenue intelligence can identify unusual records and category patterns for investigation. An anomaly is not proof of fraud; context and human review are required.";
  if (/(oversight|human|review|accountab)/.test(text)) return "Human oversight is the control that turns an AI signal into a responsible governance workflow: a reviewer can inspect evidence, request information, record a decision, and leave an audit event.";
  if (/(risk|privacy|fair|ethic|responsible)/.test(text)) return "Common governance risks include missing context, uneven impacts, privacy exposure, automation bias, and unclear accountability. Transparency, review mechanisms, and data protection should be designed in from the start.";
  if (/(nitiai|demonstrate|what is)/.test(text)) return "NITIAI demonstrates an illustrative frontend workflow from data input to validation, analysis, evidence, human review, and governance action across multiple sectors.";
  return "I can help you explore sector workflows, human oversight, explainability, data protection, and the limits of illustrative AI analysis. Try asking about agriculture, building approvals, tax administration, or responsible review.";
}

export function sendChat(message: string, onRender: () => void) {
  const clean = message.trim();
  if (!clean) return;
  update(() => { state.chatMessages.push({ role: "user", text: clean }); state.chatTyping = true; });
  onRender();
  window.setTimeout(() => update(() => { state.chatMessages.push({ role: "assistant", text: assistantReply(clean) }); state.chatTyping = false; onRender(); }), 650);
}
