import { useState } from 'react';
import MeshPanel from './MeshPanel.jsx';
import ActivityFeed from './ActivityFeed.jsx';

export default function AdvancedSection({ devices, onGossip, onFlush, onReset, busy, log }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="advanced-section">
      <button className="advanced-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? '▾' : '▸'} Advanced: step through the mesh manually
      </button>

      {open && (
        <div className="grid-mesh" style={{ marginTop: 14 }}>
          <MeshPanel devices={devices} onGossip={onGossip} onFlush={onFlush} onReset={onReset} busy={busy} />
          <ActivityFeed entries={log} />
        </div>
      )}
    </div>
  );
}
