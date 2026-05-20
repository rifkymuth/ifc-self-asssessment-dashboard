import { useState } from "react";
import { PS_META } from "../data/psMeta";
import { INDICATORS } from "../data/indicators";
import { computePSScore, computeOverall, getMaturityLabel, narrativeFor } from "../lib/scoring";

const buildSectionStats = (responses, psNumber) => {
  const psInds = INDICATORS.filter((i) => i.ps === psNumber);
  const sectionMap = new Map();
  psInds.forEach((ind) => {
    if (!sectionMap.has(ind.section)) {
      sectionMap.set(ind.section, { indicators: [], scores: [], gaps: 0, strengths: 0, na: 0 });
    }
    const bucket = sectionMap.get(ind.section);
    bucket.indicators.push(ind);
    const r = responses[ind.id];
    if (r?.score === "NA") bucket.na += 1;
    else if (typeof r?.score === "number") {
      bucket.scores.push(r.score);
      if (r.score <= 1) bucket.gaps += 1;
      if (r.score === 4) bucket.strengths += 1;
    }
  });
  return Array.from(sectionMap.entries()).map(([name, b]) => ({
    name,
    indicators: b.indicators,
    total: b.indicators.length,
    answered: b.scores.length,
    naCount: b.na,
    avg: b.scores.length > 0 ? b.scores.reduce((a, s) => a + s, 0) / b.scores.length : 0,
    gaps: b.gaps,
    strengths: b.strengths,
  }));
};

const buildDistribution = (responses, psNumber) => {
  const psInds = INDICATORS.filter((i) => i.ps === psNumber);
  const dist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, NA: 0, unanswered: 0 };
  psInds.forEach((ind) => {
    const r = responses[ind.id];
    if (!r || r.score === undefined || r.score === null) dist.unanswered += 1;
    else if (r.score === "NA") dist.NA += 1;
    else dist[r.score] += 1;
  });
  return dist;
};

