import { useState } from "react";
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
import { DEFAULT_META } from "../data/defaults";
import { computePSScore, computeOverall, getMaturityLabel } from "../lib/scoring";

function RadarView({ responses }) {
  const data = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
    const s = computePSScore(responses, n);
    return {
      ps: PS_META[n].abbr,
      fullName: PS_META[n].code,
      score: s.avg,
      fullMark: 4,
    };
  });

  return (
    <div className="bg-paper border border-rule p-6 ink-shadow">
      <div className="small-caps text-mute mb-1" style={{ fontSize: 10 }}>Fig. I</div>
      <h3 className="font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
        Maturity Profile
      </h3>
      <p className="font-body text-mute italic" style={{ fontSize: 11, marginBottom: 12 }}>
        Average score across 8 Performance Standards (0–4 scale)
      </p>
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(13,27,42,0.15)" />
            <PolarAngleAxis
              dataKey="ps"
              tick={{ fill: "var(--ink)", fontSize: 11, fontFamily: "Inter", fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 4]}
              tick={{ fill: "var(--mute)", fontSize: 9 }}
              stroke="rgba(13,27,42,0.2)"
            />
            <Radar
              name="Maturity"
              dataKey="score"
              stroke="var(--ink)"
              fill="var(--gold)"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PSCard({ psNum, responses, onClick }) {
  const meta = PS_META[psNum];
  const score = computePSScore(responses, psNum);
  const mat = getMaturityLabel(score.avg);
  const pct = score.total > 0 ? ((score.answered + score.naCount) / score.total) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className="text-left bg-paper border border-rule p-5 ink-shadow hover:border-ink transition-all group"
      style={{ minHeight: 180 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="small-caps text-gold" style={{ fontSize: 10 }}>{meta.code}</div>
          <div className="font-display text-ink mt-1" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2 }}>
            {meta.short}
          </div>
        </div>
        <div className="font-display text-ink" style={{ fontSize: 28, fontWeight: 300 }}>
          {score.avg.toFixed(1)}
          <span className="text-mute-2" style={{ fontSize: 12 }}>/4</span>
        </div>
      </div>
      <div className="hairline mb-3" />
      <div className="flex items-center justify-between" style={{ fontSize: 10 }}>
        <span className={`small-caps ${mat.cls}`}>{mat.label}</span>
        <span className="text-mute">{score.answered + score.naCount}/{score.total} answered</span>
      </div>
      <div className="mt-3" style={{ height: 3, background: "rgba(13,27,42,0.08)" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: mat.color,
            transition: "width 0.3s",
          }}
        />
      </div>
      <div className="mt-4 small-caps text-mute group-hover:text-ink" style={{ fontSize: 9 }}>
        Open assessment →
      </div>
    </button>
  );
}

const profileSelectStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  padding: "8px 10px",
  width: "100%",
  background: "var(--paper)",
  color: "var(--ink)",
  border: "1px solid rgba(13,27,42,0.2)",
  outline: "none",
  cursor: "pointer",
};

