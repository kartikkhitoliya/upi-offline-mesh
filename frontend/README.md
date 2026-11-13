# UPI Mesh — React console

A React (Vite) frontend for the `upi-offline-mesh` Spring Boot backend
(in [`../backend`](../backend)). It replaces `dashboard.html`/Thymeleaf with
a proper SPA talking to the existing REST API.

CORS is already configured on the backend (`backend/src/main/java/com/demo/upimesh/config/CorsConfig.java`)
to allow `http://localhost:5173` (Vite's default port). If you deploy the
frontend somewhere else, add that origin there too.

## 1. Run the backend

```bash
./mvnw spring-boot:run
```

It should come up on `http://localhost:8080`.

## 2. Run this frontend

```bash
npm install
cp .env.example .env   # edit VITE_API_BASE_URL if your backend isn't on :8080
npm run dev
```

Open `http://localhost:5173`.

## What it does

- **Send a payment** — one form (from / to / amount / PIN), one button. Behind
  that single click it still does the full pipeline the backend expects —
  `/api/demo/send` (encrypt + inject), two `/api/mesh/gossip` rounds so the
  packet actually reaches the bridge device, then `/api/mesh/flush` — but you
  never have to click through those steps yourself. A live status line shows
  what's happening (encrypting → broadcasting → bridge uploading → settled).
- **Account balances** — polls `/api/accounts`; a balance flashes green for a
  moment when it changes, so a settlement is visible without reading the ledger.
- **Transaction ledger** — `/api/transactions`, newest 20, with settle status.
- **Advanced (collapsed by default)** — the original mesh graph and manual
  gossip/flush/reset buttons, for when you actually want to see each hop or
  demo the idempotency/duplicate-drop behavior step by step.

Mesh state polls every 4s so the graph (inside Advanced) stays current even
if you're driving the backend from `curl` or the test suite at the same time.

## Suggested demo flow

1. Leave the defaults (alice → bob, ₹500) and click **Send payment**. Watch the
   status line and the ledger/balances below update on their own.
2. Try an amount bigger than the sender's balance (e.g. ₹50,000) — you'll see
   it come back **Rejected**, because the backend checks funds only when the
   packet finally reaches the server, not when it's composed offline.
3. Open **Advanced** if you want to see the mesh graph animate hop by hop, run
   gossip rounds manually, or demo the duplicate-drop behavior by flushing
   twice without resetting.

To see the idempotency guarantee rather than take the README's word for it,
run the backend's own test:
```bash
./mvnw test -Dtest=IdempotencyConcurrencyTest#singlePacketDeliveredByThreeBridgesSettlesExactlyOnce
```

## Pointing at a deployed backend

Edit `.env` (`VITE_API_BASE_URL`) and rebuild (`npm run build`) if the
backend isn't running on `http://localhost:8080` — e.g. a deployed URL. Also
add that origin to the backend's `CorsConfig.java`.
