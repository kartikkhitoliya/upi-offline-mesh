const ICONS = {
  pending: '○',
  settled: '✓',
  duplicate: '●',
  rejected: '✕',
  error: '✕'
};

export default function StatusFlow({ steps }) {
  if (steps.length === 0) return null;

  return (
    <div className="status-flow">
      {steps.map((s) => (
        <div key={s.id} className={`status-step ${s.kind}`}>
          <span className="status-step-icon">{ICONS[s.kind] ?? '○'}</span>
          <span>{s.text}</span>
        </div>
      ))}
    </div>
  );
}
