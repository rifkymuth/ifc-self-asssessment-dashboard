import { INDICATORS } from "../data/indicators";

export const computePSScore = (responses, psNumber) => {
  const psIndicators = INDICATORS.filter((i) => i.ps === psNumber);
  const scored = psIndicators
    .map((i) => responses[i.id])
    .filter((r) => r && r.score !== undefined && r.score !== "NA" && r.score !== null);
  if (scored.length === 0) return { avg: 0, pct: 0, answered: 0, total: psIndicators.length, naCount: psIndicators.filter(i => responses[i.id]?.score === "NA").length };
  const sum = scored.reduce((a, r) => a + Number(r.score), 0);
  const avg = sum / scored.length;
  return {
    avg,
    pct: (avg / 4) * 100,
    answered: scored.length,
    total: psIndicators.length,
    naCount: psIndicators.filter(i => responses[i.id]?.score === "NA").length,
  };
};

export const computeOverall = (responses) => {
  const perPS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => computePSScore(responses, n));
  const scoredPS = perPS.filter((p) => p.answered > 0);
  if (scoredPS.length === 0) return { avg: 0, pct: 0, completion: 0 };
  const avgOfAvgs = scoredPS.reduce((a, p) => a + p.avg, 0) / scoredPS.length;
  const totalAnswered = perPS.reduce((a, p) => a + p.answered + p.naCount, 0);
  const totalItems = INDICATORS.length;
  return {
    avg: avgOfAvgs,
    pct: (avgOfAvgs / 4) * 100,
    completion: (totalAnswered / totalItems) * 100,
  };
};

export const getMaturityLabel = (avg) => {
  if (avg >= 3.5) return { label: "Advanced", color: "var(--ink)", cls: "text-ink" };
  if (avg >= 2.5) return { label: "Established", color: "var(--sage)", cls: "text-sage" };
  if (avg >= 1.5) return { label: "Developing", color: "var(--amber)", cls: "text-amber" };
  if (avg > 0) return { label: "Initial", color: "var(--crimson)", cls: "text-crimson" };
  return { label: "Not Started", color: "var(--mute)", cls: "text-mute" };
};

export const priorityGap = (response) => {
  if (!response || response.score === undefined || response.score === null || response.score === "NA") return null;
  const s = Number(response.score);
  if (s <= 1) return "High";
  if (s === 2) return "Medium";
  return null;
};

export const narrativeFor = (psScore) => {
  const { avg, answered } = psScore;
  if (answered === 0) {
    return {
      verdict: "Not yet assessed",
      narrative: "This Performance Standard has not been scored. Completing the assessment will yield findings and recommendations specific to this area.",
    };
  }
  if (avg >= 3.5) {
    return {
      verdict: "Strong alignment with the Performance Standard",
      narrative: "The client's management system demonstrates advanced maturity in this area. Practices are fully integrated into core business decisions, continuously monitored, and improved through formal review cycles. External verification and lender-ready documentation are attainable. Sustaining this position will require continued investment in training, internal audit, and senior-management oversight.",
    };
  }
  if (avg >= 2.5) {
    return {
      verdict: "Established practice with room for refinement",
      narrative: "The client has established systematic practices that meet most of the Performance Standard's requirements. Documentation, procedures, and responsibilities are defined and generally implemented. Remaining gaps relate to consistency of application, evidence of outcomes, and depth of stakeholder engagement. A focused improvement plan over 6–12 months would move the client toward Advanced maturity.",
    };
  }
  if (avg >= 1.5) {
    return {
      verdict: "Developing — significant gaps remain",
      narrative: "The client has initiated relevant practices but implementation is inconsistent and documentation is partial. Several requirements are addressed informally or at individual-project level rather than systematically. Prior to any IFC- or Equator-Principles-aligned financing, a structured corrective action plan with clearly assigned responsibilities, timelines, and budget is required.",
    };
  }
  if (avg > 0) {
    return {
      verdict: "Initial stage — material risk exposure",
      narrative: "Current practice is informal, fragmented, or ad-hoc. The absence of documented systems creates material E&S and reputational risk, particularly where project impacts are significant. Immediate attention is required — including policy adoption, role assignment, and baseline studies — before project expansion or external financing is pursued.",
    };
  }
  return {
    verdict: "Not started — foundational action required",
    narrative: "No evidence of implementation has been identified. The client should treat this Performance Standard as a first-order priority, beginning with policy commitment, stakeholder identification, and external expert engagement.",
  };
};