function MaturityGauge({ value, size = 140, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / 4));
  const offset = circumference * (1 - pct);
  const color =
    value >= 3.5 ? "var(--ink)" :
    value >= 2.5 ? "var(--sage)" :
    value >= 1.5 ? "var(--amber)" :
    value > 0 ? "var(--crimson)" : "var(--mute-2)";

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(13,27,42,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {[1, 2, 3].map((t) => {
          const angle = (t / 4) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = size / 2 + (radius - strokeWidth / 2 - 2) * Math.cos(rad);
          const y1 = size / 2 + (radius - strokeWidth / 2 - 2) * Math.sin(rad);
          const x2 = size / 2 + (radius + strokeWidth / 2 + 2) * Math.cos(rad);
          const y2 = size / 2 + (radius + strokeWidth / 2 + 2) * Math.sin(rad);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--mute-2)" strokeWidth={1} />;
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="font-display" style={{ fontSize: size * 0.3, fontWeight: 300, color: "var(--ink)", lineHeight: 1 }}>
          {value.toFixed(1)}
        </div>
        <div className="small-caps text-mute-2" style={{ fontSize: size * 0.08, marginTop: 2 }}>
          / 4.00
        </div>
      </div>
    </div>
  );
}

function PSScoreCard({ psNumber, responses, onNavigateAssessment, isPrintable = false }) {
  const meta = PS_META[psNumber];
  const score = computePSScore(responses, psNumber);
  const mat = getMaturityLabel(score.avg);
  const sections = buildSectionStats(responses, psNumber);
  const dist = buildDistribution(responses, psNumber);

  const psIndicators = INDICATORS.filter((i) => i.ps === psNumber);
  const highGaps = psIndicators.filter((i) => {
    const r = responses[i.id];
    return typeof r?.score === "number" && r.score <= 1;
  });
  const mediumGaps = psIndicators.filter((i) => {
    const r = responses[i.id];
    return typeof r?.score === "number" && r.score === 2;
  });
  const strengths = psIndicators.filter((i) => responses[i.id]?.score === 4);

  const coverage = score.total > 0 ? ((score.answered + score.naCount) / score.total) * 100 : 0;

  return (
    <div className="bg-paper border-2 border-ink ink-shadow print-break-inside-avoid" style={{ pageBreakInside: "avoid" }}>
      <div className="bg-ink text-paper px-6 py-5 flex items-start justify-between">
        <div>
          <div className="small-caps" style={{ fontSize: 10, color: "var(--gold-soft)", letterSpacing: "0.2em" }}>
            Performance Standard {psNumber} · Scorecard
          </div>
          <div className="font-display mt-1" style={{ fontSize: 22, fontWeight: 500, color: "var(--paper)", lineHeight: 1.15, maxWidth: 520 }}>
            {meta.title}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="serial-number" style={{ color: "var(--mute-2)", fontSize: 10 }}>
            PS-{String(psNumber).padStart(2, "0")}
          </div>
          <div className="font-display italic mt-1" style={{ fontSize: 12, color: "var(--gold-soft)" }}>
            {mat.label}
          </div>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col md:flex-row items-center items-center gap-6 hairline">
        <MaturityGauge value={score.avg} size={140} />
        <div className="flex-1 grid grid-cols-4 gap-4">
          <div>
            <div className="small-caps text-mute" style={{ fontSize: 9 }}>Coverage</div>
            <div className="font-display text-ink" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>
              {coverage.toFixed(0)}<span className="text-mute-2" style={{ fontSize: 12 }}>%</span>
            </div>
            <div className="text-mute" style={{ fontSize: 10 }}>
              {score.answered + score.naCount}/{score.total} items
            </div>
          </div>
          <div>
            <div className="small-caps" style={{ fontSize: 9, color: "var(--crimson)" }}>High Gaps</div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1, color: highGaps.length > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
              {highGaps.length}
            </div>
            <div className="text-mute" style={{ fontSize: 10 }}>score 0–1</div>
          </div>
          <div>
            <div className="small-caps" style={{ fontSize: 9, color: "var(--amber)" }}>Medium Gaps</div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1, color: mediumGaps.length > 0 ? "var(--amber)" : "var(--mute-2)" }}>
              {mediumGaps.length}
            </div>
            <div className="text-mute" style={{ fontSize: 10 }}>score 2</div>
          </div>
          <div>
            <div className="small-caps text-sage" style={{ fontSize: 9 }}>Strengths</div>
            <div className="font-display text-sage" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>
              {strengths.length}
            </div>
            <div className="text-mute" style={{ fontSize: 10 }}>score 4</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 hairline" style={{ background: "rgba(184,145,81,0.03)" }}>
        <div className="small-caps text-mute mb-2" style={{ fontSize: 9 }}>Score Distribution</div>
        <div className="flex items-center gap-1" style={{ height: 24 }}>
          {[
            { key: 0, color: "#E8B4A8", label: "0" },
            { key: 1, color: "#E89E8E", label: "1" },
            { key: 2, color: "#E8C878", label: "2" },
            { key: 3, color: "#B5C88A", label: "3" },
            { key: 4, color: "var(--ink)", label: "4" },
            { key: "NA", color: "#D8D2C4", label: "N/A" },
            { key: "unanswered", color: "#F0EBDF", label: "—" },
          ].map((bucket) => {
            const count = dist[bucket.key];
            const pct = score.total > 0 ? (count / score.total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={bucket.key}
                title={`Score ${bucket.label}: ${count} indicator(s)`}
                style={{
                  flex: pct,
                  height: "100%",
                  background: bucket.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 600,
                  color: bucket.key === 4 ? "var(--paper)" : "var(--ink)",
                  fontFamily: "Inter",
                  minWidth: count > 0 ? 20 : 0,
                }}
              >
                {count}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap" style={{ fontSize: 9 }}>
          {[
            { color: "#E8B4A8", label: "0 · Not Started" },
            { color: "#E89E8E", label: "1 · Initial" },
            { color: "#E8C878", label: "2 · Developing" },
            { color: "#B5C88A", label: "3 · Established" },
            { color: "var(--ink)", label: "4 · Advanced" },
            { color: "#D8D2C4", label: "N/A" },
            { color: "#F0EBDF", label: "Unanswered" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1 text-mute">
              <span style={{ display: "inline-block", width: 10, height: 10, background: item.color, border: "1px solid rgba(13,27,42,0.15)" }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-5 hairline">
        <div className="small-caps text-mute mb-3" style={{ fontSize: 9 }}>Section-Level Breakdown</div>
        <table className="w-full" style={{ fontSize: 11 }}>
          <thead>
            <tr className="hairline">
              <th className="text-left py-1 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Section</th>
              <th className="text-center py-1 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600, width: 60 }}>Score</th>
              <th className="text-center py-1 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600, width: 60 }}>Items</th>
              <th className="text-center py-1 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600, width: 50 }}>Gaps</th>
              <th className="text-left py-1 small-caps text-mute pl-3" style={{ fontSize: 9, fontWeight: 600, width: 140 }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => {
              const secMat = getMaturityLabel(s.avg);
              const secPct = s.total > 0 ? ((s.answered + s.naCount) / s.total) * 100 : 0;
              return (
                <tr key={s.name} style={{ borderBottom: "1px solid rgba(13,27,42,0.06)" }}>
                  <td className="py-2 text-ink">{s.name}</td>
                  <td className="text-center py-2">
                    {s.answered > 0 ? (
                      <span className={`font-display ${secMat.cls}`} style={{ fontSize: 14, fontWeight: 500 }}>
                        {s.avg.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-mute-2" style={{ fontSize: 11 }}>—</span>
                    )}
                  </td>
                  <td className="text-center py-2 text-mute" style={{ fontSize: 10 }}>
                    {s.answered + s.naCount}/{s.total}
                  </td>
                  <td className="text-center py-2" style={{ color: s.gaps > 0 ? "var(--crimson)" : "var(--mute-2)", fontWeight: 500 }}>
                    {s.gaps > 0 ? s.gaps : "—"}
                  </td>
                  <td className="py-2 pl-3">
                    <div style={{ height: 4, background: "rgba(13,27,42,0.08)", borderRadius: 2 }}>
                      <div
                        style={{
                          width: `${secPct}%`,
                          height: "100%",
                          background: secMat.color,
                          borderRadius: 2,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(highGaps.length > 0 || strengths.length > 0) && (
        <div className="px-6 py-5 hairline grid grid-cols-2 gap-6">
          <div>
            <div className="small-caps mb-2" style={{ fontSize: 9, color: highGaps.length > 0 ? "var(--crimson)" : "var(--mute)" }}>
              Top High-Priority Gaps
            </div>
            {highGaps.length === 0 ? (
              <div className="text-sage italic font-body" style={{ fontSize: 11 }}>
                No high-priority gaps identified.
              </div>
            ) : (
              <ul className="space-y-2">
                {highGaps.slice(0, 5).map((ind) => {
                  const r = responses[ind.id];
                  return (
                    <li key={ind.id} className="flex gap-2" style={{ fontSize: 11, lineHeight: 1.45 }}>
                      <span
                        className="font-display flex-shrink-0"
                        style={{ fontSize: 13, fontWeight: 500, color: "var(--crimson)", minWidth: 18 }}
                      >
                        {r.score}
                      </span>
                      <div className="flex-1">
                        <span className="serial-number" style={{ fontSize: 9 }}>{ind.id}</span>{" "}
                        <span className="text-gold" style={{ fontSize: 9 }}>{ind.ref}</span>
                        <div className="text-ink">
                          {ind.text.substring(0, 130)}{ind.text.length > 130 ? "…" : ""}
                        </div>
                      </div>
                    </li>
                  );
                })}
                {highGaps.length > 5 && (
                  <li className="text-mute italic" style={{ fontSize: 10 }}>
                    + {highGaps.length - 5} more high-priority gap(s)
                  </li>
                )}
              </ul>
            )}
          </div>

          <div>
            <div className="small-caps text-sage mb-2" style={{ fontSize: 9 }}>
              Areas of Strength
            </div>
            {strengths.length === 0 ? (
              <div className="text-mute italic font-body" style={{ fontSize: 11 }}>
                No Advanced-level (score 4) indicators identified yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {strengths.slice(0, 5).map((ind) => (
                  <li key={ind.id} className="flex gap-2" style={{ fontSize: 11, lineHeight: 1.45 }}>
                    <span
                      className="font-display flex-shrink-0"
                      style={{ fontSize: 13, fontWeight: 500, color: "var(--sage)", minWidth: 18 }}
                    >
                      4
                    </span>
                    <div className="flex-1">
                      <span className="serial-number" style={{ fontSize: 9 }}>{ind.id}</span>{" "}
                      <span className="text-gold" style={{ fontSize: 9 }}>{ind.ref}</span>
                      <div className="text-ink">
                        {ind.text.substring(0, 130)}{ind.text.length > 130 ? "…" : ""}
                      </div>
                    </div>
                  </li>
                ))}
                {strengths.length > 5 && (
                  <li className="text-mute italic" style={{ fontSize: 10 }}>
                    + {strengths.length - 5} more strength(s)
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="px-6 py-5" style={{ background: "var(--parchment)" }}>
        <div className="small-caps text-gold mb-2" style={{ fontSize: 9 }}>Verdict</div>
        <p className="font-display italic text-ink" style={{ fontSize: 13, lineHeight: 1.55 }}>
          {narrativeFor(score).verdict}.
        </p>
        <p className="font-body text-mute mt-2" style={{ fontSize: 11, lineHeight: 1.6 }}>
          {narrativeFor(score).narrative}
        </p>
        {!isPrintable && onNavigateAssessment && (
          <button
            onClick={() => onNavigateAssessment(psNumber)}
            className="btn-ghost mt-3 no-print"
            style={{ fontSize: 10, padding: "6px 12px" }}
          >
            Open Assessment for PS {psNumber} →
          </button>
        )}
      </div>
    </div>
  );
}

export default function ScorecardsPage({ responses, setPage, setActivePS }) {
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPS, setSelectedPS] = useState(1);
  const overall = computeOverall(responses);

  const handleOpenAssessment = (psNumber) => {
    setActivePS(psNumber);
    setPage("assessment");
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-6 flex flex-wrap-reverse items-start justify-between gap-4 no-print">
        <div>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ IV</div>
          <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
            Performance Standard Scorecards
          </h2>
          <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 640 }}>
            Individual scorecard for each of the eight Performance Standards — maturity gauge, section
            breakdown, score distribution, priority findings, and verdict. Printable page-per-PS.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="small-caps text-mute mr-2" style={{ fontSize: 10 }}>View:</div>
          <button
            onClick={() => setViewMode("grid")}
            className="px-3 py-2 font-body"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: viewMode === "grid" ? "var(--ink)" : "var(--paper)",
              color: viewMode === "grid" ? "var(--paper)" : "var(--ink)",
              border: "1px solid var(--ink)",
            }}
          >
            All Scorecards
          </button>
          <button
            onClick={() => setViewMode("detail")}
            className="px-3 py-2 font-body"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: viewMode === "detail" ? "var(--ink)" : "var(--paper)",
              color: viewMode === "detail" ? "var(--paper)" : "var(--ink)",
              border: "1px solid var(--ink)",
            }}
          >
            Detail View
          </button>
          <button onClick={() => window.print()} className="btn-primary ml-2">
            Print
          </button>
        </div>
      </div>

      <div className="bg-ink text-paper px-6 py-4 mb-6 gap-6 flex flex-col md:flex-row items-center justify-between no-print">
        <div>
          <div className="small-caps" style={{ fontSize: 10, color: "var(--gold-soft)" }}>Portfolio Summary</div>
          <div className="font-display mt-1" style={{ fontSize: 14, color: "var(--paper)" }}>
            Overall Maturity: <strong style={{ fontSize: 18 }}>{overall.avg.toFixed(2)}</strong> / 4.00{" "}
            <span className="italic" style={{ color: "var(--gold-soft)", fontSize: 13 }}>
              ({getMaturityLabel(overall.avg).label})
            </span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-6" style={{ fontSize: 11 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
            const s = computePSScore(responses, n);
            return (
              <button
                key={n}
                onClick={() => {
                  setSelectedPS(n);
                  setViewMode("detail");
                }}
                className="text-center hover:opacity-80"
                style={{ minWidth: 36 }}
              >
                <div className="small-caps" style={{ fontSize: 9, color: "var(--gold-soft)" }}>PS {n}</div>
                <div className="font-display" style={{ fontSize: 16, color: "var(--paper)" }}>
                  {s.avg.toFixed(1)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === "detail" ? (
        <div>
          <div className="mb-5 flex items-center gap-2 flex-wrap no-print">
            <span className="small-caps text-mute mr-2" style={{ fontSize: 10 }}>Select PS:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
              const active = n === selectedPS;
              const s = computePSScore(responses, n);
              const mat = getMaturityLabel(s.avg);
              return (
                <button
                  key={n}
                  onClick={() => setSelectedPS(n)}
                  className="px-3 py-2 font-body flex items-baseline gap-2"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    background: active ? "var(--ink)" : "var(--paper)",
                    color: active ? "var(--paper)" : "var(--ink)",
                    border: active ? "1px solid var(--ink)" : "1px solid rgba(13,27,42,0.2)",
                  }}
                >
                  <span>PS {n}</span>
                  <span style={{ fontSize: 9, color: active ? "var(--gold-soft)" : mat.color }}>
                    {s.avg > 0 ? s.avg.toFixed(1) : "—"}
                  </span>
                </button>
              );
            })}
          </div>

          <PSScoreCard
            psNumber={selectedPS}
            responses={responses}
            onNavigateAssessment={handleOpenAssessment}
            isPrintable={false}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="print-page">
              <PSScoreCard
                psNumber={n}
                responses={responses}
                onNavigateAssessment={handleOpenAssessment}
                isPrintable={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
