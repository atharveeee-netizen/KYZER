# CareDOM — Person 2 Handoff (v3, 20 Aug)

Supersedes v2 (morning of 20 Aug). Upload at the start of a new chat.

---

## Who and what

I'm **Kavin**, Person 2 (Backend & Database) on **Team KYZER**, building **CareDOM** —
a BRICS-federated rural healthcare supply chain platform for the **Build with AI:
Code for Communities 2** hackathon on Hack2skill.

**Team:** Atharve (Person 1, AI/optimization, repo owner), me (Person 2, backend/DB),
Arnav (Person 3, frontend/GIS), Sumit (Person 4, voice/alerts/submission).

**Repo:** https://github.com/atharveeee-netizen/KYZER (public, work on `main` — it moves fast, pull first)

**Deadline: 24 August.** Video/deck on the 23rd, submit early on the 24th.
Evaluations 25–28, top 20 announced, virtual finale 29 Aug, Demo Day 4 Sept.

---

## How I want to work with Claude

- **Explain before building.** Design discussion and my approval before any artifact.
- **Smaller pieces.** No large unsolicited outputs.
- **Flag design decisions** rather than making them silently.
- **Division of labour:** Claude Code does local execution; this chat is for design
  decisions, architectural review, code review, and drafting prompts/messages.

---

## STATUS: backend — six routers, all live-verified

**Live: https://caredom-db-service.onrender.com** — Swagger at `/docs`

Verified against the deployed URL (not just locally), and against real browser CORS
for the ones the frontend actually calls, not just curl (curl ignores CORS entirely):

| Endpoint | File | Verified behaviour |
|---|---|---|
| `GET /health`, `/api/v1/health` | `main.py` | `{"status":"ok","service":"caredom-backend"}` |
| `GET /api/v1/inventory?country_code=IND` | `dashboard_routes.py` | One row per facility: beds, latest staff attendance, in-stock inventory (json_agg) |
| `GET /api/v1/facilities` | `facilities_routes.py` | One row per facility shaped for the frontend's `HealthFacility`: `days_to_stockout`, `risk_tier`, `cascade_risk_score` (heuristic, see below) |
| `GET /api/v1/alerts` | `alerts_routes.py` | `{"count", "alerts"}` — any facility in P0_CRITICAL/P1_WARNING for MED-PCM-500. Shares risk-tier thresholds with `/facilities` via `_risk_tier_sql.py` (see Design decisions) |
| `POST /api/v1/inventory/allocate` | `inventory_routes.py` | FEFO reservation via `allocate_fefo_stock()`. On PHC-PUN-001/MED-PCM-500: 784 from expiry 2026-10-17 drained first, then a partial slice from 2027-01-15; 2 RESERVE ledger rows. 409 on insufficient stock, zero rows changed |
| `GET /api/v1/redistribution/suggest` | `redistribution_routes.py` | Nearest domestic donor via PostGIS `<->` KNN. `allow_cross_border=true` (default false) adds a second, independent cross-border search — see below |
| `POST /api/v1/ocr/commit-register` | `ocr_routes.py` | Idempotent — zero ledger rows on an exact repost (`WHERE ... IS DISTINCT FROM` gates the write, not a pre-check) |
| CORS | `main.py` | `allow_origins=["*"]`, credentials on — Starlette echoes the real Origin, not a literal `*`. Preflight 200, confirmed against the GitHub Pages origin in a real browser |

**Redistribution params are `requesting_facility_id`, `item_code`, `needed_qty`** — not `facility_id`.

**`allow_cross_border`** (default `false`): when `true`, response gains a `cross_border_donor`
field alongside the existing `suggested_donor`, from an independent BRICS-federation
search (same country predicate inverted, 30-day shelf-life floor instead of 14).
For PHC-PUN-002: domestic donor is **PHC-PUN-004 at 9.8 km**; cross-border donor is
**CHC-TSH-004 (Mamelodi West, ZAF) at 6,970.3 km**. Cross-border sets
`estimated_transit_minutes: null` and `transit_mode: AIR_FREIGHT_REQUIRED` deliberately
— no air-logistics model exists anywhere in this system, so a number wasn't invented.
This closed the reviewers' ~20% cross-border scoring gap. The `allow_cross_border=false`
path is byte-identical to before this was added.

**Infrastructure**
- Neon Postgres + PostGIS 3.5, region `ap-southeast-1` (Singapore)
- Render web service `caredom-db-service`, Docker, build context `backend/`, Singapore, free tier.
- **Auto-Deploy is set to "On Commit" in Render's settings but has never actually fired** —
  every deploy so far (checked the Deploys tab, all show Trigger: Manual) was triggered by
  hand via the "Manual Deploy" button. **A `git push` to main does NOT deploy.** After every
  push, go to the Render dashboard's Deploys tab and click Manual Deploy, then confirm it
  actually shows as building/live before assuming the change is out. Do not use "no error
  from curl" as a proxy for "it deployed" — that cost real time this week polling a stale build.
