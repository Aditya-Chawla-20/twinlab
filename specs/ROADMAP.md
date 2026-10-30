# TwinLab completion roadmap

Status checked: 2026-10-31. Baseline source commit for the latest resumed work: 6b4b9e7. This is the plan for a credible hackathon submission; proposed work below is not already implemented or authorized for new paid execution merely by appearing here.

## Intended finished product
A maker or experimenter imports a fixed-camera recording, states a question, reviews a Muse plan, confirms the tracked object and scale, inspects SAM observations, fits an explicit motion model, checks predictions on data not used for fitting, and exports reproducible evidence. A judge can reproduce a representative example and understand the actual role of each Meta model.

Finish one well-validated practical workflow first. The proposed main example is a flexible phone/camera mount settling after a disturbance; the pendulum remains a controlled numerical fixture. See USE-CASE.md for the clip brief. AI-generated footage can demonstrate the workflow but cannot satisfy the real-experiment validation gate. Other mechanisms can use the existing generic fit families, but no universal digital-twin or arbitrary-physics claim is justified.

## What is complete

| Area | Verified status | Evidence / boundary |
| --- | --- | --- |
| Original application and public source | Complete | React/TypeScript workbench, Node API, public GitHub repository; clean tree at baseline |
| Local observation workflow | Implemented; sample browser flow exercised | Video import, scale calibration, pointer/keyboard point entry, CSV import, review/removal, JSON save/reopen and source relinking; explicit generated/AI footage declaration |
| Numerical analysis | Implemented and offline tested | Four explicit 1D model families; coefficients fitted to earlier observations; ranking uses training BIC; later validation RMSE/residuals |
| Exploratory simulation | Implemented with limits | Frequency/damping sliders create mathematical scenarios; no physical intervention validation |
| Muse Spark 1.3 | Live API verified on generated footage | Two schema-valid plans. Short target wording fixed. AI warnings can still be wrong; human review remains necessary |
| SAM 3.1 | Live API verified on generated footage | `blue ball` returned 360 points and masks; first `blue pendulum bob` request had zero matches |
| Generated-reference comparison | Complete for fixture only | Position RMSE 0.52525 px; later-point model validation RMSE 0.00081327 m in synthetic scale; not camera accuracy |
| Credentials and accounting | Implemented | Server-only ignored key, explicit paid actions, no automatic retries, local run ledger |
| Agent test spending guard | Implemented and checked | Persistent conservative reservations, $10 cumulative ceiling for the scoped test runner; not a general account/UI spending limit |
| Engineering checks | Last run passed | 28 offline tests, strict typecheck and production build |
| Frozen-model transfer | Engine and CLI implemented | Reproducible source snapshot/hash, prefix-only alignment, later errors and baselines; generated regression only; browser/real-recording check pending |
| Documentation and reproduction | Implemented | Sources, architecture, decisions, walkthrough, cost scenarios, live test evidence and generated sample |

Live testing total from reported usage: $0.215742 across six inference requests. Test reservations retained: $5.70, which is not actual spend. The latest camera-mount pair cost $0.054476. No retries or further calls followed it.

## What remains, in dependency order

### 1. Saved Meta results in the browser — completed for the camera-mount demo
Owner: implementation/QA (agent).

- Loaded the reviewed 240-point SAM project via Chrome's native Open dialog and relinked the user's original video.
- Checked source labels, Muse proposal, actual model errors, 168/72 partition, 7.00 s boundary, residuals and CSV/Markdown exports.
- Saved/reopened the analyzed project through Downloads and relinked the original again.
- Native selection resolved the Documents import issue without relocating protected files or changing security settings.

This closes the saved-results GUI check. Live calls used the capped runner; the normal paid browser endpoint remains untested live and off. Real-world accuracy is still unverified. See CAMERA-MOUNT-RESULTS.md.

### 2. Acquire real experiment recordings and independent references
Owner: user supplies recordings or authorizes suitable source footage; agent prepares fixtures and measurements.

The user supplied the first AI-generated practical-use-case clip. Its 10-second, 24 fps / 240-frame video was inspected and imported locally; see CLIP-REVIEW.md. It now has 240 SAM observations and two successful Meta runs; the model comparison and limits are in CAMERA-MOUNT-RESULTS.md. Use that as generated workflow footage, not a replacement for the physical evidence below.

Minimum physical capture set:
- A: 10–20 seconds of a slowly wobbling flexible phone/camera holder after release, fixed camera, visible known-length reference in the motion plane, plain background and one identifiable moving assembly. A pendulum remains an optional controlled baseline.
- B: a separate recording of the same setup with another release position; keep the mass, support, mount and camera unchanged for the first transfer test.
- One less ideal clip: partial occlusion, lower contrast or a shifted camera, so the app's limits are visible.

