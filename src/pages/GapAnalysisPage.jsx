import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PS_META } from "../data/psMeta";
import { INDICATORS } from "../data/indicators";
import { priorityGap } from "../lib/scoring";

export default function GapAnalysisPage({ responses }) {
  const gaps = useMemo(() => {
    return INDICATORS
      .map((ind) => ({ ind, resp: responses[ind.id], priority: priorityGap(responses[ind.id]) }))
      .filter((x) => x.priority !== null)
      .sort((a, b) => {
        const order = { High: 0, Medium: 1 };
        return order[a.priority] - order[b.priority];
      });
  }, [responses]);

  const highCount = gaps.filter((g) => g.priority === "High").length;
  const medCount = gaps.filter((g) => g.priority === "Medium").length;

  const byPS = useMemo(() => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
      const psGaps = gaps.filter((g) => g.ind.ps === n);
      return {
        ps: `PS ${n}`,
        name: PS_META[n].abbr,
        high: psGaps.filter((g) => g.priority === "High").length,
        medium: psGaps.filter((g) => g.priority === "Medium").length,
        total: psGaps.length,
      };
    });
    return data;
  }, [gaps]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ III</div>
        <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Gap Analysis
        </h2>
        <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 720 }}>
          Indicators scored below the "Established" threshold (score ≤ 2), ranked by priority.
          High-priority gaps (score 0–1) should be addressed before project financing or
          IFC/Equator Principles-aligned appraisal.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-paper border border-rule p-5 ink-shadow">
          <div className="small-caps text-crimson" style={{ fontSize: 10 }}>High Priority</div>
          <div className="font-display text-crimson mt-1" style={{ fontSize: 42, fontWeight: 300, lineHeight: 1 }}>
            {highCount}
          </div>
          <div className="font-body text-mute italic mt-1" style={{ fontSize: 11 }}>
            Score 0–1 · immediate action required
          </div>
        </div>
        <div className="bg-paper border border-rule p-5 ink-shadow">
          <div className="small-caps text-amber" style={{ fontSize: 10 }}>Medium Priority</div>
          <div className="font-display text-amber mt-1" style={{ fontSize: 42, fontWeight: 300, lineHeight: 1 }}>
            {medCount}
          </div>
          <div className="font-body text-mute italic mt-1" style={{ fontSize: 11 }}>
            Score 2 · improvement plan needed
          </div>
        </div>
        <div className="bg-paper border border-rule p-5 ink-shadow">
          <div className="small-caps text-sage" style={{ fontSize: 10 }}>Met / Exceeded</div>
          <div className="font-display text-sage mt-1" style={{ fontSize: 42, fontWeight: 300, lineHeight: 1 }}>
            {Object.values(responses).filter(r => typeof r?.score === "number" && r.score >= 3).length}
          </div>
          <div className="font-body text-mute italic mt-1" style={{ fontSize: 11 }}>
            Score 3–4 · sustain & monitor
          </div>
        </div>
      </div>

      <div className="bg-paper border border-rule ink-shadow mb-8">
        <div className="px-6 py-4 hairline" style={{ background: "rgba(184,145,81,0.05)" }}>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>Fig. II</div>
          <h3 className="font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
            Gaps by Performance Standard
          </h3>
        </div>
        <div style={{ height: 260, padding: 16 }}>
          <ResponsiveContainer>
            <BarChart data={byPS} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <XAxis dataKey="name" tick={{ fill: "var(--ink)", fontSize: 11, fontFamily: "Inter" }} />
              <YAxis tick={{ fill: "var(--mute)", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--paper)",
                  border: "1px solid var(--ink)",
                  fontFamily: "Inter",
                  fontSize: 11,
                }}
              />
              <Bar dataKey="high" stackId="a" fill="var(--crimson)" name="High" />
              <Bar dataKey="medium" stackId="a" fill="var(--amber)" name="Medium" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-paper border border-rule ink-shadow">
        <div className="px-6 py-4 hairline" style={{ background: "rgba(184,145,81,0.05)" }}>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>Tab. I</div>
          <h3 className="font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
            Prioritized Gap Register
          </h3>
        </div>
        {gaps.length === 0 ? (
          <div className="p-8 text-center font-body text-mute italic" style={{ fontSize: 13 }}>
            No gaps identified yet. Complete the assessment to populate this register.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 12, minWidth: 880 }}>
              <thead>
                <tr className="hairline" style={{ background: "rgba(13,27,42,0.04)" }}>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Priority</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>ID</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Ref</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Section</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Requirement</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Score</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map(({ ind, resp, priority }) => (
                  <tr key={ind.id} className="border-b" style={{ borderBottomColor: "rgba(13,27,42,0.06)" }}>
                    <td className="px-5 py-3">
                      <span
                        className="score-pill"
                        style={{
                          background: priority === "High" ? "#F4DCCD" : "#F5E6CB",
                          color: priority === "High" ? "var(--crimson)" : "var(--amber)",
                        }}
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 serial-number" style={{ fontSize: 11 }}>{ind.id}</td>
                    <td className="px-5 py-3 text-gold" style={{ fontSize: 10 }}>{PS_META[ind.ps].code} {ind.ref}</td>
                    <td className="px-5 py-3 text-mute" style={{ fontSize: 11 }}>{ind.section}</td>
                    <td className="px-5 py-3 text-ink" style={{ fontSize: 11, lineHeight: 1.45, maxWidth: 360 }}>
                      {ind.text.substring(0, 140)}{ind.text.length > 140 ? "…" : ""}
                    </td>
                    <td className="px-5 py-3 font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
                      {resp.score}
                    </td>
                    <td className="px-5 py-3 text-mute italic" style={{ fontSize: 11, maxWidth: 180 }}>
                      {resp.notes ? resp.notes.substring(0, 80) + (resp.notes.length > 80 ? "…" : "") : <span className="text-mute-2">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
