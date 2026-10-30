# Verification — 2026-10-30

## Result
Local application implemented and verified without live Meta calls. User-run provider validation and a real physical experiment remain outstanding. Public repository created at https://github.com/Aditya-Chawla-20/twinlab; initial source push was verified against the remote main branch. No hosted application deployment exists.

## Automated checks
`npm run check` passed: 13 Node built-in tests, strict TypeScript (including unused-code checks), and Vite production build.

Checks cover:
- Recovery of known synthetic damping and later-sample prediction.
- Validation observations changed adversarially without affecting fitted coefficients or training-BIC ranking.
- Calibration and exact constant-acceleration fit in physical units.
- Duplicate timestamps, invalid calibration, non-finite points and oversized project rejection.
- Published-rate arithmetic, cached tokens, missing/invalid usage and SAM minimum billing.
- Mandatory confirmation, duration/rate bounds and constant-rate requirement before provider transport.
- Host/Origin request guards and disabled live endpoint.
- Mocked Muse upload, bounded schema request, usage retention and provider file deletion.
- No retries after provider 429.
- Usage retained when a completed paid response fails schema validation.
- Official SAM parser with stable object identity and frame-time conversion.
- Incomplete SAM output rejected without applying partial observations, retaining reported cost.
- Completed empty SAM lane produces an empty track list rather than invented points.

`npm audit --omit=dev`: zero reported vulnerabilities at check time.
Skill Creator `quick_validate.py .agents/skills/twinlab`: passed.
Impeccable mechanical detector on changed interface targets: `[]` (no reported findings). This is not a comprehensive accessibility certification.

## Browser workflow (local IAB)
- Sample loads, plays/seeks, compares all four models, and exposes validation/residual charts.
- Switching from damped to ideal oscillator changes validation RMSE from about 0.0010 m to 0.0650 m on the synthetic sample.
- Exploratory parameter controls appear; no inference is invoked.
- Point removal updates observation count (181 → 180).
- Save project creates a downloadable JSON; reopen restores all 181 sample observations.
- Invalid project import displays a recoverable error and preserves current work.
- Imported our own generated MP4 through the local file chooser, then a 60-point numeric CSV; calibrated through keyboard endpoint entry; recovered damping near 0.090 s^-1. This checks the import path, not real-world accuracy.
- Keyboard point entry replaced the observation at t=0 without introducing a duplicate timestamp.
- Markdown report downloaded successfully and contains model errors, limitations and no-Meta-run provenance.
- API usage shows key unconfigured, live off, no requests and $0 recorded usage. Paid controls disabled. No live calls were triggered.
- Mobile viewport at 390×844: found and fixed a 2 px navigation overflow; final document width 381 px within the 390 px viewport. Model rows stack for readable labels. Keyboard calibration is available alongside pointer entry.
- Temporary browser viewport override reset.
- Development HMR port collision fixed by sharing the application's HTTP server. Historical connection errors occurred during restart; no new application error was observed in subsequent workflows.

Screenshot: [verified desktop workbench](assets/twinlab-desktop.png).

## Synthetic numerical result
181 generated observations, 70% chronological training:
- Selected by training BIC: damped oscillation.
- Fitted frequency: 0.5729475 Hz (generator angular frequency 3.6 rad/s).
- Fitted decay: 0.0911111 s^-1 (generator 0.09 s^-1).
- Training RMSE: 0.00084574 m.
- Validation RMSE: 0.00101723 m.

These numbers verify the known synthetic calculation, not camera calibration quality, Meta tracking accuracy, demand or superiority over Tracker.

## Remaining boundaries
- User must test real Muse/SAM access, actual billing, streamed response compatibility and real-video tracking quality.
- Synthetic sample is not live Meta output. No independent real recording supplied.
- Files/projects are session-local until explicitly saved; always save before replacing a recording or refreshing. The durable server ledger retains run accounting, not videos or projects.
- Video stepping is approximate. SAM frame index mapping requires verified constant fps. Pixel centers are approximate landmarks, not centers of mass.
- The later portion of one recording is validation; no cross-recording model transfer is implemented or claimed.
- Local loopback server has no multi-user authentication, quotas or cloud storage. Do not publicly expose the paid API without those controls.
- GitHub publication status is recorded in the publication log below; public source hosting does not expose the local application server.

## Public source and live walkthrough
- Repository https://github.com/Aditya-Chawla-20/twinlab confirmed PUBLIC with default branch main.
- Initial source commit dabf88918b88ed05da431828d5b19b6f8838d181 pushed; git ls-remote matched local HEAD.
- Re-ran npm run check immediately before publication: all 13 checks and build passed.
- User-requested npm run dev is running on http://127.0.0.1:5173 with Meta explicitly disabled. Local /api/status confirms configured=false and enabled=false.
- Demonstrated playback, ideal versus damped fit, residuals, exploratory frequency change to 1.02x, evidence provenance and Markdown report download. Returned the sample to the fitted baseline.
- API usage visibly showed zero requests / $0 and no configured credential. No live Meta requests made.
- Kept the user-facing app tab open. This is a running local development app, not a public web deployment.
- Walkthrough screenshot: [current demo](assets/twinlab-demo.png).