- `DATABASE_URL` is the only env var. Lives in `backend/.env` (gitignored and
  dockerignored); recreate from `~/Downloads/env.txt` if a session loses it —
  that file has PGUSER and PGPASSWORD only, host is
  `ep-winter-star-azvhv4we.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
  (direct host, **no** `-pooler` — asyncpg's prepared statements break through pgbouncer)
- Service B (AI/quantum, `Dockerfile.ai`) is still **not deployed** — needs GCP billing,
  unlikely to fit Render's free tier. `/routing/plan`, `/ocr/upload`, `/ocr/extract`,
  `/alerts/stream` are all unreachable in production as a result.

**Free tier caveat:** spins down after ~15 min idle, first request ~50s. Neon
autosuspends too. Warm every endpoint before recording the demo —
`scripts/demo_drawdown.py`'s Stage 0 does this automatically and prints timing.

**Schema** (`backend/db/schema.sql`, single source of truth, no ORM/migrations):
`facilities`, `item_masters`, `inventory_batches`, `facility_beds`, `staff_attendance`,
`inventory_ledger` (append-only), and the FEFO reservation function `allocate_fefo_stock()`
(plain `FOR UPDATE`, not `SKIP LOCKED`). New since v2:

- **`facility_item_consumption`**: 126 rows, one per (facility, item), storing a
  precomputed `avg_daily_consumption` — the mean daily consumption over the **final
  30 days of the seed CSV's 2018-10-09 → 2019-10-08 window**. This is **not live
  telemetry** — it's a static baseline from historical seed data, refreshed only by
  the seeder today. `days_to_stockout` = current stock ÷ this number. Don't let
  anyone describe this as a live feed on camera.

---

## Design decisions locked in (don't relitigate)

- **Plain `FOR UPDATE`, never `SKIP LOCKED`** in FEFO. `SKIP LOCKED` skips a locked
  earliest-expiring batch and allocates a later one — the exact failure FEFO prevents.
- **Ledger row per allocation, same transaction.** Over-request → 409, zero rows changed.
- **Raw asyncpg, no ORM, no Alembic.** Schema is `backend/db/schema.sql`.
- **Two services.** `ai_router` must NOT be mounted in Service A (`main.py`) — its image
  excludes `ai_engine`, so mounting it crashes the container on boot. There's a comment
  in `main.py` at the `include_router` block saying so. **This has been re-added by
  mistake twice already** — watch for it every time you touch `main.py`.
- **Risk-tier thresholds are shared via `backend/app/routes/_risk_tier_sql.py`**, not
  duplicated by hand: `<3` days → `P0_CRITICAL`, `<7` → `P1_WARNING`, `>30` →
  `P2_SURPLUS`, else `P3_NORMAL`. 3 and 7 come from `ai_engine/config.py`'s
  `CRITICAL_STOCKOUT_THRESHOLD_DAYS`/`FORECAST_HORIZON_DAYS` (cited by name — Service A
  never imports `ai_engine`); 30 is an arbitrary display cutoff, not sourced anywhere else.
  `facilities_routes.py` is treated as frozen/already-verified and keeps its own inline
  copy rather than importing this constant — the two are kept honest by a runtime
  cross-check (any facility `/alerts` flags P0/P1 must also show that tier on
  `/facilities`), not a shared import. If you ever see them disagree, that's the thing
  to fix first.
- **`backend/requirements.txt` is pinned** (`fastapi==0.141.1`, `uvicorn[standard]==0.52.3`,
  `pydantic==2.13.4`, `pydantic-settings==2.15.0`, `asyncpg==0.31.0`) to the versions
  actually running in the deployed image, not to whatever `pip` resolves today. Render
  auto-deploys from `main` with no lockfile; an upstream release between now and Demo Day
  could otherwise break a build with no commit to blame. Bump deliberately.
- **`dispatch_action` in `/redistribution/suggest`** no longer points at
  `POST /api/v1/inventory/transfer` — that route was never implemented. It now says so
  honestly. There is still no inter-facility transfer endpoint; `/inventory/allocate` is
  NOT a substitute (it reserves stock within one facility from its own batches).
- **Batches split 2–3 per facility with staggered expiry** for most (facility, item)
  pairs — but this is uniform synthetic seeding (fixed 3-way split, always the same
  three expiry dates: 2026-10-17 / 2027-01-15 / 2027-04-15), not organic variation.
  The one facility with a genuinely distinct, single-batch "digitised register" is
  **PHC-PUN-002** (5 items: MED-AMX-250, MED-ART-60, MED-INS-REG, MED-ORS-PKG, and
  MED-PCM-500 — the item the drawdown demo uses). Because MED-PCM-500 at PHC-PUN-002
  is single-batch, it can't show a FEFO split — `scripts/demo_drawdown.py`'s `fefo`
  subcommand uses **PHC-PUN-001/MED-PCM-500** instead (three real batches) for that slide.
- **OCR idempotency:** beds/staff are gauges (upsert); batches upsert with
  `WHERE ... IS DISTINCT FROM` so `RETURNING` only yields changed rows and drives
  ledger writes.
- **Unknown item codes skipped and reported**, never auto-created.
- **CORS `allow_origins=["*"]`, no auth** — judges must not hit a login wall.
- **Two deleted docs**: `docs/IBM_QUANTUM_EXECUTION_RESULTS.md` and
  `docs/ROUTING_BENCHMARK_20_PAPERS.md` are gone (agreed with Atharve) — their
  headline figures were unverifiable/fabricated. `README.md`'s dangling link to the
  second one has also been removed.

**Known caveats (documented, deliberately not fixed):**
- Reserved stock has no lifecycle — no unreserve/transfer/dispatch endpoint exists.
  `scripts/demo_drawdown.py`'s `reset` exists **because of** this gap, not despite it.
- An OCR commit can orphan a FEFO reservation (register overwrites `quantity_available`
  with the physical shelf count; it has no notion of "reserved for an in-flight transfer").
- `/api/v1/alerts/stream` (Service B, undeployed anyway) emits a canned message every
  15s, not DB-derived.

---

## Open blockers — not mine to fix, but I'm tracking them

1. **Still no working `GEMINI_API_KEY`.** Without it, OCR returns simulated data. This
   got *more* honest since v2, not less real: `extraction_mode` now correctly reports
   `"simulated"` instead of defaulting to `"gemini"` (which would have shown a false
   LIVE GEMINI label on camera). The underlying gap is unchanged — **this is the
   mandatory Google AI gate; submissions without Google AI are not considered.**
2. **Frontend now calls the live API** — this is real progress since v2, when it was
   mockData-only. `api.ts` is wired to `/facilities`, `/inventory/allocate`,
   `/redistribution/suggest`, and polls `/alerts`. Worth a final pass before the 23rd to
   confirm no tab silently still reads `mockData` for something the API now serves.
3. **Who owns GCP with billing?** Still only needed for Service B, still unresolved.
4. **Quantum claims are gone from the spoken pitch script and the UI** (Atharve,
   commits `1b56647`/`ba6c9d6`/`94fc937`, 20-21 Aug) — redistribution is now
   attributed to PostGIS KNN + OR-Tools, not `ibm_fez`/156-qubit/quantum hardware.
   `ai_engine/quantum/` itself is untouched and still has no real optimizer — see
   below for what to say if it comes up at the finale anyway.

---

## What's left for me (not code, mostly)

- **Be the second person who can explain the whole system for the 29th finale** — still
  true, still mostly Atharve right now.
- Two deck slides only I can source cleanly: the FEFO multi-batch allocation with its
  ledger trail (`scripts/demo_drawdown.py fefo`, PHC-PUN-001/MED-PCM-500), and the
  PostGIS redistribution at 9.8 km / 6,970.3 km cross-border.
- **Rehearse with `scripts/demo_drawdown.py`, not by hand.** `run` (P0 drawdown on
  PHC-PUN-002/MED-PCM-500) and `fefo` (two-batch split on PHC-PUN-001/MED-PCM-500) each
  have a matching `reset` — allocate has no reversal path in this build, so without
  `reset` each facility gets exactly one rehearsal before someone has to fix Neon by
  hand. `reset` restores whichever of the two are pending, in one transaction, and is
  safe to call with only one outstanding. Observed timings warm: `run` ~5–10s stages
  1–4, `fefo` ~6–9s. Cold start adds ~50s to Stage 0, once.
- Give whoever owns the deck/pitch script the QAOA findings below before they present
  live numbers a judge could ask to see recomputed.
- Optional: deploy Service B, and kill the 50s cold start (Cloud Run `min-instances=1`).

### The quantum module — what to say if it comes up at the finale

As of `1b56647`/`ba6c9d6`/`94fc937` (Atharve, 20-21 Aug), the pitch script and the
UI no longer claim `ibm_fez`/156-qubit/quantum hardware for redistribution — it's
now attributed to PostGIS KNN + OR-Tools, which is what actually runs in production.
`12.66 ms` is gone from `App.tsx`/`OperationsDrawer.tsx`. That fixes the
external-facing claim. **`ai_engine/quantum/ibm_quantum.py` itself was not touched
and still has no real optimizer** — this is the thing to know, not relitigate,
if a judge asks about it directly:

- `IBMQuantumRouter.solve_qaoa_route`'s "optimal" gamma/beta angles are a **fixed
  function of layer index alone**, at `ibm_quantum.py:203-204`:
  `opt_gammas = [round(0.12 * (layer + 1), 3) ...]`,
  `opt_betas = [round(0.35 / (layer + 1), 3) ...]`. No classical optimizer, nothing
  reads the QUBO or the distance matrix. I proved this isn't coincidental by running
  it three times — twice on identical inputs, once on a completely different
  facility cluster — and got the exact same `[0.12, 0.24]` / `[0.35, 0.175]` all
  three times. They'll match *any* input, real or not.
- **A real run of this code returns a suboptimal tour.** Against real PHC-PUN-002/
  004/001/003 coordinates, my run returned 120.37 km on the *worst* of the three
  distinct cyclic orderings for that cluster — not the true 106.86 km optimum
  (which I brute-forced independently, matching the committed JSON's tour
  *ordering* but not its 105.09 km distance figure). `_simulate_quantum_measurement`'s
  fixed-angle sampling doesn't reliably find the true minimum — there's no real
  search loop in this path, live claim or not.
- `ai_engine/quantum/ibm_quantum_results.json`'s numbers were typed as a literal
  dict in `scripts/apply_quantum_consistency_fixes.py`, not regenerated by running
  the code — confirmed by reading that script directly.
- One number from the old narrative survived the cleanup unnoticed:
  `frontend/src/components/tabs/RoutesTab.tsx:146` still says **"13.5 km Saved vs
  Classical Unoptimized (8.9% Faster)"** — that 8.9% only works out against the old
  138.89 km baseline, not the current 105.1 km figure. Minor compared to the
  hardware claim, but still wrong if anyone checks the arithmetic.
- `DH-DEPOT-001` (not one of the 18 seeded facilities) is gone from the deck and
  `InventoryTab.tsx`, but still appears in two dev/benchmark scripts that aren't on
  any live path: `ai_engine/allocator/benchmark.py` and `ai_engine/quantum/export_circuit.py`.

I did not edit any of this — read-only verification, reported to Atharve. His call
how far the quantum module itself gets touched before the 23rd.

---

## Pattern worth knowing

Documentation on this project has repeatedly outrun the code — a fabricated
bibliography, benchmark numbers contradicting their own committed CSV, a folder tree
for directories that didn't exist, "100% OPERATIONAL & VERIFIED" while the frontend
was on mock data. Not malice; fast AI-generated output mistaken for finished work.

**Verify claims against running code before building on them.** Every real bug found
this week surfaced only from actually running things — the original list still holds
(`ST_Distance` returning degrees not metres, `ai_router` crashing a Service-A-only
image, `CareDOMEngine` missing `ocr_engine`, CORS rejecting the frontend origin while
curl passed) — and this week added three more of the same shape:

- Render's "Auto-Deploy: On Commit" setting doing nothing — every deploy this week was
  actually manual, confirmed only by reading the Deploys tab, not by polling the endpoint.
- Atharve also runs a second, older checkout of `WISER_NESTLE_DOM` on his machine —
  a file path named in a commit message is not proof of which repo was actually
  edited. Confirm against `KYZER`'s own `git log`/`git show`, not the commit message's word for it.
- The QAOA angles "matching" a fabricated file wasn't reassuring evidence of anything —
  running the code proved they're structurally incapable of *not* matching, any input,
  because nothing in the code optimizes them.
- `current_stock_pcm500` on 17 of 18 facilities is real, but `days_to_stockout` for
  all 18 is currently ~30+ days (P3_NORMAL/P2_SURPLUS) because the seeded consumption
  history is steady-state with no stockout in it. Any "1.4 days critical" figure seen
  anywhere is mockData, not a live number — the crisis has to be created live, with
  `demo_drawdown.py`, or it doesn't exist. Related: bed occupancy is 0 for 17 of 18
  facilities (only PHC-PUN-002 has a digitised register), so `cascade_risk_score`'s
  occupancy term is inert almost everywhere it's shown — and `cascade_risk_score`
  itself is a SQL heuristic, not Service B's isolation forest; `/facilities` says so
  via `cascade_risk_source: "heuristic"` on every row.

Also still true: **test against the deployed URL, not localhost.** curl ignores CORS
entirely, so a browser-only failure is invisible from the terminal.
