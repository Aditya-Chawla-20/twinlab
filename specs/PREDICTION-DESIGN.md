# Frozen model and independent recording

Decision: 2026-10-31. Extend the existing deterministic fitter and portable JSON format; no new service or dependency.

## Contract

Freeze a selected fit from recording A with a copy of its observations, calibration, axis, source declaration, training interval and parameters. A SHA-256 covers that normalized snapshot and parameters. Imported models must pass schema, digest and source-fit reproduction checks. A digest establishes identity/integrity, not authenticity or independent recording by itself.

Recording B retains its own observations and calibration. Its declared initial-state window is measured in seconds from its first observation, not a fraction of its eventual length. Only that prefix estimates offset, amplitude and phase for oscillators, or position and velocity for polynomial motion. Frequency/decay or acceleration remain frozen from A. Linear transfer assumes zero acceleration; initial velocity is estimated on B. At least eight prefix and eight later samples are required; oscillators require at least one period in the prefix. No B evaluation sample may influence alignment or dynamics.

The user must declare unchanged object, load, support, camera orientation and geometry. Axes and units must match. Pixel-only transfer additionally requires identical video dimensions; physical calibration does not correct perspective. Identical observation data or matching known source-video hashes are rejected as self-evaluation. Different hashes alone do not prove independence.

## Evidence

Report later-only RMSE, MAE and maximum error alongside persistence and constant-velocity baselines trained only on the prefix. Preserve prefix duration/count, excluded interval, source/target hashes and generated-source declarations. JSON remains reopenable. CSV distinguishes initial-state alignment from evaluation. A failure or weak baseline comparison is a result, never a reason to refit on evaluation data.

## Acceptance checks

- Portable round trip; edits to source after freezing cannot mutate the snapshot.
- Changed model/source rejected by digest and source-fit verification.
- Different release with the same generated dynamics predicts correctly; this is a numerical regression only.
- Poisoning later B observations cannot change aligned parameters or predictions.
- Changed B dynamics produce higher error rather than adjusting frozen dynamics.
- Same data, incompatible units/axis and insufficient initial windows fail clearly.
- Browser freeze/import/evaluate/export/reopen flow; stale async results cannot attach to a replacement project.

Real-camera accuracy and independent physical transfer remain separate evidence gates. Generated fixtures do not satisfy them.
