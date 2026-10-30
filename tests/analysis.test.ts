import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fitModels, type Point } from "../src/lib/physics";
import { sampleProject } from "../src/lib/project";
import { csv, reportMarkdown } from "../src/lib/export";
import { Chart } from "../src/Chart";
import { ModelPanel } from "../src/ModelPanel";
import { Evidence } from "../src/Evidence";

test("held-out timestamps cannot change the frequency search or fitted dynamics", () => {
  const points: Point[] = Array.from({ length: 60 }, (_, i) => {
    const t = i * 0.2;
    return {
      t,
      x: 200 + 50 * Math.exp(-0.09 * t) * Math.cos(2 * Math.PI * 0.8 * t),
      y: 100,
      source: "synthetic",
    };
  });
  const before = fitModels(points, null, "x", 0.5);
  const changed = points.map((p, i) =>
    i < 30 ? p : { ...p, t: 6 + (i - 30) },
  );
  const after = fitModels(changed, null, "x", 0.5);
  const dynamics = (fits: typeof before) =>
    fits.map((f) => [
      f.kind, f.coefficients, f.frequency, f.damping, f.bic, f.trainCount,
    ]);
  assert.deepEqual(dynamics(after), dynamics(before));
  assert.ok(
    Math.abs(before.find((f) => f.kind === "damped")!.frequency - 0.8) < 0.002,
  );
});

test("small-dataset labels and exports match the fitter's actual training boundary", () => {
  const project = sampleProject();
  project.points = project.points.slice(0, 12);
  project.trainFraction = 0.6;
  const fits = fitModels(
    project.points, project.calibration, project.axis, project.trainFraction,
  );
  const fit = fits[0];
  assert.equal(fit.trainCount, 8); // At least eight training and three validation points.
  const rows = csv(project, fit)
    .split("\n")
    .slice(1)
    .map((r) => r.split(","));
  assert.equal(rows.filter((r) => r[6] === "training").length, 8);
  assert.equal(rows.filter((r) => r[6] === "validation").length, 4);
  assert.match(reportMarkdown(project, fits, fit), /first 8 observations/);
  assert.match(
    reportMarkdown(project, fits, fit),
    /AI-GENERATED footage, not a real-world measurement/,
  );
  const chart = renderToStaticMarkup(createElement(Chart, {
    points: project.points,
    calibration: project.calibration,
    axis: project.axis,
    fit,
    currentTime: 0,
    onSeek: () => {},
  }));
  assert.ok(
    chart.includes(`Validation begins at ${project.points[8].t.toFixed(2)} seconds.`),
  );
  const panel = renderToStaticMarkup(createElement(ModelPanel, {
    project,
    fit,
    fits,
    update: () => {},
    status: { enabled: false, configured: false },
    busy: false,
    videoUrl: "",
    onSelect: () => {},
    onPlan: () => {},
    onApplyPlan: () => {},
  }));
  assert.match(panel, /4 later observations withheld/);
  assert.match(panel, /Generated \/ AI footage/);
  assert.match(panel, /type="checkbox"[^>]*checked=""/);
  const evidence = renderToStaticMarkup(createElement(Evidence, {
    project,
    fits,
    fit,
    videoAvailable: false,
    onImportCsv: () => {},
    onViewFrame: () => {},
    update: () => {},
  }));
  assert.equal((evidence.match(/<td>Training<\/td>/g) ?? []).length, 8);
  assert.equal((evidence.match(/<td>Validation<\/td>/g) ?? []).length, 4);
});

test("unfitted observations are not exported as a completed validation", () => {
  const project = sampleProject();
  project.points = project.points.slice(0, 4);
  const rows = csv(project, null).split("\n").slice(1);
  assert.ok(rows.every((r) => r.split(",")[6] === "unfitted"));
  assert.match(reportMarkdown(project, [], null), /No model fitted/);
});
