import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "../server/index";
import { runMeta } from "../server/meta";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("local server exposes status and blocks paid calls while live mode is off", async () => {
  const old = process.env.META_LIVE_ENABLED;
  process.env.META_LIVE_ENABLED = "false";
  const app = await startServer(0, true),
    port = (app.server.address() as { port: number }).port,
    url = `http://127.0.0.1:${port}`;
  try {
    const status = await fetch(url + "/api/status").then((r) => r.json());
    assert.equal(status.enabled, false);
    const blocked = await fetch(url + "/api/meta", {
      method: "POST",
      headers: { "X-TwinLab-Action": "manual-paid-run" },
    });
    assert.equal(blocked.status, 403);
    const cross = await fetch(url + "/api/status", {
      headers: { Origin: "https://other.example" },
    });
    assert.equal(cross.status, 403);
    const missing = await fetch(url + "/api/missing");
    assert.equal(missing.status, 404);
  } finally {
    await app.close();
    if (old === undefined) delete process.env.META_LIVE_ENABLED;
    else process.env.META_LIVE_ENABLED = old;
  }
});

test("manual HTTP multipart path calls the real SDK/parser through fake transport and retains usage", async () => {
  const cwd = process.cwd(),
    oldKey = process.env.MODEL_API_KEY,
    oldLive = process.env.META_LIVE_ENABLED;
  const directory = await mkdtemp(join(tmpdir(), "twinlab-http-"));
  process.chdir(directory); // Isolate the ledger; never contaminate the user's actual run history.
  process.env.MODEL_API_KEY = "offline-test-key";
  process.env.META_LIVE_ENABLED = "true";
  let providerCalls = 0;
  const fake: typeof fetch = async (url, init) => {
    const href = String(url);
    const response = (body: unknown) =>
      new Response(JSON.stringify(body), {
        headers: { "Content-Type": "application/json" },
      });
    if (href === "data:,") return new Response("");
    if (href.endsWith("/files")) return response({ id: "offline-file" });
    if (init?.method === "DELETE") return response({ deleted: true });
    assert.ok(href.endsWith("/responses"));
    providerCalls++;
    return response({
      object: "response",
      status: "completed",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                summary: "Offline integration fixture",
                target: "test object",
                axis: "y",
                suggestedModel: "damped",
                assumptions: ["Offline QA only"],
                warnings: [],
              }),
            },
          ],
        },
      ],
      usage: { input_tokens: 1000, output_tokens: 100 },
    });
  };
  const app = await startServer(0, true, (input, options) =>
    runMeta(input, { ...options, fetch: fake }),
  );
  const port = (app.server.address() as { port: number }).port,
    url = `http://127.0.0.1:${port}`;
  try {
    const form = new FormData();
    form.set(
      "file",
      new Blob(["offline fixture"], { type: "video/mp4" }),
      "offline.mp4",
    );
    for (const [key, value] of Object.entries({
      stage: "plan",
      question: "Offline HTTP check",
      target: "test object",
      fps: "30",
      duration: "1",
      cfrConfirmed: "true",
      confirmation: "RUN_PAID_META_REQUEST",
    }))
      form.set(key, value);
    const blocked = await fetch(url + "/api/meta", {
      method: "POST",
      body: form,
    });
    assert.equal(blocked.status, 403);
    assert.equal(providerCalls, 0);
    const response = await fetch(url + "/api/meta", {
      method: "POST",
      headers: { "X-TwinLab-Action": "manual-paid-run" },
      body: form,
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.plan.summary, "Offline integration fixture");
    assert.equal(result.run.status, "completed");
    assert.equal(result.run.estimatedUsd, 0.001675);
    assert.equal(providerCalls, 1);
    const usage = await fetch(url + "/api/usage").then((r) => r.json());
    assert.equal(usage.runs.length, 1);
    assert.equal(usage.runs[0].id, result.run.id);
  } finally {
    await app.close();
    process.chdir(cwd);
    if (oldKey === undefined) delete process.env.MODEL_API_KEY;
    else process.env.MODEL_API_KEY = oldKey;
    if (oldLive === undefined) delete process.env.META_LIVE_ENABLED;
    else process.env.META_LIVE_ENABLED = oldLive;
    await rm(directory, { recursive: true, force: true });
  }
});
