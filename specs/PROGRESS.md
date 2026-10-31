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

## Agent-authorized live Meta test — 2026-10-30
- User superseded the earlier self-testing-only restriction and explicitly authorized agent Meta testing with a cumulative $10 ceiling. User saved the credential locally; no secret was printed or committed.
- Created the ignored .env.local only while absent, with owner-only permissions and an empty key field. Existing app live mode remains false.
- Added an explicit --live smoke-test runner, constrained to the bundled validated 12 s / 30 fps / 360-frame clip, Standard Muse Spark 1.3 and SAM 3.1, one-shot requests and no automatic retries.
- The test transport persists non-refundable conservative reservations before dispatch: $1.50 per Muse plan and $0.40 per SAM track; cumulative reservations may not exceed $10. Unknown/failed requests retain reservations, and corruption/write failure stops dispatch. Separate lock prevents concurrent test runners.
- Ran 16 offline tests plus strict typecheck and build successfully. Budget tests cover reservation before transport, cumulative ceiling, unsupported requests and ledger write failure. Dry run made no provider call.
- Started one authorized live plan-and-track test. Final results and actual reported usage will be recorded after completion. Provider billing remains authoritative.

## Live test result and prompt correction
- Completed 4 paid inference requests. Muse: $0.008807 and $0.008459; SAM: two requests of $0.072 each. Total computed from reported usage: **$0.161266**. No further paid requests planned.
- First SAM noun phrase returned zero objects; a deliberate separate test with `blue ball` returned one complete 360-point track and 360 masks. Short visual target wording is now the default and is requested in planner instructions.
- Compared SAM positions with the known generated reference: RMSE 0.52525 px, max error 1.25202 px; local damped fit validation RMSE 0.00081327 m in synthetic scale. Real-footage accuracy remains untested.
- Final Muse regression check returned a schema-valid plan with target `blue ball`. Model warnings still include an incorrect possible second-ball interpretation; proposals require human review.
- Added source-aware copy so generated input with live SAM points is not mislabeled as a zero-inference demo. No automatic zero-match retry added.
- Conservative test reservations total $3.80; these reservations are not the actual $0.161266 usage cost. Saved raw outputs and a reopenable project only in ignored local artifacts.
- User reported a rounded billing drop consistent with the first three requests. The final planning check completed afterward and is included in the four-request total. No private account balances or billing identifiers are published.
- Restarted the dev server with the configured key and application live mode off. Browser handle reconnection failed after API verification; manual opening of the saved evidence project is not claimed as completed.

## Completion roadmap — 2026-10-30
- Audited the current source and latest verification evidence for the user's complete roadmap request. Baseline commit 33401b0 was clean.
- Wrote specs/ROADMAP.md separating completed work from unverified real footage, incomplete live browser validation, missing frozen-model cross-recording prediction, judge access and actual submission. Each phase records dependencies, ownership and acceptance criteria.
- Corrected stale summary statements in PRODUCT.md and VERIFICATION.md that still described live access as unverified or the test count as 13; the detailed evidence already recorded 4 live requests and 16 offline tests.
- Rechecked the official deadline: Nov 4, 2026 9 PM Eastern / Nov 5 7:30 AM IST. Proposed milestones reserve Nov 4 for final verification/submission issues.
- No new paid requests, application changes, deployment or submission were performed for roadmap preparation.


## Resume after storage cleanup — 2026-10-30
- Confirmed clean baseline fa6b2db and running local server; key configured, live mode off. Applied TwinLab, Ponytail and end-to-end verification guidance; reviewed React changes. Kept existing native-control styling; no design-generation spend or new dependencies.
- The user questioned the pendulum as the main demo and offered an AI-generated practical-use-case clip. Wrote USE-CASE.md with one proposed maker workflow (phone/camera mount settling), a generation prompt and a separate real-validation plan. Updated the roadmap/product scope accordingly.
- Chrome control restored access to the local app. Saved live project import hit missing extension file-URL access, communicated the exact required setting, and left that verification gate open.
- Traced every training split caller and found two correctness issues: frequency-search bounds depended on held-out timestamps; small-dataset partition labels differed from the fitter's minimum sample allocation. Fixed them by deriving the sampling bound from training times and carrying trainCount on the fit.
- Added three regression/integration checks, including rendered chart/model/evidence output and exports. Unfitted data no longer claims a completed validation partition.
- Added explicit generated/AI input declaration using Project.synthetic; CSV observation import no longer changes video origin. Updated workspace/report wording for imported generated clips, preserving manual/SAM point sources.
- Verified declaration toggling, model selection, evidence and actual Markdown download in Chrome. Saved an updated screenshot. Restored generated source and damped baseline; left the app open.
- 19 offline tests, strict typecheck and production build passed. No new paid calls; four-request ledger still totals $0.161266. Real footage, frozen-model transfer, public judge access and submission remain outstanding.


