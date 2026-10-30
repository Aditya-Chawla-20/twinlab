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
Train on the first 70% of time-ordered observations by default. Fit coefficients using training data only. Frequency search bounds use training timestamps only. Fits carry their actual training count; charts, evidence and exports use it rather than independently rounding the requested fraction. At least eight training and three validation observations are retained, so small datasets may differ from the requested percentage. Rank candidate models by training BIC, not validation error. Report validation RMSE separately; repeated inspection makes this a validation set, not a pristine final test.

`src/lib/twin.ts` freezes source parameters and observations with a SHA-256 digest, verifies imports against the source fit, and evaluates another recording with prefix-only initial-state alignment. It reuses the numerical least-squares implementation. `scripts/predict.ts` provides the working CLI and reproducible evidence exports; browser integration is pending. Dynamics are never optimized against B. Source observations are embedded once, excluding usage/plans/nested comparisons. Project v1 remains backward compatible, with an optional bounded comparison. See PREDICTION-DESIGN.md for units, independence checks and acceptance gates. Generated transfer regressions do not establish physical transfer.

Frequency/damping search is bounded with refinement; coefficients are solved by least squares. It is not an arbitrary physical simulator. Counterfactual frequency/damping controls are phenomenological and are labeled exploratory, not verified interventions.

## Scope ceilings and upgrade triggers
- Single-user loopback service: add authentication, per-user storage and quotas before public hosting.
- Videos capped at 30 MB / 30 seconds for user-run Meta requests; use an object store and jobs only if real demand requires larger input.
- Browser fitting capped at 2,000 observations; move into a Web Worker when supported datasets exceed this bound.
- SAM boxes become reviewable center observations; mask centroid measurement is a later precision improvement, not a present claim.
- Uniform frame-rate confirmation is mandatory before mapping SAM indices to timestamps. Variable-frame-rate videos need transcoding or an actual frame timestamp table.

## Authorized live test harness
The user later authorized agent testing up to $10 total. scripts/meta-live-test.ts invokes the same provider integration through a constrained transport with a durable, conservative reservation ledger and a single-runner lock. This applies to the authorized test runner, not to unrelated account activity or the normal manual UI endpoint. Only metadata/usage is durable on the server; projects and videos still require explicit export/relinking. Completed live results are recorded in AGENT-TESTING.md. Selected-file tests require a reviewed SHA-256, explicit target/question and decoded zero-origin constant frame timing under the original limits. Dry runs do not read credentials or create budget state. Do not automatically consume unused budget.

## Footage provenance
The existing Project.synthetic flag is an explicit generated/AI-footage declaration, separate from Point.source (manual, SAM or generated coordinates). Importing a manual CSV does not clear the video-origin declaration. Generated footage remains labeled in the workspace, evidence and reports. User-provided unmarked footage is not independently authenticated as physical camera evidence.

## Tracking target persistence
The current tracking target is part of the portable project (trackingTarget), not separate App state. New videos start with a blank target. The bundled sample uses blue ball. Legacy project imports use those same safe defaults; importing a Muse proposal alone does not silently apply its target. A reviewed proposal updates axis and tracking target together. Targets are at most 120 characters.

Pixel units are a complete analysis mode. The step guide advances to model validation when enough observations exist, without implying an uncalibrated clip has a meter reference. Muse proposals are in a native disclosure; opening the disclosure does not apply settings or call a model.
