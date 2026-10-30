# TwinLab build log

## 2026-10-30 — authorization and baseline
- User authorized an original TwinLab implementation informed by open-source research, with architecture, steps, decisions and important information retained in `specs/`.
- Repository started empty and clean; no configured remote. No existing application code to preserve.
- Paid Meta calls are reserved for the user. No API key requested, read or used by the builder.
- Applying Ponytail (minimal maintainable implementation), Skill Creator (repository maintenance guidance), 12ui (visual exploration), and full-flow verification.

## Architecture before implementation
- Browser: React + TypeScript + native video/canvas/SVG. Local calibration, manual observations, numerical fitting, held-out validation, simulation and export.
- Node: same-origin local API, environment-only credential, explicit paid endpoints, strict bounded payloads, no retries and no startup calls.
- No database, account system, queue, cloud upload store or general agent framework. Project JSON and source-video relinking provide portability.
- Models: Muse Spark 1.3 for a human-reviewable experiment plan; SAM 3.1 for segmentation/tracking. Numerical results are computed by code, never invented by the models.
- Demo: an original generated pendulum recording and corresponding synthetic observations, labeled throughout. Real footage/accuracy and live provider access remain user validation steps.

## Planned sequence
1. Record product contract, architecture, references and manual cost-test procedure.
2. Implement and check deterministic analysis and data validation.
3. Implement guarded Meta endpoints against current official documentation; use injected fake transport for checks.
4. Build accessible responsive workbench: import, calibrate, track/review, fit, holdout, simulation, evidence, usage and exports.
5. Run build, meaningful numerical/security checks, and browser workflows without paid calls.
6. Record results, limitations and exact user-run instructions.

## Domain implementation
- Added typed project format with bounded import validation, known-scale calibration, chronological train/validation split, four least-squares model families, training-BIC ranking, and explicit validation RMSE.
- Original deterministic synthetic pendulum data is distinct from recorded video observations and live SAM output.
- 12ui draft stopped before generation because the CLI requires sign-in. Connection link shared; original hand-authored workbench proceeds. No Meta requests made.

## Full application implementation
- Added local video import, project JSON save/reopen and source relinking, click calibration and manual observation marking, CSV import/export, model selection, validation/residual chart, exploratory model sliders, paginated point review/removal and Markdown evidence export.
- Added server-only Meta upload/inference/cleanup, schema-constrained Muse proposals with human application, official SAM parser and object-ID selection. Live mode off by default; explicit confirmation, bounded uploads/time, no retries.
- Added local usage ledger to retain run IDs, reported usage, failures and cleanup notes without retaining videos or credentials.
- Original 12-second synthetic video generated locally with Pillow/FFmpeg; no remote media or model-generated experiment evidence used.
- Added a concise repository-local TwinLab maintenance skill; Skill Creator validator passed.

## First automated verification
- Production TypeScript/Vite build passed.
- 11 Node checks passed: known damping recovery, withheld-data isolation, calibrated polynomial fits, invalid import rejection, cost accounting, request validation, Host/Origin guards, mocked Muse upload/usage/cleanup, no retries on 429, malformed paid response usage retention, streamed SAM identities/timing and disabled server flow.
- Tests use explicit fake credentials and injected transport; no paid API requests executed.
- Initial mock failure traced to SDK FormData capability probe (`data:,`) and incomplete fake response shape, corrected without provider calls.

## Browser verification and corrective work
- Verified sample model comparison, residuals, exploration, evidence deletion, JSON save/reopen, invalid-import recovery, local video/CSV import, keyboard calibration and landmark correction, and Markdown report export.
- Added keyboard alternatives to video pointing. Small-screen model rows now stack; fixed navigation overflow and confirmed mobile content fits the viewport.
- Split evidence, usage, model review, chart, icons and export code into concrete modules; no shared state framework added. Enabled unused-code compiler checks.
- Fixed a development websocket-port collision by attaching Vite HMR to the same local HTTP server.
- Hardened empty CSV fields, invalid project notes/calibration and malformed usage values. Freeze project edits during a paid run; project/file changes invalidate stale asynchronous work.
- Added checks for incomplete and empty-match SAM output. Initial empty-match fake lacked a finalized empty output lane; corrected the fake to the documented stream shape, preserving rejection of truncated streams.
- Final automated suite: 13 tests passed; strict typecheck and production build passed. No Meta calls or credit usage by the builder.
- Retained bundled font/React license notices. Moved tsx to runtime dependencies because production start executes TypeScript.

## Handoff
- specs/META-SELF-TEST.md documents exact user-run setup, separate paid stages, usage inspection, frame-rate requirements and provider cleanup.
- specs/HACKATHON.md records the three-minute demo outline and outstanding submission gates.
- specs/VERIFICATION.md separates actual offline/browser checks from unverified real-model and real-world performance.
- No remote configured; no commit, push, public hosting or hackathon submission performed. All application work remains reviewable in this repository.
- Final build and skill validation passed after dependency/license packaging. Temporary browser tab and owned dev server stopped after verification; restart with `npm run dev`.

## Public repository and walkthrough — 2026-10-30
- User explicitly authorized a public GitHub repository, pushing the code, starting npm run dev and a demo.
- GitHub connector has no repository-creation capability here; used authenticated GitHub CLI account Aditya-Chawla-20.
- Created https://github.com/Aditya-Chawla-20/twinlab and independently confirmed PUBLIC visibility.
- Candidate-source scan found no credential patterns. Environment files, build/dependency output, local QA artifacts and .twinlab usage ledger are excluded from Git; .env.example contains no credential.
- Re-ran npm run check: 13 tests plus strict typecheck and production build passed.
- Started npm run dev with META_LIVE_ENABLED=false; /api/status confirms configured=false and enabled=false. Dev server is intended to remain running for the user's walkthrough.
- Added specs/WALKTHROUGH.md and linked it from README. Initial source commit/push and browser demonstration follow.

## Publication confirmed and demo completed
- Initial source commit dabf88918b88ed05da431828d5b19b6f8838d181 pushed to origin/main; remote SHA matched local HEAD and visibility was PUBLIC.
- Browser demo: played/paused the generated recording; compared ideal 0.0650 m versus damped 0.0010 m validation RMSE; enabled residuals; changed exploratory frequency to 1.02x and reset it.
- Opened the evidence table, exported the synthetic sample's Markdown report, and inspected the disabled Meta setup and empty usage ledger. Returned to the sample experiment and retained the visible app tab.
- Saved specs/assets/twinlab-demo.png. Added final publication/demo evidence to specs/VERIFICATION.md and marked the public-source hackathon checklist complete.
- Dev server remains running for the user; paid Meta remains off. No hosted application deployment or hackathon submission was performed.

## Model pricing and run-cost research — 2026-10-30
- User requested current prices and the combined cost of a TwinLab run. Rechecked official Meta pricing/token-counting docs and inspected actual server request settings.
- Current paid path: one Standard Muse Spark 1.3 planning call and one SAM 3.1 tracking call, with no automatic retries. Planning output cap is 4,000 tokens including reasoning.
- Wrote specs/COSTING.md with exact rate arithmetic, explicit token scenarios, video-length sensitivity and optional Contributor-mode tradeoff. A 12 s / 30 fps sample plus assumed 10k uncached Spark input and 1k output totals $0.08875; token usage is illustrative, not measured or guaranteed.
- No Meta requests, credential reads, token-count calls or credit spending performed. No application code or pricing mode changed.
