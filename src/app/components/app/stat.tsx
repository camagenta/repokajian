type Accent = "jade" | "amber" | "rust" | "g500";

function accentColor(accent?: Accent): string {
  return accent === "jade" ? "text-[var(--jade)]"
    : accent === "amber" ? "text-[var(--amber)]"
    : accent === "rust" ? "text-[var(--rust)]"
    : accent === "g500" ? "text-[var(--g500)]"
    : "text-[var(--slate)]";
}

export function Stat({ label, value, accent }: { label: string; value: number; accent?: Accent }) {
  return (
    <div className="rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-4">
      <div className="eyebrow !text-[10px] mb-2">{label}</div>
      <div className={`font-display text-[32px] leading-none ${accentColor(accent)}`}>{value}</div>
    </div>
  );
}

export function MiniStat({ label, value, accent }: { label: string; value: number; accent?: Accent }) {
  return (
    <div className="rounded-lg border border-[var(--g300)] bg-[var(--ivory)] px-3 py-3">
      <div className="eyebrow !text-[9.5px] mb-2">{label}</div>
      <div className={`font-display text-[26px] leading-none ${accentColor(accent)}`}>{value}</div>
    </div>
  );
}
