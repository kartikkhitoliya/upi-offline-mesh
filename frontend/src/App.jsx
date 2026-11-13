import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api/client.js';
import TopBar from './components/TopBar.jsx';
import SimpleSendCard from './components/SimpleSendCard.jsx';
import AccountsPanel from './components/AccountsPanel.jsx';
import LedgerPanel from './components/LedgerPanel.jsx';
import AdvancedSection from './components/AdvancedSection.jsx';

let idCounter = 0;
const nextId = () => (idCounter += 1);

export default function App() {
  const [serverKey, setServerKey] = useState(null);
  const [connected, setConnected] = useState(true);
  const [devices, setDevices] = useState([]);
  const [cacheSize, setCacheSize] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [log, setLog] = useState([]);
  const [steps, setSteps] = useState([]);
  const [busy, setBusy] = useState(false);
  const [flashed, setFlashed] = useState(new Set());

  const prevBalances = useRef({});

  const pushLog = useCallback((kind, text) => {
    setLog((prev) => [...prev.slice(-29), { id: nextId(), kind, text }]);
  }, []);

  const pushStep = useCallback((kind, text) => {
    setSteps((prev) => [...prev, { id: nextId(), kind, text }]);
  }, []);

  const refreshAccounts = useCallback(async () => {
    const next = await api.getAccounts();
    const changed = new Set();
    next.forEach((a) => {
      const prev = prevBalances.current[a.vpa];
      if (prev !== undefined && prev !== a.balance) changed.add(a.vpa);
      prevBalances.current[a.vpa] = a.balance;
    });
    setAccounts(next);
    if (changed.size > 0) {
      setFlashed(changed);
      setTimeout(() => setFlashed(new Set()), 900);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    const [meshState, txs] = await Promise.all([api.getMeshState(), api.getTransactions()]);
    setDevices(meshState.devices);
    setCacheSize(meshState.idempotencyCacheSize);
    setTransactions(txs);
    await refreshAccounts();
  }, [refreshAccounts]);

  useEffect(() => {
    (async () => {
      try {
        const key = await api.getServerKey();
        setServerKey(key);
        setConnected(true);
      } catch {
        setConnected(false);
      }
      try {
        await refreshAll();
      } catch {
        setConnected(false);
      }
    })();
  }, [refreshAll]);

  // light polling so the mesh graph / cache size stay current
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const meshState = await api.getMeshState();
        setDevices(meshState.devices);
        setCacheSize(meshState.idempotencyCacheSize);
        setConnected(true);
      } catch {
        setConnected(false);
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function withBusy(fn) {
    setBusy(true);
    try {
      await fn();
      setConnected(true);
    } catch (err) {
      setConnected(false);
      pushLog('error', err.message);
    } finally {
      setBusy(false);
    }
  }

  // One click does the whole thing: encrypt + inject, a couple of gossip
  // rounds so the packet actually reaches the bridge device, then flush.
  async function handleSimpleSend(payload) {
    setBusy(true);
    setSteps([]);
    try {
      pushStep('pending', `Encrypting ₹${payload.amount} on ${payload.senderVpa}'s phone…`);
      const sendResult = await api.sendPayment({
        ...payload,
        ttl: 5,
        startDevice: 'phone-alice'
      });
      const shortId = sendResult.packetId.slice(0, 8);
      await sleep(350);

      pushStep('pending', `Packet ${shortId}… broadcasting over Bluetooth to nearby phones…`);
      await api.gossipRound();
      await sleep(250);
      await api.gossipRound();
      await sleep(250);

      pushStep('pending', 'A bridge phone just walked outside and got 4G — uploading…');
      const flushResult = await api.flushBridges();
      const match = flushResult.results.find((r) => r.packetId === shortId);

      if (!match) {
        pushStep(
          'duplicate',
          "Packet hasn't reached a bridge device yet — try sending again, or open Advanced and run an extra gossip round."
        );
      } else if (match.outcome === 'SETTLED') {
        pushStep('settled', `Settled — transaction #${match.transactionId}.`);
      } else if (match.outcome === 'DUPLICATE_DROPPED') {
        pushStep('duplicate', 'This exact packet already settled earlier — duplicate dropped, money moved only once.');
      } else {
        pushStep('rejected', `Rejected — ${match.reason || 'insufficient balance or invalid packet'}.`);
      }

      await refreshAll();
      setConnected(true);
    } catch (err) {
      setConnected(false);
      pushStep('rejected', `Something went wrong: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  function handleGossip() {
    withBusy(async () => {
      const result = await api.gossipRound();
      pushLog('settled', `Gossip round: ${result.transfers} packet transfer(s) across the mesh`);
      await refreshAll();
    });
  }

  function handleFlush() {
    withBusy(async () => {
      const result = await api.flushBridges();
      if (result.uploadsAttempted === 0) {
        pushLog('duplicate_dropped', 'No bridge node is currently holding a packet — run gossip first.');
      }
      result.results.forEach((r) => {
        pushLog(
          r.outcome.toLowerCase(),
          `${r.bridgeNode} → packet ${r.packetId}… ${r.outcome}${r.transactionId >= 0 ? ` (tx #${r.transactionId})` : ''}${r.reason ? ` — ${r.reason}` : ''}`
        );
      });
      await refreshAll();
    });
  }

  function handleReset() {
    withBusy(async () => {
      await api.resetMesh();
      pushLog('duplicate_dropped', 'Mesh and idempotency cache cleared.');
      await refreshAll();
    });
  }

  return (
    <div className="app-shell">
      <TopBar serverKey={serverKey} cacheSize={cacheSize} connected={connected} />

      <section className="zone-void">
        <div className="grid-simple">
          <SimpleSendCard accounts={accounts} onSend={handleSimpleSend} busy={busy} steps={steps} />
        </div>

        <AdvancedSection
          devices={devices}
          onGossip={handleGossip}
          onFlush={handleFlush}
          onReset={handleReset}
          busy={busy}
          log={log}
        />
      </section>

      <section className="zone-paper">
        <div className="grid-ledger">
          <AccountsPanel accounts={accounts} flashed={flashed} />
          <LedgerPanel transactions={transactions} />
        </div>
      </section>

      <footer className="app-footer">
        UPI Mesh console · talking to {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}
      </footer>
    </div>
  );
}
