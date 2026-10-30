import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "../server/index";
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
