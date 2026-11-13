const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${options.method || 'GET'} ${path} failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export const api = {
  getServerKey: () => request('/api/server-key'),
  getAccounts: () => request('/api/accounts'),
  getTransactions: () => request('/api/transactions'),
  getMeshState: () => request('/api/mesh/state'),

  sendPayment: (payload) =>
    request('/api/demo/send', { method: 'POST', body: JSON.stringify(payload) }),

  gossipRound: () => request('/api/mesh/gossip', { method: 'POST' }),

  flushBridges: () => request('/api/mesh/flush', { method: 'POST' }),

  resetMesh: () => request('/api/mesh/reset', { method: 'POST' })
};

export { BASE_URL };
