export default function AccountsPanel({ accounts, flashed }) {
  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  return (
    <div>
      <h2 className="section-title">Account balances</h2>
      <div className="account-grid">
        {accounts.map((a) => (
          <div className="account-card" key={a.vpa}>
            <div className="holder">{a.holderName}</div>
            <div className="vpa">{a.vpa}</div>
            <div className={`balance ${flashed.has(a.vpa) ? 'flash' : ''}`}>
              {formatter.format(a.balance)}
            </div>
          </div>
        ))}
        {accounts.length === 0 && <div className="empty-row">No accounts seeded yet.</div>}
      </div>
    </div>
  );
}
