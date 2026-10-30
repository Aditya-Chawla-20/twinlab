# Authorized agent testing — 2026-10-30

The user explicitly authorized agent testing of Meta with a total ceiling of $10, superseding the earlier user-only test restriction. This is a maximum, not a target. The key stays in ignored `.env.local` as `MODEL_API_KEY`; it is read only by the local server/test runner and is never printed. Keep app `META_LIVE_ENABLED=false` while using the scoped runner.

## Run
`npm run test:meta` is a dry run and sends nothing.

`npm run test:meta -- --live` performs one experiment-plan call and, only if that succeeds with reported usage, one SAM call using the bundled synthetic clip. It stops on errors or unknown usage. Raw results stay under ignored `artifacts/meta-live/`; run metadata is appended to ignored `.twinlab/usage.jsonl`.

## Spending bound
- Explicit test authorization: $10 cumulative for this testing session.
- Before every inference, the runner durably reserves $1.50 for Muse Spark or $0.40 for SAM. Reservations are not released after failure or cheap completion and survive restarts.
- Muse reservation exceeds the published 1,048,576-token context × $1.25/M input plus 4,000 output tokens × $4.25/M, or $1.32772 at current rates. No tools, conversation continuation, background jobs, or automatic retries are allowed.
- SAM input is validated with ffprobe: at most 1,800 constant-rate frames, costing at most $0.36 at the published $0.20/1,000-frame rate. The test currently uses 360 frames.
- Refuse a request if its reservation would cross $10. Malformed ledgers or inability to persist reservations prevent requests. Do not reset `.twinlab/test-budget.json` to continue testing.
- A single local lock prevents concurrent test runners. If a process is interrupted, inspect the ledger and pending work before removing a stale lock.
- This bounds the runner's inference spending under published rates; it is not an account-wide Meta billing limit and does not cover unrelated activity outside the runner. Leave the normal app paid controls off during agent testing.

Sources checked 2026-10-30:
- https://dev.meta.ai/docs/pricing-rate-limits
- https://dev.meta.ai/docs/models

## Completed live results

Four inference requests were made, with no automatic retries:

| Request | Reported units | Usage-based cost | Result |
| --- | --- | ---: | --- |
| Muse planning, original prompt | 3,360 input / 1,084 output tokens | $0.008807 | Valid structured plan; target wording needed improvement |
| SAM, `blue pendulum bob` | 360 frames | $0.072000 | Completed, zero matching objects |
| SAM, `blue ball` | 360 frames | $0.072000 | One track, all 360 observations, 360 masks |
| Muse planning, clarified target instruction | 3,391 input / 993 output tokens | $0.008459 | Valid structured plan; target `blue ball` |
| **All testing** | **4 requests** | **$0.161266** | **Paid testing stopped** |

The successful first-plan + useful-SAM pair cost $0.080807. Total testing also includes the zero-match SAM request and the final planner regression check. Costs are computed from actual reported API usage at verified rates, not a promise about the final provider invoice.

The persistent reservation ledger retains $3.80 of conservative allocation, not $3.80 of actual spend. No further paid tests are planned. Do not reset the ledger or automatically consume the rest of the user's ceiling.

## Observation checks
- Compared the actual SAM box-center track against the original generated coordinates at every returned timestamp.
- 360 points; position RMSE 0.52525 pixels; maximum point error 1.25202 pixels.
- Local fit selected damped oscillation; fitted decay 0.0911111 s^-1 against generator 0.09 s^-1.
- Later-sample validation RMSE 0.00081327 m using the synthetic reference scale. These are generated-fixture results, not physical-camera accuracy.
- Muse correctly marked the clip synthetic and proposed damped horizontal motion. It also warned about a second similar ball despite our generator having one bob; this is an unverified/incorrect model interpretation and reinforces the human review requirement. Do not turn model warnings into ground truth.
- Changed the app's default target and planner instructions to prefer a short visual noun phrase. No automatic reattempt on zero matches was added.
- Updated UI copy to distinguish live SAM observations from generated input and preloaded synthetic observations.
- Created an ignored, reopenable evidence project at `artifacts/meta-live/verified-project.twinlab.json`. It contains actual SAM points and associated run metadata; the input remains the original generated sample.
- All four provider-file cleanup requests completed without a reported cleanup warning.

## Local handoff
The dev server was restarted with the saved server-side key and `META_LIVE_ENABLED=false`. Refresh API usage to read the local ledger. The browser control handle could list the existing local tab but failed to rebind/reload it (`browser.user is unavailable`); loading the verified project in the GUI is therefore a manual handoff, not a completed browser check. No alternative browser-control mechanism was used.

This verifies live API compatibility and tracking against a generated reference; it does not validate physical-camera accuracy.