Record the setup dimensions, reference length, confirmed constant frame rate and any deliberate changes. Preserve original files and rights/consent for demo publication. Inspect timestamps rather than assuming browser metadata proves frame rate.

Independently mark representative visible landmarks (proposed: at least 20 timestamps per clean clip, spanning early and late motion). Keep these separate from SAM output so they are a meaningful comparison.

Done when: we have real footage with known scale/time and a manual reference, not just a model judging its own output.

### 3. Validate and harden the full real-video workflow
Owner: agent; user reviews capture/measurement assumptions and any paid-test allocation.

Work:
- Exercise browser → local API → Meta → plan/track review → calibration → fitting → export on real clip A.
- Use the now-implemented selected-file runner with reviewed SHA-256 and decoded timing checks for real fixtures. Preserve cumulative reservations and stop conditions.
- Reuse saved results for UI iteration. Reuse approved plans for repeated clips when appropriate; do not call models for chart/slider changes.
- Compare SAM positions with manual landmarks, including visible-frame coverage and wrong-object errors. Do not fabricate missing observations or silently switch IDs.
- Check frame-time alignment, bounding-box-center bias, calibration errors and perspective. Implement mask-centroid or point-seeded tracking only if the observed errors justify them.
- Make empty matches and bad plans actionable: review the target or select the intended object; never automatically spend more on retries.
- Verify input limits, unavailable model/timeout behavior, usage preservation, duplicate-click prevention and save/reopen with imported clips.
- Make unsupported/weak fits visible. A lowest-BIC candidate is not automatically a useful explanation. Treat AI warnings as proposals, not verified facts.

Proposed acceptance gates (targets, not measured results): on the clean, unobscured fixture, <=3 px position RMSE against independent marks and >=95% intended visible-frame coverage. Revise these gates before evaluation if the physical scale or reference annotation quality makes them unsuitable. Always publish actual results, failures and denominators.

Done when: a full real recording can be processed reproducibly and its errors are measured, with useful fallback when capture quality is inadequate.

### 4. Deliver the prediction claim on a separate recording
Owner: agent implementation; user supplies the second recording and setup measurements.

Implemented: a frozen model contract, SHA-256 integrity/source-fit checks, initial-state-only alignment on B and later evaluation against persistence/constant-velocity baselines. The credential-free CLI exports a model, target project, CSV and report. See PREDICTION-WALKTHROUGH.md. Generated release tests prove numerical behavior, not physical transfer. Remaining: browser screen (required 12ui CLI is awaiting sign-in), independent real recording B and measurement/calibration validation. Re-fitting B independently is not this feature.

Work:
- Persist a portable fitted model with parameters, units, calibration/reference frame, training interval, assumptions and input provenance.
- Freeze frequency/decay from recording A before evaluating B.
- For B, allow only a declared initial-state/alignment prefix to establish release phase/amplitude/offset; exclude that prefix from the prediction score. Do not tune dynamics on B's evaluation segment.
- Map B's reference scale/coordinate origin consistently. Declare which physical conditions are assumed unchanged.
- Compare the frozen model's predictions with B's later observed motion and show errors/overlay. Changing pendulum length or other system properties requires a different, explicitly validated model assumption.
- Persist the model/data hashes or equivalent immutable references so the report can prove which data fitted the model and which data evaluated it.

Done when: we can show a prediction on a separately recorded run without fitting its dynamics to the answers. If the test fails, disclose model mismatch rather than weakening the claim silently.

Optional only after this passes: a measured physical what-if, such as changing pendulum length and testing a physically justified period prediction. Existing frequency sliders alone do not establish this.

### 5. Evaluate usefulness and finish the first-use experience
Owner: agent prepares the workflow and comparison; user recruits relevant testers if available.

Work:
- Compare the same task with Tracker/manual analysis: time to first usable measurement, required corrections, error and reproducibility. Tracker already supports modeling; novelty/superiority is unproven.
- Get a small number of representative makers/experimenters to attempt the workflow. Proposed: 2–3 people, not a claim that they already exist or are customers.
- Measure where they get stuck: object selection, scale, units, fitting assumptions and the meaning of validation.
- Fix observed friction, recovery and data-loss risks. Resolve close/refresh/replacement behavior through draft recovery or explicit save warnings, without adding accounts/cloud sync unnecessarily.
- Make generated demo, live model observation and real-world experiment sources unmistakable.

Done when: a new user can reach and understand a reproducible result, and our claim of usefulness is supported by observed behavior or clearly labeled as a hypothesis.

