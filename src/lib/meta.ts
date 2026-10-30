export type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: { cached_tokens?: number };
  video_frames_processed?: number;
};
export type Run = {
  id: string;
  at: string;
  stage: "plan" | "track";
  model: string;
  usage: Usage;
  estimatedUsd: number | null;
  status: "completed" | "failed";
  note?: string;
};
export type Plan = {
  summary: string;
  target: string;
  axis: "x" | "y";
  suggestedModel: "linear" | "quadratic" | "oscillation" | "damped";
  assumptions: string[];
  warnings: string[];
};
// Published Standard-mode rates, 2026-10-30. Estimates only; provider billing is authoritative.
export function cost(stage: "plan" | "track", u: Usage): number | null {
  const valid = (n: unknown): n is number =>
    typeof n === "number" && Number.isFinite(n) && n >= 0;
  if (stage === "track")
    return valid(u.video_frames_processed)
      ? (Math.max(50, u.video_frames_processed!) * 0.2) / 1000
      : null;
  if (!valid(u.input_tokens) || !valid(u.output_tokens)) return null;
  if (
    u.input_tokens_details?.cached_tokens !== undefined &&
    !valid(u.input_tokens_details.cached_tokens)
  )
    return null;
  const cached = Math.min(
    u.input_tokens!,
    Math.max(0, u.input_tokens_details?.cached_tokens ?? 0),
  );
  return (
    ((u.input_tokens! - cached) * 1.25 +
      cached * 0.15 +
      u.output_tokens! * 4.25) /
    1e6
  );
}
export const usd = (n: number | null) =>
  n === null
    ? "Unknown"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(n);