## Generated camera-mount video received — 2026-10-30
- User supplied gemini_generated_video_fad646de.mp4 in Downloads. Inspected codec, dimensions, byte size, duration, all decoded timestamps and visual contact sheet; verified 240 frames at 24 fps rather than assuming the prompt's 30 fps.
- Imported and played the video in Chrome. Prepared a generated, pixel-only camera-mount project with phone target and verified timing. Original video remains untouched; artifacts are ignored.
- Discovered that the tracking target was not saved with a project. Moved it into the existing portable contract, with safe legacy defaults and bounded input. Removed the duplicate App state; reviewed all target setters/callers.
- Verified actual saved project reopening in Downloads retains phone / 24 fps / generated declaration, then relinked the MP4. Documents-based project import remains blocked and was not worked around.
- 20 offline tests, strict typecheck and production build passed. No paid calls or fake observations. New clip remains ready for the next bounded Meta tracking step; it is not a completed analysis. See CLIP-REVIEW.md.


## Bounded camera-mount Meta demonstration — 2026-10-30
- User asked for next steps after clip intake. Continued under the existing explicit $10 Meta authorization; did not reset the ledger or enable the normal paid UI. Baseline 3598d7e was clean.
- Added selected-file support to scripts/meta-live-test.ts using standard parseArgs and a testable fixture reader. Require explicit SHA-256, target/question; verify decoded zero-origin constant frame timing and original size/duration/rate/frame/output limits. Scope remains Muse Spark 1.3 and SAM 3.1 only.
- Three fixture tests plus the existing suite passed (23 total), with typecheck/build. Actual selected-file dry run printed 240 / 24 fps / correct digest / providerCalls=0 without loading credentials or changing budget state.
- Rechecked official prices, then made exactly one live planning/tracking pair. Muse $0.006476; SAM $0.048; pair $0.054476; session $0.215742 / six inference requests. Conservative allocations total $5.70. Both cleanup calls returned without warnings. Testing stopped after the pair.
- Reviewed the unique 240-point phone track on eight representative frames before using it. Built a pixel-only generated-input project and local evidence exports; did not add synthetic points or infer physical scale.
- Recorded all four deterministic fits. Damped wins training BIC, but quadratic has lower validation error on the quiet ending; documented the mismatch rather than claiming accurate physical prediction.
- Resolved saved-results GUI access using Chrome's normal native picker. Relinked original video, checked source/usage/fit/residual displays, exported CSV/Markdown, saved/reopened the 240-point project from Downloads and relinked again. Browser console check was empty.
- Corrected the pixel-only stage guide and made the long Muse proposal a native disclosure so the graph stays close to the video. Native disclosure review remains separate from applying the proposal. Final checks passed; no new dependencies or design-generation calls.
- Results in CAMERA-MOUNT-RESULTS.md; raw responses, source manifests and screenshots remain ignored/private. App stays running, key server-side, paid UI off. Next: frozen-model separate-recording feature, real-camera validation, judge access and submission package.

## Frozen-model prediction engine and readiness audit — 2026-10-31
- Resumed from clean 6b4b9e7 under the existing complete-MVP goal. Read repository requirements and applied TwinLab/Ponytail guidance. No new runtime dependencies or services.
- Wrote PREDICTION-DESIGN.md before implementation. Added a portable source snapshot and SHA-256 model identity, schema/digest/source-fit verification, prefix-only initial-state alignment, unchanged-setup declaration, units/axis checks and obvious self-evaluation rejection. Frequency/decay or acceleration remain frozen from A.
- Added a working credential-free `npm run predict` CLI. It exports the frozen model, target project with embedded comparison, CSV partitions and Markdown scores against persistence/constant-velocity baselines. Existing evidence files are not overwritten.
- Added original generated A/B point fixtures and a reproducible walkthrough. Example: 31 initial-state observations, 150 later evaluations, RMSE 0.000402406 in synthetic meter scale; persistence 0.106395 and constant velocity 0.551547. B has no recorded video. These are numerical results, not physical accuracy or a real second recording.
- Five new regression/integration tests check snapshot immutability, tampering, source reconstruction/round trip, held-out poisoning, changed dynamics, invalid units/setup/window, fixed acceleration and the actual CLI/export/re-evaluation/no-overwrite flow. All 28 tests, strict typecheck and production build passed; `git diff --check` passed.
- Restored the previously exported 240-point camera-mount project in Chrome and relinked its original Downloads video after development reload. Correct labels/7.00 s partition/model errors remained; console warnings/errors were empty. Saved ignored screenshot artifacts/camera-mount/post-transfer-engine.png.
- Required 12ui CLI for the non-trivial prediction screen is signed out. Sent its sign-in link to the user; no hosted design run, purchase or upgrade was started. Browser prediction UI is not implemented. This is an actual dependency, not a completed screen.
- Reviewed primary-source physical datasets; inspected sources do not supply a usable unchanged-setup phone-mount A/B pair. No third-party footage was bundled or paid inference dispatched.
- Added the original-source MIT license, a submission draft and READINESS-AUDIT.md. Preserved real validation, recovery, judge access, actual demo and final submission as open gates. No fabricated users/results and no claim the whole goal is complete.
- Live ledger remains six requests totaling $0.215742 reported usage. App live mode stays off; no new Meta calls or budget resets.

