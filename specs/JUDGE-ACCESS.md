# Judge access

The public product is a credential-free static browser build, separate from the owner’s optional loopback Meta server. User explicitly authorized GitHub Pages publication on 2026-10-31. Deployed and checked in Chrome without sign-in:

- Product: https://aditya-chawla-20.github.io/twinlab/
- Narrated2:54 demo/player: https://aditya-chawla-20.github.io/twinlab/demo/
- Direct MP4: https://aditya-chawla-20.github.io/twinlab/demo/twinlab-demo.mp4
- Source: https://github.com/Aditya-Chawla-20/twinlab

Deployment run41213297489 and check run41213277519 both succeeded for app commit93d69a8f7eeb261b822a07022c92598eb9ad6c0a. Chrome reproduced the real121/479 prediction and downloaded valid evidence. Product remains a static browser build, not a paid hosted service. Full verification is in VERIFICATION.md.

## Reproduce locally

```sh
npm ci
npm run build:demo
npm run preview:demo
```

Open http://127.0.0.1:4173. Use Real sample to inspect A or Predict → Try recorded real footage for A/B. Local video/manual CSV/calibration/model/prediction/export features work without credentials. Recorded Meta results are historical; the browser demo makes zero inference requests and cannot spend the owner’s credits.

Alternatively unzip artifacts/twinlab-static-demo.zip into a directory and serve it with a static HTTP server. Do not open index.html as file://; module assets and bundled fetches require HTTP. Relative assets also work below a path prefix, checked at /judge/twinlab/ locally.

## Public build

`.github/workflows/pages.yml` is manually dispatched; it builds dist-demo and publishes only that directory. No environment secrets are passed. The check workflow tests the app with offline transports and no provider credentials. GitHub Pages is available for public repositories on GitHub Free according to the [official workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), checked 2026-10-31.

Future changes require a new manual deployment. The optional server is never part of the Pages artifact. Do not deploy or tunnel it publicly without separate access/budget controls.
