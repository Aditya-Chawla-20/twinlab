import { test } from "node:test";
import assert from "node:assert/strict";
import { runMeta, validateInput, type MetaInput } from "../server/meta";
import { allowedRequest } from "../server/index";
import type { IncomingMessage } from "node:http";
const input: MetaInput = {
  stage: "plan",
  file: new File(["not-real-video"], "sample.mp4", { type: "video/mp4" }),
  question: "Measure motion",
  target: "ball",
  fps: 30,
  duration: 10,
  cfrConfirmed: true,
  confirmed: true,
};
const response = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
test("missing confirmation and variable-frame-rate tracking fail before transport", () => {
  assert.throws(() => validateInput({ ...input, confirmed: false }));
  assert.throws(() =>
    validateInput({ ...input, stage: "track", cfrConfirmed: false }),
  );
  assert.throws(() => validateInput({ ...input, duration: 31 }));
  assert.equal(
    allowedRequest({
      headers: { host: "127.0.0.1:5173", origin: "https://evil.example" },
    } as IncomingMessage),
    false,
  );
  assert.equal(
    allowedRequest({
      headers: { host: "evil.example:5173" },
    } as IncomingMessage),
    false,
  );
  assert.equal(
    allowedRequest({
      headers: { host: "127.0.0.1:5173", origin: "http://127.0.0.1:5173" },
    } as IncomingMessage),
    true,
  );
});
test("planning uses server key, bounded output, no retries, usage and file cleanup", async () => {
  const calls: { url: string; method: string; body: unknown }[] = [];
  const plan = {
    summary: "Horizontal oscillation",
    target: "ball",
    axis: "x",
    suggestedModel: "damped",
    assumptions: ["Fixed camera"],
    warnings: [],
  };
  const fake: typeof fetch = async (url, init) => {
    const href = String(url),
      method = init?.method ?? "GET";
    if (href === "data:,") return new Response("");
    calls.push({ url: href, method, body: init?.body });
    if (href.endsWith("/files") && method === "POST")
      return response({ id: "file-test", object: "file" });
    if (href.endsWith("/files/file-test"))
      return response({ id: "file-test", deleted: true });
    assert.equal(
      new Headers(init?.headers).get("authorization"),
      "Bearer test-key",
    );
    const body = JSON.parse(init?.body as string);
    assert.equal(body.max_output_tokens, 4000);
    assert.equal(body.model, "muse-spark-1.3");
    return response({
      id: "resp-test",
      object: "response",
      status: "completed",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: JSON.stringify(plan),
              annotations: [],
            },
          ],
        },
      ],
      usage: { input_tokens: 10000, output_tokens: 1000 },
    });
  };
  const result = await runMeta(input, { apiKey: "test-key", fetch: fake });
  assert.ok("plan" in result, JSON.stringify(result));
  assert.equal(result.run.estimatedUsd, 0.01675);
  assert.equal(result.run.status, "completed");
  assert.equal(calls.length, 3);
  assert.equal(calls.at(-1)?.method, "DELETE");
});
test("provider errors do not retry and retain unknown cost rather than zero", async () => {
  let n = 0;
  const fake: typeof fetch = async (url) => {
    if (String(url) === "data:,") return new Response("");
    n++;
    return new Response(
      JSON.stringify({ error: { message: "rate limited" } }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  };
  const r = await runMeta(input, { apiKey: "test-key", fetch: fake });
  assert.equal(n, 1);
  assert.equal(r.run.status, "failed");
  assert.equal(r.run.estimatedUsd, null);
  assert.ok("error" in r);
});
test("invalid completed plan retains billed usage", async () => {
  const fake: typeof fetch = async (url, init) => {
    const href = String(url);
    if (href.endsWith("/files")) return response({ id: "f" });
    if (init?.method === "DELETE") return response({ deleted: true });
    return response({
      object: "response",
      status: "completed",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "{}" }],
        },
      ],
      usage: { input_tokens: 1000, output_tokens: 100 },
    });
  };
  const r = await runMeta(input, { apiKey: "test-key", fetch: fake });
  assert.equal(r.run.status, "failed");
  assert.equal(r.run.estimatedUsd, 0.001675);
});
test("SAM preserves object identity and frame times through streamed protocol parsing", async () => {
  const text =
    "<0f>2<|box;x1=10;y1=20;x2=14;y2=24;w=100;h=80|><|mask;x=0;y=0;data=5,5,!!!!!(QO(0lu8?|>\n<30f>2<|box;x1=20;y1=20;x2=24;y2=24;w=100;h=80|><|mask;x=0;y=0;data=5,5,!!!!!(QO(0lu8?|>\n";
  const events = [
    {
      type: "response.output_text.delta",
      item_id: "m",
      output_index: 0,
      content_index: 0,
      delta: text,
    },
    {
      type: "response.output_text.done",
      item_id: "m",
      output_index: 0,
      content_index: 0,
      text,
    },
    {
      type: "response.completed",
      response: { usage: { video_frames_processed: 50 } },
    },
  ];
  const fake: typeof fetch = async (url, init) => {
    if (String(url) === "data:,") return new Response("");
    if (String(url).endsWith("/files")) return response({ id: "f" });
    if (init?.method === "DELETE") return response({ deleted: true });
    return new Response(
      events.map((e) => "data: " + JSON.stringify(e) + "\n\n").join(""),
      { headers: { "Content-Type": "text/event-stream" } },
    );
  };
  const r = await runMeta(
    { ...input, stage: "track" },
    { apiKey: "test-key", fetch: fake },
  );
  assert.ok("tracks" in r, JSON.stringify(r));
  if (!("tracks" in r) || !r.tracks) return;
  assert.equal(r.tracks[0].objectId, "2");
  assert.equal(r.tracks[0].points[1].t, 1);
  assert.equal(r.tracks[0].points[0].x, 12.5);
  assert.equal(r.tracks[0].centroidPoints[0].x, 12.6);
  assert.equal(r.tracks[0].centroidPoints[0].measurement, "mask-centroid");
  assert.equal(r.tracks[0].centroidPoints[1].t, 1);
  assert.equal(r.run.estimatedUsd, 0.01);
});
test("incomplete SAM output is rejected without inventing observations", async () => {
  const fake: typeof fetch = async (url, init) => {
    if (String(url) === "data:,") return new Response("");
    if (String(url).endsWith("/files")) return response({ id: "f" });
    if (init?.method === "DELETE") return response({ deleted: true });
    return new Response(
      "data: " +
        JSON.stringify({
          type: "response.incomplete",
          response: {
            usage: { video_frames_processed: 100 },
            incomplete_details: { reason: "max_output_tokens" },
          },
        }) +
        "\n\n",
      { headers: { "Content-Type": "text/event-stream" } },
    );
  };
  const r = await runMeta(
    { ...input, stage: "track" },
    { apiKey: "test-key", fetch: fake },
  );
  assert.equal(r.run.status, "failed");
  assert.ok("error" in r);
  assert.equal(r.run.estimatedUsd, 0.02);
  assert.ok(!r.tracks);
});
test("a completed zero-match SAM run is valid and leaves tracks empty", async () => {
  const fake: typeof fetch = async (url, init) => {
    if (String(url) === "data:,") return new Response("");
    if (String(url).endsWith("/files")) return response({ id: "f" });
    if (init?.method === "DELETE") return response({ deleted: true });
    return new Response(
      "data: " +
        JSON.stringify({
          type: "response.output_text.done",
          item_id: "m",
          output_index: 0,
          content_index: 0,
          text: "",
        }) +
        "\n\ndata: " +
        JSON.stringify({
          type: "response.completed",
          response: { usage: { video_frames_processed: 50 } },
        }) +
        "\n\n",
      { headers: { "Content-Type": "text/event-stream" } },
    );
  };
  const r = await runMeta(
    { ...input, stage: "track" },
    { apiKey: "test-key", fetch: fake },
  );
  assert.equal(r.run.status, "completed");
  assert.deepEqual(r.tracks, []);
  assert.equal(r.run.estimatedUsd, 0.01);
});
