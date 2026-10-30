// Scoped to authorized agent smoke tests, not the application's manual paid controls.
export const TEST_LIMIT_CENTS = 1000;
export type TestBudget = {
  version: 1;
  reservedCents: number;
  requests: { model: string; reservedCents: number; at: string }[];
};
export function validateBudget(value: unknown): TestBudget {
  const b = value as TestBudget;
  if (
    !b ||
    b.version !== 1 ||
    !Number.isInteger(b.reservedCents) ||
    b.reservedCents < 0 ||
    b.reservedCents > TEST_LIMIT_CENTS ||
    !Array.isArray(b.requests) ||
    b.requests.some(
      (r) =>
        !r ||
        !["muse-spark-1.3", "sam-3.1"].includes(r.model) ||
        !Number.isInteger(r.reservedCents) ||
        r.reservedCents <= 0 ||
        typeof r.at !== "string",
    ) ||
    b.requests.reduce((n, r) => n + r.reservedCents, 0) !== b.reservedCents
  )
    throw new Error(
      "Invalid test-budget ledger. Stop and inspect it; do not reset it.",
    );
  return b;
}
export function budgetedFetch(
  budget: TestBudget,
  persist: (b: TestBudget) => Promise<void>,
  transport: typeof fetch = fetch,
): typeof fetch {
  return async (input, init) => {
    const url = String(input);
    if (url === "data:,") return transport(input, init); // SDK FormData capability probe, no network.
    const u = new URL(url),
      method = init?.method ?? "GET";
    if (u.origin !== "https://api.meta.ai" || u.search || u.hash)
      throw new Error("Test transport permits only the official Meta API.");
    if (u.pathname === "/v1/responses" && method === "POST") {
      if (typeof init?.body !== "string")
        throw new Error("Unexpected request body; no paid request sent.");
      const body = JSON.parse(init.body);
      if (
        body.tools?.length ||
        body.previous_response_id ||
        body.background ||
        !Array.isArray(body.input) ||
        body.input.length !== 1
      )
        throw new Error("Only one-shot, tool-free tests are authorized.");
      let reservedCents: number;
      if (
        body.model === "muse-spark-1.3" &&
        Number.isInteger(body.max_output_tokens) &&
        body.max_output_tokens > 0 &&
        body.max_output_tokens <= 4000
      )
        reservedCents = 150;
      else if (body.model === "sam-3.1") reservedCents = 40;
      else
        throw new Error(
          "Model or output limit is outside the authorized test.",
        );
      validateBudget(budget);
      if (budget.reservedCents + reservedCents > TEST_LIMIT_CENTS)
        throw new Error(
          "The cumulative $10 test ceiling would be exceeded. No paid request sent.",
        );
      // Reservations are never released, including failed/unknown-cost requests.
      const next: TestBudget = {
        ...budget,
        reservedCents: budget.reservedCents + reservedCents,
        requests: [
          ...budget.requests,
          { model: body.model, reservedCents, at: new Date().toISOString() },
        ],
      };
      await persist(next); // A write failure prevents dispatch.
      Object.assign(budget, next);
    } else if (
      !(
        (u.pathname === "/v1/files" && method === "POST") ||
        (/^\/v1\/files\/[A-Za-z0-9_-]+$/.test(u.pathname) &&
          method === "DELETE")
      )
    )
      throw new Error("This endpoint is outside the authorized test.");
    return transport(input, init);
  };
}
