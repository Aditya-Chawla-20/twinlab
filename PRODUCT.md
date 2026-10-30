# TwinLab

A local-first experimental workbench for makers and prototype engineers. Import a fixed-camera planar-motion video; calibrate a known length; collect/review object observations; fit a small set of explicit physical motion models; check predictions on withheld time samples; export reproducible evidence.

## User commitments
- Original application code; study open-source work without copying application implementations.
- Important decisions, progress and verification evidence live in `specs/`.
- Paid runs require explicit user authorization. On 2026-10-30 the user authorized agent Meta testing up to $10 total through the persistent capped test runner; default app live mode stays off.
- Server-only key. Default live mode off. No retries, hidden inference or model calls on startup.
- Calibration, numerical calculations and evaluation are deterministic. Models propose, humans review.

## Product truth
- First release is a single-user local web application, not a hosted multi-tenant product.
- Default sample observations demonstrate mathematics and UI without live inference. Separate live Muse/SAM tests now exist on the generated clip; neither is a physical experiment.
- Supported fits: constant velocity, constant acceleration, sinusoidal motion and exponentially damped sinusoidal motion. These are phenomenological 1D fits, not discovery of arbitrary laws or proof of causes.
- A stationary camera and motion in a calibrated plane are required for metric interpretation. Bounding-box centers are not centers of mass. Occlusions remain missing observations.
- Live model access is verified on generated footage. Demand and real-video accuracy remain unverified.

## Interface assumptions
Operate mode: video and observations lead; compact controls and plots support the task. Desktop workbench with responsive stacked layout on small screens. No marketing landing page needed.
