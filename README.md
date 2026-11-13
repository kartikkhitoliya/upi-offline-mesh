# UPI Offline Mesh

Offline UPI payments routed through a simulated Bluetooth mesh network.
You're in a basement with zero signal. You send your friend ₹500. Your
phone encrypts the payment, broadcasts it device-to-device, and it hops
through the mesh until some phone walks outside, gets 4G, and silently
uploads it to the backend — which decrypts, deduplicates, and settles it.

This repo has two parts:

```
upi-offline-mesh/
├── backend/     Spring Boot API + mesh simulator (Java 17)
└── frontend/    React console for driving the demo (Vite)
```

The backend also ships its own built-in dashboard at `/`, so the frontend
here is optional if you just want to see the demo work — but the React
console is the nicer way to drive it and is what these instructions assume.

## What this demonstrates

1. **A payment can travel through untrusted intermediaries without anyone
   in the middle reading or tampering with it.** (Hybrid RSA-OAEP + AES-256-GCM
   encryption — the same pattern TLS uses.)
2. **Even if the same payment reaches the backend simultaneously through
   several bridge devices, it settles exactly once.** (Atomic idempotency
   claim on the ciphertext hash, with a unique DB index as a fallback.)
3. **A tampered or replayed packet is rejected** before it touches the ledger.

See [`backend/README.md`](backend/README.md) for the full write-up —
architecture diagram, the three hard problems and how they're solved, the
API reference, and this design's honest limitations.

## Quick start

### Prerequisites

- JDK 17+ (`java -version`)
- Node.js 18+ and npm (`node -v`)

### 1. Run the backend

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

Runs on `http://localhost:8080` with an in-memory H2 database — nothing
else to install. Leave this running.

### 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL it prints — usually `http://localhost:5173`.

### 3. Try it

Pick a sender/receiver/amount and hit **Send payment**. The console walks
the packet through encryption → mesh gossip → bridge upload → settlement
automatically, and the account balances and transaction ledger update live.
Open **Advanced** in the UI to step through gossip rounds and bridge
flushing manually, or to see the mesh graph.

## Project structure

| Path | What it is |
|---|---|
| `backend/` | Spring Boot 3.3 app: crypto, mesh simulator, settlement, REST API |
| `backend/README.md` | Full architecture doc, API reference, test notes |
| `frontend/` | React (Vite) console that drives the backend's API |
| `frontend/README.md` | Frontend-specific setup and what each panel does |

## Configuration

The backend defaults to an in-memory H2 database so it runs with zero
setup. To point it at a real Postgres instance instead, set these
environment variables before starting it — **never commit real credentials
into `application.properties`**:

| Variable | Purpose |
|---|---|
| `DB_URL` | e.g. `jdbc:postgresql://<host>:<port>/<database>` |
| `DB_DRIVER` | `org.postgresql.Driver` |
| `DB_USERNAME` | DB username |
| `DB_PASSWORD` | DB password |
| `SERVER_PORT` | Backend port (default `8080`) |

The frontend reads its backend URL from `frontend/.env` (`VITE_API_BASE_URL`,
default `http://localhost:8080`). CORS for the frontend's dev origin is
already configured in `backend/src/main/java/com/demo/upimesh/config/CorsConfig.java` —
add any other origin you deploy the frontend to in that file.

## Tests

```bash
cd backend
./mvnw test
```

The interesting one is `IdempotencyConcurrencyTest` — it fires three
threads delivering the same packet simultaneously and asserts exactly one
settles.

## Honest limitations

This is a teaching/portfolio demo, not production-ready offline payments.
The backend README has a full section on what's simulated vs. real, and
on the inherent limits of "no internet anywhere in the chain" (e.g. a
sender can double-spend offline until the packet reaches the backend).
Worth reading before pitching this as more than it is.

## License

MIT — see [`LICENSE`](LICENSE). This is demo/learning code; use it however
you want.
