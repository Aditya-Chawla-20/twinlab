# TwinLab example provenance

## Filmed spring experiment

`beam-A-20s.mp4`, `beam-B-20s.mp4` and their project JSON files use the filmed real-world split published at [Morpheus Real-World Physics Videos](https://huggingface.co/datasets/physics-from-video/morpheus-real-world), declared MIT by its publisher. Attribution: Antonios Tragoudaras and collaborators, *Evaluating Newtonian Mechanics in Video Generative Models with Real Physical Systems*, ICML 2026. [License notice](../notices/morpheus-MIT.txt). No upstream application code is reused.

Original paths: `real-world-cropped/spring/video_0_fps30/cropped_video.mp4` and `video_1_fps30/cropped_video.mp4`. Each excerpt keeps the first 20 seconds, original 1280×1024 geometry and 30 fps; re-encoded H.264 CRF22 without audio. Exact original/derived SHA-256 values and measurements are in the public repository's `specs/REAL-FOOTAGE-VALIDATION.md`.

Projects contain recorded Muse/SAM results. Loading, fitting, freezing and evaluating these examples makes no inference calls. They are saved evidence, not a fresh API run. A includes a Muse plan and two tracking attempts; B includes a separate tracking call. Point coordinates use explicitly labeled mask foreground centroids. The older box-center attempt is retained in the local research evidence, and its cost is retained in A's usage history.

Capture conditions and hidden mechanical properties were not independently authenticated. Similar setup is a visual assumption. No physical reference scale is verified; units are pixels. Approximate agent visual annotations disagree with segmentation landmarks by more than the desired precision threshold. A small prediction error against SAM observations is not the same as physical tracking accuracy or proof of causes. These are not recordings of the user's phone mount.

B's project contains a frozen model from A. The initial-state window is 4 seconds (121 points); 479 later points are scored. Frequency/decay are fixed from A; only initial offset/amplitude/phase are aligned. The same-setup checkbox is intentionally unchecked so the user reviews this conditional assumption.

## Generated numerical fixtures

`transfer-A.json` and `transfer-B.json` are original mathematical point arrays. They share frequency 3.6 radians/s and decay 0.09/s but have different amplitudes/phases. A includes a small deterministic disturbance. B has no recorded video. Their meter scale is synthetic; these fixtures verify mathematics and the workflow, not a physical device.

`pendulum-synthetic.mp4` in the application root is an original procedural demonstration, also labeled generated.
