"use client";

import { useMemo, useState } from "react";
import type { HealthStatus, Snapshot, Source } from "../../lib/data";
import { PLATFORM_ICONS, STATUS_META } from "./status-config";
import { confidenceToPercent, formatNum, formatRelative } from "../../lib/format";
import { generateHistory, ScoreRing, Sparkline } from "./charts";

export function SourceCard({
  source,
  snapshot,
  index,
  parentSource,
  childCount,
}: {
  source: Source;
  snapshot?: Snapshot;
  index: number;
  parentSource?: Source;
  childCount: number;
}) {
  const [hovered, setHovered] = useState(false);
  const status: HealthStatus = snapshot?.status ?? "unmonitored";
  const score = confidenceToPercent(snapshot?.confidence_score);
  const meta = STATUS_META[status];
  const history = useMemo(() => generateHistory(source.id, status, score), [source.id, status, score]);
  const sparkColor = meta.ringColor;
  const lastPost = snapshot?.metrics?.last_post_at ?? null;
  const subs = snapshot?.metrics?.subscribers ?? null;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-enter flex items-center gap-4 rounded-xl border bg-[var(--paper)] px-5 py-4 no-underline transition-all duration-200"
      style={{
        borderColor: hovered ? "var(--g500)" : "var(--g300)",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 4px 18px rgba(0,0,0,0.07)" : "none",
        animationDelay: `${Math.min(index * 35, 280)}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ScoreRing score={score} status={status} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-semibold text-[15px] text-[var(--slate)] truncate max-w-[200px]">{source.name}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-mono ${meta.bg} ${meta.fg} shrink-0`}>
            <span className={`size-1.5 rounded-full ${meta.dot} ${
              status === "active" ? "animate-[pulse-active_2s_ease_infinite]" :
              status === "stale" ? "animate-[pulse-checking_1.2s_ease_infinite]" : ""
            }`} />
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[var(--g500)] opacity-60 shrink-0">
            {PLATFORM_ICONS[source.platform] ?? PLATFORM_ICONS.web}
          </span>
          {source.priority >= 4 && (
            <span className="font-mono text-[10px] text-[var(--g500)] shrink-0">archived</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-[var(--g500)]">
          {source.handle && (
            <span className="font-mono text-[11.5px] truncate max-w-[180px]">@{source.handle}</span>
          )}
          {source.source_type && (
            <span className="font-mono text-[11px]">{source.source_type}</span>
          )}
          {source.parent_id && (
            <span className="font-mono text-[11px]">
              parent: {parentSource?.id ?? source.parent_id}
            </span>
          )}
          {!source.parent_id && childCount > 0 && (
            <span className="font-mono text-[11px]">children: {childCount}</span>
          )}
          {subs != null && <span>{formatNum(subs)} subs</span>}
          {lastPost && <span>{formatRelative(lastPost)}</span>}
        </div>
      </div>
      {/* Sparkline — hidden on small screens */}
      <div className="hidden sm:block shrink-0">
        <Sparkline data={history} width={68} height={26} color={sparkColor} />
      </div>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0"
        style={{ opacity: hovered ? 0.35 : 0.12, transition: "opacity 0.2s" }}>
        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
