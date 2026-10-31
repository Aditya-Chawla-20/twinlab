# TwinLab demo transcript

Synthetic system narration; actual app screen captures and licensed filmed footage. Recorded Meta outputs; no fresh inference.

## 00:00:00.000 — A model you can put to the test

TwinLab helps makers and prototype engineers turn motion recordings into models they can inspect and test. Think of a flexible camera mount: does the model learned from one release predict the next? This demonstration uses two openly licensed, filmed spring experiments, in pixels, with no verified physical scale.

## 00:00:18.400 — Meta proposes and tracks. You review.

Muse Spark reviews the video and proposes the object, axis, candidate model and assumptions. SAM tracks the object through six hundred frames per recording. These are actual saved model results, replayed without another paid request. The first box track drifted toward the hook, so we added explicit foreground mask centroids, preserving the original boxes as an alternative.

## 00:00:40.367 — Fit earlier observations. Check later ones.

The numerical engine is local TypeScript, separate from model prose. It compares four explicit motion families, fitting only the earlier four hundred and twenty observations. Training information criteria select the damped model. Its error on one hundred and eighty later observations is about two point one seven pixels. That is agreement with the SAM trajectory, not a measurement of tracking accuracy.

## 00:01:02.900 — Freeze A. Align only B’s initial state.

Freezing stores A's dynamics, source observations and a verifiable model identity. For the separate recording B, frequency and decay stay fixed. The declared four second prefix aligns only amplitude, phase and offset. Its one hundred and twenty one points are excluded from the score. The same setup assumption is explicit; matching hashes or similar images cannot verify hidden capture conditions.

## 00:01:26.233 — Reveal the independent prediction

Now evaluate the remaining four hundred and seventy nine observations. The frozen model has about two point nine nine pixels root mean square error. Persistence scores eighteen point six four; constant velocity scores twenty two point seven one. Both baselines use only the same initial prefix. The overlay and residuals expose mismatch, and editing an input immediately invalidates the old score.

## 00:01:48.533 — Keep the evidence, not just the chart

Inspect individual observations and their landmark convention, then export the model, partitioned CSV and report with input identities. Project JSON preserves results and settings; one browser draft protects refresh recovery. Personal videos remain local and must be relinked. The public browser demo contains no paid backend, while optional local Meta requests require explicit confirmation.

## 00:02:11.767 — Useful evidence has visible limits

Our approximate body center annotations disagree with the centroids by about ten and eight pixels on A and B. They are agent visual references, not certified ground truth. We have not established calibrated accuracy, customer demand or a validated physical intervention. All ten authorized Meta test requests total about fifty nine cents from reported usage; fitting and replay add no inference cost.

## 00:02:35.000 — From a recording to a reproducible test

TwinLab's contribution is the reviewable path from video assistance to frozen dynamics, a separate prediction and portable evidence. The original code, licensed examples, evaluation protocol and runnable demo are public. Try the recorded A and B example, inspect the assumptions, and reproduce the result without an API key.
