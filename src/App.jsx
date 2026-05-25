import { useState, useEffect, useRef } from "react";
import { STYLE_TAG } from "./styles/editorialStyles";
import { DEFAULT_META } from "./data/defaults";
import { INDICATORS } from "./data/indicators";
import { computeOverall } from "./lib/scoring";
import * as api from "./lib/api";
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

const LAST_PID_KEY = "ifc-ps:projectId";

const mergeMeta = (m) => ({
  ...DEFAULT_META,
  ...(m || {}),
  companyProfile: { ...DEFAULT_META.companyProfile, ...((m && m.companyProfile) || {}) },
});

export default function App() {
  const [page, setPage] = useState("portal");
  const [activePS, setActivePS] = useState(1);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [responses, setResponses] = useState({});
  const [esapItems, setEsapItems] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [lastProjectId, setLastProjectId] = useState(() => {
    try {
      return localStorage.getItem(LAST_PID_KEY);
    } catch {
      return null;
    }
  });
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLE_TAG;
    document.head.appendChild(style);
    document.body.style.backgroundColor = "var(--parchment)";
    return () => { document.head.removeChild(style); };
  }, []);

  const fail = (prefix) => (e) => setApiError(`${prefix}: ${e.message}`);

  const rememberPid = (pid) => {
    try {
      localStorage.setItem(LAST_PID_KEY, pid);
    } catch {}
    setLastProjectId(pid);
  };

  const openProjectData = (data) => {
    setProjectId(data.projectId);
    setMeta(mergeMeta(data.meta));
    setResponses(data.responses || {});
    setEsapItems(data.esapItems || []);
    rememberPid(data.projectId);
  };

  const createNew = async () => {
    try {
      const data = await api.createProject();
      openProjectData(data);
      setPage("dashboard");
    } catch (e) {
      setApiError(`Could not create project: ${e.message}`);
    }
  };

  const continueLast = async () => {
    if (!lastProjectId) return;
    try {
      openProjectData(await api.getProject(lastProjectId));
      setPage("dashboard");
    } catch (e) {
      setApiError(`Could not open saved project: ${e.message}`);
    }
  };

  // Throws on not-found so PortalPage can show an inline message.
  const joinProject = async (pid) => {
    openProjectData(await api.getProject(pid.trim()));
    setPage("dashboard");
  };

  const metaTimer = useRef(null);
  const updateMeta = (next) => {
    setMeta(next);
    if (!projectId) return;
    if (metaTimer.current) clearTimeout(metaTimer.current);
    metaTimer.current = setTimeout(() => {
      api.putMeta(projectId, next).catch(fail("Save failed"));
    }, 400);
  };

  const respTimers = useRef({});
  const updateResponse = (indicatorId, payload) => {
    setResponses((prev) => ({ ...prev, [indicatorId]: payload }));
    if (!projectId) return;
    if (respTimers.current[indicatorId]) clearTimeout(respTimers.current[indicatorId]);
    respTimers.current[indicatorId] = setTimeout(() => {
      api.putResponse(projectId, indicatorId, payload).catch(fail("Save failed"));
    }, 400);
  };

  const replaceResponses = (obj) => {
    setResponses(obj);
    if (projectId) api.putResponses(projectId, obj).catch(fail("Import save failed"));
  };

  const esapApi = {
    create: (item) => projectId && api.createEsap(projectId, item).catch(fail("ESAP save failed")),
    bulkCreate: (items) => projectId && api.bulkCreateEsap(projectId, items).catch(fail("ESAP save failed")),
    update: (id, item) => projectId && api.updateEsap(projectId, id, item).catch(fail("ESAP save failed")),
    remove: (id) => projectId && api.deleteEsap(projectId, id).catch(fail("ESAP delete failed")),
    clear: () => projectId && api.clearEsap(projectId).catch(fail("ESAP clear failed")),
  };

  const clearAll = async () => {
    if (projectId) {
      try {
        await api.deleteProject(projectId);
      } catch (e) {
        setApiError(`Delete failed: ${e.message}`);
      }
    }
    try {
      localStorage.removeItem(LAST_PID_KEY);
    } catch {}
    setLastProjectId(null);
    setProjectId(null);
    setMeta(DEFAULT_META);
    setResponses({});
    setEsapItems([]);
    setPage("portal");
  };

  const overall = computeOverall(responses);
  const hasSavedData = !!lastProjectId;

  return (
    <div className="font-body" style={{ backgroundColor: "var(--parchment)", minHeight: "100vh", color: "var(--ink)" }}>
      {apiError && (
        <div
          className="no-print"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
            background: "var(--crimson, #8a2b2b)", color: "#fff",
            padding: "8px 16px", fontSize: 12, display: "flex",
            justifyContent: "space-between", alignItems: "center",
          }}
        >
          <span>{apiError}</span>
          <button onClick={() => setApiError("")} style={{ color: "#fff", fontSize: 14, lineHeight: 1 }}>×</button>
        </div>
      )}
      {page !== "portal" && <Header meta={meta} overall={overall} />}
      {page !== "portal" && <Nav page={page} setPage={setPage} />}
      {page === "portal" && (
        <PortalPage
          hasSavedData={hasSavedData}
          lastProjectId={lastProjectId}
          onContinue={continueLast}
          onCreateNew={createNew}
          onJoin={joinProject}
        />
      )}
      {page === "dashboard" && (
        <DashboardPage
          responses={responses}
          setPage={setPage}
          setActivePS={setActivePS}
          meta={meta}
          setMeta={updateMeta}
          setResponses={replaceResponses}
          clearAll={clearAll}
          projectId={projectId}
        />
      )}
      {page === "assessment" && (
        <AssessmentPage
          responses={responses}
          onResponseChange={updateResponse}
          activePS={activePS}
          setActivePS={setActivePS}
        />
      )}
      {page === "scorecards" && <ScorecardsPage responses={responses} setPage={setPage} setActivePS={setActivePS} />}
      {page === "gap" && <GapAnalysisPage responses={responses} setPage={setPage} setActivePS={setActivePS} />}
      {page === "esap" && (
        <ESAPPage
          esapItems={esapItems}
          setEsapItems={setEsapItems}
          esapApi={esapApi}
          responses={responses}
          meta={meta}
        />
      )}
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
