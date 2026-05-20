export default function MastheadRule() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center my-2">
      <span style={{ width: 40, height: 1, background: "var(--gold)" }} />
      <span className="mx-3 text-gold font-display" style={{ fontSize: 10 }}>❦</span>
      <span style={{ width: 40, height: 1, background: "var(--gold)" }} />
    </div>
  );
}
