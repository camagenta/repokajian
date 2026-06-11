"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";

const HeroPipelineFlow = dynamic(
  () => import("./HeroPipelineFlow").then((mod) => mod.HeroPipelineFlow),
  { ssr: false },
);

export function Masthead() {
  const ref = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const metricRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        gsap.set([eyebrowRef.current, titleRef.current, subtitleRef.current, ...metricRefs.current], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(eyebrowRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55 })
        .fromTo(titleRef.current, { opacity: 0, y: 18, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85 }, "-=0.25")
        .fromTo(subtitleRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.65 }, "-=0.45")
        .fromTo(metricRefs.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.25");
    }, ref);

    return () => ctx.revert();
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
        <HeroPipelineFlow />

        <div className="relative z-10 max-w-[700px]">
          {/* Eyebrow */}
          <div ref={eyebrowRef} className="mb-5 flex items-center gap-3 opacity-0">
            <span className="eyebrow">Kajian Source List · Open Registry</span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="font-display text-[clamp(34px,5vw,58px)] leading-[1.06] tracking-[-0.018em] text-[var(--slate)] mb-4 max-w-[22ch] opacity-0"
            style={{ fontWeight: 500 }}
          >
            Source List{" "}
            <em className="italic text-[var(--clay)]">Kajian Sunnah</em>
            <br />
            Indonesia
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-[16.5px] text-[var(--g700)] max-w-[600px] leading-relaxed mb-10 opacity-0"
          >
            Open registry sumber kajian dengan automated health monitoring.
            Layer&nbsp;1 infrastructure — bukan kompetitor, tapi{" "}
            <em className="italic">data supplier</em> untuk ekosistem.
          </p>

          <div className="grid max-w-[620px] grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["L1", "Registry terbuka"],
              ["API", "Static & konsumsi publik"],
              ["Cron", "Health monitoring harian"],
            ].map(([value, label], index) => (
              <div
                key={value}
                ref={(element) => {
                  if (element) metricRefs.current[index] = element;
                }}
                className="hero-metric opacity-0"
              >
                <span className="font-display text-[26px] leading-none text-[var(--slate)]">{value}</span>
                <span className="mt-1 block text-[12px] font-medium text-[var(--g500)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
