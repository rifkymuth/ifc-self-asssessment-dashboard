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
import { SCORE_LEVELS } from "../data/scoreLevels";
import {
  computePSScore,
  computeOverall,
  getMaturityLabel,
  priorityGap,
  narrativeFor,
} from "../lib/scoring";
import MastheadRule from "../components/MastheadRule";
import RichText from "../components/RichText";
import { isEmptyHtml } from "../lib/richText";

const priorityDot = (color) => (
  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, marginRight: 8, verticalAlign: "middle" }} />
);

export default function NarrativeReportPage({ responses, meta }) {
  const overall = computeOverall(responses);
  const perPS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    n,
    meta: PS_META[n],
    score: computePSScore(responses, n),
  }));

  const allGaps = INDICATORS
    .map((ind) => ({ ind, resp: responses[ind.id], priority: priorityGap(responses[ind.id]) }))
    .filter((x) => x.priority !== null);

  const highGaps = allGaps.filter((g) => g.priority === "High");
  const medGaps = allGaps.filter((g) => g.priority === "Medium");

  const strengths = INDICATORS
    .map((ind) => ({ ind, resp: responses[ind.id] }))
    .filter((x) => x.resp?.score === 4);

  const established = INDICATORS
    .map((ind) => ({ ind, resp: responses[ind.id] }))
    .filter((x) => x.resp?.score === 3);

  const scoredPS = perPS.filter((p) => p.score.answered > 0);
  const strongestPS = [...scoredPS].sort((a, b) => b.score.avg - a.score.avg)[0];
  const weakestPS = [...scoredPS].sort((a, b) => a.score.avg - b.score.avg)[0];

  const riskProfile =
    overall.avg >= 3 ? { level: "Low Residual Risk", color: "var(--sage)", desc: "suitable for category B/C appraisal" } :
    overall.avg >= 2 ? { level: "Moderate Residual Risk", color: "var(--amber)", desc: "category A projects require corrective action plan before appraisal" } :
    overall.avg >= 1 ? { level: "High Residual Risk", color: "var(--crimson)", desc: "material E&S gaps — immediate remediation required prior to any financing" } :
    { level: "Severe Risk Exposure", color: "var(--crimson)", desc: "foundational ESMS work required before project progression" };

  const psWithSections = perPS.map((p) => {
    const secMap = new Map();
    INDICATORS.filter((i) => i.ps === p.n).forEach((i) => {
      if (!secMap.has(i.section)) secMap.set(i.section, { total: 0, sum: 0, count: 0, gaps: 0 });
      const s = secMap.get(i.section);
      const r = responses[i.id];
      s.total += 1;
      if (r && typeof r.score === "number") {
        s.sum += r.score;
        s.count += 1;
        if (r.score <= 1) s.gaps += 1;
      }
    });
    const sections = Array.from(secMap.entries()).map(([name, data]) => ({
      name,
      avg: data.count > 0 ? data.sum / data.count : 0,
      answered: data.count,
      total: data.total,
      gaps: data.gaps,
    }));
    return { ...p, sections };
  });

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 bg-paper" style={{ minHeight: "100vh" }}>
      <div className="no-print mb-6 flex justify-between items-center p-4 border border-rule" style={{ background: "rgba(184,145,81,0.06)" }}>
        <div className="font-body text-ink" style={{ fontSize: 12 }}>
          <strong>Full narrative report — {INDICATORS.length}-indicator comprehensive analysis.</strong>
          <br />
          <span className="text-mute italic">Use browser Print → Save as PDF for the complete document.</span>
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
          Comprehensive Diagnostic Report
        </div>
        <h1 className="font-display text-ink" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15 }}>
          IFC Performance Standards
          <br />on Environmental & Social Sustainability
        </h1>
        <div className="font-display italic text-ink-soft mt-3" style={{ fontSize: 16, fontWeight: 300 }}>
          Self-Assessment Compliance Review · Full Narrative
        </div>
        <MastheadRule />

        <div className="mt-14 space-y-2">
          <div className="font-display text-ink" style={{ fontSize: 24, fontWeight: 500 }}>
            {meta.projectName || "—"}
          </div>
          <div className="font-body text-mute" style={{ fontSize: 14 }}>
            Prepared for <span className="text-ink font-display italic">{meta.clientName || "—"}</span>
          </div>
          {meta.sector && (
            <div className="font-body text-mute" style={{ fontSize: 12 }}>
              Sector: <span className="text-ink">{meta.sector}</span>
            </div>
          )}
          {meta.location && (
            <div className="font-body text-mute" style={{ fontSize: 12 }}>
              Location: <span className="text-ink">{meta.location}</span>
            </div>
          )}
        </div>

        <div className="mt-12 inline-block text-left border border-ink p-6" style={{ minWidth: 360 }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3" style={{ fontSize: 11 }}>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Overall Maturity</div>
              <div className="font-display text-ink" style={{ fontSize: 20 }}>
                {overall.avg.toFixed(2)} / 4.00
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Risk Profile</div>
              <div className="font-display italic" style={{ fontSize: 14, color: riskProfile.color }}>
                {riskProfile.level}
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Indicators Assessed</div>
              <div className="font-display text-ink" style={{ fontSize: 16 }}>
                {Object.values(responses).filter(r => r?.score !== undefined && r?.score !== null).length} / {INDICATORS.length}
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>High-Priority Gaps</div>
              <div className="font-display" style={{ fontSize: 16, color: "var(--crimson)" }}>
                {highGaps.length}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-1">
          <div className="font-body text-mute" style={{ fontSize: 11 }}>
            Lead Assessor: <span className="text-ink">{meta.assessorName || "—"}</span>
          </div>
          <div className="font-body text-mute" style={{ fontSize: 11 }}>
            Assessment Date: <span className="text-ink">{meta.assessmentDate || "—"}</span>
          </div>
        </div>

        <div className="mt-16 serial-number" style={{ fontSize: 10 }}>
          A+CSR Indonesia (PT Caraka Swara Raharja Indonesia)
          <br />Jakarta · Bogor · sustainabilityindonesia.com
          <br />
          <span style={{ fontSize: 9 }}>STRICTLY PRIVATE AND CONFIDENTIAL</span>
        </div>
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Contents</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Table of Contents
        </h2>
        <div className="mt-6 space-y-2 font-body" style={{ fontSize: 12 }}>
          {[
            { n: "1.", title: "Executive Summary", page: "03" },
            { n: "2.", title: "Assessment Context & Scope", page: "04" },
            { n: "3.", title: "Methodology", page: "05" },
            { n: "4.", title: "Overall Findings & Risk Profile", page: "06" },
            { n: "5.", title: "Performance Standard 1 — ESMS & Stakeholder Engagement", page: "08" },
            { n: "6.", title: "Performance Standard 2 — Labor and Working Conditions", page: "10" },
            { n: "7.", title: "Performance Standard 3 — Resource Efficiency and Pollution Prevention", page: "11" },
            { n: "8.", title: "Performance Standard 4 — Community Health, Safety and Security", page: "12" },
            { n: "9.", title: "Performance Standard 5 — Land Acquisition and Involuntary Resettlement", page: "13" },
            { n: "10.", title: "Performance Standard 6 — Biodiversity and Natural Resources", page: "15" },
            { n: "11.", title: "Performance Standard 7 — Indigenous Peoples", page: "16" },
            { n: "12.", title: "Performance Standard 8 — Cultural Heritage", page: "18" },
            { n: "13.", title: "Strategic Roadmap & Recommendations", page: "19" },
            { n: "14.", title: "Appendix A — Prioritized Gap Register", page: "21" },
            { n: "15.", title: "Appendix B — Detailed Findings by Indicator", page: "23" },
            { n: "16.", title: "Appendix C — Glossary & References", page: "30" },
          ].map((item) => (
            <div key={item.n} className="flex items-baseline" style={{ lineHeight: 2 }}>
              <span className="font-display text-gold" style={{ fontSize: 12, minWidth: 32 }}>{item.n}</span>
              <span className="text-ink flex-1">{item.title}</span>
              <span className="flex-1 mx-3" style={{ borderBottom: "1px dotted rgba(13,27,42,0.25)", marginBottom: 4 }} />
              <span className="serial-number text-mute" style={{ fontSize: 11 }}>{item.page}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 1</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Executive Summary
        </h2>
        <div className="mt-5 space-y-4 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.7 }}>
          <p>
            This report presents the findings of a structured self-assessment of{" "}
            <strong>{meta.projectName || "the Project"}</strong>
            {meta.clientName ? <>, operated by <strong>{meta.clientName}</strong>,</> : null} against the International
            Finance Corporation (IFC) Performance Standards on Environmental and Social Sustainability,
            effective 1 January 2012. The assessment covers all eight Performance Standards through{" "}
            <strong>{INDICATORS.length} discrete indicators</strong> spanning policy, management systems,
            stakeholder engagement, labor, pollution prevention, community health, land acquisition,
            biodiversity, Indigenous Peoples, and cultural heritage.
          </p>

          <p>
            Based on evidence reviewed and responses provided, the overall Maturity Index stands at{" "}
            <strong>{overall.avg.toFixed(2)} out of a possible 4.00</strong>, placing the Project at the{" "}
            <strong className={getMaturityLabel(overall.avg).cls}>
              {getMaturityLabel(overall.avg).label}
            </strong>{" "}
            level. Against the IFC Sustainability Framework, this translates to a{" "}
            <strong style={{ color: riskProfile.color }}>{riskProfile.level.toLowerCase()}</strong>{" "}
            — {riskProfile.desc}.
          </p>

          <p>
            The assessment identified{" "}
            <strong style={{ color: "var(--crimson)" }}>{highGaps.length} high-priority gaps</strong>
            {" "}(indicators scored 0–1) requiring immediate corrective action,{" "}
            <strong style={{ color: "var(--amber)" }}>{medGaps.length} medium-priority gaps</strong>
            {" "}(scored 2) warranting structured improvement plans, and{" "}
            <strong className="text-sage">{strengths.length + established.length} areas of demonstrated adequacy</strong>{" "}
            (scored 3–4) that should be sustained through ongoing management attention.
          </p>

          {strongestPS && weakestPS && (
            <p>
              The strongest performance is observed in{" "}
              <strong>{strongestPS.meta.code} — {strongestPS.meta.short}</strong>{" "}
              (score {strongestPS.score.avg.toFixed(2)}), reflecting{" "}
              {strongestPS.score.avg >= 3 ? "mature systems and sustained implementation" : "acceptable practice that can be built upon"}.
              Conversely, the area requiring the most urgent attention is{" "}
              <strong>{weakestPS.meta.code} — {weakestPS.meta.short}</strong>{" "}
              (score {weakestPS.score.avg.toFixed(2)}), where{" "}
              {weakestPS.score.avg < 1.5 ? "foundational policies and procedures remain absent or informal" : "practices are developing but inconsistently applied"}.
            </p>
          )}

          <p>
            In the Indonesian extractive-sector context, these findings carry specific implications
            for regulatory compliance (UU 32/2009 PPLH, Permen LHK 7/2018 AMDAL, Permen ESDM 26/2018,
            UU 5/1960 Agraria, UU 39/1999 HAM), lender appraisal (Equator Principles, IFC direct
            investment, green-loan frameworks), and the social license to operate in communities
            with active civil-society scrutiny (WALHI, JATAM, Mongabay, Watchdoc, among others).
          </p>

          <div className="mt-6 p-4 border-l-4" style={{ borderColor: "var(--gold)", background: "rgba(184,145,81,0.06)" }}>
            <div className="small-caps text-gold mb-2" style={{ fontSize: 10 }}>Headline Recommendation</div>
            <p className="font-body text-ink italic" style={{ fontSize: 12 }}>
              {overall.avg >= 3
                ? "Sustain current performance through annual internal review, external verification of monitoring data, and integration of PS requirements into procurement and joint-venture agreements."
                : overall.avg >= 2
                ? "Elevate the Project from 'Developing' to 'Established' within 9–12 months via a time-bound corrective action plan targeting the " + highGaps.length + " high-priority gaps and strengthening documentation across identified weak sections."
                : overall.avg >= 1
                ? "Before further project expansion or external financing, undertake a foundational ESMS programme focused on PS 1 policy and procedures, stakeholder engagement infrastructure, and — where applicable — RAP/LRP and FPIC-related safeguards."
                : "Commission a structured ESMS development engagement covering all eight Standards, starting with policy commitment, role assignment, baseline studies, and external expert onboarding before project activities proceed."}
            </p>
          </div>
        </div>
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 2</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Assessment Context & Scope
        </h2>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          2.1 Rationale for the Assessment
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            The IFC Performance Standards constitute the de facto global benchmark for private-sector
            environmental and social (E&S) risk management, adopted by the Equator Principles
            Financial Institutions (EPFIs), most multilateral development banks, and major private
            lenders. In the Indonesian context, the Standards are routinely referenced in appraisal
            of extractive projects (nickel, coal, gold, rubber, palm), infrastructure, and carbon
            projects seeking international financing or offtake agreements.
          </p>
          <p>
            A structured self-assessment serves three complementary purposes: it provides the client
            with an internal baseline of compliance maturity, it identifies priority investments in
            management systems and capacity prior to formal external audit, and it generates the
            documentary foundation for subsequent stakeholder engagement, lender due diligence, or
            independent assurance.
          </p>
        </div>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          2.2 Scope of This Assessment
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>The assessment covers:</p>
          <ul className="pl-6 space-y-1" style={{ listStyle: "square" }}>
            <li>All eight IFC Performance Standards (PS 1 through PS 8)</li>
            <li><strong>{INDICATORS.length}</strong> detailed indicators mapped to specific paragraphs of the Standards</li>
            <li>
              Project identification: <em>{meta.projectName || "—"}</em>
              {meta.sector && <> · Sector: <em>{meta.sector}</em></>}
              {meta.location && <> · Location: <em>{meta.location}</em></>}
            </li>
            <li>Assessment period concluded: {meta.assessmentDate || "—"}</li>
          </ul>
        </div>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          2.3 Limitations of the Self-Assessment Format
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            This is a <em>diagnostic self-assessment</em>. Findings reflect the client's own review
            of practice against the Standards, informed by documented evidence where cited. The
            report does not constitute — and should not be represented as — an independent audit,
            assurance engagement, or certification. For lender-ready determinations, a third-party
            independent audit is recommended, typically by firms with IFC/MIGA, Equator-Principles,
            or accredited-body credentials.
          </p>
        </div>
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 3</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Methodology
        </h2>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          3.1 Indicator Set
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            The indicator set comprises {INDICATORS.length} requirements distilled directly from
            the Performance Standards (2012) and cross-referenced to the corresponding Guidance
            Notes and the World Bank Group Environmental, Health and Safety (EHS) Guidelines. Each
            indicator cites the specific paragraph(s) of the underlying Standard from which it
            derives, preserving traceability back to the primary source.
          </p>
          <p>
            Indicators are grouped by thematic section within each Performance Standard (e.g., for
            PS 1: Policy; Risks & Impacts Identification; Management Programs; Organizational
            Capacity; Emergency Preparedness; Monitoring & Review; Stakeholder Engagement;
            Grievance Mechanism; External Communications). This architecture allows practitioners
            to read results either vertically (by PS) or horizontally (by management system
            element across PS).
          </p>
        </div>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          3.2 Maturity Scoring
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>Each indicator is rated on a five-level maturity scale:</p>
          <table className="w-full mt-2" style={{ fontSize: 11 }}>
            <thead>
              <tr style={{ background: "rgba(13,27,42,0.05)" }}>
                <th className="text-left py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Level</th>
                <th className="text-left py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Descriptor</th>
                <th className="text-left py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Characterization</th>
              </tr>
            </thead>
            <tbody>
              {SCORE_LEVELS.map((lvl) => (
                <tr key={lvl.value} className="hairline">
                  <td className="py-2 px-3 font-display text-ink" style={{ fontSize: 15 }}>{lvl.value}</td>
                  <td className="py-2 px-3 font-display italic">{lvl.label}</td>
                  <td className="py-2 px-3 text-mute">{lvl.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3">
            An <strong>N/A</strong> option is available where an indicator does not apply to the
            specific business activities of the Project. N/A responses are excluded from PS-level
            average calculations but counted toward completion metrics.
          </p>
        </div>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          3.3 Aggregation & Risk Profile
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            Each Performance Standard's overall score is the unweighted arithmetic mean of all
            answered (non-N/A) indicators within that PS. The overall Maturity Index is the mean
            of the eight PS scores, giving each Standard equal weight. In consulting engagements,
            A+CSR typically applies sector-specific weighting (e.g., elevating PS 5 and PS 7 for
            nickel/coal operations in Indigenous territories); the present report uses equal
            weighting for transparency.
          </p>
          <p>
            Residual risk profile is derived from overall maturity:{" "}
            ≥3.00 = Low; 2.00–2.99 = Moderate; 1.00–1.99 = High;{" "}
            {"<"}1.00 = Severe.
          </p>
        </div>
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 4</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Overall Findings & Risk Profile
        </h2>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          4.1 Maturity Distribution Across the Eight Standards
        </h3>
        <div className="grid grid-cols-5 gap-4 mt-4" style={{ alignItems: "start" }}>
          <div className="col-span-3" style={{ height: 280 }}>
            <ResponsiveContainer>
              <RadarChart data={perPS.map((p) => ({ ps: p.meta.abbr, score: p.score.avg, fullMark: 4 }))}>
                <PolarGrid stroke="rgba(13,27,42,0.2)" />
                <PolarAngleAxis dataKey="ps" tick={{ fill: "var(--ink)", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 9 }} />
                <Radar dataKey="score" stroke="var(--ink)" fill="var(--gold)" fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-2 font-body text-ink" style={{ fontSize: 11, lineHeight: 1.6 }}>
            <div className="small-caps text-mute mb-1" style={{ fontSize: 9 }}>Fig. 4.1</div>
            <p className="italic text-mute" style={{ fontSize: 11 }}>
              The radar profile illustrates relative maturity across the eight Performance Standards
              on a 0–4 scale. A well-rounded figure approaching the outer ring indicates balanced,
              Advanced-level E&S management.
            </p>
          </div>
        </div>

        <h3 className="font-display text-ink mt-6" style={{ fontSize: 16, fontWeight: 600 }}>
          4.2 Performance Standard Scorecard
        </h3>
        <table className="w-full mt-3" style={{ fontSize: 11 }}>
          <thead>
            <tr style={{ background: "var(--ink)", color: "var(--paper)" }}>
              <th className="text-left py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>PS</th>
              <th className="text-left py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Title</th>
              <th className="text-right py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Score</th>
              <th className="text-right py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Level</th>
              <th className="text-right py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>High Gaps</th>
              <th className="text-right py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {perPS.map((p) => {
              const mat = getMaturityLabel(p.score.avg);
              const highs = highGaps.filter((g) => g.ind.ps === p.n).length;
              const coverage = p.score.total > 0 ? Math.round(((p.score.answered + p.score.naCount) / p.score.total) * 100) : 0;
              return (
                <tr key={p.n} className="hairline">
                  <td className="py-2 px-3 font-display" style={{ fontSize: 13, fontWeight: 500 }}>{p.n}</td>
                  <td className="py-2 px-3 text-ink">{p.meta.short}</td>
                  <td className="text-right py-2 px-3 font-display" style={{ fontSize: 14, fontWeight: 500 }}>
                    {p.score.avg.toFixed(2)}
                  </td>
                  <td className={`text-right py-2 px-3 italic font-display ${mat.cls}`} style={{ fontSize: 12 }}>
                    {mat.label}
                  </td>
                  <td className="text-right py-2 px-3" style={{ color: highs > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
                    {highs > 0 ? highs : "—"}
                  </td>
                  <td className="text-right py-2 px-3 text-mute">{coverage}%</td>
                </tr>
              );
            })}
            <tr style={{ background: "rgba(184,145,81,0.08)", borderTop: "2px solid var(--ink)" }}>
              <td className="py-2 px-3 font-display font-bold" colSpan={2}>Overall</td>
              <td className="text-right py-2 px-3 font-display" style={{ fontSize: 15, fontWeight: 600 }}>
                {overall.avg.toFixed(2)}
              </td>
              <td className={`text-right py-2 px-3 italic font-display ${getMaturityLabel(overall.avg).cls}`} style={{ fontSize: 13 }}>
                {getMaturityLabel(overall.avg).label}
              </td>
              <td className="text-right py-2 px-3" style={{ color: "var(--crimson)" }}>
                {highGaps.length}
              </td>
              <td className="text-right py-2 px-3">{overall.completion.toFixed(0)}%</td>
            </tr>
          </tbody>
        </table>

        <h3 className="font-display text-ink mt-6" style={{ fontSize: 16, fontWeight: 600 }}>
          4.3 Cross-Cutting Observations
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            <strong>Governance and system coherence.</strong>{" "}
            {perPS[0].score.avg >= 3
              ? "The foundations established under PS 1 provide a coherent management-system backbone, enabling consistent application across the downstream standards."
              : perPS[0].score.avg >= 2
              ? "PS 1 shows established practice but remains uneven in depth; strengthening the ESMS backbone will lift downstream standards in turn."
              : "PS 1 maturity is below the Established threshold, which is material: without a functioning ESMS backbone, discrete improvements in downstream standards tend not to sustain. Investment in PS 1 is recommended as a priority."}
          </p>
          <p>
            <strong>Stakeholder engagement intensity.</strong>{" "}
            {(() => {
              const seIds = ["1.7.1","1.7.2","1.7.3","1.7.4","1.7.5","1.7.6","1.7.7","1.7.8","1.7.9","1.7.10","1.7.11","1.7.12"];
              const seResps = seIds.map(id => responses[id]).filter(r => typeof r?.score === "number");
              const seAvg = seResps.length > 0 ? seResps.reduce((a,r)=>a+r.score,0) / seResps.length : 0;
              if (seResps.length === 0) return "Stakeholder engagement indicators have not yet been assessed; this area is critical for extractive-sector projects in Indonesia and warrants priority attention.";
              if (seAvg >= 3) return "Stakeholder engagement is functioning as a two-way system with documented evidence of community influence on project decisions — an asset in the Indonesian context where civil-society scrutiny is active.";
              if (seAvg >= 2) return "Stakeholder engagement is regularly conducted but the depth of inclusion (vulnerable groups, women's separate fora, ICP documentation) shows room for improvement.";
              return "Stakeholder engagement is at an early stage. Given the Indonesian context of active NGO scrutiny (WALHI, JATAM, Mongabay) and evolving FPIC expectations, rapid improvement is warranted.";
            })()}
          </p>
          <p>
            <strong>Land and Indigenous Peoples exposure.</strong>{" "}
            {(() => {
              const ps5 = perPS[4].score.avg, ps7 = perPS[6].score.avg;
              if (ps5 === 0 && ps7 === 0) return "PS 5 and PS 7 have not yet been assessed. These Standards carry the highest-profile legal and reputational risk in the Indonesian extractive context — urgent attention recommended.";
              if (ps5 >= 2.5 && ps7 >= 2.5) return "Land acquisition and Indigenous Peoples management show Established maturity — a significant strength given the heightened scrutiny these Standards attract from lenders and civil society.";
              return "PS 5 and PS 7 relate directly to the highest-severity risks in Indonesian extractive operations: involuntary resettlement, livelihood restoration, and FPIC. The current maturity in these areas is " +
                ((ps5 + ps7) / 2 >= 2 ? "developing" : "below the Developing threshold") +
                ", suggesting that targeted investment in RAP/LRP design, FPIC process, and documented community agreements is a priority.";
            })()}
          </p>
          <p>
            <strong>Biodiversity and resource efficiency.</strong>{" "}
            {(() => {
              const ps3 = perPS[2].score.avg, ps6 = perPS[5].score.avg;
              if (ps3 === 0 && ps6 === 0) return "Environmental standards PS 3 and PS 6 are not yet assessed and should be addressed alongside the social standards in an integrated ESMS approach.";
              if (ps6 >= 2.5) return "Biodiversity management is at an acceptable level; for projects in or near protected areas, critical habitat, or HCV areas, maintaining robust monitoring and offset arrangements remains essential.";
              return "PS 6 is below Established maturity. For projects operating in Indonesia's biodiversity-rich landscapes (Sulawesi, Papua, Kalimantan, Halmahera), investment in Critical Habitat Assessment, BMPs, and biodiversity offset design is recommended.";
            })()}
          </p>
        </div>
      </div>

      {psWithSections.map((p, idx) => {
        const mat = getMaturityLabel(p.score.avg);
        const narr = narrativeFor(p.score);
        const psGaps = highGaps.filter((g) => g.ind.ps === p.n);
        const psMedium = medGaps.filter((g) => g.ind.ps === p.n);
        const psStrengths = strengths.filter((x) => x.ind.ps === p.n);
        return (
          <div key={p.n} className="print-page mt-12">
            <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section {5 + idx}</div>
            <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 24, fontWeight: 500 }}>
              Performance Standard {p.n} — {p.meta.short}
            </h2>
            <div className="font-display italic text-mute mt-1" style={{ fontSize: 13 }}>
              {p.meta.title}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="border border-rule p-3">
                <div className="small-caps text-mute" style={{ fontSize: 9 }}>Maturity Score</div>
                <div className="font-display text-ink" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1 }}>
                  {p.score.avg.toFixed(2)}<span className="text-mute-2" style={{ fontSize: 11 }}>/4.00</span>
                </div>
                <div className={`font-display italic mt-1 ${mat.cls}`} style={{ fontSize: 12 }}>
                  {mat.label}
                </div>
              </div>
              <div className="border border-rule p-3">
                <div className="small-caps text-mute" style={{ fontSize: 9 }}>High-Priority Gaps</div>
                <div className="font-display" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1, color: psGaps.length > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
                  {psGaps.length}
                </div>
                <div className="text-mute italic" style={{ fontSize: 10 }}>score 0–1 · urgent</div>
              </div>
              <div className="border border-rule p-3">
                <div className="small-caps text-mute" style={{ fontSize: 9 }}>Coverage</div>
                <div className="font-display text-ink" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1 }}>
                  {p.score.total > 0 ? Math.round(((p.score.answered + p.score.naCount) / p.score.total) * 100) : 0}
                  <span className="text-mute-2" style={{ fontSize: 11 }}>%</span>
                </div>
                <div className="text-mute italic" style={{ fontSize: 10 }}>
                  {p.score.answered + p.score.naCount}/{p.score.total} assessed
                </div>
              </div>
            </div>

            <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
              {5 + idx}.1 Verdict & Analysis
            </h4>
            <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
              <p className="font-display italic" style={{ fontSize: 13, color: mat.color }}>
                {narr.verdict}.
              </p>
              <p>{narr.narrative}</p>
            </div>

            {p.sections.some((s) => s.answered > 0) && (
              <>
                <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
                  {5 + idx}.2 Section-Level Breakdown
                </h4>
                <table className="w-full mt-2" style={{ fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "rgba(13,27,42,0.05)" }}>
                      <th className="text-left py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Section</th>
                      <th className="text-right py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Score</th>
                      <th className="text-right py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Assessed</th>
                      <th className="text-right py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>High Gaps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.sections.map((s) => (
                      <tr key={s.name} className="hairline">
                        <td className="py-2 px-3 text-ink">{s.name}</td>
                        <td className="text-right py-2 px-3 font-display" style={{ fontSize: 13 }}>
                          {s.answered > 0 ? s.avg.toFixed(2) : "—"}
                        </td>
                        <td className="text-right py-2 px-3 text-mute">{s.answered}/{s.total}</td>
                        <td className="text-right py-2 px-3" style={{ color: s.gaps > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
                          {s.gaps > 0 ? s.gaps : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {psGaps.length > 0 && (
              <>
                <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
                  {5 + idx}.3 High-Priority Findings in This Standard
                </h4>
                <div className="mt-2 space-y-3">
                  {psGaps.slice(0, 8).map(({ ind, resp }) => (
                    <div key={ind.id} className="print-break-inside-avoid pb-3" style={{ borderBottom: "1px solid rgba(13,27,42,0.08)" }}>
                      <div className="flex items-baseline gap-3">
                        <div className="serial-number flex-shrink-0" style={{ fontSize: 10, minWidth: 42 }}>{ind.id}</div>
                        <div className="flex-1">
                          <div className="font-body text-ink" style={{ fontSize: 12, lineHeight: 1.5 }}>
                            {ind.text}
                          </div>
                          <div className="small-caps text-mute mt-1" style={{ fontSize: 9 }}>
                            {p.meta.code} {ind.ref} · {ind.section}
                          </div>
                          {!isEmptyHtml(resp?.notes) && (
                            <div className="font-body italic text-mute mt-2 pl-3 border-l border-gold flex gap-1" style={{ fontSize: 11 }}>
                              <strong className="text-ink flex-shrink-0" style={{ fontStyle: "normal", fontSize: 10 }}>Finding:</strong>
                              <RichText value={resp.notes} className="flex-1" />
                            </div>
                          )}
                        </div>
                        <div className="font-display flex-shrink-0" style={{ fontSize: 22, fontWeight: 300, color: resp.score === 0 ? "var(--crimson)" : "var(--amber)" }}>
                          {resp.score}
                        </div>
                      </div>
                    </div>
                  ))}
                  {psGaps.length > 8 && (
                    <div className="text-mute italic" style={{ fontSize: 11 }}>
                      … plus {psGaps.length - 8} additional high-priority findings — see Appendix A for the complete register.
                    </div>
                  )}
                </div>
              </>
            )}

            {psMedium.length > 0 && (
              <>
                <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
                  {5 + idx}.{psGaps.length > 0 ? 4 : 3} Medium-Priority Observations
                </h4>
                <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <p className="mb-2">
                    {psMedium.length} indicator{psMedium.length > 1 ? "s" : ""} in this Standard scored 2 (Developing). These are
                    areas where documented practice exists but is not yet consistently applied, monitored, or verified.
                    Structured elevation to Established level is recommended.
                  </p>
                  <ul className="pl-4 space-y-1" style={{ fontSize: 11 }}>
                    {psMedium.slice(0, 4).map(({ ind }) => (
                      <li key={ind.id}>
                        <span className="serial-number" style={{ fontSize: 10 }}>{ind.id}</span>{" — "}
                        <span className="italic">{ind.section}:</span>{" "}
                        {ind.text.substring(0, 150)}{ind.text.length > 150 ? "…" : ""}
                      </li>
                    ))}
                    {psMedium.length > 4 && (
                      <li className="italic text-mute">… plus {psMedium.length - 4} further medium-priority observations.</li>
                    )}
                  </ul>
                </div>
              </>
            )}

            {psStrengths.length > 0 && (
              <>
                <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
                  {5 + idx}.{(psGaps.length > 0 ? 1 : 0) + (psMedium.length > 0 ? 1 : 0) + 3} Areas of Demonstrated Strength
                </h4>
                <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <p>
                    {psStrengths.length} indicator{psStrengths.length > 1 ? "s" : ""} in this Standard achieved the Advanced level (score 4),
                    indicating fully integrated and continuously improving practice. These capabilities should be captured
                    as institutional knowledge, referenced in stakeholder communications, and sustained through
                    senior-management oversight.
                  </p>
                </div>
              </>
            )}

            <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
              {5 + idx}.{(psGaps.length > 0 ? 1 : 0) + (psMedium.length > 0 ? 1 : 0) + (psStrengths.length > 0 ? 1 : 0) + 3} Recommended Actions for PS {p.n}
            </h4>
            <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
              {p.score.avg >= 3 ? (
                <ol className="pl-5 space-y-1" style={{ listStyle: "decimal" }}>
                  <li>Sustain current practice through annual internal review cycle.</li>
                  <li>Where not already done, commission external verification for the {p.meta.short} module.</li>
                  <li>Capture institutional knowledge via procedure manuals and internal training.</li>
                </ol>
              ) : p.score.avg >= 2 ? (
                <ol className="pl-5 space-y-1" style={{ listStyle: "decimal" }}>
                  <li>Close the {psGaps.length} high-priority gap{psGaps.length !== 1 ? "s" : ""} via a time-bound corrective action plan (90 days).</li>
                  <li>Elevate the {psMedium.length} medium-priority item{psMedium.length !== 1 ? "s" : ""} through structured documentation, staff training, and management attention (6 months).</li>
                  <li>Integrate this Standard into the annual ESMS review cycle with clear KPIs.</li>
                </ol>
              ) : (
                <ol className="pl-5 space-y-1" style={{ listStyle: "decimal" }}>
                  <li>Establish baseline policy and procedures for {p.meta.short} as a priority.</li>
                  <li>Assign senior-management responsibility and allocate budget; engage external experts where warranted.</li>
                  <li>Develop a 12–18 month improvement plan targeting Established maturity.</li>
                  <li>Align the plan with applicable Indonesian regulations and international good practice.</li>
                </ol>
              )}
            </div>
          </div>
        );
      })}

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 13</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Strategic Roadmap & Recommendations
        </h2>

        <p className="mt-5 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.7 }}>
          The strategic roadmap below translates the findings of this assessment into a phased
          programme of work. Phases are sequenced to address the most material risks first,
          to build capacity progressively, and to position the Project for eventual external
          audit or lender appraisal.
        </p>

        <div className="mt-6 border-l-4 pl-5" style={{ borderColor: "var(--crimson)" }}>
          <div className="small-caps" style={{ fontSize: 10, color: "var(--crimson)" }}>Phase 1 · 0–3 months</div>
          <h3 className="font-display text-ink" style={{ fontSize: 17, fontWeight: 600 }}>
            Close High-Priority Gaps
          </h3>
          <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p>
              Address all {highGaps.length} indicator{highGaps.length !== 1 ? "s" : ""} scored 0–1 through a
              time-bound Corrective Action Plan (CAP). Prioritize PS 1 (ESMS foundations) and any findings
              related to critical habitat (PS 6), land acquisition (PS 5), Indigenous Peoples (PS 7), or
              cultural heritage (PS 8) — areas where residual damage is difficult to reverse.
            </p>
            <p className="mt-2">
              <strong>Key deliverables:</strong> policy documents, role matrices, stakeholder register,
              grievance mechanism procedure, updated RAP/LRP as applicable, FPIC documentation where
              required, BAP/critical habitat assessment where warranted.
            </p>
          </div>
        </div>

        <div className="mt-6 border-l-4 pl-5" style={{ borderColor: "var(--amber)" }}>
          <div className="small-caps" style={{ fontSize: 10, color: "var(--amber)" }}>Phase 2 · 3–9 months</div>
          <h3 className="font-display text-ink" style={{ fontSize: 17, fontWeight: 600 }}>
            Elevate to Established Maturity
          </h3>
          <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p>
              Work through the {medGaps.length} indicator{medGaps.length !== 1 ? "s" : ""} scored 2 (Developing)
              to bring them to Established (3). This phase focuses on operationalization — making documented
              procedures into consistently-applied practice with evidence of outcomes.
            </p>
            <p className="mt-2">
              <strong>Key activities:</strong> staff training and capacity building; roll-out of monitoring
              systems; integration of PS requirements into contractor management and procurement; development
              of targeted plans (SEP, Emergency Response Plan, OHS Plan, Chance Find Procedure, Influx
              Management Plan, etc.); first complete cycle of senior-management review.
            </p>
          </div>
        </div>

        <div className="mt-6 border-l-4 pl-5" style={{ borderColor: "var(--sage)" }}>
          <div className="small-caps text-sage" style={{ fontSize: 10 }}>Phase 3 · 9–24 months</div>
          <h3 className="font-display text-ink" style={{ fontSize: 17, fontWeight: 600 }}>
            Embed, Verify, and Continuously Improve
          </h3>
          <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p>
              Integrate ESMS elements into core business decisions; conduct an independent third-party
              audit or verification engagement; pursue any relevant certifications (e.g., ISO 14001, ISO 45001,
              RSPO, IRMA where applicable); target Advanced maturity on PS 1 and the Standards most material
              to the Project's risk profile.
            </p>
            <p className="mt-2">
              <strong>Key outcomes:</strong> IFC/Equator-Principles-ready documentation; internal audit
              function established; public sustainability report published; community relationships formalized
              through long-term engagement agreements.
            </p>
          </div>
        </div>

        <div className="mt-6 border-l-4 pl-5" style={{ borderColor: "var(--ink)" }}>
          <div className="small-caps" style={{ fontSize: 10 }}>Phase 4 · Ongoing</div>
          <h3 className="font-display text-ink" style={{ fontSize: 17, fontWeight: 600 }}>
            Integrate with Complementary Frameworks
          </h3>
          <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p>
              Align outcomes with applicable industry standards and frameworks:
            </p>
            <ul className="pl-5 mt-2 space-y-1" style={{ listStyle: "disc" }}>
              <li><strong>Indonesian regulation:</strong> UU 32/2009 PPLH; UU 39/1999 HAM; UU 5/1960 Pokok Agraria; Permen LHK 7/2018 AMDAL; Permen ESDM 26/2018 Good Mining Practice; Permen ATR/BPN on land acquisition; RKAB submissions; PPKH/IPPKH procedures.</li>
              <li><strong>Sector-specific:</strong> IRMA Standard for Responsible Mining (mining); RSPO P&C (palm oil); FSC or PEFC (forestry); VCS/CCB (carbon projects).</li>
              <li><strong>International frameworks:</strong> UNGPs on Business & Human Rights; OECD Due Diligence Guidance for Responsible Business Conduct; Voluntary Principles on Security & Human Rights; UN Declaration on the Rights of Indigenous Peoples.</li>
              <li><strong>Financial-sector:</strong> Equator Principles 4; IFC direct-investment appraisal; OJK green-finance taxonomy; TCFD / TNFD disclosures.</li>
            </ul>
            <p className="mt-3 italic text-mute">
              A+CSR offers integrated assessments combining IFC PS, ESG materiality, IRMA readiness, and
              sector-specific frameworks within a single engagement — reducing duplication and ensuring
              consistent findings across lender, regulator, and civil-society audiences.
            </p>
          </div>
        </div>
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Appendix A</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Prioritized Gap Register
        </h2>
        <p className="font-body text-mute italic mt-2" style={{ fontSize: 11 }}>
          Complete register of indicators scoring below Established maturity (≤2), ordered by priority.
        </p>

        {allGaps.length === 0 ? (
          <p className="mt-4 text-sage italic font-body" style={{ fontSize: 12 }}>
            No gaps currently identified. (Note: gaps appear as assessment is completed.)
          </p>
        ) : (
          <table className="w-full mt-4" style={{ fontSize: 10 }}>
            <thead>
              <tr style={{ background: "var(--ink)", color: "var(--paper)" }}>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>Pri.</th>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>ID</th>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>PS Ref</th>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>Section</th>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>Requirement</th>
                <th className="text-right py-2 px-2" style={{ fontSize: 9 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {allGaps.map(({ ind, resp, priority }) => (
                <tr key={ind.id} className="hairline print-break-inside-avoid">
                  <td className="py-2 px-2">
                    {priorityDot(priority === "High" ? "var(--crimson)" : "var(--amber)")}
                    <span style={{ fontSize: 9 }}>{priority === "High" ? "H" : "M"}</span>
                  </td>
                  <td className="py-2 px-2 serial-number" style={{ fontSize: 9 }}>{ind.id}</td>
                  <td className="py-2 px-2 text-gold" style={{ fontSize: 9 }}>{PS_META[ind.ps].code} {ind.ref}</td>
                  <td className="py-2 px-2 text-mute">{ind.section}</td>
                  <td className="py-2 px-2 text-ink" style={{ lineHeight: 1.4, maxWidth: 280 }}>
                    {ind.text.substring(0, 180)}{ind.text.length > 180 ? "…" : ""}
                  </td>
                  <td className="text-right py-2 px-2 font-display" style={{ fontSize: 13 }}>{resp.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Appendix B</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Detailed Findings by Indicator
        </h2>
        <p className="font-body text-mute italic mt-2" style={{ fontSize: 11 }}>
          Complete record of scoring with notes and evidence references for every assessed indicator.
        </p>

        {[1, 2, 3, 4, 5, 6, 7, 8].map((psNum) => {
          const psInds = INDICATORS.filter((i) => i.ps === psNum);
          const psAssessed = psInds.filter((i) => responses[i.id]?.score !== undefined);
          if (psAssessed.length === 0) return null;

          return (
            <div key={psNum} className="mt-6">
              <h3 className="font-display text-ink" style={{ fontSize: 16, fontWeight: 600, background: "rgba(13,27,42,0.05)", padding: "6px 10px" }}>
                {PS_META[psNum].code} — {PS_META[psNum].short}
              </h3>
              <div className="mt-2 space-y-2">
                {psAssessed.map((ind) => {
                  const r = responses[ind.id];
                  const isNA = r.score === "NA";
                  const scoreColor = isNA ? "var(--mute)" : r.score >= 3 ? "var(--sage)" : r.score === 2 ? "var(--amber)" : "var(--crimson)";
                  return (
                    <div key={ind.id} className="print-break-inside-avoid py-2" style={{ borderBottom: "1px solid rgba(13,27,42,0.06)" }}>
                      <div className="flex items-baseline gap-2">
                        <span className="serial-number flex-shrink-0" style={{ fontSize: 9, minWidth: 42 }}>{ind.id}</span>
                        <span className="text-gold flex-shrink-0" style={{ fontSize: 9 }}>{ind.ref}</span>
                        <span className="text-ink flex-1" style={{ fontSize: 11, lineHeight: 1.4 }}>{ind.text}</span>
                        <span className="font-display flex-shrink-0" style={{ fontSize: 16, fontWeight: 500, color: scoreColor, minWidth: 28, textAlign: "right" }}>
                          {isNA ? "N/A" : r.score}
                        </span>
                      </div>
                      {(!isEmptyHtml(r.notes) || !isEmptyHtml(r.evidence)) && (
                        <div className="mt-1 pl-12 font-body" style={{ fontSize: 10, lineHeight: 1.5 }}>
                          {!isEmptyHtml(r.notes) && (
                            <div className="text-mute italic flex gap-1">
                              <span className="small-caps text-ink flex-shrink-0" style={{ fontSize: 9, fontStyle: "normal" }}>Notes:</span>
                              <RichText value={r.notes} className="flex-1" />
                            </div>
                          )}
                          {!isEmptyHtml(r.evidence) && (
                            <div className="text-mute italic mt-1 flex gap-1">
                              <span className="small-caps text-ink flex-shrink-0" style={{ fontSize: 9, fontStyle: "normal" }}>Evidence:</span>
                              <RichText value={r.evidence} className="flex-1" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Appendix C</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Glossary & References
        </h2>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
          C.1 Key Terms
        </h3>
        <dl className="mt-3 font-body text-ink" style={{ fontSize: 11, lineHeight: 1.6 }}>
          {[
            ["Affected Communities", "Local communities directly affected by the project; subject of stakeholder engagement, consultation, and grievance mechanism obligations under PS 1."],
            ["Area of Influence", "Area encompassing direct, indirect, and associated impacts of a project, including associated facilities and cumulative impacts."],
            ["BAP (Biodiversity Action Plan)", "Required under PS 6 for projects in critical habitat; sets out mitigation strategy designed to achieve net gains for biodiversity values."],
            ["Cumulative Impacts", "Incremental impacts on areas/resources from the project combined with other existing, planned, or reasonably defined developments."],
            ["ESMS", "Environmental and Social Management System; required under PS 1; incorporates policy, risks/impacts identification, management programs, capacity, emergency response, stakeholder engagement, and monitoring."],
            ["FPIC (Free, Prior & Informed Consent)", "Required under PS 7 in specific circumstances affecting Indigenous Peoples — impacts on customary lands, relocation, critical cultural heritage, or commercial use of their heritage/knowledge."],
            ["GIIP (Good International Industry Practice)", "Exercise of professional skill, diligence, prudence, and foresight reasonably expected from skilled professionals engaged in similar undertakings globally or regionally."],
            ["Grievance Mechanism", "Required under PS 1 (community) and PS 2 (workers); scaled to risks; accessible, transparent, non-retaliatory, and does not impede access to judicial remedies."],
            ["ICP (Informed Consultation & Participation)", "Two-way engagement process required for projects with potentially significant adverse impacts; more in-depth than basic consultation; leads to incorporation of community views in decision-making."],
            ["LRP (Livelihood Restoration Plan)", "Required under PS 5 for projects causing economic displacement; aims to restore or improve income-earning capacity, production levels, and standards of living."],
            ["Mitigation Hierarchy", "Sequence of avoid → minimize → restore → compensate/offset for residual impacts; applied across PS 1, 5, 6, 7, 8."],
            ["RAP (Resettlement Action Plan)", "Required under PS 5 for projects causing physical displacement; covers entitlements, compensation, relocation, host communities, budget, schedule, and M&E."],
            ["Stakeholder Engagement Plan (SEP)", "Required under PS 1; scaled to project risks; includes stakeholder analysis, disclosure, consultation/participation, grievance mechanism, ongoing reporting."],
          ].map(([term, def]) => (
            <div key={term} className="mb-2 print-break-inside-avoid">
              <dt className="font-display text-ink" style={{ fontSize: 11, fontWeight: 600, display: "inline" }}>{term}</dt>
              <dd className="inline text-mute"> — {def}</dd>
            </div>
          ))}
        </dl>

        <h3 className="font-display text-ink mt-6" style={{ fontSize: 15, fontWeight: 600 }}>
          C.2 Primary References
        </h3>
        <ul className="mt-3 font-body text-ink pl-5 space-y-1" style={{ fontSize: 11, lineHeight: 1.55, listStyle: "square" }}>
          <li>International Finance Corporation (2012). <em>Performance Standards on Environmental and Social Sustainability</em>. Effective 1 January 2012.</li>
          <li>International Finance Corporation (2012). <em>Guidance Notes to the Performance Standards</em>.</li>
          <li>World Bank Group. <em>Environmental, Health and Safety Guidelines</em> (General and industry-specific).</li>
          <li>IFC Handbook for Land Acquisition and Involuntary Resettlement.</li>
          <li>UN Guiding Principles on Business and Human Rights (2011).</li>
          <li>OECD Due Diligence Guidance for Responsible Business Conduct (2018).</li>
          <li>Voluntary Principles on Security and Human Rights.</li>
          <li>UN Declaration on the Rights of Indigenous Peoples (2007).</li>
          <li>IUCN Red List of Threatened Species (current edition).</li>
          <li>Equator Principles (EP4, 2020).</li>
          <li>Relevant Indonesian legislation (UU 32/2009 PPLH; UU 5/1960 Agraria; UU 39/1999 HAM; Permen LHK on AMDAL; Permen ESDM 26/2018; etc.).</li>
        </ul>

        <div className="mt-10 p-5 border border-ink" style={{ background: "rgba(13,27,42,0.03)" }}>
          <div className="small-caps text-gold" style={{ fontSize: 10 }}>Important Notice</div>
          <p className="font-body text-ink italic mt-2" style={{ fontSize: 11, lineHeight: 1.6 }}>
            This report is a diagnostic self-assessment prepared using A+CSR Indonesia's proprietary
            assessment instrument. It reflects information provided by the client and does not
            constitute an independent audit, certification, or assurance opinion. Findings should
            be used to inform internal improvement planning and preparation for subsequent
            independent review. A+CSR accepts no liability to third parties who may rely upon the
            contents of this report.
          </p>
        </div>

        <div className="mt-10 text-center">
          <MastheadRule />
          <div className="serial-number mt-2" style={{ fontSize: 10 }}>
            — End of Comprehensive Report —
          </div>
          <div className="font-display italic text-mute mt-2" style={{ fontSize: 11 }}>
            Prepared by A+CSR Indonesia · Jakarta · Bogor
          </div>
        </div>
      </div>
    </div>
  );
}
