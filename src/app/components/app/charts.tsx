"use client";

import { useEffect, useRef, useState } from "react";
import type { HealthHistoryPoint, HealthStatus } from "../../lib/data";
import { STATUS_META } from "./status-config";

// ===== Seeded history generation ==============================

function seededRand(seed: number) {
  let s = (seed * 1664525 + 1013904223) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export function generateHistory(id: string, status: HealthStatus, score: number | null): (number | null)[] {
  const rand = seededRand(hashStr(id));
  return Array.from({ length: 30 }, (_, i) => {
    if (status === "active") {
      return Math.round(Math.max(60, Math.min(100, (score ?? 85) + Math.sin(i * 0.4) * 8 + rand() * 6 - 3)));
    }
    if (status === "stale") {
      return Math.round(Math.max(20, Math.min(65, 45 + Math.sin(i * 0.3) * 10 + rand() * 12 - 6)));
    }
    if (status === "dead") {
      if (i < 10) return Math.round(Math.max(0, Math.min(100, 65 + rand() * 15 - 7)));
      if (i < 20) return Math.round(Math.max(0, 35 + rand() * 18));
      return Math.round(Math.max(0, 12 - (i - 20) * 2 + rand() * 8));
    }
    if (status === "error") return i < 26 ? Math.round(55 + rand() * 14) : null;
    return null;
  });
}

// ===== SVG Components =========================================

export function ScoreRing({ score, status, size = 44 }: { score: number | null; status: HealthStatus; size?: number }) {
  const sw = 3.5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const filled = score != null ? circ * (score / 100) : 0;
  const offset = circ - filled;
  const ringColor = STATUS_META[status]?.ringColor ?? "#D1CFC5";

  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--g200)" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={ringColor} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.27), fontWeight: 600,
        fontFamily: "var(--font-mono-stack)",
        color: ringColor,
      }}>
        {score != null ? score : "—"}
      </span>
    </div>
  );
}

