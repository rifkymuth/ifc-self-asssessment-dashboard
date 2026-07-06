import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { PS_META } from "../data/psMeta";
import { INDICATORS } from "../data/indicators";
import { computePSScore, computeOverall, getMaturityLabel, priorityGap } from "../lib/scoring";
import MastheadRule from "../components/MastheadRule";
import RichText from "../components/RichText";
import { isEmptyHtml } from "../lib/richText";

export default function ReportPage({ responses, meta }) {
  const overall = computeOverall(responses);
  const perPS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    n,
    meta: PS_META[n],
    score: computePSScore(responses, n),
  }));

  const topGaps = useMemo(() => {
    return INDICATORS
      .map((ind) => ({ ind, resp: responses[ind.id], priority: priorityGap(responses[ind.id]) }))
      .filter((x) => x.priority === "High")
      .slice(0, 12);
  }, [responses]);

  const strengths = useMemo(() => {
    return INDICATORS
      .map((ind) => ({ ind, resp: responses[ind.id] }))
      .filter((x) => x.resp?.score === 4)
      .slice(0, 8);
  }, [responses]);

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 bg-paper" style={{ minHeight: "100vh" }}>
      <div className="no-print mb-6 flex justify-between items-center p-4 border border-rule" style={{ background: "rgba(184,145,81,0.06)" }}>
        <div className="font-body text-ink" style={{ fontSize: 12 }}>
          <strong>Print-ready report.</strong> Use your browser's Print → Save as PDF to export.
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          Print / Save PDF
        </button>
      </div>

      <div className="print-page text-center py-12">
        <div className="small-caps text-mute mb-3" style={{ fontSize: 10 }}>
          A+CSR Indonesia · Sustainability & Social Impact Advisory
        </div>
        <MastheadRule />
        <div className="small-caps text-gold my-4" style={{ fontSize: 11, letterSpacing: "0.24em" }}>
          Self-Assessment Compliance Report
        </div>
        <h1 className="font-display text-ink" style={{ fontSize: 38, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.1 }}>
          IFC Performance Standards
          <br />on Environmental & Social Sustainability
        </h1>
        <div className="font-display italic text-ink-soft mt-3" style={{ fontSize: 16, fontWeight: 300 }}>
          Effective January 1, 2012
        </div>
        <MastheadRule />
        <div className="mt-16 space-y-2">
          <div className="font-display text-ink" style={{ fontSize: 22, fontWeight: 500 }}>
            {meta.projectName || "—"}
          </div>
          <div className="font-body text-mute" style={{ fontSize: 14 }}>
            Prepared for <span className="text-ink">{meta.clientName || "—"}</span>
          </div>
          <div className="font-body text-mute italic" style={{ fontSize: 12 }}>
            Assessor: {meta.assessorName || "—"} · Date: {meta.assessmentDate || "—"}
          </div>
        </div>
        <div className="mt-20 serial-number" style={{ fontSize: 10 }}>
          A+CSR Indonesia (PT Caraka Swara Raharja Indonesia) · Jakarta · Bogor
          <br />sustainabilityindonesia.com
        </div>
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 1</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
          Executive Summary
        </h2>
        <div className="mt-4 space-y-4 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            This report presents the outcome of a structured self-assessment of{" "}
            <strong>{meta.projectName || "the project"}</strong>'s alignment with the International
            Finance Corporation (IFC) Performance Standards on Environmental and Social Sustainability
            (effective January 1, 2012), covering all eight Performance Standards across{" "}
            <strong>{INDICATORS.length} indicators</strong>.
          </p>
          <p>
            The overall maturity index is <strong>{overall.avg.toFixed(2)} out of 4.00</strong>,
            placing the project at the <strong>{getMaturityLabel(overall.avg).label}</strong> level.
            Assessment completion stands at <strong>{overall.completion.toFixed(0)}%</strong>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div>
            <div className="small-caps text-gold" style={{ fontSize: 10 }}>Maturity Profile</div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <RadarChart data={perPS.map(p => ({ ps: p.meta.abbr, score: p.score.avg, fullMark: 4 }))}>
                  <PolarGrid stroke="rgba(13,27,42,0.2)" />
                  <PolarAngleAxis dataKey="ps" tick={{ fill: "var(--ink)", fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 9 }} />
                  <Radar dataKey="score" stroke="var(--ink)" fill="var(--gold)" fillOpacity={0.4} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="small-caps text-gold" style={{ fontSize: 10 }}>Scores by Standard</div>
            <table className="w-full mt-2 font-body" style={{ fontSize: 11 }}>
              <thead>
                <tr className="hairline">
                  <th className="text-left py-1 small-caps text-mute" style={{ fontSize: 9 }}>PS</th>
                  <th className="text-left py-1 small-caps text-mute" style={{ fontSize: 9 }}>Short Title</th>
                  <th className="text-right py-1 small-caps text-mute" style={{ fontSize: 9 }}>Score</th>
                  <th className="text-right py-1 small-caps text-mute" style={{ fontSize: 9 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {perPS.map((p) => (
                  <tr key={p.n} className="border-b" style={{ borderBottomColor: "rgba(13,27,42,0.06)" }}>
                    <td className="py-2 font-display" style={{ fontSize: 13 }}>{p.n}</td>
                    <td className="py-2">{p.meta.short}</td>
                    <td className="text-right py-2 font-display" style={{ fontSize: 14 }}>
                      {p.score.avg.toFixed(2)}
                    </td>
                    <td className={`text-right py-2 italic ${getMaturityLabel(p.score.avg).cls}`}>
                      {getMaturityLabel(p.score.avg).label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 2</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
          High-Priority Findings
        </h2>
        <p className="font-body text-mute italic mt-3" style={{ fontSize: 12 }}>
          Indicators scored 0 or 1 require immediate corrective action. Below, the top{" "}
          {topGaps.length} findings.
        </p>
        {topGaps.length === 0 ? (
          <p className="mt-6 font-body text-sage italic" style={{ fontSize: 13 }}>
            No high-priority gaps identified at this stage of assessment.
          </p>
        ) : (
          <div className="space-y-4 mt-6">
            {topGaps.map(({ ind, resp }, idx) => (
              <div key={ind.id} className="print-break-inside-avoid pb-4 hairline">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex-1">
                    <div className="small-caps text-mute" style={{ fontSize: 9 }}>
                      Finding {String(idx + 1).padStart(2, "0")} · {PS_META[ind.ps].code} {ind.ref} · {ind.section}
                    </div>
                    <div className="font-body text-ink mt-1" style={{ fontSize: 12, lineHeight: 1.5 }}>
                      {ind.text}
                    </div>
                    {!isEmptyHtml(resp?.notes) && (
                      <RichText
                        value={resp.notes}
                        className="font-body italic text-mute mt-2 pl-3 border-l border-gold"
                        style={{ fontSize: 11 }}
                      />
                    )}
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 28,
                      fontWeight: 300,
                      color: resp.score === 0 ? "var(--crimson)" : "var(--amber)",
                    }}
                  >
                    {resp.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {strengths.length > 0 && (
        <div className="print-page mt-12">
          <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 3</div>
          <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
            Areas of Demonstrated Strength
          </h2>
          <p className="font-body text-mute italic mt-3" style={{ fontSize: 12 }}>
            Indicators scored at the Advanced level (4); these practices should be sustained and
            leveraged as institutional knowledge.
          </p>
          <div className="space-y-3 mt-6">
            {strengths.map(({ ind, resp }) => (
              <div key={ind.id} className="pb-3 hairline print-break-inside-avoid">
                <div className="small-caps text-sage" style={{ fontSize: 9 }}>
                  {PS_META[ind.ps].code} {ind.ref} · {ind.section}
                </div>
                <div className="font-body text-ink mt-1" style={{ fontSize: 12, lineHeight: 1.5 }}>
                  {ind.text}
                </div>
                {!isEmptyHtml(resp?.notes) && (
                  <div className="font-body italic text-mute mt-1 flex gap-1" style={{ fontSize: 11 }}>
                    <span aria-hidden>—</span>
                    <RichText value={resp.notes} className="flex-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 4</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
          Recommended Next Steps
        </h2>
        <div className="mt-6 space-y-5 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <div>
            <div className="font-display text-ink" style={{ fontSize: 15, fontWeight: 600 }}>
              1. Close High-Priority Gaps (0–3 months)
            </div>
            <p className="mt-1 text-ink">
              Address all indicators scored 0–1 through a time-bound corrective action plan,
              prioritizing PS 1 (ESMS foundations) and any critical-habitat, cultural-heritage,
              or Indigenous Peoples findings. Deliverables should include updated policies,
              procedures, and assigned responsibilities.
            </p>
          </div>
          <div>
            <div className="font-display text-ink" style={{ fontSize: 15, fontWeight: 600 }}>
              2. Develop Targeted Management Plans (3–9 months)
            </div>
            <p className="mt-1 text-ink">
              For indicators scored 2, elevate practice to "Established" via specific plans —
              e.g., Resettlement Action Plan (PS 5), Biodiversity Action Plan (PS 6), Indigenous
              Peoples Plan (PS 7), Stakeholder Engagement Plan (PS 1), or Chance Find Procedure
              (PS 8) — with measurable KPIs and monitoring cycles.
            </p>
          </div>
          <div>
            <div className="font-display text-ink" style={{ fontSize: 15, fontWeight: 600 }}>
              3. Embed & Continuously Improve (9–24 months)
            </div>
            <p className="mt-1 text-ink">
              Integrate ESMS elements into core business decisions; conduct annual senior-management
              reviews; commission independent verification for projects with significant adverse
              impacts. Target moves all Performance Standards to "Established" (≥2.5) or better
              before financing approvals or Equator-Principles-aligned appraisal.
            </p>
          </div>
          <div>
            <div className="font-display text-ink" style={{ fontSize: 15, fontWeight: 600 }}>
              4. Cross-Reference with Complementary Frameworks
            </div>
            <p className="mt-1 text-ink">
              Align findings with applicable industry standards (e.g., IRMA for mining, RSPO for
              palm oil), host-country regulations (UU 32/2009, Permen ESDM 26/2018, Permen LHK on
              AMDAL/UKL-UPL, RKAB, Izin PPKH), and international frameworks (UNGPs, OECD Due
              Diligence Guidance). A+CSR can support integrated assessments combining IFC PS,
              ESG materiality, and IRMA readiness.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 5</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
          Methodology Note
        </h2>
        <div className="mt-4 space-y-3 font-body text-mute" style={{ fontSize: 11, lineHeight: 1.6 }}>
          <p>
            The assessment instrument maps {INDICATORS.length} indicators to the eight Performance
            Standards, with each indicator referencing the specific paragraph(s) of the IFC PS
            (2012) from which it is derived. Scoring follows a five-level maturity scale (0 — Not
            Started; 1 — Initial; 2 — Developing; 3 — Established; 4 — Advanced), with an N/A
            option for indicators that do not apply to the project's business activities.
          </p>
          <p>
            Performance Standard averages exclude N/A responses. The overall maturity index is
            the unweighted mean of the eight PS averages, giving equal weight to each Standard.
            In practice, client organizations may wish to apply sector-specific weightings —
            A+CSR's full consulting engagement typically develops a bespoke weighting scheme
            during scoping.
          </p>
          <p className="italic">
            This self-assessment is diagnostic in nature and does not constitute, and should not
            be represented as, an independent audit, certification, or assurance opinion. For
            lender-ready assessments, a third-party audit is recommended.
          </p>
        </div>
        <div className="mt-8 serial-number text-center" style={{ fontSize: 10 }}>
          — End of Report —
        </div>
      </div>
    </div>
  );
}
