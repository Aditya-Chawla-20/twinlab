# TwinLab

A local-first experimental workbench for makers and prototype engineers. Import a fixed-camera planar-motion video; calibrate a known length; collect/review object observations; fit a small set of explicit physical motion models; check predictions on withheld time samples; export reproducible evidence.

## User commitments
- Original application code; study open-source work without copying application implementations.
- Important decisions, progress and verification evidence live in `specs/`.
- User alone triggers paid Meta API runs and checks billing. No paid calls by coding agents.
- Server-only key. Default live mode off. No retries, hidden inference or model calls on startup.
- Calibration, numerical calculations and evaluation are deterministic. Models propose, humans review.

## Product truth
- First release is a single-user local web application, not a hosted multi-tenant product.
- Synthetic sample demonstrates mathematics and UI; it is not a real experiment or a Meta run.
- Supported fits: constant velocity, constant acceleration, sinusoidal motion and exponentially damped sinusoidal motion. These are phenomenological 1D fits, not discovery of arbitrary laws or proof of causes.
- A stationary camera and motion in a calibrated plane are required for metric interpretation. Bounding-box centers are not centers of mass. Occlusions remain missing observations.
- Demand, live model access and real-video accuracy are unverified.

## Interface assumptions
Operate mode: video and observations lead; compact controls and plots support the task. Desktop workbench with responsive stacked layout on small screens. No marketing landing page needed.
