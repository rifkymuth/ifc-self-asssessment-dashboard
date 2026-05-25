import { useMemo, useState } from "react";
import { PS_META } from "../data/psMeta";
import { INDICATORS } from "../data/indicators";
import { SCORE_LEVELS } from "../data/scoreLevels";
import { computePSScore, getMaturityLabel } from "../lib/scoring";

function ScoreButtons({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {SCORE_LEVELS.map((lvl) => {
        const active = value === lvl.value;
        return (
          <button
            key={lvl.value}
            onClick={() => onChange(lvl.value)}
            className={`score-btn ${active ? `active-${lvl.value}` : ""}`}
            title={lvl.desc}
          >
            {lvl.value} · {lvl.short}
          </button>
        );
      })}
      <button
        onClick={() => onChange("NA")}
        className={`score-btn ${value === "NA" ? "active-na" : ""}`}
        title="Not applicable to this project"
      >
        N/A
      </button>
    </div>
  );
}

function IndicatorRow({ indicator, response, onChange }) {
  const [showNotes, setShowNotes] = useState(false);
  const hasContent = response?.notes || response?.evidence;

  const handleScore = (score) => {
    onChange(indicator.id, { ...response, score });
  };

  const handleField = (field, val) => {
    onChange(indicator.id, { ...response, [field]: val });
  };

  return (
    <div className="indicator-row border-b border-rule" style={{ borderBottomColor: "rgba(13,27,42,0.08)" }}>
      <div className="py-5 px-5">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0" style={{ width: 60 }}>
            <div className="serial-number" style={{ fontSize: 10 }}>
              {indicator.id}
            </div>
            <div className="small-caps text-gold mt-1" style={{ fontSize: 9 }}>
              {indicator.ref}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-body text-ink" style={{ fontSize: 13, lineHeight: 1.55 }}>
              {indicator.text}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-mute font-body italic" style={{ fontSize: 11 }}>
                Guidance
              </summary>
              <p className="font-body text-mute mt-1 pl-3 border-l border-gold" style={{ fontSize: 11, lineHeight: 1.5 }}>
                {indicator.guidance}
              </p>
            </details>
          </div>
          <div className="flex-shrink-0">
            <ScoreButtons value={response?.score} onChange={handleScore} />
            <button
              onClick={() => setShowNotes((s) => !s)}
              className="small-caps text-mute mt-2 hover:text-ink"
              style={{ fontSize: 9 }}
            >
              {showNotes ? "− Hide" : "+ Add"} Notes & Evidence {hasContent && "●"}
            </button>
          </div>
        </div>
        {showNotes && (
          <div className="mt-4 grid grid-cols-2 gap-4 pl-16">
            <div>
              <label className="small-caps text-mute" style={{ fontSize: 9 }}>
                Findings / Notes
              </label>
              <textarea
                rows={3}
                value={response?.notes || ""}
                onChange={(e) => handleField("notes", e.target.value)}
                placeholder="Observations, assessor notes, interview findings..."
                style={{ marginTop: 4, fontSize: 12 }}
              />
            </div>
            <div>
              <label className="small-caps text-mute" style={{ fontSize: 9 }}>
                Evidence / Document Reference
              </label>
              <textarea
                rows={3}
                value={response?.evidence || ""}
                onChange={(e) => handleField("evidence", e.target.value)}
                placeholder="Policy doc ref, procedure ID, records reviewed..."
                style={{ marginTop: 4, fontSize: 12 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssessmentPage({ responses, onResponseChange, activePS, setActivePS }) {
  const indicators = useMemo(() => INDICATORS.filter((i) => i.ps === activePS), [activePS]);
  const psScore = computePSScore(responses, activePS);
  const meta = PS_META[activePS];

  const sections = useMemo(() => {
    const map = new Map();
    indicators.forEach((i) => {
      if (!map.has(i.section)) map.set(i.section, []);
      map.get(i.section).push(i);
    });
    return Array.from(map.entries());
  }, [indicators]);

  const handleChange = (id, payload) => {
    onResponseChange(id, payload);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <span className="small-caps text-mute mr-2" style={{ fontSize: 10 }}>Jump to PS:</span>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
          const active = n === activePS;
          const s = computePSScore(responses, n);
          return (
            <button
              key={n}
              onClick={() => setActivePS(n)}
              className="px-3 py-2 font-body"
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                background: active ? "var(--ink)" : "var(--paper)",
                color: active ? "var(--paper)" : "var(--ink)",
                border: active ? "1px solid var(--ink)" : "1px solid rgba(13,27,42,0.2)",
                transition: "all 0.15s",
              }}
            >
              PS {n}
              {s.answered > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 9,
                    color: active ? "var(--gold-soft)" : "var(--gold)",
                  }}
                >
                  {s.avg.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-paper border border-rule ink-shadow">
        <div className="bg-ink text-paper p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="small-caps" style={{ fontSize: 10, color: "var(--gold-soft)" }}>
                Performance Standard {activePS}
              </div>
              <h2 className="font-display mt-1" style={{ fontSize: 26, fontWeight: 400, color: "var(--paper)", letterSpacing: "-0.01em", maxWidth: 720, lineHeight: 1.15 }}>
                {meta.title}
              </h2>
            </div>
            <div className="text-right">
              <div className="small-caps" style={{ fontSize: 9, color: "var(--gold-soft)" }}>Section Maturity</div>
              <div className="font-display" style={{ fontSize: 36, fontWeight: 300, lineHeight: 1, color: "var(--paper)" }}>
                {psScore.avg.toFixed(2)}
              </div>
              <div className="font-display italic" style={{ fontSize: 12, color: "var(--gold-soft)" }}>
                {getMaturityLabel(psScore.avg).label}
              </div>
              <div className="small-caps mt-2" style={{ fontSize: 9, color: "var(--mute-2)" }}>
                {psScore.answered + psScore.naCount}/{psScore.total} answered
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 hairline" style={{ fontSize: 10, background: "rgba(184,145,81,0.05)" }}>
          <div className="small-caps text-mute" style={{ fontSize: 9, marginBottom: 4 }}>Scoring Guide</div>
          <div className="flex gap-6 flex-wrap text-mute font-body" style={{ fontSize: 10 }}>
            {SCORE_LEVELS.map((lvl) => (
              <span key={lvl.value}>
                <strong className="text-ink">{lvl.value}</strong> {lvl.label} — {lvl.desc}
              </span>
            ))}
          </div>
        </div>

        {sections.map(([sectionName, items]) => (
          <div key={sectionName}>
            <div className="px-5 py-3" style={{ background: "var(--parchment)", borderTop: "1px solid rgba(13,27,42,0.08)" }}>
              <div className="small-caps text-ink font-body" style={{ fontSize: 11, fontWeight: 600 }}>
                {sectionName}
              </div>
            </div>
            {items.map((ind) => (
              <IndicatorRow
                key={ind.id}
                indicator={ind}
                response={responses[ind.id]}
                onChange={handleChange}
              />
            ))}
          </div>
        ))}

        <div className="p-6 hairline-t flex items-center justify-between">
          <button
            onClick={() => setActivePS(Math.max(1, activePS - 1))}
            disabled={activePS === 1}
            className="btn-ghost"
            style={{ opacity: activePS === 1 ? 0.3 : 1 }}
          >
            ← Previous PS
          </button>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>
            PS {activePS} of 8
          </div>
          <button
            onClick={() => setActivePS(Math.min(8, activePS + 1))}
            disabled={activePS === 8}
            className="btn-primary"
            style={{ opacity: activePS === 8 ? 0.3 : 1 }}
          >
            Next PS →
          </button>
        </div>
      </div>
    </div>
  );
}