export function Sparkline({ data, width = 70, height = 26, color = "#788C5D" }: {
  data: (number | null)[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const valid = data.filter((d) => d != null);
  if (valid.length === 0) {
    return (
      <svg width={width} height={height} style={{ flexShrink: 0 }}>
        <line x1="0" y1={height / 2} x2={width} y2={height / 2}
          stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    );
  }
  const step = width / (data.length - 1);
  let line = "", area = "", started = false;
  data.forEach((v, i) => {
    if (v == null) { started = false; return; }
    const x = i * step;
    const y = height - (v / 100) * height;
    line += (started ? " L" : "M") + x + "," + y;
    if (!started) area += `M${x},${height} L${x},${y}`;
    else area += ` L${x},${y}`;
    started = true;
  });
  const li = data.length - 1 - [...data].reverse().findIndex((v) => v != null);
  if (li >= 0 && data[li] != null) area += ` L${li * step},${height} Z`;
  const gid = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} style={{ flexShrink: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function TrendChart({ data }: { data: HealthHistoryPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([e]) => setW(e.contentRect.width));
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (data.length === 0) {
    return (
      <div ref={containerRef} className="rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-5">
        <h3 className="font-semibold text-[15px] text-[var(--slate)]">Ecosystem Health</h3>
        <p className="mt-2 font-mono text-[11px] text-[var(--g500)] tracking-[0.02em]">
          Belum ada arsip health untuk ditampilkan.
        </p>
      </div>
    );
  }

  const h = w < 500 ? 160 : 200;
  const pad = { t: 20, r: 16, b: 28, l: 36 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const sx = iw / Math.max(1, data.length - 1);
  const sy = (v: number) => pad.t + ih - (v / 100) * ih;
  const maxCount = Math.max(1, ...data.flatMap((d) => [d.active_count, d.dead_count]));
  const countY = (v: number) => pad.t + ih - (v / maxCount) * ih;

  let linePath = "", areaPath = "";
  data.forEach((d, i) => {
    const x = pad.l + i * sx;
    const y = sy(d.avg_score);
    linePath += (i === 0 ? "M" : " L") + x + "," + y;
    if (i === 0) areaPath = `M${x},${pad.t + ih} L${x},${y}`;
    else areaPath += ` L${x},${y}`;
  });
  areaPath += ` L${pad.l + (data.length - 1) * sx},${pad.t + ih} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    const idx = Math.round((x - pad.l) / sx);
    setHoverIdx(idx >= 0 && idx < data.length ? idx : null);
  };

  return (
    <div ref={containerRef} className="relative rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[15px] text-[var(--slate)]">Ecosystem Health</h3>
          <p className="font-mono text-[11px] text-[var(--g500)] mt-0.5 tracking-[0.02em]">Avg score · health archive ({data.length} snapshots)</p>
        </div>
        <div className="flex items-center gap-4">
          <ChartLegend color="var(--clay)" label="Avg Score" />
          <ChartLegend color="var(--olive)" label="Active" />
          <ChartLegend color="var(--g500)" label="Dead" dashed />
        </div>
      </div>
      <svg
        width={w} height={h}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--clay)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={pad.l} y1={sy(t)} x2={pad.l + iw} y2={sy(t)}
              stroke="var(--g200)" strokeWidth="1" strokeDasharray={t === 0 ? undefined : "2 4"} />
            <text x={pad.l - 7} y={sy(t) + 4} fontSize="9.5" fill="var(--g500)" textAnchor="end"
              fontFamily="var(--font-mono-stack)">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const step = Math.ceil(data.length / 6);
          if (i % step !== 0 && i !== data.length - 1) return null;
          const x = pad.l + i * sx;
          const label = i === data.length - 1 ? "latest" : d.date.slice(5);
          return <text key={i} x={x} y={h - 8} fontSize="9.5" fill="var(--g500)" textAnchor="middle"
            fontFamily="var(--font-mono-stack)">{label}</text>;
        })}
        <path d={areaPath} fill="url(#trendGrad)" />
        <path d={(() => {
          let p = "";
          data.forEach((d, i) => {
            const x = pad.l + i * sx;
            const y = countY(d.active_count);
            p += (i === 0 ? "M" : " L") + x + "," + y;
          });
          return p;
        })()} fill="none" stroke="var(--olive)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
        <path d={(() => {
          let p = "";
          data.forEach((d, i) => {
            const x = pad.l + i * sx;
            const y = countY(d.dead_count);
            p += (i === 0 ? "M" : " L") + x + "," + y;
          });
          return p;
        })()} fill="none" stroke="var(--g500)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
        <path d={linePath} fill="none" stroke="var(--clay)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hoverIdx != null && data[hoverIdx] && (
          <g>
            <line x1={pad.l + hoverIdx * sx} y1={pad.t} x2={pad.l + hoverIdx * sx} y2={pad.t + ih}
              stroke="var(--slate)" strokeWidth="1" strokeDasharray="2 2" opacity="0.25" />
            <circle cx={pad.l + hoverIdx * sx} cy={sy(data[hoverIdx].avg_score)}
              r="4" fill="var(--paper)" stroke="var(--clay)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hoverIdx != null && data[hoverIdx] && (
        <div className="pointer-events-none absolute top-12 z-10 rounded-md bg-[var(--slate)] px-3 py-2 shadow-md"
          style={{ left: Math.min(Math.max(pad.l + hoverIdx * sx - 55, 12), w - 115), minWidth: 110 }}>
          <div className="font-mono text-[10px] text-[var(--ivory)]/60 mb-1.5">
            {data[hoverIdx].date}
          </div>
          {[["Avg", data[hoverIdx].avg_score], ["Active", data[hoverIdx].active_count], ["Dead", data[hoverIdx].dead_count]].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between gap-3 font-mono text-[10px]">
              <span className="text-[var(--ivory)]/70">{k}</span>
              <span className="font-semibold text-[var(--ivory)]">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartLegend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="14" height="2"><line x1="0" y1="1" x2="14" y2="1" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "3 2" : undefined} /></svg>
      <span className="font-mono text-[10px] text-[var(--g500)] tracking-[0.02em]">{label}</span>
    </div>
  );
}
