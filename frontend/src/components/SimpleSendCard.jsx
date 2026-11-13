import { useState } from 'react';
import StatusFlow from './StatusFlow.jsx';

export default function SimpleSendCard({ accounts, onSend, busy, steps }) {
  const vpas = accounts.map((a) => a.vpa);
  const [senderVpa, setSenderVpa] = useState('alice@demo');
  const [receiverVpa, setReceiverVpa] = useState('bob@demo');
  const [amount, setAmount] = useState('500');
  const [pin, setPin] = useState('1234');

  const sameAccount = senderVpa === receiverVpa;

  function submit(e) {
    e.preventDefault();
    if (sameAccount) return;
    onSend({ senderVpa, receiverVpa, amount: Number(amount), pin });
  }

  return (
    <div className="panel-void">
      <div className="panel-title">SEND A PAYMENT — no internet required on either phone</div>

      <form onSubmit={submit}>
        <div className="field-pair">
          <div className="field-row">
            <label>From</label>
            <select value={senderVpa} onChange={(e) => setSenderVpa(e.target.value)} disabled={busy}>
              {vpas.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <label>To</label>
            <select value={receiverVpa} onChange={(e) => setReceiverVpa(e.target.value)} disabled={busy}>
              {vpas.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-pair">
          <div className="field-row">
            <label>Amount (₹)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="field-row">
            <label>UPI PIN</label>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} disabled={busy} />
          </div>
        </div>

        {sameAccount && (
          <p style={{ color: 'var(--rejected)', fontSize: 11.5, marginTop: -4 }}>
            Sender and receiver can't be the same account.
          </p>
        )}

        <div className="action-row">
          <button className="btn btn-primary" type="submit" disabled={busy || sameAccount} style={{ flex: 1 }}>
            {busy ? 'Sending…' : '📤 Send payment'}
          </button>
        </div>
      </form>

      <StatusFlow steps={steps} />
    </div>
  );
}
