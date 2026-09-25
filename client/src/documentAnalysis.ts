import * as mammoth from "mammoth/mammoth.browser";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const workerUrl = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export type DocumentAnalysis = {
  fileName: string;
  fileType: string;
  pageCount: number | null;
  wordCount: number;
  language: string;
  text: string;
  sections: string[];
  keyTerms: string[];
  dates: string[];
  entities: string[];
  requirements: string[];
  risks: string[];
  actionItems: string[];
  signals: { label: string; score: number }[];
  evidence: { label: string; status: string; detail: string }[];
  status: "complete" | "unsupported" | "error";
  message?: string;
};

const stopWords = new Set("about after again against also among because before being between could does during each from further have into more most other over should than that their there these they this through under until using were which with would your document report information section policy public service data ai and the for are was has its not can may must shall required requirements".split(" "));
const signalTerms: Record<string, string[]> = {
  POLICY: ["policy", "guideline", "framework", "regulation", "standard"],
  COMPLIANCE: ["compliance", "compliant", "mandatory", "required", "shall", "prohibited"],
  "PUBLIC SERVICE": ["service", "citizen", "resident", "public", "access", "eligibility"],
  ACCOUNTABILITY: ["accountability", "oversight", "audit", "review", "responsible"],
  DATA: ["data", "record", "information", "privacy", "dataset", "personal"],
  IMPLEMENTATION: ["implement", "deploy", "operation", "process", "procedure"],
  ELIGIBILITY: ["eligible", "eligibility", "qualify", "application", "applicant"],
  RISK: ["risk", "violation", "penalty", "limitation", "exception", "delay"],
  DEADLINE: ["deadline", "due", "before", "期限", "by "] ,
  STAKEHOLDERS: ["organization", "department", "authority", "staff", "community", "stakeholder"],
};

function fileType(file: File) {
  const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
  return extension === "DOCX" ? "DOCX" : extension;
}

function words(text: string) { return text.match(/[A-Za-z][A-Za-z'-]{2,}/g) || []; }
function sentences(text: string) { return text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 24); }
function unique(values: string[]) { return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))); }
function detectLanguage(text: string) { const sample = text.toLowerCase(); const english = [" the ", " and ", " of ", " to ", " for "].filter((term) => sample.includes(term)).length; return english >= 2 ? "English (indicative)" : "Not determined"; }
function extractSections(text: string) { return unique(text.split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 3 && line.length < 90 && (/^\d+[.)]\s/.test(line) || /^[A-Z][A-Z\s&/-]{5,}$/.test(line))).slice(0, 12)); }
function extractEntities(text: string) { return unique((text.match(/\b(?:[A-Z][A-Za-z&.-]+\s+){1,4}(?:Authority|Department|Ministry|Agency|Council|University|Hospital|Office|Organization|Institute|Commission)\b/g) || []).slice(0, 12)); }
function analyzeText(file: File, text: string, pageCount: number | null): DocumentAnalysis {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const tokenList = words(cleanText);
  const frequency = new Map<string, number>();
  tokenList.forEach((token) => { const normalized = token.toLowerCase(); if (!stopWords.has(normalized)) frequency.set(normalized, (frequency.get(normalized) || 0) + 1); });
  const keyTerms = Array.from(frequency.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([term]) => term.toUpperCase());
  const allSentences = sentences(cleanText);
  const requirements = allSentences.filter((sentence) => /\b(must|shall|required|mandatory|should|eligible|prohibited|deadline)\b/i.test(sentence)).slice(0, 8);
  const risks = allSentences.filter((sentence) => /\b(risk|compliance|violation|penalty|delay|limitation|missing|requirement|exception)\b/i.test(sentence)).slice(0, 8);
  const actionItems = allSentences.filter((sentence) => /\b(must|shall|required|should|implement|submit|review|ensure|maintain|provide|complete)\b/i.test(sentence)).slice(0, 8);
  const dates = unique((cleanText.match(/\b(?:\d{1,2}[/-])?\d{1,2}[/-]\d{2,4}\b|\b(?:19|20)\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi) || []).slice(0, 10));
  const signals = Object.entries(signalTerms).map(([label, terms]) => ({ label, score: Math.min(100, Math.round((terms.reduce((sum, term) => sum + (cleanText.toLowerCase().split(term.toLowerCase()).length - 1), 0) / Math.max(1, tokenList.length)) * 700)) })).sort((a, b) => b.score - a.score);
  const sections = extractSections(text);
  return { fileName: file.name, fileType: fileType(file), pageCount, wordCount: tokenList.length, language: detectLanguage(cleanText), text: cleanText, sections, keyTerms, dates, entities: extractEntities(text), requirements, risks, actionItems, signals, evidence: [{ label: "DOCUMENT", status: "IDENTIFIED", detail: file.name }, { label: "EXTRACTED TEXT", status: "EXTRACTED", detail: `${tokenList.length} words` }, { label: "DETECTED SECTIONS", status: sections.length ? "DETECTED" : "REVIEW", detail: sections.length ? `${sections.length} section headings` : "No clear headings found" }, { label: "KEY REQUIREMENTS", status: requirements.length ? "DETECTED" : "REVIEW", detail: requirements.length ? `${requirements.length} requirement statements` : "No requirement language found" }, { label: "GOVERNANCE SIGNALS", status: "DETECTED", detail: `${signals.filter((signal) => signal.score > 0).length} themes matched` }, { label: "HUMAN REVIEW", status: "REVIEW", detail: "Interpretation remains required" }], status: "complete" };
}