export default function DashboardPage({ responses, setPage, setActivePS, meta, setMeta, setResponses, clearAll, projectId }) {
  const overall = computeOverall(responses);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const copyProjectId = async () => {
    if (!projectId) return;
    try {
      await navigator.clipboard.writeText(projectId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const exportJSON = () => {
    const blob = { projectId, meta, responses, exportedAt: new Date().toISOString(), version: "1.0" };
    const str = JSON.stringify(blob, null, 2);
    const file = new Blob([str], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ifc-ps-assessment-${(meta.projectName || "project").replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.meta) setMeta({ ...DEFAULT_META, ...parsed.meta, companyProfile: { ...DEFAULT_META.companyProfile, ...(parsed.meta.companyProfile || {}) } });
      if (parsed.responses) setResponses(parsed.responses);
      setImportMsg("Import successful.");
      setImportText("");
    } catch (err) {
      setImportMsg("Import failed: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ I</div>
        <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Project Identification
        </h2>
        <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 640 }}>
          Project metadata is included in the exported report and persists across sessions.
        </p>
        {projectId && (
          <div
            className="mt-4 inline-flex items-center gap-3 border border-ink bg-paper"
            style={{ padding: "8px 14px" }}
          >
            <span className="small-caps text-mute" style={{ fontSize: 9, letterSpacing: "0.14em" }}>
              Project Code
            </span>
            <span className="font-display text-ink" style={{ fontSize: 18, letterSpacing: "0.12em", fontWeight: 500 }}>
              {projectId}
            </span>
            <button
              onClick={copyProjectId}
              className="small-caps"
              style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--gold)" }}
              title="Copy code to share for collaborative editing"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-paper border border-rule p-6 ink-shadow mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Project Name</span>
            <input
              type="text"
              value={meta.projectName}
              onChange={(e) => setMeta({ ...meta, projectName: e.target.value })}
              placeholder="e.g., Blok Pomalaa Nickel Operations"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Client / Company</span>
            <input
              type="text"
              value={meta.clientName}
              onChange={(e) => setMeta({ ...meta, clientName: e.target.value })}
              placeholder="e.g., PT Vale Indonesia Tbk"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Sector / Sub-sector</span>
            <input
              type="text"
              value={meta.sector}
              onChange={(e) => setMeta({ ...meta, sector: e.target.value })}
              placeholder="e.g., Nickel mining & processing"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Location</span>
            <input
              type="text"
              value={meta.location}
              onChange={(e) => setMeta({ ...meta, location: e.target.value })}
              placeholder="e.g., Kolaka, Southeast Sulawesi"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Lead Assessor</span>
            <input
              type="text"
              value={meta.assessorName}
              onChange={(e) => setMeta({ ...meta, assessorName: e.target.value })}
              placeholder="e.g., Noviansyah Manap, MD A+CSR"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Assessment Date</span>
            <input
              type="date"
              value={meta.assessmentDate}
              onChange={(e) => setMeta({ ...meta, assessmentDate: e.target.value })}
            />
          </label>
        </div>

        <div className="hairline my-6" />

        <div className="mb-4">
          <div className="small-caps text-gold" style={{ fontSize: 10, letterSpacing: "0.14em" }}>
            Company Profile
          </div>
          <p className="font-body text-mute italic mt-1" style={{ fontSize: 12, maxWidth: 640 }}>
            Used to tailor ESAP action items to the client's actual context. The richer this profile,
            the more useful AI-refined actions will be.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Country</span>
            <input
              type="text"
              value={meta.companyProfile?.country || ""}
              onChange={(e) => setMeta({ ...meta, companyProfile: { ...meta.companyProfile, country: e.target.value } })}
              placeholder="e.g., Indonesia"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Employee Count</span>
            <select
              value={meta.companyProfile?.employeeCount || ""}
              onChange={(e) => setMeta({ ...meta, companyProfile: { ...meta.companyProfile, employeeCount: e.target.value } })}
              style={profileSelectStyle}
            >
              <option value="">— select —</option>
              <option value="<50">Fewer than 50</option>
              <option value="50–250">50 – 250</option>
              <option value="251–1000">251 – 1,000</option>
              <option value="1001–5000">1,001 – 5,000</option>
              <option value=">5000">More than 5,000</option>
            </select>
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Current ESMS Maturity</span>
            <select
              value={meta.companyProfile?.esmsMaturity || ""}
              onChange={(e) => setMeta({ ...meta, companyProfile: { ...meta.companyProfile, esmsMaturity: e.target.value } })}
              style={profileSelectStyle}
            >
              <option value="">— select —</option>
              {SCORE_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.label}>{lvl.label} — {lvl.desc}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Implementation Budget Tier</span>
            <select
              value={meta.companyProfile?.budgetTier || ""}
              onChange={(e) => setMeta({ ...meta, companyProfile: { ...meta.companyProfile, budgetTier: e.target.value } })}
              style={profileSelectStyle}
            >
              <option value="">— select —</option>
              <option value="Constrained">Constrained — minimal discretionary budget</option>
              <option value="Moderate">Moderate — funded compliance program</option>
              <option value="Substantial">Substantial — well-resourced sustainability function</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Existing Certifications & Frameworks</span>
            <input
              type="text"
              value={meta.companyProfile?.certifications || ""}
              onChange={(e) => setMeta({ ...meta, companyProfile: { ...meta.companyProfile, certifications: e.target.value } })}
              placeholder="e.g., ISO 14001, ISO 45001, RSPO, ICMM commitments"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Operating Context</span>
            <textarea
              rows={3}
              value={meta.companyProfile?.operatingContext || ""}
              onChange={(e) => setMeta({ ...meta, companyProfile: { ...meta.companyProfile, operatingContext: e.target.value } })}
              placeholder="Community sensitivities, recent incidents, regulatory pressure, indigenous peoples, biodiversity context, etc."
            />
          </label>
        </div>
      </div>

      <div className="mb-8">
        <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ II</div>
        <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Diagnostic Overview
        </h2>
        <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 640 }}>
          A structured appraisal of the client's alignment with the IFC Performance Standards on
          Environmental and Social Sustainability (2012), covering all eight Standards across {INDICATORS.length}{" "}
          indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <RadarView responses={responses} />
        </div>

        <div className="bg-ink text-paper p-6 flex flex-col">
          <div className="small-caps" style={{ color: "var(--gold-soft)", fontSize: 10 }}>Executive Summary</div>
          <h3 className="font-display mt-1" style={{ fontSize: 22, fontWeight: 400, color: "var(--paper)" }}>
            At a glance
          </h3>
          <div className="my-5" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }} />
          <div className="space-y-5 flex-1">
            <div>
              <div className="small-caps" style={{ fontSize: 9, color: "var(--gold-soft)" }}>
                Overall Maturity Index
              </div>
              <div className="font-display" style={{ fontSize: 42, fontWeight: 300, color: "var(--paper)", lineHeight: 1 }}>
                {overall.avg.toFixed(2)}
                <span style={{ fontSize: 16, color: "var(--mute-2)" }}> /4.00</span>
              </div>
              <div className="font-display italic mt-1" style={{ fontSize: 14, color: "var(--gold-soft)" }}>
                {getMaturityLabel(overall.avg).label}
              </div>
            </div>
            <div>
              <div className="small-caps" style={{ fontSize: 9, color: "var(--gold-soft)" }}>
                Assessment Completion
              </div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 300, color: "var(--paper)" }}>
                {overall.completion.toFixed(0)}%
              </div>
              <div className="mt-2" style={{ height: 4, background: "rgba(255,255,255,0.15)" }}>
                <div style={{ width: `${overall.completion}%`, height: "100%", background: "var(--gold)", transition: "width 0.3s" }} />
              </div>
            </div>
          </div>
          <button
            onClick={() => setPage("assessment")}
            className="mt-6 py-3 font-body"
            style={{
              background: "var(--gold)",
              color: "var(--ink)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Begin / Continue Assessment
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ III</div>
          <h3 className="font-display text-ink" style={{ fontSize: 22, fontWeight: 500 }}>
            The Eight Performance Standards
          </h3>
        </div>
        <div className="serial-number">click to enter</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <PSCard
            key={n}
            psNum={n}
            responses={responses}
            onClick={() => {
              setActivePS(n);
              setPage("assessment");
            }}
          />
        ))}
      </div>

      <div className="mb-4">
        <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ IV</div>
        <h3 className="font-display text-ink" style={{ fontSize: 22, fontWeight: 500 }}>
          Data Management
        </h3>
      </div>

      <div className="bg-paper border border-rule p-6 ink-shadow">
        <p className="font-body text-mute italic mb-4" style={{ fontSize: 12 }}>
          Your assessment is saved to the shared backend under its project code. Share the code above
          to let others edit collaboratively, or use the controls below to back up or transfer the
          assessment as JSON.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportJSON} className="btn-primary">Export JSON</button>
          <button
            onClick={() => {
              if (confirm("Clear all responses and metadata? This cannot be undone.")) clearAll();
            }}
            className="btn-ghost"
            style={{ borderColor: "var(--crimson)", color: "var(--crimson)" }}
          >
            Clear All
          </button>
        </div>
        <div className="mt-5">
          <label className="small-caps text-mute block" style={{ fontSize: 9 }}>Import from JSON</label>
          <textarea
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Paste previously exported JSON here...'
            style={{ fontFamily: "monospace", fontSize: 11, marginTop: 4 }}
          />
          <div className="flex gap-3 mt-2 items-center">
            <button onClick={doImport} className="btn-ghost" disabled={!importText}>Import</button>
            {importMsg && (
              <span
                className="font-body italic"
                style={{
                  fontSize: 11,
                  color: importMsg.startsWith("Import successful") ? "var(--sage)" : "var(--crimson)",
                }}
              >
                {importMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
