import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseVideoStream,
  recordsOfKind,
  type ResponsesEvent,
} from "@meta-sam/parser";
import { maskCentroid } from "../server/landmarks";

test("mask centroid decodes protocol pixels and maps their centers into source coordinates", async () => {
  const text =
    "<0f>2<|box;x1=10;y1=20;x2=14;y2=24;w=100;h=80|><|mask;x=0;y=0;data=5,5,!!!!!(QO(0lu8?|>\n";
  async function* events(): AsyncIterable<ResponsesEvent> {
    yield {
      type: "response.output_text.done",
      item_id: "m",
      output_index: 0,
      content_index: 0,
      text,
    };
    yield { type: "response.completed" };
  }
  const result = await parseVideoStream(events()).finalResult;
  const mask = recordsOfKind(result.records, "mask")[0];
  const point = maskCentroid(mask)!;
  // Ten foreground pixels in this conformance mask have center sums x=26, y=27.
  // The asymmetric foreground differs from the box midpoint (12.5, 22.5).
  assert.deepEqual(point, { x: 12.6, y: 22.7 });
  const scaled = {
    ...mask,
    bounds: { left: 100, top: 200, right: 110, bottom: 220 },
  };
  assert.deepEqual(maskCentroid(scaled), { x: 105.2, y: 210.8 });
  assert.throws(
    () =>
      maskCentroid({
        ...mask,
        mask: { ...mask.mask, width: 5000, height: 5000 },
      }),
    /limit/,
  );
});
