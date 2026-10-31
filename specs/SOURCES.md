# Sources and originality

Inspected during research / build on 2026-10-30. Application code is independently authored here. No upstream application repository was cloned or copied. Standard dependencies retain their own licenses.

| Reference | What informed this project | License / boundary |
| --- | --- | --- |
| https://github.com/OpenSourcePhysics/tracker | Calibration, tracking and model-comparison baseline | GPL-3.0; reference only, no code reuse |
| https://github.com/KuzeyGorgulu/motionlab | Existing browser workflow and feature overlap | MIT; reference only; cannot claim video-to-graphs is novel |
| https://github.com/soft-matter/trackpy | Established particle-tracking baseline | BSD-style; reference only |
| https://dev.meta.ai/docs/models | Model IDs and modality support | Current official API reference |
| https://dev.meta.ai/docs/video-understanding | Video input requests | Official reference |
| https://dev.meta.ai/docs/sam/segmenting | SAM input_video, files and streaming | Official reference |
| https://github.com/meta-models/meta-sam | Official SAM output parser | Parser is a standard protocol dependency if available, not application code |
| https://dev.meta.ai/docs/structured-output | Muse JSON schema response format | Official reference |
| https://dev.meta.ai/docs/pricing-rate-limits | Cost estimates | Rates are estimates as of date, dashboard is authoritative |

Differentiation to validate: shorten experiment setup and produce an inspectable prediction-validation workflow. Existing Tracker already supports modeling; no claim of category invention or superiority is established.

## Licensed footage and presentation — 2026-10-31

- [Morpheus Real-World Physics Videos](https://huggingface.co/datasets/physics-from-video/morpheus-real-world), publisher MIT dataset declaration; [source license](https://github.com/physics-from-video/Morpheus/blob/main/LICENSE), copyright2026 Antonios Tragoudaras. Two spring excerpts bundled with full notice, unchanged geometry, first20s/CFR30/H.264 derivation. See public/examples/README.md and REAL-FOOTAGE-VALIDATION.md for original/derived hashes and limits. No Morpheus application implementation reused.
- [Official GitHub Pages custom workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) informed static deployment. This does not host the private paid backend.
- Native macOS Samantha voice supplies synthetic narration; FFmpeg composes licensed footage and actual application captures. Presentation is edited, not a continuous screen recording. Optional renderer uses Pillow and stdlib without adding an app runtime dependency.
- [Official hackathon page](https://dev.meta.ai/events/global-hackathon), rechecked2026-10-31: Push the Frontier theme, Indie/Startup tracks and Nov4 9PM ET submission deadline still listed. Participant/portal eligibility and actual acceptance are not inferred.
