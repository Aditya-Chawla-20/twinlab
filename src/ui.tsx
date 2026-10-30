export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    upload: "M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5",
    download: "M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4",
    play: "m8 5 11 7-11 7Z",
    pause: "M8 5v14M16 5v14",
    ruler: "m3 16 13-13 5 5L8 21Zm7-10 3 3m-7 1 3 3m-7 1 3 3",
    target: "M12 2v4m0 12v4M2 12h4m12 0h4M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
    chart: "M4 3v17h17M7 14l4-6 4 4 5-8",
    check: "m5 12 4 4L19 6",
    arrow: "M5 12h14m-5-5 5 5-5 5",
    close: "m6 6 12 12M6 18 18 6",
    folder: "M3 7h7l2 2h9v11H3Zm0 0V4h7l2 3",
    info: "M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    reset: "M3 11a9 9 0 1 1 2 7M3 4v7h7",
    step: "m5 5 10 7-10 7ZM19 5v14",
    spark: "m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3Z",
    table: "M3 4h18v16H3Zm0 5h18M9 4v16",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.info} />
    </svg>
  );
}

export const fmt = (v: number, d = 3) =>
  Number.isFinite(v) ? v.toFixed(d) : "—";
