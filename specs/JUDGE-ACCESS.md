# Judge access

The public product is a credential-free static browser build, separate from the owner’s optional loopback Meta server. User explicitly authorized GitHub Pages publication on 2026-10-31. Deployment and public URL verification are recorded in VERIFICATION.md after completion.

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
