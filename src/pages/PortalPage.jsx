import { useState } from "react";
import MastheadRule from "../components/MastheadRule";

export default function PortalPage({ hasSavedData, lastProjectId, onContinue, onCreateNew, onJoin }) {
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const submitJoin = async () => {
    const code = joinCode.trim();
    if (!code) return;
    setJoining(true);
    setJoinError("");
    try {
      await onJoin(code);
    } catch (e) {
      setJoinError(e.message.includes("not found") ? "No project found with that code." : e.message);
    } finally {
      setJoining(false);
    }
  };

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
            indicators. Begin a new assessment, continue your last one, or join an existing
            project by its code.
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
              Creates a fresh project on the server and gives you a shareable project code.
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
                ? "Reopen the project you last worked on, on this device."
                : "No recently opened project on this device yet."}
            </p>
            {hasSavedData && (
              <div className="mt-4" style={{ fontSize: 11, lineHeight: 1.5 }}>
                <div className="small-caps text-mute" style={{ fontSize: 9, letterSpacing: "0.14em" }}>
                  Last project code
                </div>
                <div className="font-display text-ink" style={{ fontSize: 16, letterSpacing: "0.12em" }}>
                  {lastProjectId}
                </div>
              </div>
            )}
          </button>
        </div>

        <div className="hairline my-8" />

        <div>
          <div className="small-caps text-gold" style={{ fontSize: 10, letterSpacing: "0.18em" }}>
            Collaborate
          </div>
          <div className="font-display text-ink mt-1" style={{ fontSize: 18, fontWeight: 500 }}>
            Join with a Project Code
          </div>
          <p className="font-body text-mute italic mt-1" style={{ fontSize: 12, lineHeight: 1.55 }}>
            Enter a code shared with you to open and edit that project collaboratively.
          </p>
          <div className="flex gap-3 mt-3 items-start">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setJoinError("");
              }}
              onKeyDown={(e) => { if (e.key === "Enter") submitJoin(); }}
              placeholder="e.g., AB12CD34"
              style={{ flex: 1, letterSpacing: "0.12em", fontFamily: "monospace" }}
            />
            <button
              onClick={submitJoin}
              disabled={!joinCode.trim() || joining}
              className="btn-primary"
              style={{ opacity: !joinCode.trim() || joining ? 0.5 : 1 }}
            >
              {joining ? "Joining…" : "Join"}
            </button>
          </div>
          {joinError && (
            <div className="font-body italic mt-2" style={{ fontSize: 11, color: "var(--crimson)" }}>
              {joinError}
            </div>
          )}
        </div>

        <div
          className="text-center mt-8 small-caps text-mute-2"
          style={{ fontSize: 9, letterSpacing: "0.14em" }}
        >
          Assessments are stored on the shared backend and identified by project code
        </div>
      </div>
    </div>
  );
}
