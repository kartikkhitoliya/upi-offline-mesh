const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return new Date(iso).toLocaleTimeString();
}

export default function LedgerPanel({ transactions }) {
  return (
    <div>
      <h2 className="section-title">Transaction ledger</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Bridge node</th>
              <th>Hops</th>
              <th>Status</th>
              <th>Settled</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{t.senderVpa}</td>
                <td>{t.receiverVpa}</td>
                <td>{formatter.format(t.amount)}</td>
                <td>{t.bridgeNodeId}</td>
                <td>{t.hopCount}</td>
                <td>
                  <span className={`status-pill ${t.status === 'SETTLED' ? 'settled' : 'rejected'}`}>
                    {t.status}
                  </span>
                </td>
                <td>{timeAgo(t.settledAt)}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-row">
                  No settlements yet — run the mesh flow above to see one land here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
