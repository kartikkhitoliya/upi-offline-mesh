export default function TopBar({ serverKey, cacheSize, connected }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <h1>UPI Mesh</h1>
        <span>offline settlement console</span>
      </div>
      <div className="topbar-stats">
        <span>
          <span className="live-dot" style={{ background: connected ? 'var(--settled)' : 'var(--rejected)' }} />
          {connected ? 'backend reachable' : 'backend unreachable'}
        </span>
        {serverKey && (
          <span className="key-badge">{serverKey.algorithm}</span>
        )}
        <span>
          idempotency cache: <strong>{cacheSize ?? 0}</strong>
        </span>
      </div>
    </header>
  );
}
