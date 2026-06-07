"use client";

import { useEffect, useRef, useState } from "react";
import type { Source } from "../lib/data";

export function Masthead({
  sources,
}: {
  sources: Source[];
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <header
      ref={ref}
      className="relative overflow-hidden border-b border-[var(--g300)] bg-[var(--ivory)]"
    >
      {/* Grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(var(--slate) 1px, transparent 1px),
            linear-gradient(90deg, var(--slate) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Decorative accent blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-20 size-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(217,119,87,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1180px] px-8 pt-16 pb-14 sm:pt-20 sm:pb-16">
        {/* Eyebrow */}
        <div
          className="mb-5 flex items-center gap-3 transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transitionDelay: "0ms",
          }}
        >
          <span className="eyebrow">Kajian Source List · Open Registry</span>
        </div>

        {/* Title */}
        <h1
          className="font-display text-[clamp(34px,5vw,58px)] leading-[1.06] tracking-[-0.018em] text-[var(--slate)] mb-4 max-w-[22ch] transition-all duration-700"
          style={{
            fontWeight: 500,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(14px)",
            transitionDelay: "80ms",
          }}
        >
          Source List{" "}
          <em className="italic text-[var(--clay)]">Kajian Sunnah</em>
          <br />
          Indonesia
        </h1>

        {/* Subtitle */}
        <p
          className="text-[16.5px] text-[var(--g700)] max-w-[600px] leading-relaxed mb-10 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transitionDelay: "160ms",
          }}
        >
          Open registry sumber kajian dengan automated health monitoring.
          Layer&nbsp;1 infrastructure — bukan kompetitor, tapi{" "}
          <em className="italic">data supplier</em> untuk ekosistem.
        </p>

      </div>
    </header>
  );
}
