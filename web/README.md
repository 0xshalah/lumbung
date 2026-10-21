# Lumbung web

React 19 single-page app for the Lumbung SEP-56 vault on Stellar Testnet.

- `/` — landing page, docs hub, live vault stats
- `/app` — vault dashboard: connect Freighter, deposit, withdraw, redeem
- `/docs` — plain-language mechanics (shares, decimals, rounding, limits)
- `/status` — hand-maintained status snapshot
- `/changelog` — release history

There is **no backend**. The app talks straight to Soroban RPC and Horizon.

## Stack

| Layer | Choice |
|---|---|
| UI | React 19, React Router 7, Tailwind CSS, Radix/shadcn primitives |
| Build | Create React App 5 + CRACO (webpack), `legacy-peer-deps` |
| Chain | `@stellar/stellar-sdk` 17.2.1 |
| Wallet | `@stellar/freighter-api` 6.0.1 (Freighter extension) |
| Hosting | Vercel static build with SPA rewrite |

## Run locally

```bash
cd web
npm install          # .npmrc sets legacy-peer-deps=true
npm start            # http://localhost:3000
```

Useful checks:

```bash
CI=false npm run build   # production build in web/build
npx serve -s build       # serve the build with SPA fallback
```

## Environment

All values are public; never put a secret key in a `REACT_APP_*` variable.
CRA inlines them at build time.

| Variable | Purpose |
|---|---|
| `REACT_APP_VAULT_CONTRACT_ID` | Vault contract (`C...`, 56 chars) |
| `REACT_APP_SOROBAN_RPC_URL` | Soroban RPC endpoint |
| `REACT_APP_HORIZON_URL` | Horizon endpoint, used for the wallet's XLM balance |
| `REACT_APP_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` |
| `REACT_APP_READ_SOURCE` | Funded public account used only as the simulation source for read calls |
| `REACT_APP_GITHUB_URL` | Repository link |
| `REACT_APP_X_URL` | Project X profile |

`.env.production` contains the values for the Testnet deployment. Copy
`.env.example` to `.env` if you want to override them locally.

`REACT_APP_READ_SOURCE` is a **public** address. Simulations do not consume a
sequence number, cost a fee, or require a signature. It exists because Soroban
RPC needs an existing account as the transaction source even for read-only
simulation.

## How a transaction flows

1. The user enters an amount; the app previews shares/assets with the same
   integer formula as the contract (`src/lib/vault-math.js`).
2. On submit, the app builds a `deposit`, `withdraw`, or `redeem` operation and
   calls `prepareTransaction` (simulation + resource estimation + auth).
3. Freighter signs the prepared envelope. The app sends it and polls
   `getTransaction` until `SUCCESS` or `FAILED` (60 s budget).
4. Totals are re-read from RPC; the landing and dashboard refresh every 15 s.

Reads are simulations of `total_assets`, `total_supply`, and `balance`, decoded
with `scValToNative`. The wallet's spendable XLM comes from Horizon.

## Decimals

XLM has 7 decimals. Shares have **10** (asset decimals + offset 3). Formatting
and parsing therefore take an explicit decimals argument — do not reuse the
XLM formatter for shares. See `src/lib/format.js` and `src/lib/parse.js`.

## Deploy

Vercel project settings:

- **Root directory:** `web`
- **Build command:** `npm run build`
- **Output directory:** `build`
- **Environment:** `CI=false` (CRA otherwise turns lint warnings into build errors)

`vercel.json` rewrites every path to `index.html` so client-side routes work on
refresh. The contract ID and RPC URL are baked into `.env.production`; override
them in Vercel if you deploy against another network.

## Known limits

- Testnet only. No Mainnet build.
- Freighter is the only wallet integration for now.
- No indexer: the app shows current state, not transaction history.
- Contract state expires with the network's persistent-entry TTL (about 7 days
  on Testnet) unless someone extends it; this is fine for the challenge window.
