import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, stat, writeFile, truncate } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { readTestFixture, validateFixtureProbe } from "../scripts/meta-fixture";

const samplePath = resolve("public/pendulum-synthetic.mp4");
const sampleSha = "c0bbb9dbc6c43468e42832e74b909164cdc0a5249b50490d3c9a8f9e6c2ece78";
const probe = () => ({
  streams: [{ r_frame_rate: "24/1", avg_frame_rate: "24/1", duration: "10", nb_frames: "240", width: 1280, height: 720 }],
  format: { duration: "10.026667" },
  frames: Array.from({ length: 240 }, (_, i) => ({ best_effort_timestamp_time: (i / 24).toFixed(6) })),
});

test("rate metadata alone cannot authorize variable or shifted frame timestamps", () => {
  assert.equal(validateFixtureProbe(probe()).frames, 240);
  const variable = probe();
  variable.frames[100].best_effort_timestamp_time = "4.20";
  assert.throws(() => validateFixtureProbe(variable), /timestamps/);
  const shifted = probe();
  shifted.frames[0].best_effort_timestamp_time = "0.04";
  assert.throws(() => validateFixtureProbe(shifted), /timestamps/);
  const missing = probe();
  missing.frames[0].best_effort_timestamp_time = "";
  assert.throws(() => validateFixtureProbe(missing), /timestamps/);
  const long = probe();
  long.format.duration = "31";
  assert.throws(() => validateFixtureProbe(long), /limits/);
  const highRate = probe();
  highRate.streams[0].r_frame_rate = "120/1";
  assert.throws(() => validateFixtureProbe(highRate), /limits/);
});

test("fixture inspection pins reviewed bytes and rejects oversized files before dispatch", async () => {
  const fixture = await readTestFixture(samplePath, sampleSha);
  assert.equal(fixture.frames, 360);
  assert.equal(fixture.fps, 30);
  await assert.rejects(() => readTestFixture(samplePath, "0".repeat(64)), /digest differs/);
  const dir = await mkdtemp(join(tmpdir(), "twinlab-fixture-"));
  try {
    const large = join(dir, "large.mp4");
    await writeFile(large, "");
    await truncate(large, 31 * 1024 * 1024);
    await assert.rejects(() => readTestFixture(large, sampleSha), /30 MB/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("selected-file dry run works without credentials or creating a spending ledger", async () => {
  const dir = await mkdtemp(join(tmpdir(), "twinlab-dry-run-"));
  try {
    const output = execFileSync(process.execPath, [
      "--import", resolve("node_modules/tsx/dist/loader.mjs"),
      resolve("scripts/meta-live-test.ts"), "--video", samplePath, "--sha256", sampleSha,
      "--target", "blue ball", "--question", "Review generated motion only.",
    ], { cwd: dir, encoding: "utf8", env: { ...process.env, MODEL_API_KEY: "" } });
    const summary = JSON.parse(output);
    assert.equal(summary.live, false);
    assert.equal(summary.providerCalls, 0);
    assert.equal(summary.frames, 360);
    await assert.rejects(() => stat(join(dir, ".twinlab")), { code: "ENOENT" });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
