import MastheadRule from "../components/MastheadRule";

export default function PortalPage({ meta, hasSavedData, onContinue, onCreateNew }) {
  return (
    <div
      className="paper-grain"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div
        className="bg-paper border-2 border-ink ink-shadow"
        style={{ maxWidth: 720, width: "100%", padding: "48px 40px" }}
      >
        <div className="text-center">
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>
            A+CSR Indonesia · Diagnostic Suite
          </div>
          <h1
            className="font-display text-ink mt-3"
            style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.15 }}
          >
            IFC Performance Standards 2012
          </h1>
          <div
            className="font-display italic text-ink-soft mt-1"
            style={{ fontSize: 16, fontWeight: 300 }}
          >
            Self-Assessment Compliance Dashboard
          </div>
          <MastheadRule />
          <p
            className="font-body text-mute italic mt-2 mx-auto"
            style={{ fontSize: 13, maxWidth: 480, lineHeight: 1.55 }}
          >
            A diagnostic instrument covering all eight IFC Performance Standards across 162
            indicators. Begin a new assessment or continue an existing one.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onCreateNew}
            className="bg-paper border-2 border-ink p-6 text-left hover:bg-ink hover:text-paper transition-colors group"
            style={{ minHeight: 160 }}
          >
            <div
              className="small-caps text-gold"
              style={{ fontSize: 10, letterSpacing: "0.18em" }}
            >
              Begin
            </div>
            <div
              className="font-display mt-2"
              style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}
            >
              Create New Assessment
            </div>
            <p
              className="font-body mt-3"
              style={{ fontSize: 12, lineHeight: 1.55, color: "inherit", opacity: 0.75 }}
            >
              Start a fresh self-assessment. Existing saved data on this device will be cleared.
            </p>
            <div
              className="small-caps mt-4"
              style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--gold)" }}
            >
              Start fresh →
            </div>
          </button>

          <button
            onClick={onContinue}
            disabled={!hasSavedData}
            title={hasSavedData ? "Resume the saved assessment" : "No saved assessment found"}
            className="bg-paper border-2 border-ink p-6 text-left transition-colors group"
            style={{
              minHeight: 160,
              opacity: hasSavedData ? 1 : 0.45,
              cursor: hasSavedData ? "pointer" : "not-allowed",
            }}
          >
            <div
              className="small-caps text-gold"
              style={{ fontSize: 10, letterSpacing: "0.18em" }}
            >
              Resume
            </div>
            <div
              className="font-display mt-2 text-ink"
              style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}
            >
              Continue Assessment
            </div>
            <p
              className="font-body text-mute mt-3"
              style={{ fontSize: 12, lineHeight: 1.55 }}
            >
              {hasSavedData
                ? "Pick up from the previously saved state on this device."
                : "No saved assessment found in this browser yet."}
            </p>
            {hasSavedData && (
              <div className="mt-4" style={{ fontSize: 11, lineHeight: 1.5 }}>
                <div className="font-display italic text-ink" style={{ fontSize: 13 }}>
                  {meta.projectName || "Untitled Project"}
                </div>
                {meta.clientName && (
                  <div className="text-mute" style={{ fontSize: 11 }}>
                    {meta.clientName}
                  </div>
                )}
                {meta.assessmentDate && (
                  <div className="small-caps text-mute-2 mt-1" style={{ fontSize: 9 }}>
                    Last assessed · {meta.assessmentDate}
                  </div>
                )}
              </div>
            )}
          </button>
        </div>

        <div
          className="text-center mt-8 small-caps text-mute-2"
          style={{ fontSize: 9, letterSpacing: "0.14em" }}
        >
          Data is currently stored locally in your browser
        </div>
      </div>
    </div>
  );
}
