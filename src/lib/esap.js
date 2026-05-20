import { ESAP_LIBRARY } from "../data/esapLibrary";
import { SCORE_LEVELS } from "../data/scoreLevels";

export const generateActionText = (indicator) => {
  const lib = ESAP_LIBRARY[indicator.id];
  if (lib?.action) return lib.action;
  const t = indicator.text;
  if (/^(Policy|Procedure|Plan|System|Mechanism|Framework|Process)/i.test(t)) {
    return `Establish and formalize: ${t}`;
  }
  if (/is documented|documented and|in place|established/i.test(t)) {
    return `Develop and implement: ${t.replace(/\.$/, "")}`;
  }
  if (/^(Training|Capacity)/i.test(t)) {
    return `Conduct and document: ${t.replace(/\.$/, "")}`;
  }
  if (/assessment|monitoring|review/i.test(t)) {
    return `Implement and operationalize: ${t.replace(/\.$/, "")}`;
  }
  return `Address gap: ${t}`;
};

export const generateCompletionIndicators = (indicator) => {
  const lib = ESAP_LIBRARY[indicator.id];
  if (lib?.completionIndicators) return lib.completionIndicators;
  const t = indicator.text.toLowerCase();
  if (t.includes("policy")) return "Signed policy document; Board/senior management approval memo; internal communication record";
  if (t.includes("procedure")) return "Documented procedure; training attendance record; implementation log (min. 3 months)";
  if (t.includes("training")) return "Training curriculum; attendance records; pre/post assessment results";
  if (t.includes("plan")) return "Approved plan document; implementation schedule; quarterly progress report";
  if (t.includes("grievance")) return "Grievance mechanism SOP; case log; stakeholder awareness materials; response time records";
  if (t.includes("monitoring") || t.includes("monitor")) return "Monitoring protocol; baseline data; periodic monitoring reports (min. 2 cycles)";
  if (t.includes("consultation") || t.includes("engagement")) return "Engagement plan; meeting minutes; attendance sheets; feedback register";
  if (t.includes("assessment")) return "Assessment report; methodology description; expert qualifications; management response";
  if (t.includes("compensation")) return "Entitlement matrix; compensation records; receipt acknowledgments; third-party verification";
  if (t.includes("register") || t.includes("log")) return "Functional register (accessible & maintained); sample entries; quarterly review record";
  return "Documented evidence of implementation; internal verification memo; photo/site evidence where applicable";
};

export const generateSuggestedResources = (indicator) => ESAP_LIBRARY[indicator.id]?.suggestedResources || "";
export const generateSuggestedPIC = (indicator) => ESAP_LIBRARY[indicator.id]?.suggestedPIC || "";

export const recommendTimeline = (priority) => {
  if (priority === "High") return "3 months";
  if (priority === "Medium") return "6 months";
  return "12 months";
};

export const calcTargetDate = (monthsAhead) => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d.toISOString().slice(0, 10);
};

export const buildESAPItemFromGap = (indicator, response) => {
  let priority = "Low";
  if (response && typeof response.score === "number") {
    if (response.score <= 1) priority = "High";
    else if (response.score === 2) priority = "Medium";
    else if (response.score === 3) priority = "Low";
  }
  const monthsAhead = priority === "High" ? 3 : priority === "Medium" ? 6 : 12;
  const fromLibrary = !!ESAP_LIBRARY[indicator.id];
  return {
    id: `esap-${indicator.id}-${Date.now()}`,
    indicatorId: indicator.id,
    component: `PS ${indicator.ps} · ${indicator.section} (${indicator.ref})`,
    action: generateActionText(indicator),
    priority,
    targetDate: calcTargetDate(monthsAhead),
    completionIndicators: generateCompletionIndicators(indicator),
    pic: generateSuggestedPIC(indicator),
    resources: generateSuggestedResources(indicator),
    status: "Not Started",
    progressPct: 0,
    lastUpdate: "",
    notes: response?.notes ? `From assessment: ${response.notes}` : "",
    source: fromLibrary ? "library" : "heuristic",
  };
};