## Browser prediction, recovery and licensed footage — 2026-10-31
- Added bounded single-draft browser recovery using localStorage, schema validation, preservation of malformed prior drafts and visible/full-storage failure behavior. Native replacement warning protects edited/recovered data. JSON remains the portable backup; videos relink after refresh. Checked changed title/split, 240-point imported project and manual point/calibration persistence in Chrome. Native warning automation was unreliable while Chrome focus changed; cancellation is not claimed fully verified.
- Added a static demo build with relative assets, no local API requests and compiled-out paid calls. Tested the earlier build at a nested URL with real HTTP logs, sample/video/fonts, manual point entry, calibration, reload and actual JSON/CSV downloads. Latest feature build still requires the final static recheck.
- Video imports/relinks now record SHA-256 and reject mismatching known sources. Actual browser export of the camera project retained the reviewed 2fd1647d... source hash and 240 observations. Stale async edits/imports are invalidated through the existing epoch.
- User connected 12ui after the first link expired. Updated the official CLI from 0.2.72 to 0.2.130; an old API-backed claim rejected its source before generating images. A fresh updated native run generated the Predict reference. Fixed its dependency lock setup, then conversion hit the Codex CLI usage limit. Preserved needs-reconciliation state and did not buy an API fallback, alter receipts, upgrade or switch accounts. Used the generated image with original React/existing styles, then checked actual rendering.
- Implemented Predict UI: freeze/import models, independent target import, generated/recorded examples, declared initial window/setup, chronological scoring, residuals, simple baselines, report/CSV/model exports and project recovery. It skips B's ordinary fitter and hides scores after any input changes. Browser self-evaluation was rejected; generated A/B reproduced 0.000402 m in synthetic scale, 31 excluded /150 scored; changing the window invalidated old scores.
- User explicitly chose suitable openly licensed real footage. Acquired two MIT-declared Morpheus filmed spring clips; pinned publisher LFS hashes, kept/re-encoded first20s at original geometry/CFR30 and validated all600 timestamps per clip with the capped dry runner. Saved20 approximate agent visual body-center references per clip before SAM, labeled their ~5px uncertainty and lack of independent human metrology.
- Real A's box-center track showed variable hook/spring bias. Added selectable official-parser mask centroids (geometric, not centers of mass), source provenance and raw mask custody in runner artifacts. Regression checks map an asymmetric10-pixel mask into source bounds; no fabricated missing points. Second A call and B track completed deliberately under the existing cap; no automatic retries.
- Real frozen transfer uses A's420 earlier centroid points and a4s B prefix declared before calculating scores. Actual B:121 initial /479 later; RMSE2.988099px, MAE2.435468px, max8.494126px; persistence18.642771px and velocity22.712756px. Browser reproduces these values. Body-center annotation agreement remains weaker (A10.373/B8.386px vertical RMSE); no physical accuracy/known-scale claim.
- Added attributed licensed clips and reproducible A/B project files to public/examples, with original/derived hashes and full MIT notice. No user AI video was published. Public source/code push for this phase is still pending final checks.
- Source and prediction screenshots captured. Responsive overflow from the extra navigation tab was found and fixed; settled layouts at actual CSS widths433 and355 had no horizontal overflow. Restored the normal viewport. Added actual shipped-media/model evidence check; latest check passes32 offline tests, strict typecheck and production build.
- Session ledger now10 inference requests, $0.5851035 reported usage and $8.40 conservative reservations. Ordinary live mode remains false. Full real paid browser-request path, metric accuracy, human usability comparison, public judge URL and final video/submission remain open; do not claim the overall goal complete yet.

## Presentation and public static release preparation — 2026-10-31

- Completed the final nested static A/B flow: real preset,4s/setup review,121/479 partitions,2.988099px score, exports and refresh recovery; no API requests in server logs and no route references in the compiled bundle. Public-build credential check passed without printing a key. All33 offline tests/typecheck/production build passed; production dependency audit reports0 vulnerabilities.
- Published source reference coordinates, agreement rows and reproducible prediction CSV/report under specs/evidence, retaining weak landmark agreement and pixel-only assumptions. Updated stale product/architecture/roadmap/readiness/submission copy around the implemented narrower MVP. No metrology, physical intervention, user demand or accepted-entry claim.
- Prepared a standalone static zip, license notices, Pages/check workflows and a native-control accessible video page. User explicitly authorized free GitHub Pages publication; the connector lacks Pages administration, so the official gh CLI configured workflow-based Pages. No paid server/key is exposed. Public URL is not called live until deployment/browser verification.
- Created an edited actual-UI/filmed-footage presentation with synthetic local-system narration, explicit historical-run labels, captions/transcript and exact scene manifest. No new provider/service spend. Final encode/decode/link checks and source push remain in progress.
