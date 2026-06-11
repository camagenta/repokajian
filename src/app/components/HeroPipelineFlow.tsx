"use client";

import { useEffect, useRef, useState } from "react";

export function HeroPipelineFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [active, setActive] = useState(false);
  const nodes = [
    { code: "L0", title: "Sources", detail: "Telegram · WhatsApp · YouTube · Web" },
    { code: "L1", title: "Registry", detail: "Source List + Health" },
    { code: "API", title: "Static API", detail: "/v1/latest.json" },
    { code: "L2+", title: "Apps", detail: "Aggregator · Finder" },
  ];

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const syncActive = (visible: boolean) => {
      const nextActive = visible && document.visibilityState === "visible";
      setActive(nextActive);
      if (visible) setHasEntered(true);
    };

    let currentlyVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        currentlyVisible = entry.isIntersecting;
        syncActive(currentlyVisible);
      },
      { threshold: 0.2 },
    );

    const handleVisibilityChange = () => syncActive(currentlyVisible);

    observer.observe(element);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={[
        "pointer-events-none absolute right-[-72px] top-42 hidden h-[320px] w-[460px] md:block lg:right-0",
        active ? "pipeline-running" : "pipeline-paused",
      ].join(" ")}
    >
      {hasEntered && (
        <>
          <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,87,0.12),transparent_45%),radial-gradient(circle_at_68%_38%,rgba(120,140,93,0.14),transparent_36%)]" />

          <div className="absolute left-[72px] right-[72px] top-[86px] h-px bg-[var(--g300)]/80" />
          <div className="hero-pipeline-line absolute left-[72px] right-[72px] top-[84px] h-[4px] rounded-full" />

          <div className="absolute left-5 right-5 top-12 flex items-start justify-between gap-3">
            {nodes.map((node, index) => (
              <div key={node.code} className="relative flex w-[92px] flex-col items-center text-center">
                <div
                  className={[
                    "hero-pipeline-box pipeline-node relative z-10 flex size-16 flex-col items-center justify-center overflow-hidden rounded-2xl border bg-[var(--paper)]/90 shadow-xl backdrop-blur",
                    node.code === "L1" ? "border-[var(--clay)] text-[var(--clay)]" : "border-[var(--g300)] text-[var(--slate)]",
                  ].join(" ")}
                  style={{ animationDelay: `${index * 0.18}s` }}
                >
                  <span className="font-mono text-[9.5px] font-semibold">{node.code}</span>
                  {node.code === "L1" && <span className="mt-1 rounded bg-[var(--clay)]/12 px-1.5 py-0.5 font-mono text-[7.5px]">KITA</span>}
                </div>
                <p className="mt-2 font-display text-[15px] leading-tight text-[var(--slate)]">{node.title}</p>
                <p className="mt-1 max-w-[92px] text-[9.5px] leading-snug text-[var(--g500)]">{node.detail}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