async function extractPdf(file: File) {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let index = 1; index <= pdf.numPages; index += 1) { const page = await pdf.getPage(index); const content = await page.getTextContent(); pages.push(content.items.map((item: any) => "str" in item ? item.str : "").join(" ")); }
  return { text: pages.join("\n"), pageCount: pdf.numPages };
}

export async function analyzeDocument(file: File): Promise<DocumentAnalysis> {
  const type = fileType(file);
  try {
    if (type === "DOC") return { fileName: file.name, fileType: type, pageCount: null, wordCount: 0, language: "Not determined", text: "", sections: [], keyTerms: [], dates: [], entities: [], requirements: [], risks: [], actionItems: [], signals: [], evidence: [], status: "unsupported", message: "This document format requires conversion to DOCX or PDF for browser analysis." };
    if (type === "JPG" || type === "JPEG" || type === "PNG") return { fileName: file.name, fileType: type, pageCount: null, wordCount: 0, language: "Not determined", text: "", sections: [], keyTerms: [], dates: [], entities: [], requirements: [], risks: [], actionItems: [], signals: [], evidence: [{ label: "DOCUMENT", status: "IDENTIFIED", detail: file.name }, { label: "IMAGE CONTENT", status: "REVIEW", detail: "Image preview available; OCR is not enabled." }, { label: "HUMAN REVIEW", status: "REVIEW", detail: "Visual interpretation remains required" }], status: "unsupported", message: "Image preview is available, but text extraction requires OCR support." };
    if (type === "PDF") { const result = await extractPdf(file); if (!result.text.trim()) throw new Error("Unable to extract readable text from this PDF."); return analyzeText(file, result.text, result.pageCount); }
    if (type === "DOCX") { const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() }); if (!result.value.trim()) throw new Error("No readable text was found in this DOCX document."); return analyzeText(file, result.value, null); }
    const text = await file.text(); if (!text.trim()) throw new Error("No readable text was found in this document."); return analyzeText(file, text, null);
  } catch (error) { return { fileName: file.name, fileType: type, pageCount: null, wordCount: 0, language: "Not determined", text: "", sections: [], keyTerms: [], dates: [], entities: [], requirements: [], risks: [], actionItems: [], signals: [], evidence: [], status: "error", message: error instanceof Error ? error.message : "The document could not be processed in the browser." }; }
}
