"use client";

import { useState } from "react";

const SCORE_TIERS = [
  { range: "≥ 80", label: "Last post < 7 hari", color: "text-[var(--jade)]" },
  { range: "50–79", label: "Last post 7–14 hari", color: "text-[var(--amber)]" },
  { range: "1–49", label: "Last post 14–30 hari", color: "text-[var(--rust)]" },
  { range: "0", label: "Last post > 30 hari atau error", color: "text-[var(--g500)]" },
];

export function ScoreExplainer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="text-[12px] text-[var(--g500)] hover:text-[var(--clay)] underline decoration-[var(--oat)] underline-offset-4 transition-colors">
        {open ? "▾ Sembunyikan cara hitung skor" : "▸ Bagaimana skor dihitung?"}
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-5 max-w-[650px]">
          <p className="eyebrow !text-[10px] mb-3">Reliability Score · Phase 1 (MVP)</p>
          <p className="text-[12.5px] text-[var(--g700)] mb-4 leading-relaxed">
            Skor saat ini dihitung murni dari <strong>freshness</strong> — seberapa baru postingan terakhir.
          </p>
          <div className="grid gap-2.5">
            {SCORE_TIERS.map((t) => (
              <div key={t.range} className="grid grid-cols-[72px_1px_minmax(0,1fr)] items-center gap-4">
                <span className={`font-display text-[21px] leading-none tabular-nums text-right ${t.color}`}>{t.range}</span>
                <span className="h-6 w-px bg-[var(--g200)]" aria-hidden="true" />
                <span className="text-[12.5px] leading-5 text-[var(--g700)]">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
