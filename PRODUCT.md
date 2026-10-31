# TwinLab

A local-first experimental-video workbench for makers, prototype engineers and experimenters. Turn a fixed-camera planar-motion recording into reviewable observations, explicit 1D models and a reproducible prediction test on another recording.

## Implemented workflow

Import video → work in pixels or calibrate a verified known length → review a Muse proposal → track with SAM or mark/import observations → compare models fitted on earlier samples → freeze A → align only B’s initial state → score later B observations → export project, model, CSV and Markdown evidence.

The browser demo runs analysis locally with recorded results and no paid backend. The separate single-user loopback server optionally enables manually confirmed Meta calls. No accounts, cloud sync or multi-tenant service are implemented.

## User commitments

- Original application code; referenced open-source implementations were not copied.
- Decisions, progress, sources and actual verification are recorded in specs/.
- Server-only key, live off by default, no startup inference or automatic retries.
- Agent Meta tests use only the existing persistent capped runner under the cumulative $10 authorization. Ten requests cost $0.5851035 from reported usage; $8.40 reservations remain intact. Billing is provider-authoritative.
- Calibration, fitting, initial-state alignment and scores are deterministic; model prose does not become a measured parameter.
- Draft recovery is one browser-local slot, not cloud storage or a substitute for exported JSON.

## Product truth

Supported families: constant velocity, constant acceleration, sinusoid and exponentially damped sinusoid. These are bounded phenomenological fits, not arbitrary physics discovery or proof of causes. Training BIC selects candidates; later same-recording validation is shown separately.

Frozen transfer retains A’s dynamics and source snapshot/hash. Only B’s declared prefix determines initial position/velocity or amplitude/phase/offset. Prefix observations are excluded from the later score. No dynamics are optimized on B. Digests and setup declarations do not authenticate an experiment.

The included MIT-licensed Morpheus spring A/B clips are publisher-described filmed experiments. Their conditional pixel-only transfer produces 2.98810 px later RMSE over 479 observations, versus 18.64277/22.71276 px prefix-trained baselines. This is prediction agreement with SAM observations, not physical measurement accuracy. Approximate agent body-center reference agreement is weaker (A 10.373 / B 8.386 px vertical RMSE). No metric reference or unchanged hidden mechanical conditions were independently verified.

A flexible phone/camera mount settling after a disturbance is the proposed practical use case. The user’s AI clip demonstrates that workflow but does not establish a real prototype’s performance. Human demand/usability, calibrated accuracy and superiority over existing tools remain unverified. See specs/REAL-FOOTAGE-VALIDATION.md.

## Interface

Video and observations lead; compact native controls and plots support the task. Experiment, Predict, Evidence and API usage views share one portable project. Responsive layouts stack on small screens. No separate marketing site or speculative infrastructure.
