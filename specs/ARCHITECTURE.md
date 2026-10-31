# Architecture and decisions

## Flow and boundaries

Local video → pixel observations → optional calibrated 1D series → chronological fitting/validation → frozen source model → prefix-only alignment on separate target observations → later-only scores and reproducible exports.

- `src/lib/physics.ts`: bounded numerical fitting/calibration/diagnostics; no network or UI.
- `src/lib/project.ts`: bounded portable project schema, provenance and JSON/CSV parsing.
- `src/lib/twin.ts`: source snapshots, SHA-256 identities, imported-source verification, frozen transfer, baselines and reports.
- `src/lib/draft.ts`: validated one-slot localStorage recovery; malformed/full-storage behavior.
- `src/lib/meta.ts`: shared response contracts and reported-usage price arithmetic.
- `server/meta.ts`: server-only key, bounded Meta transport, injected fetch, no retries and usage retention.
- `server/landmarks.ts`: official-parser foreground centroids mapped through source bounds; missing masks remain missing.
- `server/index.ts`: loopback-only same-origin HTTP boundary, Vite development/static production service and metadata ledger. Injectable performer permits offline HTTP integration without provider calls.
- `src/App.tsx`: project/file ownership, explicit paid confirmation, stale-result invalidation and navigation.
- `src/Predict.tsx`: immutable-input evaluation state and evidence exports; edits invalidate scores.

One Node process, one browser project, native files/JSON. Videos are sent to Meta only for an explicitly confirmed paid stage. Ordinary analysis never uploads them. No application-owned video/project cloud storage.

## Numerical contract

Fit on the earlier 70% by default, retaining at least eight training and three validation points. Fits carry their actual trainCount; charts/tables/exports reuse it. Search bounds use training timestamps only. Rank by training BIC and report later validation separately. Repeated inspection is exploratory, not a pristine final test.

Freeze a normalized source snapshot plus parameters and SHA-256 identity. Imported artifacts must reproduce the source fit within 1e-8 relative/absolute tolerance (browser/Node floating point can differ). An exported artifact retains its digest; refreezing in another runtime may produce a different ID. Frequency/decay or acceleration stay fixed. B’s declared prefix aligns only initial state; at least eight initial/evaluation points and one period for oscillators are required. Reject obvious self-evaluation, inconsistent units/axes and pixel-frame dimensions. Different hashes do not prove independent capture. See PREDICTION-DESIGN.md.

## Observations and provenance

Box centers and foreground mask centroids are explicit selectable landmarks, neither a center of mass. Preserve source/landmark, missing observations, frame timing and video SHA-256. Relinking a source with a known digest rejects changed bytes. Tracking target persists with the project. A reviewed Muse proposal may update target/axis; merely opening it does not apply it.

Project.synthetic declares generated footage/data separately from Point.source. CSV import does not clear the declaration. Recorded Meta runs retain model/usage metadata; loading a sample never repeats inference. Included real clips remain uncalibrated pixels because no metric reference is verified.

## Recovery and asynchronous ownership

Persist a validated bounded draft after project edits, never video-time ticks. Do not silently overwrite malformed prior recovery data. Report storage failures and warn on close when needed. JSON is the portable backup; videos relink after refresh except allowlisted bundled files with verified hashes. Concurrent tabs share one slot.

A synchronous busy ref prevents duplicate paid requests. Existing epoch ownership invalidates asynchronous imports/freezes/provider results after project/file changes. Results attach to the exact evaluated immutable Project input; any relevant edit hides stale scores. Predict does not run B’s ordinary fitter.

## Public/private boundary

`npm run build:demo` produces relative-path static assets in dist-demo. Compile-time guards remove API status/usage/paid calls. Static visitors can import videos, mark/calibrate/import points, fit, predict, export and recover locally; Meta controls stay disabled. No owner key or server ledger is included. The public GitHub Pages site serves this build only.

The optional paid server remains 127.0.0.1 with Host/Origin checks. Public paid uploads would require authentication, per-user durable budgets/storage and explicit deployment work; they are outside this MVP. A public static demo does not expose the loopback server.

## Scope ceilings

- Meta: 30 MB / 30 s / confirmed zero-origin constant frame rate, bounded frames/output, no retries.
- Browser: 2,000 observations, bounded project/model/draft input. Add a worker only when supported data exceeds this ceiling.
- Mask centroid: at most four million pixels per decoded mask. Empty masks create no point.
- Persistence: one browser draft and append-only local accounting metadata; no DB, queue or account system.
- Counterfactual sliders are exploratory parameter changes, not validated physical interventions.

## Authorized test runner

scripts/meta-live-test.ts uses the same provider integration through a conservative durable reservation ledger and single-runner lock. Selected footage requires reviewed SHA-256, explicit question/target and all decoded timestamps. Dry runs load no key or budget state. Never reset the existing ledger or consume unused budget automatically. Actual provider calls and the ordinary browser HTTP boundary are checked separately; the successful HTTP route uses offline fake transport, while real provider evidence comes only from the capped runner.
