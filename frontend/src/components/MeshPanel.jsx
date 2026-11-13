const WIDTH = 460;
const HEIGHT = 260;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };
const RADIUS = 95;

function layout(devices) {
  const n = devices.length || 1;
  return devices.map((d, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return {
      ...d,
      x: CENTER.x + RADIUS * Math.cos(angle),
      y: CENTER.y + RADIUS * Math.sin(angle)
    };
  });
}

export default function MeshPanel({ devices, onGossip, onFlush, onReset, busy }) {
  const positioned = layout(devices);

  return (
    <div className="panel-void">
      <div className="panel-title">MESH NETWORK — bluetooth-style gossip simulation</div>

      <svg className="mesh-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {positioned.map((a) =>
          positioned
            .filter((b) => b.deviceId !== a.deviceId)
            .map((b) => (
              <line
                key={`${a.deviceId}-${b.deviceId}`}
                className="mesh-edge"
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                opacity={0.25}
              />
            ))
        )}

        {positioned.map((d) => (
          <g key={d.deviceId}>
            <circle
              cx={d.x}
              cy={d.y}
              r={28}
              className={`mesh-node-ring ${d.hasInternet ? 'bridge' : ''} ${d.packetCount > 0 ? 'holding' : ''}`}
            />
            <text x={d.x} y={d.y - 2} textAnchor="middle" className="mesh-count">
              {d.packetCount}
            </text>
            <text x={d.x} y={d.y + 11} textAnchor="middle" className="mesh-label">
              {d.hasInternet ? '4G' : 'offline'}
            </text>
            <text x={d.x} y={d.y + 44} textAnchor="middle" className="mesh-label">
              {d.deviceId.replace('phone-', '')}
            </text>
          </g>
        ))}
      </svg>

      <div className="action-row">
        <button className="btn" onClick={onGossip} disabled={busy}>
          🔄 Run gossip round
        </button>
        <button className="btn" onClick={onFlush} disabled={busy}>
          📡 Flush bridges
        </button>
        <button className="btn btn-danger" onClick={onReset} disabled={busy}>
          ⟲ Reset mesh
        </button>
      </div>
    </div>
  );
}
