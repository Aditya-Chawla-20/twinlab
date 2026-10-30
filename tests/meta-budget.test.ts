import { test } from "node:test";
import assert from "node:assert/strict";
import {
  budgetedFetch,
  validateBudget,
  type TestBudget,
} from "../scripts/meta-budget";
const request = (model = "muse-spark-1.3") => ({
  method: "POST",
  body: JSON.stringify({
    model,
    max_output_tokens: 4000,
    input: [{ role: "user", content: [] }],
  }),
});
test("test budget is reserved durably before dispatch and retained on transport failure", async () => {
  const b: TestBudget = { version: 1, reservedCents: 0, requests: [] };
  let written = 0,
    sent = 0;
  const f = budgetedFetch(
    b,
    async (next) => {
      written = next.reservedCents;
    },
    async () => {
      assert.equal(written, 150);
      sent++;
      throw new Error("timeout");
    },
  );
  await assert.rejects(() => f("https://api.meta.ai/v1/responses", request()));
  assert.equal(b.reservedCents, 150);
  assert.equal(sent, 1);
});
test("budget rejects another request before the cumulative $10 ceiling", async () => {
  const b: TestBudget = {
    version: 1,
    reservedCents: 900,
    requests: Array.from({ length: 6 }, () => ({
      model: "muse-spark-1.3",
      reservedCents: 150,
      at: "test",
    })),
  };
  let sent = 0;
  const f = budgetedFetch(
    b,
    async () => {},
    async () => {
      sent++;
      return new Response("{}");
    },
  );
  await assert.rejects(
    () => f("https://api.meta.ai/v1/responses", request()),
    /ceiling/,
  );
  assert.equal(sent, 0);
  assert.equal(b.reservedCents, 900);
});
test("unsupported models, tools, endpoints and reservation write failure cannot dispatch", async () => {
  const b: TestBudget = { version: 1, reservedCents: 0, requests: [] };
  let sent = 0;
  const f = budgetedFetch(
    b,
    async () => {
      throw new Error("disk full");
    },
    async () => {
      sent++;
      return new Response("{}");
    },
  );
  await assert.rejects(() =>
    f("https://api.meta.ai/v1/responses", request("muse-wonder-1.0")),
  );
  await assert.rejects(() =>
    f("https://other.example/v1/responses", request()),
  );
  await assert.rejects(() =>
    f("https://api.meta.ai/v1/responses", {
      method: "POST",
      body: JSON.stringify({
        model: "muse-spark-1.3",
        max_output_tokens: 4000,
        input: [{}],
        tools: [{ type: "web_search" }],
      }),
    }),
  );
  await assert.rejects(
    () => f("https://api.meta.ai/v1/responses", request()),
    /disk full/,
  );
  assert.equal(sent, 0);
  assert.equal(b.reservedCents, 0);
  assert.throws(() =>
    validateBudget({
      version: 1,
      reservedCents: 0,
      requests: [{ model: "sam-3.1", reservedCents: 40, at: "test" }],
    }),
  );
});
