# Presentation artifact

The final `public/demo/twinlab-demo.mp4` is an edited product walkthrough: actual application screenshots, the licensed Morpheus spring excerpt and native synthetic system narration. Historical Muse/SAM results are explicitly labeled. It is not a continuous screen recording or a fresh inference run. No user AI video or private key appears.

`storyboard.json` contains the exact spoken sentences and scene labels; `specs/assets/demo/` contains the reviewed presentation frames. `public/demo/manifest.json` records measured duration, chapter times, source/frame hashes and final video digest. SRT/VTT and transcript are shipped beside the MP4. Captions are also burned into the video. Native video controls on `demo/index.html` provide playback/download and optional caption selection.

Optional rerender from the repository root on macOS:

```sh
python3 scripts/render-demo.py
```

Requires installed FFmpeg/ffprobe, Pillow and the macOS Samantha voice; no API/service call. It measures individual synthesized sentences before scheduling cuts, checks total duration <=180s, uses 30fps cuts, adds audio headroom, and validates the final output. Exact voice waveform/MP4 bytes may vary across OS/encoder versions; generated hashes identify the actual artifact rather than promise bit-identical cross-machine rendering. Narration caches are fingerprinted by voice/rate/text under ignored artifacts/. App build/reproduction does not require this optional renderer.

Full decode, audio signal levels, keyframe visual review, caption counts/hashes and the public playback check are recorded in VERIFICATION.md. Footage attribution/derivation is in public/examples/README.md and public/notices/morpheus-MIT.txt.
