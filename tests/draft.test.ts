import { test } from "node:test";
import assert from "node:assert/strict";
import { DRAFT_KEY, loadDraft, saveDraft } from "../src/lib/draft";
import { sampleProject } from "../src/lib/project";

test("browser draft recovers project provenance and leaves invalid prior data intact", () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
  assert.equal(loadDraft(storage).project, null);
  const project = {
    ...sampleProject(),
    trackingTarget: "phone",
    synthetic: true,
  };
  saveDraft(project, storage);
  assert.deepEqual(loadDraft(storage).project, project);
  data.set(DRAFT_KEY, "{broken");
  const bad = loadDraft(storage);
  assert.equal(bad.project, null);
  assert.equal(bad.protected, true);
  assert.equal(data.get(DRAFT_KEY), "{broken");
  data.set(DRAFT_KEY, "x".repeat(1_500_001));
  assert.equal(loadDraft(storage).protected, true);
});
test("denied/full storage reports failure and never silently reports a saved draft", () => {
  const unavailable = loadDraft({
    getItem: () => {
      throw new Error("Access denied");
    },
  });
  assert.match(unavailable.error, /unavailable/);
  assert.throws(
    () =>
      saveDraft(sampleProject(), {
        setItem: () => {
          throw new Error("Quota exceeded");
        },
      }),
    /Save project JSON/,
  );
});
