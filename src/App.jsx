import { useState, useEffect, useRef } from "react";
import { STYLE_TAG } from "./styles/editorialStyles";
import { DEFAULT_META, K_META, K_RESP, K_ESAP } from "./data/defaults";
import { INDICATORS } from "./data/indicators";
import { computeOverall } from "./lib/scoring";
import Header from "./components/Header";
import Nav from "./components/Nav";
import PortalPage from "./pages/PortalPage";
import DashboardPage from "./pages/DashboardPage";
import AssessmentPage from "./pages/AssessmentPage";
import ScorecardsPage from "./pages/ScorecardsPage";
import GapAnalysisPage from "./pages/GapAnalysisPage";
import ESAPPage from "./pages/ESAPPage";
import ReportPage from "./pages/ReportPage";
import NarrativeReportPage from "./pages/NarrativeReportPage";

export default function App() {
  const [page, setPage] = useState("portal");
  const [activePS, setActivePS] = useState(1);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [responses, setResponses] = useState({});
  const [esapItems, setEsapItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLE_TAG;
    document.head.appendChild(style);
    document.body.style.backgroundColor = "var(--parchment)";
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    try {
      const m = localStorage.getItem(K_META);
      if (m) setMeta({ ...DEFAULT_META, ...JSON.parse(m), companyProfile: { ...DEFAULT_META.companyProfile, ...(JSON.parse(m).companyProfile || {}) } });
    } catch {}
    try {
      const r = localStorage.getItem(K_RESP);
      if (r) setResponses(JSON.parse(r));
    } catch {}
    try {
      const e = localStorage.getItem(K_ESAP);
      if (e) setEsapItems(JSON.parse(e));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(K_META, JSON.stringify(meta));
    } catch {}
  }, [meta, loaded]);

  const saveTimer = useRef(null);
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(K_RESP, JSON.stringify(responses));
      } catch {}
    }, 400);
  }, [responses, loaded]);

  const esapSaveTimer = useRef(null);
  useEffect(() => {
    if (!loaded) return;
    if (esapSaveTimer.current) clearTimeout(esapSaveTimer.current);
    esapSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(K_ESAP, JSON.stringify(esapItems));
      } catch {}
    }, 400);
  }, [esapItems, loaded]);

  const overall = computeOverall(responses);

  const hasSavedData =
    loaded &&
    (Object.keys(responses).length > 0 ||
      esapItems.length > 0 ||
      (meta.projectName && meta.projectName.length > 0));

  const clearAll = () => {
    setMeta(DEFAULT_META);
    setResponses({});
    setEsapItems([]);
    try {
      localStorage.removeItem(K_META);
      localStorage.removeItem(K_RESP);
      localStorage.removeItem(K_ESAP);
    } catch {}
  };

  return (
    <div className="font-body" style={{ backgroundColor: "var(--parchment)", minHeight: "100vh", color: "var(--ink)" }}>
      {page !== "portal" && <Header meta={meta} overall={overall} />}
      {page !== "portal" && <Nav page={page} setPage={setPage} />}
      {page === "portal" && (
        <PortalPage
          meta={meta}
          hasSavedData={hasSavedData}
          onContinue={() => setPage("dashboard")}
          onCreateNew={() => {
            clearAll();
            setPage("dashboard");
          }}
        />
      )}
      {page === "dashboard" && (
        <DashboardPage
          responses={responses}
          setPage={setPage}
          setActivePS={setActivePS}
          meta={meta}
          setMeta={setMeta}
          setResponses={setResponses}
          clearAll={clearAll}
        />
      )}
      {page === "assessment" && (
        <AssessmentPage
          responses={responses}
          setResponses={setResponses}
          activePS={activePS}
          setActivePS={setActivePS}
        />
      )}
      {page === "scorecards" && <ScorecardsPage responses={responses} setPage={setPage} setActivePS={setActivePS} />}
      {page === "gap" && <GapAnalysisPage responses={responses} setPage={setPage} setActivePS={setActivePS} />}
      {page === "esap" && <ESAPPage esapItems={esapItems} setEsapItems={setEsapItems} responses={responses} meta={meta} />}
      {page === "report" && <ReportPage responses={responses} meta={meta} />}
      {page === "narrative" && <NarrativeReportPage responses={responses} meta={meta} />}
      {page !== "portal" && (
        <footer className="no-print mt-12 py-6 text-center hairline-t" style={{ background: "var(--parchment)" }}>
          <div className="small-caps text-mute-2" style={{ fontSize: 9 }}>
            A+CSR Indonesia · Diagnostic Suite · IFC Performance Standards 2012 · {INDICATORS.length} indicators
          </div>
        </footer>
      )}
    </div>
  );
}
