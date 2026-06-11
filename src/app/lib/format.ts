// Shared, dependency-free display formatters used by both server-side data
// loading (`data.ts`) and client dashboard components.

export function confidenceToPercent(score?: number | null): number | null {
  if (typeof score !== "number") return null;
  return Math.round(score * 100);
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta",
    }).format(new Date(iso));
  } catch { return iso; }
}

export function formatRelative(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const hr = ms / 3_600_000;
    if (hr < 24) return `${Math.round(hr)} jam lalu`;
    const day = hr / 24;
    if (day < 30) return `${Math.round(day)} hari lalu`;
    const month = day / 30;
    if (month < 12) return `${Math.round(month)} bulan lalu`;
    return `${Math.round(month / 12)} tahun lalu`;
  } catch { return iso; }
}

export function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
