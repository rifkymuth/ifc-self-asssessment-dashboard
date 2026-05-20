export default function Nav({ page, setPage }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "assessment", label: "Assessment" },
    { id: "scorecards", label: "Scorecards" },
    { id: "gap", label: "Gap Analysis" },
    { id: "esap", label: "ESAP" },
    { id: "report", label: "Summary Report" },
    { id: "narrative", label: "Full Report" },
  ];
  return (
    <nav className="bg-paper no-print">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setPage(t.id)}
              className={`py-4 font-body ${page === t.id ? "tab-active" : "tab-inactive"}`}
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
