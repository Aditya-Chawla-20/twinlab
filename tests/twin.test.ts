import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fitModels } from "../src/lib/physics";
import { parseProject, sampleProject } from "../src/lib/project";
import {
  evaluateTransfer,
  freezeTwin,
  transferCsv,
  transferReport,
  verifyTwin,
} from "../src/lib/twin";
import { loadDraft, saveDraft } from "../src/lib/draft";

function release(frequency = 3.6) {
  const p = sampleProject();
  p.name = "Independent generated release B";
  p.media.name = "generated-B.mp4";
  p.points = p.points.map((q) => ({
    ...q,
    x: 480 + 100 * Math.exp(-0.09 * q.t) * Math.cos(frequency * q.t + 1.3),
    y: 300,
  }));
  return p;
}
const source = sampleProject();
const fit = fitModels(
  source.points,
  source.calibration,
  source.axis,
  source.trainFraction,
)[0];

test("frozen model round trip preserves independent snapshot and rejects tampering", async () => {
  const p = structuredClone(source),
    twin = await freezeTwin(p, fit);
  p.points[0].x = 0;
  assert.notEqual(twin.source.points[0].x, 0);
  assert.deepEqual(await verifyTwin(JSON.parse(JSON.stringify(twin))), twin);
  const changed = structuredClone(twin);
  changed.parameters.frequency += 0.1;
  await assert.rejects(verifyTwin(changed), /digest/);
  const target = release();
  target.comparison = { twin, initialSeconds: 2, sameSetup: true };
  assert.deepEqual(
    parseProject(JSON.parse(JSON.stringify(target))).comparison,
    target.comparison,
  );
  let draft = "";
  saveDraft(target, {
    setItem: (_key, value) => {
      draft = value;
    },
  });
  assert.deepEqual(
    loadDraft({ getItem: () => draft }).project?.comparison,
    target.comparison,
  );
});

test("separate release predicts without changing dynamics and exports excluded prefix", async () => {
  const twin = await freezeTwin(source, fit),
    target = release();
  const result = await evaluateTransfer(twin, target, 2, true);
  assert.ok(result.metrics.rmse < 0.002);
  assert.ok(result.metrics.rmse < result.baselines.persistence.rmse);
  assert.equal(result.fit.frequency, fit.frequency);
  assert.equal(result.fit.damping, fit.damping);
  assert.equal(result.count, 31);
  const poisoned = structuredClone(target);
  poisoned.points = poisoned.points.map((p, i) =>
    i < result.count ? p : { ...p, x: 10 },
  );
  const after = await evaluateTransfer(twin, poisoned, 2, true);
  assert.deepEqual(after.fit.coefficients, result.fit.coefficients);
  assert.deepEqual(
    after.rows.map((p) => p.predicted),
    result.rows.map((p) => p.predicted),
  );
  assert.ok(after.metrics.rmse > result.metrics.rmse * 100);
  assert.equal(
    transferCsv(result)
      .split("\n")
      .filter((s) => s.includes(",initial-state,")).length,
    31,
  );
  assert.match(
    transferReport(result, target),
    /These samples are excluded from scores/,
  );
  const mismatch = await evaluateTransfer(twin, release(5.0), 2, true);
  assert.ok(mismatch.metrics.rmse > result.metrics.rmse * 20);
});

test("self-evaluation, changed units/axes, short windows and missing declarations fail", async () => {
  const twin = await freezeTwin(source, fit),
    target = release();
  await assert.rejects(evaluateTransfer(twin, source, 2, true), /source data/);
  await assert.rejects(
    evaluateTransfer(twin, target, 2, false),
    /Review and accept/,
  );
  await assert.rejects(
    evaluateTransfer(twin, { ...target, calibration: null }, 2, true),
    /same units/,
  );
  await assert.rejects(
    evaluateTransfer(twin, { ...target, axis: "y" }, 2, true),
    /axes/,
  );
  await assert.rejects(
    evaluateTransfer(twin, target, 0.5, true),
    /one frozen period/,
  );
  await assert.rejects(evaluateTransfer(twin, target, 12, true), /eight later/);
  const videoHash = "a".repeat(64);
  const p = { ...source, media: { ...source.media, sha256: videoHash } };
  const hashed = await freezeTwin(p, fit);
  await assert.rejects(
    evaluateTransfer(
      hashed,
      { ...target, media: { ...target.media, sha256: videoHash } },
      2,
      true,
    ),
    /video hashes match/,
  );
});

test("quadratic transfer freezes acceleration while aligning a new release velocity", async () => {
  const a = release();
  a.calibration = null;
  a.points = a.points
    .slice(0, 60)
    .map((p) => ({ ...p, x: 100 + 10 * p.t + 2 * p.t ** 2 }));
  const fits = fitModels(a.points, null, "x", 0.7);
  const twin = await freezeTwin(a, fits.find((f) => f.kind === "quadratic")!);
  const b = {
    ...a,
    points: a.points.map((p) => ({ ...p, x: 200 + 5 * p.t + 2 * p.t ** 2 })),
  };
  const result = await evaluateTransfer(twin, b, 1, true);
  assert.ok(result.metrics.rmse < 1e-8);
  assert.equal(result.fit.coefficients[2], twin.parameters.coefficients[2]);
});

test("prediction CLI creates reproducible evidence without credentials and refuses overwrite", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "twinlab-prediction-"));
  try {
    const a = resolve(directory, "A.json"),
      b = resolve(directory, "B.json"),
      out = resolve(directory, "result");
    await writeFile(a, JSON.stringify(source));
    await writeFile(b, JSON.stringify(release()));
    const args = [
      "--import",
      "tsx",
      "scripts/predict.ts",
      "--source",
      a,
      "--target",
      b,
      "--initial-seconds",
      "2",
      "--same-setup",
      "--out",
      out,
    ];
    const exec = promisify(execFile);
    const env = {
      ...process.env,
      MODEL_API_KEY: "",
      META_LIVE_ENABLED: "false",
    };
    const { stdout } = await exec(process.execPath, args, { env });
    assert.equal(JSON.parse(stdout).providerCalls, 0);
    const target = parseProject(
      JSON.parse(await readFile(resolve(out, "target.twinlab.json"), "utf8")),
    );
    const r = await evaluateTransfer(target.comparison!.twin, target, 2, true);
    assert.equal(r.metrics.rmse, JSON.parse(stdout).metrics.rmse);
    await assert.rejects(exec(process.execPath, args, { env }), /EEXIST/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
