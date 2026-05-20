import { getMaturityLabel } from "../lib/scoring";
import MastheadRule from "./MastheadRule";

export default function Header({ meta, overall }) {
  return (
    <header className="paper-grain border-b-2 border-ink">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="small-caps text-mute" style={{ fontSize: 10 }}>
              A+CSR Indonesia · Diagnostic Suite
            </div>
            <h1
              className="font-display text-ink mt-2 text-3xl md:text-4xl"
              style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.01em" }}
            >
              IFC Performance Standards 2012
            </h1>
            <div className="font-display text-ink-soft italic mt-1" style={{ fontSize: 20, fontWeight: 300 }}>
              Self-Assessment Compliance Dashboard
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="serial-number">VOL. I · ED. 2026</div>
            <div className="font-display text-ink" style={{ fontSize: 14, marginTop: 4 }}>
              {meta.projectName || "Untitled Project"}
            </div>
            <div className="small-caps text-mute" style={{ fontSize: 9 }}>
              {meta.clientName || "Client organization"}
            </div>
          </div>
        </div>
        <MastheadRule />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 hidden md:flex">
          <div className="flex flex-wrap gap-6 md:gap-8" style={{ fontSize: 11 }}>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Overall Maturity</div>
              <div className="font-display text-ink" style={{ fontSize: 20 }}>
                {overall.avg.toFixed(2)}<span className="text-mute-2" style={{ fontSize: 12 }}> / 4.00</span>
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Completion</div>
              <div className="font-display text-ink" style={{ fontSize: 20 }}>
                {overall.completion.toFixed(0)}<span className="text-mute-2" style={{ fontSize: 12 }}>%</span>
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Status</div>
              <div className={`font-display ${getMaturityLabel(overall.avg).cls}`} style={{ fontSize: 16 }}>
                {getMaturityLabel(overall.avg).label}
              </div>
            </div>
          </div>
          <div className="small-caps text-mute-2" style={{ fontSize: 9 }}>
            {meta.assessmentDate || new Date().toISOString().slice(0, 10)}
          </div>
        </div>
      </div>
    </header>
  );
}
