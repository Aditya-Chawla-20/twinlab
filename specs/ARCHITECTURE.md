# Architecture and decision record

## Flow
Local file → native video → pixel observations → calibrated one-dimensional series → chronological training/validation split → deterministic fits → prediction overlays and report.

Meta is optional for assistance, essential to the intended final hackathon model story: explicit user-run Muse planning and SAM tracking endpoints. Manual observations provide an independent baseline and an offline recovery path. A sample alone does not verify Meta integration.

## Boundaries
- `src/lib/physics.ts`: numerical models, calibration and diagnostics. No network or UI.
- `src/lib/project.ts`: portable project contract, untrusted JSON validation, original synthetic sample.
- `src/lib/meta.ts`: shared published-price calculations and API response types.
- `server/meta.ts`: bounded same-origin requests; key stays in process; injected fetch for offline checks; no retries.
- `server/index.ts`: loopback HTTP server with Vite middleware in development and static dist in production.
- `src/App.tsx`: user workflow and request ownership. Stale work is invalidated when replacing a project/video.

One process, one browser project, JSON exports. Local files are not uploaded except after the user confirms a paid provider action. No application-owned server persistence. The user can save/reopen a project and relink its original video.

## Numerical contract
Train on the first 70% of time-ordered observations by default. Fit coefficients using training data only. Rank candidate models by training BIC, not validation error. Report validation RMSE separately; repeated inspection makes this a validation set, not a pristine final test. Fit an independent recording separately; cross-recording transfer is not claimed.

Frequency/damping search is bounded with refinement; coefficients are solved by least squares. It is not an arbitrary physical simulator. Counterfactual frequency/damping controls are phenomenological and are labeled exploratory, not verified interventions.

## Scope ceilings and upgrade triggers
- Single-user loopback service: add authentication, per-user storage and quotas before public hosting.
- Videos capped at 30 MB / 30 seconds for user-run Meta requests; use an object store and jobs only if real demand requires larger input.
- Browser fitting capped at 2,000 observations; move into a Web Worker when supported datasets exceed this bound.
- SAM boxes become reviewable center observations; mask centroid measurement is a later precision improvement, not a present claim.
- Uniform frame-rate confirmation is mandatory before mapping SAM indices to timestamps. Variable-frame-rate videos need transcoding or an actual frame timestamp table.