export const buildAIPrompt = (item, indicator, meta) => {
  const cp = meta?.companyProfile || {};
  const scoreLevel = SCORE_LEVELS.find((l) => l.value === item.priority);
  void scoreLevel;
  const lines = [];
  lines.push("You are an Environmental & Social (E&S) consultant tailoring an Environmental & Social Action Plan (ESAP) item for a specific client. The client is undergoing a self-assessment against the IFC Performance Standards 2012. Refine the action below so it is concrete, measurable, sequenced, sector-appropriate, and proportionate to the client's capacity. Cite the relevant IFC PS paragraph where useful. Avoid generic templated language.");
  lines.push("");
  lines.push("=== COMPANY PROFILE ===");
  lines.push(`Project Name: ${meta?.projectName || "—"}`);
  lines.push(`Client / Company: ${meta?.clientName || "—"}`);
  lines.push(`Sector / Sub-sector: ${meta?.sector || "—"}`);
  lines.push(`Site / Location: ${meta?.location || "—"}`);
  lines.push(`Country: ${cp.country || "—"}`);
  lines.push(`Employee Count: ${cp.employeeCount || "—"}`);
  lines.push(`Current ESMS Maturity: ${cp.esmsMaturity || "—"}`);
  lines.push(`Implementation Budget Tier: ${cp.budgetTier || "—"}`);
  lines.push(`Existing Certifications: ${cp.certifications || "—"}`);
  lines.push(`Operating Context: ${cp.operatingContext || "—"}`);
  lines.push("");
  lines.push("=== INDICATOR (IFC PS 2012) ===");
  if (indicator) {
    lines.push(`Indicator ID: ${indicator.id}`);
    lines.push(`Performance Standard: PS ${indicator.ps}`);
    lines.push(`Section: ${indicator.section}`);
    lines.push(`PS Reference: ${indicator.ref}`);
    lines.push(`Requirement: ${indicator.text}`);
    if (indicator.guidance) lines.push(`Guidance: ${indicator.guidance}`);
  } else {
    lines.push("(Manual item — no underlying IFC indicator.)");
  }
  lines.push("");
  lines.push("=== CURRENT ASSESSMENT ===");
  lines.push(`Priority: ${item.priority}`);
  if (item.priority === "High") lines.push("Score interpretation: 0–1 (Not Started / Initial) — significant gap, urgent action required.");
  else if (item.priority === "Medium") lines.push("Score interpretation: 2 (Developing) — partial implementation, gaps remain.");
  else lines.push("Score interpretation: 3 (Established) — meets most criteria, room for improvement.");
  lines.push("");
  lines.push("=== CURRENT ESAP DRAFT ===");
  lines.push(`Action: ${item.action || "(empty)"}`);
  lines.push(`Completion Indicators: ${item.completionIndicators || "(empty)"}`);
  lines.push(`Person in Charge (PIC): ${item.pic || "(empty)"}`);
  lines.push(`Resources: ${item.resources || "(empty)"}`);
  lines.push(`Target Date: ${item.targetDate || "(empty)"}`);
  lines.push(`Notes: ${item.notes || "(empty)"}`);
  lines.push("");
  lines.push("=== INSTRUCTIONS ===");
  lines.push("Reply with EXACTLY ONE JSON object — no prose before or after, no Markdown fence required but acceptable — with these string keys:");
  lines.push('  "action"               — concrete, sequenced action tailored to the company profile and sector. Name specific artifacts, governance steps, and the verification gate.');
  lines.push('  "completionIndicators" — semi-colon-separated list of evidence items proportionate to the action.');
  lines.push('  "resources"            — realistic estimate of internal effort, external expertise, and budget tier. Reflect the company\'s budget/capacity.');
  lines.push('  "pic"                  — role title (and seniority level) most appropriate for this client\'s structure.');
  lines.push('  "notes"                — risks, dependencies, sequencing notes, or context that the assessor should be aware of. Cite IFC PS paragraph references where relevant.');
  lines.push("");
  lines.push("Keep each field self-contained. Be specific and actionable. Do not restate the indicator text verbatim.");
  return lines.join("\n");
};

export const parseAIResponse = (raw) => {
  if (!raw || typeof raw !== "string") return { ok: false, error: "Empty response." };
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();
  if (!text.startsWith("{")) {
    const braceStart = text.indexOf("{");
    const braceEnd = text.lastIndexOf("}");
    if (braceStart >= 0 && braceEnd > braceStart) {
      text = text.slice(braceStart, braceEnd + 1);
    }
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, error: `Could not parse JSON: ${err.message}` };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "Response must be a JSON object." };
  }
  const required = ["action", "completionIndicators", "resources", "pic", "notes"];
  const fields = {};
  for (const key of required) {
    if (!(key in parsed)) return { ok: false, error: `Missing required field: "${key}".` };
    if (typeof parsed[key] !== "string") return { ok: false, error: `Field "${key}" must be a string.` };
    fields[key] = parsed[key].trim();
  }
  if (!fields.action) return { ok: false, error: 'Field "action" must not be empty.' };
  return { ok: true, fields };
};

export const priorityStyles = {
  High:   { bg: "#F4DCCD", fg: "var(--crimson)", border: "var(--crimson)" },
  Medium: { bg: "#F5E6CB", fg: "var(--amber)",   border: "var(--amber)" },
  Low:    { bg: "#E6EBDB", fg: "var(--sage)",    border: "var(--sage)" },
};

export const statusStyles = {
  "Not Started":  { bg: "#E8E2D3", fg: "var(--mute)",    border: "var(--mute-2)" },
  "In Progress":  { bg: "#F5E6CB", fg: "var(--amber)",   border: "var(--amber)" },
  "Completed":    { bg: "#E6EBDB", fg: "var(--sage)",    border: "var(--sage)" },
  "Overdue":      { bg: "#F4DCCD", fg: "var(--crimson)", border: "var(--crimson)" },
  "Deferred":     { bg: "#E5E0D3", fg: "var(--mute)",    border: "var(--mute-2)" },
};

export const isOverdue = (item) => {
  if (!item.targetDate || item.status === "Completed" || item.status === "Deferred") return false;
  return new Date(item.targetDate) < new Date();
};

export const esapThStyle = (width) => ({
  padding: "10px 8px",
  textAlign: "left",
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--gold-soft)",
  width: `${width}px`,
  verticalAlign: "top",
  borderBottom: "2px solid var(--gold)",
});
