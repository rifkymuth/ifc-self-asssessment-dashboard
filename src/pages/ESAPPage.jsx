import { useMemo, useState } from "react";
import { INDICATORS } from "../data/indicators";
import {
  buildESAPItemFromGap,
  buildAIPrompt,
  parseAIResponse,
  calcTargetDate,
  isOverdue,
  priorityStyles,
  statusStyles,
  esapThStyle,
} from "../lib/esap";

const esapTdStyle = {
  padding: "10px 8px",
  verticalAlign: "top",
  lineHeight: 1.4,
};

const esapInputStyle = {
  fontFamily: "inherit",
  fontSize: 10,
  padding: "4px 6px",
  width: "100%",
  background: "var(--paper)",
  color: "var(--ink)",
  border: "1px solid var(--ink)",
  outline: "none",
};

function AIResponseModal({ item, indicator, raw, error, onChange, onCopyPrompt, onApply, onClose }) {
  if (!item) return null;
  return (
    <div
      className="no-print"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,27,42,0.55)",
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-paper border-2 border-ink ink-shadow"
        style={{ maxWidth: 720, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div className="px-5 pt-5 pb-3" style={{ borderBottom: "1px solid var(--rule)" }}>
          <div className="small-caps text-gold" style={{ fontSize: 10 }}>Refine ESAP Action</div>
          <div className="font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
            {item.component || "Manual item"}
          </div>
          {indicator && (
            <div className="text-mute italic mt-1" style={{ fontSize: 11 }}>
              {indicator.id} · {indicator.text}
            </div>
          )}
        </div>

        <div className="px-5 py-4 overflow-auto" style={{ flex: 1 }}>
          <p className="text-mute" style={{ fontSize: 12, lineHeight: 1.5 }}>
            Paste the JSON response from your AI tool below. Expected keys:{" "}
            <code style={{ fontSize: 11 }}>action</code>,{" "}
            <code style={{ fontSize: 11 }}>completionIndicators</code>,{" "}
            <code style={{ fontSize: 11 }}>resources</code>,{" "}
            <code style={{ fontSize: 11 }}>pic</code>,{" "}
            <code style={{ fontSize: 11 }}>notes</code>. Markdown code fences are tolerated.
          </p>
          <div className="mt-3">
            <button
              onClick={onCopyPrompt}
              className="btn-ghost"
              style={{ fontSize: 10, padding: "6px 10px" }}
            >
              ⌘ Copy prompt for this item
            </button>
          </div>
          <textarea
            value={raw}
            onChange={(e) => onChange(e.target.value)}
            rows={14}
            placeholder={'{\n  "action": "…",\n  "completionIndicators": "…",\n  "resources": "…",\n  "pic": "…",\n  "notes": "…"\n}'}
            style={{
              fontFamily: "ui-monospace, 'SFMono-Regular', monospace",
              fontSize: 12,
              marginTop: 12,
              minHeight: 220,
              resize: "vertical",
            }}
          />
          {error && (
            <div
              className="mt-3 px-3 py-2"
              style={{
                background: "rgba(190,49,68,0.08)",
                color: "var(--crimson)",
                border: "1px solid var(--crimson)",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: "1px solid var(--rule)" }}>
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: 11, padding: "8px 14px" }}>
            Cancel
          </button>
          <button onClick={onApply} className="btn-primary" style={{ fontSize: 11 }}>
            Validate & Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ESAPPage({ esapItems, setEsapItems, esapApi, responses, meta }) {
  const [filterPS, setFilterPS] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [refineModal, setRefineModal] = useState(null);
  const [aiToast, setAiToast] = useState("");

  const filtered = useMemo(() => {
    return esapItems.filter((item) => {
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      if (filterStatus !== "all") {
        if (filterStatus === "Overdue") {
          if (!isOverdue(item)) return false;
        } else if (item.status !== filterStatus) return false;
      }
      if (filterPS !== "all") {
        const ps = item.indicatorId ? INDICATORS.find(i => i.id === item.indicatorId)?.ps : null;
        if (String(ps) !== filterPS) return false;
      }
      return true;
    }).sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      const p = (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
      if (p !== 0) return p;
      return (a.targetDate || "9999").localeCompare(b.targetDate || "9999");
    });
  }, [esapItems, filterPS, filterPriority, filterStatus]);

  const kpis = useMemo(() => {
    const total = esapItems.length;
    const byPriority = { High: 0, Medium: 0, Low: 0 };
    const byStatus = { "Not Started": 0, "In Progress": 0, "Completed": 0, "Deferred": 0 };
    let overdue = 0;
    let totalProgress = 0;
    esapItems.forEach((i) => {
      byPriority[i.priority] = (byPriority[i.priority] || 0) + 1;
      byStatus[i.status] = (byStatus[i.status] || 0) + 1;
      if (isOverdue(i)) overdue += 1;
      totalProgress += (i.progressPct || 0);
    });
    const completionRate = total > 0 ? (byStatus.Completed / total) * 100 : 0;
    const avgProgress = total > 0 ? totalProgress / total : 0;
    return { total, byPriority, byStatus, overdue, completionRate, avgProgress };
  }, [esapItems]);

  const generateFromGaps = () => {
    const existingIds = new Set(esapItems.filter(e => e.indicatorId).map(e => e.indicatorId));
    const newItems = [];
    INDICATORS.forEach((ind) => {
      const resp = responses[ind.id];
      if (!resp || resp.score === "NA" || resp.score === undefined) return;
      if (typeof resp.score !== "number") return;
      if (resp.score >= 4) return;
      if (existingIds.has(ind.id)) return;
      newItems.push(buildESAPItemFromGap(ind, resp));
    });
    if (newItems.length === 0) {
      alert("No new gaps found. ESAP already covers all identified gaps.");
      return;
    }
    setEsapItems([...esapItems, ...newItems]);
    esapApi.bulkCreate(newItems);
    alert(`Added ${newItems.length} new action item(s) from current gaps.`);
  };

  const addManualItem = () => {
    const newItem = {
      id: `esap-manual-${Date.now()}`,
      indicatorId: null,
      component: "",
      action: "",
      priority: "Medium",
      targetDate: calcTargetDate(6),
      completionIndicators: "",
      pic: "",
      resources: "",
      status: "Not Started",
      progressPct: 0,
      lastUpdate: "",
      notes: "Manually added item",
    };
    setEsapItems([...esapItems, newItem]);
    esapApi.create(newItem);
    setEditingId(newItem.id);
  };

  const updateItem = (id, updates) => {
    const current = esapItems.find(i => i.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };
    if (updates.status !== undefined || updates.progressPct !== undefined) {
      updated.lastUpdate = new Date().toISOString().slice(0, 10);
    }
    if (updates.status === "Completed") updated.progressPct = 100;
    else if (updates.status === "Not Started") updated.progressPct = 0;
    setEsapItems(esapItems.map(i => (i.id === id ? updated : i)));
    esapApi.update(id, updated);
  };

  const removeItem = (id) => {
    if (window.confirm("Remove this action item from the ESAP?")) {
      setEsapItems(esapItems.filter(i => i.id !== id));
      esapApi.remove(id);
      if (editingId === id) setEditingId(null);
    }
  };

  const clearAllESAP = () => {
    if (window.confirm("Clear all ESAP items? This cannot be undone.")) {
      setEsapItems([]);
      esapApi.clear();
    }
  };

  const flashToast = (msg) => {
    setAiToast(msg);
    window.clearTimeout(flashToast._t);
    flashToast._t = window.setTimeout(() => setAiToast(""), 2400);
  };

  const indicatorFor = (item) => item.indicatorId ? INDICATORS.find((i) => i.id === item.indicatorId) : null;

  const copyAIPrompt = async (item) => {
    const ind = indicatorFor(item);
    const prompt = buildAIPrompt(item, ind, meta);
    try {
      await navigator.clipboard.writeText(prompt);
      flashToast("AI prompt copied to clipboard. Paste into Claude / ChatGPT and bring the JSON response back.");
    } catch {
      const w = window.open("", "_blank", "width=720,height=620");
      if (w) {
        w.document.write(`<pre style="font: 12px/1.5 ui-monospace, monospace; padding: 16px; white-space: pre-wrap;">${prompt.replace(/[<&>]/g, (c) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" })[c])}</pre>`);
        w.document.title = "ESAP AI Prompt — copy manually";
      }
      flashToast("Clipboard blocked — prompt opened in a new tab for manual copy.");
    }
  };

  const copyBatchAIPrompt = async (priorityFilter) => {
    const targets = esapItems.filter((i) => i.priority === priorityFilter);
    if (targets.length === 0) {
      flashToast(`No ${priorityFilter}-priority items to refine.`);
      return;
    }
    const sections = targets.map((item, idx) => {
      const ind = indicatorFor(item);
      const header = `========== ITEM ${idx + 1} of ${targets.length} · ${item.component || "(manual item)"} ==========`;
      return `${header}\n\n${buildAIPrompt(item, ind, meta)}`;
    });
    const intro = `You will receive ${targets.length} ESAP items to refine. For EACH item, reply with ONE JSON object as instructed in that item, separated by a line containing only "---". Do not merge items into a single object.\n\n`;
    const full = intro + sections.join("\n\n---\n\n");
    try {
      await navigator.clipboard.writeText(full);
      flashToast(`Copied ${targets.length} ${priorityFilter}-priority prompts as a single batch.`);
    } catch {
      flashToast("Clipboard blocked — try the per-row Copy button instead.");
    }
  };

  const openRefineModal = (item) => setRefineModal({ itemId: item.id, raw: "", error: "" });
  const closeRefineModal = () => setRefineModal(null);

  const applyAIResponse = () => {
    if (!refineModal) return;
    const result = parseAIResponse(refineModal.raw);
    if (!result.ok) {
      setRefineModal({ ...refineModal, error: result.error });
      return;
    }
    const target = esapItems.find((i) => i.id === refineModal.itemId);
    if (!target) {
      setRefineModal({ ...refineModal, error: "Item no longer exists." });
      return;
    }
    updateItem(refineModal.itemId, {
      action: result.fields.action,
      completionIndicators: result.fields.completionIndicators,
      resources: result.fields.resources,
      pic: result.fields.pic,
      notes: result.fields.notes,
      source: "ai-refined",
    });
    closeRefineModal();
    flashToast("Action item refined from AI response.");
  };

  const exportCSV = () => {
    const header = ["Item", "ESAP Component", "Action Item", "Priority", "Target Completion",
                    "Indicators of Completion (Documentation)", "Accountability (PIC)", "Resources",
                    "Status", "Progress %", "Last Update", "Notes"];
    const esc = (s) => `"${String(s || "").replace(/"/g, '""')}"`;
    const rows = filtered.map((item, idx) => [
      idx + 1,
      item.component,
      item.action,
      item.priority,
      item.targetDate,
      item.completionIndicators,
      item.pic,
      item.resources,
      item.status,
      item.progressPct,
      item.lastUpdate,
      item.notes,
    ].map(esc).join(","));
    const csv = [header.map(esc).join(","), ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const projectSlug = (meta?.projectName || "ESAP").replace(/[^a-z0-9]/gi, "_").substring(0, 40);
    a.href = url;
    a.download = `${projectSlug}_ESAP_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-6 flex items-start justify-between no-print">
        <div>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ V</div>
          <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
            Environmental & Social Action Plan (ESAP)
          </h2>
          <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 780 }}>
            Structured remediation plan mapping each identified gap to an action, target date, responsible
            person, and completion evidence. Monitored by lender compliance teams throughout the
            investment cycle.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={generateFromGaps} className="btn-primary">
            ⟳ Generate from Gaps
          </button>
          {esapItems.some((i) => i.priority === "High") && (
            <button
              onClick={() => copyBatchAIPrompt("High")}
              className="btn-ghost"
              style={{ fontSize: 10, padding: "8px 12px" }}
              title="Copy a single batch prompt covering every High-priority item to refine via Claude / ChatGPT"
            >
              ⌘ AI Prompt — High Priority
            </button>
          )}
          <button onClick={addManualItem} className="btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }}>
            + Manual Item
          </button>
          <button onClick={exportCSV} className="btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }}>
            ↓ Export CSV
          </button>
          <button onClick={() => window.print()} className="btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }}>
            Print
          </button>
          {esapItems.length > 0 && (
            <button
              onClick={clearAllESAP}
              className="btn-ghost"
              style={{ fontSize: 10, padding: "8px 12px", borderColor: "var(--crimson)", color: "var(--crimson)" }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="print-only mb-6" style={{ display: "none" }}>
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>
          {meta?.projectName || "Project"} · Environmental & Social Action Plan
        </div>
        <h2 className="font-display text-ink" style={{ fontSize: 24, fontWeight: 400 }}>
          ESAP · {meta?.clientName || "—"}
        </h2>
        <div className="font-body text-mute" style={{ fontSize: 10 }}>
          Generated: {new Date().toISOString().slice(0, 10)} · Total items: {filtered.length}
        </div>
      </div>

      {esapItems.length === 0 && (
        <div className="bg-paper border border-ink ink-shadow p-12 text-center">
          <div className="font-display text-ink italic" style={{ fontSize: 22, marginBottom: 12 }}>
            No ESAP items yet
          </div>
          <p className="font-body text-mute mb-6" style={{ fontSize: 13, maxWidth: 540, margin: "0 auto 20px" }}>
            The Environmental & Social Action Plan is generated automatically from your
            gap analysis. Each scored indicator below maturity level 4 becomes a candidate
            action item. You can also add manual items not tied to specific indicators.
          </p>
          <button onClick={generateFromGaps} className="btn-primary">
            Generate ESAP from Current Gaps
          </button>
        </div>
      )}

      {esapItems.length > 0 && (
        <>
          <div className="grid grid-cols-5 gap-3 mb-5 no-print">
            <div className="bg-paper border border-ink p-3" style={{ borderWidth: 2 }}>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Total Items</div>
              <div className="font-display text-ink" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1 }}>
                {kpis.total}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>action items</div>
            </div>
            <div className="bg-paper border p-3" style={{ borderColor: "var(--crimson)", borderWidth: 1 }}>
              <div className="small-caps" style={{ fontSize: 9, color: "var(--crimson)" }}>High</div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1, color: "var(--crimson)" }}>
                {kpis.byPriority.High || 0}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>high priority</div>
            </div>
            <div className="bg-paper border p-3" style={{ borderColor: "var(--amber)" }}>
              <div className="small-caps" style={{ fontSize: 9, color: "var(--amber)" }}>Medium</div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1, color: "var(--amber)" }}>
                {kpis.byPriority.Medium || 0}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>medium priority</div>
            </div>
            <div className="bg-paper border p-3" style={{ borderColor: "var(--sage)" }}>
              <div className="small-caps text-sage" style={{ fontSize: 9 }}>Completed</div>
              <div className="font-display text-sage" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1 }}>
                {kpis.byStatus.Completed || 0}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>
                {kpis.completionRate.toFixed(0)}% completion rate
              </div>
            </div>
            <div className="bg-paper border p-3" style={{ borderColor: kpis.overdue > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
              <div className="small-caps" style={{ fontSize: 9, color: kpis.overdue > 0 ? "var(--crimson)" : "var(--mute)" }}>Overdue</div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1, color: kpis.overdue > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
                {kpis.overdue}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>past target date</div>
            </div>
          </div>

          <div className="mb-5 no-print">
            <div className="flex items-center justify-between mb-1">
              <span className="small-caps text-mute" style={{ fontSize: 9 }}>Overall ESAP Progress</span>
              <span className="font-display text-ink italic" style={{ fontSize: 11 }}>
                {kpis.avgProgress.toFixed(0)}% average across all items
              </span>
            </div>
            <div style={{ height: 8, background: "rgba(13,27,42,0.08)" }}>
              <div style={{
                width: `${kpis.avgProgress}%`,
                height: "100%",
                background: "var(--ink)",
                transition: "width 0.3s",
              }} />
            </div>
          </div>

          <div className="bg-paper border border-ink p-3 mb-4 flex gap-4 items-center flex-wrap no-print" style={{ borderWidth: 0.5 }}>
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Filters:</span>

            <div className="flex items-center gap-1">
              <span className="text-mute" style={{ fontSize: 10 }}>PS:</span>
              <select
                value={filterPS}
                onChange={(e) => setFilterPS(e.target.value)}
                style={{
                  fontFamily: "inherit", fontSize: 11, padding: "3px 6px",
                  background: "var(--paper)", color: "var(--ink)",
                  border: "1px solid rgba(13,27,42,0.2)", cursor: "pointer"
                }}
              >
                <option value="all">All</option>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={String(n)}>PS {n}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-mute" style={{ fontSize: 10 }}>Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  fontFamily: "inherit", fontSize: 11, padding: "3px 6px",
                  background: "var(--paper)", color: "var(--ink)",
                  border: "1px solid rgba(13,27,42,0.2)", cursor: "pointer"
                }}
              >
                <option value="all">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-mute" style={{ fontSize: 10 }}>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  fontFamily: "inherit", fontSize: 11, padding: "3px 6px",
                  background: "var(--paper)", color: "var(--ink)",
                  border: "1px solid rgba(13,27,42,0.2)", cursor: "pointer"
                }}
              >
                <option value="all">All</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
                <option value="Deferred">Deferred</option>
              </select>
            </div>

            <span className="text-mute italic ml-auto" style={{ fontSize: 10 }}>
              Showing {filtered.length} of {esapItems.length}
            </span>
          </div>

          <div className="bg-paper border-2 border-ink ink-shadow" style={{ overflow: "auto" }}>
            <table className="w-full" style={{ fontSize: 10, borderCollapse: "collapse", minWidth: 1400 }}>
              <thead>
                <tr style={{ background: "var(--ink)", color: "var(--paper)" }}>
                  <th style={esapThStyle(40)}>#</th>
                  <th style={esapThStyle(180)}>ESAP Component</th>
                  <th style={esapThStyle(280)}>Action Item</th>
                  <th style={esapThStyle(80)}>Priority</th>
                  <th style={esapThStyle(110)}>Target</th>
                  <th style={esapThStyle(220)}>Completion Indicators</th>
                  <th style={esapThStyle(130)}>PIC</th>
                  <th style={esapThStyle(130)}>Resources</th>
                  <th style={esapThStyle(130)}>Status / Update</th>
                  <th style={esapThStyle(140)}>Notes</th>
                  <th style={{ ...esapThStyle(40), textAlign: "center" }} className="no-print">·</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const overdue = isOverdue(item);
                  const statusKey = overdue ? "Overdue" : item.status;
                  const ps = priorityStyles[item.priority] || priorityStyles.Medium;
                  const st = statusStyles[statusKey] || statusStyles["Not Started"];
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid rgba(13,27,42,0.1)",
                        background: idx % 2 === 0 ? "var(--paper)" : "rgba(246,241,231,0.5)",
                      }}
                    >
                      <td style={esapTdStyle}>
                        <span className="serial-number" style={{ fontSize: 10 }}>{idx + 1}</span>
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.component}
                            onChange={(e) => updateItem(item.id, { component: e.target.value })}
                            style={esapInputStyle}
                          />
                        ) : (
                          <span className="font-display italic text-ink" style={{ fontSize: 10 }}>{item.component}</span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <textarea
                            value={item.action}
                            onChange={(e) => updateItem(item.id, { action: e.target.value })}
                            rows={3}
                            style={{ ...esapInputStyle, resize: "vertical" }}
                          />
                        ) : (
                          <>
                            <span style={{ fontSize: 10, lineHeight: 1.4 }}>{item.action}</span>
                            {item.source && (
                              <div className="italic text-mute-2 mt-1 no-print" style={{ fontSize: 8, letterSpacing: "0.05em" }}>
                                source: {item.source === "library" ? "curated library" : item.source === "ai-refined" ? "AI-refined" : item.source === "heuristic" ? "heuristic fallback" : item.source}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <select
                            value={item.priority}
                            onChange={(e) => updateItem(item.id, { priority: e.target.value })}
                            style={esapInputStyle}
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        ) : (
                          <span style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            fontSize: 9,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            background: ps.bg,
                            color: ps.fg,
                            border: `1px solid ${ps.border}`,
                          }}>
                            {item.priority}
                          </span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <input
                            type="date"
                            value={item.targetDate || ""}
                            onChange={(e) => updateItem(item.id, { targetDate: e.target.value })}
                            style={esapInputStyle}
                          />
                        ) : (
                          <span className="font-mono" style={{ fontSize: 10, color: overdue ? "var(--crimson)" : "var(--ink)" }}>
                            {item.targetDate || "—"}
                            {overdue && <span className="italic ml-1" style={{ fontSize: 9 }}> (overdue)</span>}
                          </span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <textarea
                            value={item.completionIndicators}
                            onChange={(e) => updateItem(item.id, { completionIndicators: e.target.value })}
                            rows={3}
                            style={{ ...esapInputStyle, resize: "vertical" }}
                          />
                        ) : (
                          <span style={{ fontSize: 9, lineHeight: 1.4, color: "var(--mute)" }}>
                            {item.completionIndicators}
                          </span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.pic}
                            onChange={(e) => updateItem(item.id, { pic: e.target.value })}
                            placeholder="Role / Name"
                            style={esapInputStyle}
                          />
                        ) : (
                          <span style={{ fontSize: 10 }}>{item.pic || <span className="italic text-mute-2">— not assigned —</span>}</span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.resources}
                            onChange={(e) => updateItem(item.id, { resources: e.target.value })}
                            placeholder="Budget / Team / Consultant"
                            style={esapInputStyle}
                          />
                        ) : (
                          <span style={{ fontSize: 10 }}>{item.resources || <span className="italic text-mute-2">— TBD —</span>}</span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <select
                            value={item.status}
                            onChange={(e) => updateItem(item.id, { status: e.target.value })}
                            style={{
                              fontFamily: "inherit", fontSize: 9, padding: "3px 4px",
                              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                              background: st.bg, color: st.fg,
                              border: `1px solid ${st.border}`, cursor: "pointer"
                            }}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Deferred">Deferred</option>
                          </select>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={item.progressPct || 0}
                              onChange={(e) => updateItem(item.id, { progressPct: parseInt(e.target.value) })}
                              style={{ flex: 1, height: 4 }}
                            />
                            <span className="font-mono" style={{ fontSize: 9, minWidth: 28, textAlign: "right", color: "var(--ink)" }}>
                              {item.progressPct || 0}%
                            </span>
                          </div>
                          {item.lastUpdate && (
                            <span className="italic text-mute-2" style={{ fontSize: 8 }}>
                              updated {item.lastUpdate}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <textarea
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                            rows={3}
                            placeholder="Notes, risks, dependencies…"
                            style={{ ...esapInputStyle, resize: "vertical" }}
                          />
                        ) : (
                          <span style={{ fontSize: 9, lineHeight: 1.4, color: "var(--mute)" }}>
                            {item.notes || <span className="italic text-mute-2">—</span>}
                          </span>
                        )}
                      </td>
                      <td style={{ ...esapTdStyle, textAlign: "center" }} className="no-print">
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <button
                            onClick={() => setEditingId(isEditing ? null : item.id)}
                            style={{
                              fontSize: 9, padding: "2px 4px",
                              background: isEditing ? "var(--ink)" : "transparent",
                              color: isEditing ? "var(--paper)" : "var(--ink)",
                              border: "1px solid var(--ink)",
                              cursor: "pointer",
                            }}
                            title={isEditing ? "Save" : "Edit"}
                          >
                            {isEditing ? "✓" : "✎"}
                          </button>
                          <button
                            onClick={() => copyAIPrompt(item)}
                            style={{
                              fontSize: 9, padding: "2px 4px",
                              background: "transparent",
                              color: "var(--gold)",
                              border: "1px solid var(--gold)",
                              cursor: "pointer",
                            }}
                            title="Copy an AI prompt for this item — paste into Claude / ChatGPT, then bring the JSON back via the ⤓ button"
                          >
                            ⌘
                          </button>
                          <button
                            onClick={() => openRefineModal(item)}
                            style={{
                              fontSize: 9, padding: "2px 4px",
                              background: "transparent",
                              color: "var(--sage)",
                              border: "1px solid var(--sage)",
                              cursor: "pointer",
                            }}
                            title="Paste an AI response (JSON) to refine this item"
                          >
                            ⤓
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{
                              fontSize: 9, padding: "2px 4px",
                              background: "transparent",
                              color: "var(--crimson)",
                              border: "1px solid var(--crimson)",
                              cursor: "pointer",
                            }}
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <p className="italic text-mute" style={{ fontSize: 12 }}>
                  No items match the current filters.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 text-mute italic" style={{ fontSize: 10 }}>
            <strong>Note:</strong> Target dates are auto-suggested (High = 3 months, Medium = 6 months, Low = 12 months).
            Adjust based on project context and lender-approved timeline. Status progress auto-timestamps
            on change. Export to CSV for lender submission or import into project tracking tools.
            Use the <span style={{ color: "var(--gold)" }}>⌘</span> button per row to copy a tailored AI
            prompt and the <span style={{ color: "var(--sage)" }}>⤓</span> button to paste the AI's JSON
            response back to refine the action.
          </div>
        </>
      )}

      {aiToast && (
        <div
          className="no-print"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "10px 16px",
            fontSize: 12,
            maxWidth: 520,
            boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
            zIndex: 60,
          }}
        >
          {aiToast}
        </div>
      )}

      {refineModal && (
        <AIResponseModal
          item={esapItems.find((i) => i.id === refineModal.itemId)}
          indicator={(() => {
            const it = esapItems.find((i) => i.id === refineModal.itemId);
            return it?.indicatorId ? INDICATORS.find((x) => x.id === it.indicatorId) : null;
          })()}
          raw={refineModal.raw}
          error={refineModal.error}
          onChange={(v) => setRefineModal({ ...refineModal, raw: v, error: "" })}
          onCopyPrompt={() => {
            const it = esapItems.find((i) => i.id === refineModal.itemId);
            if (it) copyAIPrompt(it);
          }}
          onApply={applyAIResponse}
          onClose={closeRefineModal}
        />
      )}
    </div>
  );
}
