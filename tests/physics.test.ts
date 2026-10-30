import { test } from "node:test";
import assert from "node:assert/strict";
import { fitModels, metersPerPixel, type Point } from "../src/lib/physics";
import { emptyProject, parseProject, sampleProject } from "../src/lib/project";
import { cost } from "../src/lib/meta";

test("known synthetic damping is recovered and predicts later samples", () => {
  const p = sampleProject(),
    fits = fitModels(p.points, p.calibration, "x", 0.7),
    best = fits[0];
  assert.equal(best.kind, "damped");
  assert.ok(Math.abs(best.frequency - 3.6 / (2 * Math.PI)) < 0.002);
  assert.ok(Math.abs(best.damping - 0.09) < 0.003);
  assert.ok(best.validationRmse < 0.002);
});
test("validation observations cannot influence fitted coefficients or training ranking", () => {
  const p = sampleProject(),
    before = fitModels(p.points, p.calibration, "x", 0.7),
    split = Math.floor(p.points.length * 0.7);
  const poisoned = p.points.map((point, i) =>
    i < split ? point : { ...point, x: point.x + 1000 },
  );
  const after = fitModels(poisoned, p.calibration, "x", 0.7);
  assert.deepEqual(
    before.map((f) => [f.kind, f.coefficients, f.frequency, f.damping, f.bic]),
    after.map((f) => [f.kind, f.coefficients, f.frequency, f.damping, f.bic]),
  );
  assert.ok(after[0].validationRmse > 1);
});
test("calibration and linear/quadratic fits preserve physical units", () => {
  const points: Point[] = Array.from({ length: 30 }, (_, i) => ({
    t: i * 0.2,
    x: 100 + 10 * i * 0.2 + 2 * (i * 0.2) ** 2,
    y: 100,
    source: "manual",
  }));
  const c = {
    a: [0, 0] as [number, number],
    b: [100, 0] as [number, number],
    meters: 1,
  };
  assert.equal(metersPerPixel(c), 0.01);
  const fits = fitModels(points, c, "x", 0.7);
  assert.equal(fits[0].kind, "quadratic");
  assert.ok(fits[0].validationRmse < 1e-10);
  assert.ok(Math.abs(fits[0].coefficients[2] - 0.02) < 1e-8);
  assert.throws(() => metersPerPixel({ ...c, b: [0, 0] }));
});
test("untrusted imports reject duplicate time, invalid calibration and oversized points", () => {
  const p = sampleProject();
  assert.equal(parseProject(JSON.parse(JSON.stringify(p))).points.length, 181);
  assert.throws(() =>
    parseProject({ ...p, points: [p.points[0], p.points[0]] }),
  );
  assert.throws(() =>
    parseProject({ ...p, calibration: { a: [0, 0], b: [1, 0], meters: 0 } }),
  );
  assert.throws(() =>
    parseProject({ ...p, points: [{ t: NaN, x: 1, y: 1, source: "manual" }] }),
  );
  assert.throws(() =>
    parseProject({ ...p, points: Array(2001).fill(p.points[0]) }),
  );
});
test("saved tracking targets survive reopen and legacy projects get safe defaults", () => {
  const p = { ...emptyProject(), trackingTarget: "phone", synthetic: true };
  assert.equal(
    parseProject(JSON.parse(JSON.stringify(p))).trackingTarget,
    "phone",
  );
  assert.throws(() => parseProject({ ...p, trackingTarget: 42 }));
  assert.throws(() => parseProject({ ...p, trackingTarget: "x".repeat(121) }));
  assert.equal(
    parseProject({ ...sampleProject(), trackingTarget: undefined }).trackingTarget,
    "blue ball",
  );
  assert.equal(parseProject({ ...p, trackingTarget: undefined }).trackingTarget, "");
});
test("cost uses reported units, cached tokens, and minimum video billing", () => {
  assert.equal(cost("track", { video_frames_processed: 300 }), 0.06);
  assert.equal(cost("track", { video_frames_processed: 1 }), 0.01);
  assert.equal(cost("track", {}), null);
  assert.equal(cost("track", { video_frames_processed: -1 }), null);
  assert.equal(cost("plan", { input_tokens: -1, output_tokens: 1 }), null);
  assert.equal(
    cost("plan", {
      input_tokens: 1,
      output_tokens: 1,
      input_tokens_details: { cached_tokens: NaN },
    }),
    null,
  );
  assert.equal(cost("plan", {}), null);
  assert.equal(
    cost("plan", { input_tokens: 10000, output_tokens: 1000 }),
    0.01675,
  );
  assert.equal(
    cost("plan", {
      input_tokens: 1000,
      output_tokens: 0,
      input_tokens_details: { cached_tokens: 1000 },
    }),
    0.00015,
  );
});