### 6. Provide a judge-accessible version
Owner: agent prepares deployment; user chooses/authorizes the destination and any live-access credentials or costs.

Current gap: public GitHub source exists, but localhost is not a public application. Current Host/Origin checks and 127.0.0.1 binding deliberately prevent public hosting.

Recommended minimum:
- Public replay/manual-analysis mode using original, approved fixture assets; clearly label recorded Meta results. No secret or unattended inference in that mode.
- If judges need live uploads, a protected live mode on one Node-compatible service, with deployment-specific host/origin rules, authentication, request/upload bounds and durable server-side usage reservations/quotas. A private key in environment variables alone is not sufficient to protect the paid endpoint.
- Use appropriate storage for any state that must survive that host's restarts. Do not add distributed queues or multi-region infrastructure without a demonstrated need.
- Confirm the submission portal's live-product access requirements; do not assume replay alone satisfies them.
- Check the deployed URL from a fresh session, representative mobile width and no privileged local files. Verify that public users cannot consume the owner's credits.

Done when: judges have a working, documented access path that survives deployment and does not expose an unrestricted paid backend. No hosting vendor or paid commitment has been selected by this roadmap.

### 7. Finalize evidence, demo and submission
Owner: agent prepares code/docs/demo artifacts; user confirms track, team/contributors and submits or explicitly authorizes submission.

Work:
- Feature freeze; run the appropriate checks and full browser flow on the final commit.
- Complete the README with setup, environment template, real and generated fixture provenance, actual evaluation results, known limits, demo URL and attribution/original contributions.
- Decide the application's license before describing it as permissively reusable open-source; public source visibility is already satisfied.
- Record a three-minute video: actual problem → real clip/calibration → visible Meta plan/track → frozen prediction/evaluation → result/evidence/costs. Label recorded/replayed sections and the work done during the hackathon honestly.
- Include a poor-input/uncertain case if it helps establish the boundary; do not conceal failures.
- Verify video/repository/product links as an unauthenticated or judge-equivalent visitor, with any permitted access instructions.
- Confirm track (Indie Developer or Startup), representative, all contributors, required portal fields and consent. Submit once per team and retain visible success confirmation.
- Optional after core submission: X demo link and community-vote materials if pursuing bonus categories. No posts are authorized merely by this plan.

Done when: the submission is actually accepted by the platform, not merely when the code is pushed or the video exists.

## Suggested milestones (not a guarantee)

| Target | Outcome |
| --- | --- |
| Oct 30–31 | Existing live evidence reviewed in UI; real clips and manual references collected |
| Nov 1 | Real browser flow measured; tracking/recovery fixes verified |
| Nov 2 | Frozen-model separate-recording test and practical comparison completed |
| Nov 3 | Judge access, README/evidence, feature freeze and three-minute video ready |
| Nov 4 | Final link/access checks and CV submission, keeping time for portal issues |

Official page checked 2026-10-30: https://dev.meta.ai/events/global-hackathon lists November 4, 2026 at 9:00 PM Eastern Time, which is November 5 at 7:30 AM IST. Aim to finish and submit before the final hours. Participant-guide submission length/public-repository requirements were supplied in this chat; inspect the actual portal before final submission.

## What is needed from the user
1. Real recordings A/B and at least one imperfect example, or permission to use identified appropriate footage.
2. Reference dimensions and what the experimenter actually wants to measure or predict. Do not invent a firsthand use case.
3. Access to a few relevant users if possible, or an honest statement that user validation has not happened.
4. Hosting destination / access choice when phase 6 is ready; API key is already configured and need not be shared again.
5. Track, team/contributor details and final submission instructions.

## Defer unless measurements show a need
Additional Meta models, model training, arbitrary 3D reconstruction, general robotics control, billing/subscriptions, teams/accounts beyond necessary judge protection, cloud project sync, distributed queues, vector databases, multi-region scaling and a new visual redesign. Scientific validity, usable recovery and judge access have priority.

## Definition of hackathon-ready
- [ ] Reproducible real experiment and independent reference measurements.
- [ ] Full browser-to-Meta-to-analysis-to-export flow checked.
- [ ] A separately recorded prediction test, or a clearly narrower claim if it fails.
- [ ] Clear treatment of invalid/uncertain inputs and grounded Meta proposals.
- [ ] Actual evaluation table and no unsupported superiority/digital-twin claims.
- [ ] Judge-accessible deployment or organizer-accepted reproduction path.
- [ ] Final tests, attribution, three-minute video, accessible links and team details.
- [ ] Visible successful submission before the deadline.
