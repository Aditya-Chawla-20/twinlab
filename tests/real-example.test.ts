import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseProject } from "../src/lib/project";
import { evaluateTransfer, transferCsv, verifyTwin } from "../src/lib/twin";
import { readTestFixture } from "../scripts/meta-fixture";

test("shipped real example retains verified media, source identity and reported transfer evidence", async () => {
  const [a, b] = await Promise.all(
    ["A", "B"].map(async (name) => {
      const p = parseProject(
        JSON.parse(
          await readFile(`public/examples/beam-${name}.twinlab.json`, "utf8"),
        ),
      );
      const media = await readTestFixture(
        `public/examples/${p.media.name}`,
        p.media.sha256!,
      );
      assert.equal(media.frames, 600);
      assert.equal(media.fps, 30);
      assert.equal(p.synthetic, false);
      assert.equal(p.calibration, null);
      assert.equal(p.points.length, 600);
      assert.ok(
        p.points.every(
          (point) =>
            point.source === "sam" && point.measurement === "mask-centroid",
        ),
      );
      return p;
    }),
  );
  assert.equal(a.runs.length, 3); // Plan, initial boxes, deliberate centroid review.
  assert.equal(b.runs.length, 1);
  const c = b.comparison!;
  assert.equal(c.sameSetup, false); // A conditional assumption must be reviewed.
  assert.equal(c.initialSeconds, 4);
  const model = await verifyTwin(c.twin);
  assert.deepEqual(model.source.points, a.points);
  const result = await evaluateTransfer(model, b, c.initialSeconds, true);
  assert.equal(result.count, 121);
  assert.equal(result.rows.length - result.count, 479);
  assert.ok(Math.abs(result.metrics.rmse - 2.9880990318807) < 1e-6);
  assert.ok(result.metrics.rmse < result.baselines.persistence.rmse);
  assert.match(transferCsv(result).split("\n")[0], /observed_px,predicted_px/);
});
