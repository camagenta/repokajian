"use client";

import { useEffect, useRef, useState } from "react";
import type { Source } from "../lib/data";
import { ContributionForm } from "./ContributionForm";

const REPO_OWNER = process.env.NEXT_PUBLIC_REPO_OWNER ?? "t-onluring";
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME ?? "vibathon-2026";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const CONTRIBUTING_URL = `${REPO_URL}/blob/main/docs/CONTRIBUTING.md`;

// ===== Step definitions ===========================================

const STEPS = [
  {
    num: "01",
    title: "Open Issue",
    desc: "Pakai template Source Add atau Update",
  },
  {
    num: "02",
    title: "Fork & Intake",
    desc: "Tambah file JSON di data/contributions/pending",
  },
  {
    num: "03",
    title: "Open PR",
    desc: "Reference issue, isi PR template",
  },
  {
    num: "04",
    title: "CI + Merge",
    desc: "Auto-validate, review, merge",
  },
] as const;

// ===== Mock window chrome =========================================

function MockWindowChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[var(--g300)] bg-[var(--g100)] px-3.5 py-2.5">
      <div className="flex gap-1.5">
        <span className="size-2 rounded-full bg-[#FF5F57]" />
        <span className="size-2 rounded-full bg-[#FEBC2E]" />
        <span className="size-2 rounded-full bg-[#28C840]" />
      </div>
      <div className="flex-1 overflow-hidden rounded px-2 py-0.5 text-center font-mono text-[10px] text-[var(--g500)] bg-[var(--paper)] border border-[var(--g300)] truncate">
        {url}
      </div>
    </div>
  );
}

// ===== Mock screens ===============================================

function MockIssueForm() {
  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <MockWindowChrome url="github.com/.../issues/new" />
      <div className="p-4">
        <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.04em] text-[var(--g500)]">
          📝 New Issue · Template: Source Add
        </div>
        <div className="mb-2 rounded-md border border-[var(--g300)] bg-[var(--g100)] px-2.5 py-2 text-[13px] text-[var(--slate)]">
          [Source Add] Bekal Islam Sunnah
        </div>
        <div className="rounded-md border border-[var(--g300)] bg-[var(--g100)] px-3 py-2.5 font-mono text-[11px] leading-[1.7]">
          <div><span className="text-[var(--olive)]">Platform:</span> <span className="text-[var(--g500)]">telegram</span></div>
          <div><span className="text-[var(--olive)]">Handle:</span> <span className="text-[var(--g500)]">@bekalislamsunnah</span></div>
          <div><span className="text-[var(--olive)]">URL:</span> <span className="text-[var(--g500)]">https://t.me/bekalislamsunnah</span></div>
          <div><span className="text-[var(--olive)]">Category:</span> <span className="text-[var(--g500)]">kajian</span></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className="rounded-md bg-[#1F8A5B] px-3.5 py-1.5 text-[12px] font-semibold text-white" type="button">
            Submit new issue
          </button>
          <span className="rounded-full bg-[var(--olive)]/12 px-2 py-0.5 font-mono text-[10px] text-[var(--olive)]">
            source-add
          </span>
        </div>
      </div>
    </div>
  );
}

function DiffLine({ type, num, text }: { type: "add" | "ctx"; num: string; text: string }) {
  return (
    <div
      className="flex"
      style={{ background: type === "add" ? "rgba(120,140,93,0.08)" : "transparent", padding: "1px 0" }}
    >
      <span className="w-8 shrink-0 pr-2.5 text-right font-mono text-[9.5px] text-[var(--g400)] opacity-60">
        {num}
      </span>
      <span
        className="font-mono text-[11px] whitespace-pre"
        style={{ color: type === "add" ? "var(--slate)" : "var(--g500)" }}
      >
        {text}
      </span>
    </div>
  );
}

function MockCodeDiff() {
  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <MockWindowChrome url="data/contributions/pending/bekal-islam-sunnah.json" />
      <div className="p-4">
        <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.04em] text-[var(--g500)]">
          🔀 Fork · Branch: contrib/bekal-islam-sunnah
        </div>
        <div className="overflow-hidden rounded-md border border-[var(--g300)] bg-[var(--g100)]">
          <DiffLine type="ctx" num="1" text="{" />
          <DiffLine type="add" num="2" text='+  "name": "Bekal Islam Sunnah",' />
          <DiffLine type="add" num="3" text='+  "platform": "tg",' />
          <DiffLine type="add" num="4" text='+  "source_type": "channel",' />
          <DiffLine type="add" num="5" text='+  "url": "https://t.me/bekalislamsunnah",' />
          <DiffLine type="add" num="6" text='+  "handle": "bekalislamsunnah",' />
          <DiffLine type="add" num="7" text='+  "evidence_url": "https://t.me/bekalislamsunnah"' />
          <DiffLine type="ctx" num="8" text="}" />
        </div>
        <div className="mt-2.5 flex gap-3 font-mono text-[10px]">
          <span className="text-[var(--olive)]">+6 additions</span>
          <span className="text-[var(--g500)]">0 deletions</span>
        </div>
      </div>
    </div>
  );
}

function MockPullRequest() {
  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <MockWindowChrome url="github.com/.../pull/47" />
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#1F8A5B] px-2 py-0.5 text-[10px] font-semibold text-white">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <circle cx="3" cy="3" r="2" stroke="white" strokeWidth="1.2" />
              <path d="M3 5v3" stroke="white" strokeWidth="1.2" />
              <circle cx="3" cy="8" r="1.5" stroke="white" strokeWidth="1.2" />
            </svg>
            Open
          </span>
          <span className="font-mono text-[10px] text-[var(--g500)]">#47 · Opened 2m ago</span>
        </div>
        <div className="mb-2 text-[13.5px] font-semibold text-[var(--slate)]">
          Add Bekal Islam Sunnah to registry
        </div>
        <div className="rounded-md border border-[var(--g300)] bg-[var(--g100)] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--g700)]">
          <div className="mb-1.5">Closes #46.</div>
          <div>Telegram channel aktif harian. Sudah verified ustadz.</div>
          <div className="mt-2 font-mono text-[10px] space-y-0.5">
            <div><input type="checkbox" defaultChecked readOnly className="mr-1" /> Validated locally</div>
            <div><input type="checkbox" defaultChecked readOnly className="mr-1" /> No duplicates</div>
            <div><input type="checkbox" defaultChecked readOnly className="mr-1" /> URL accessible</div>
          </div>
        </div>
        <div className="mt-2.5 flex gap-2 font-mono text-[10px] text-[var(--g500)]">
          <span>👤 @contributor</span>
          <span>·</span>
          <span>main ← add-bekal-islam-sunnah</span>
        </div>
      </div>
    </div>
  );
}

function MockCIChecks() {
  const checks = [
    { name: "schema-validate", time: "4s" },
    { name: "duplicate-check", time: "2s" },
    { name: "url-reachable", time: "8s" },
    { name: "maintainer-review", time: "—" },
  ];
  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <MockWindowChrome url="github.com/.../pull/47/checks" />
      <div className="p-4">
        <div className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.04em] text-[var(--g500)]">
          ✅ All checks passed · Merged
        </div>
        <div className="overflow-hidden rounded-md border border-[var(--g300)]">
          {checks.map((c, i) => (
            <div
              key={c.name}
              className="flex items-center gap-2.5 border-b border-[var(--g300)] px-3 py-2.5 last:border-b-0"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#1F8A5B]">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="flex-1 font-mono text-[11.5px] text-[var(--slate)]">{c.name}</span>
              <span className="font-mono text-[10px] text-[var(--g500)]">{c.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2.5 rounded-md border border-[var(--olive)]/30 bg-[var(--olive)]/8 px-3.5 py-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="var(--olive)" strokeWidth="1.5" />
            <path d="M5 8l2 2 4-4" stroke="var(--olive)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="text-[12px] font-semibold text-[var(--slate)]">
              Merged · Intake siap direview maintainer
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-[var(--g500)]">
              Promote step akan memasukkan source approved ke registry
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Animated walkthrough =======================================

function ContributionWalkthrough() {
  const [activeStep, setActiveStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay || !inView) return;
    const t = setTimeout(() => setActiveStep((s) => (s + 1) % STEPS.length), 3800);
    return () => clearTimeout(t);
  }, [activeStep, autoplay, inView]);

  const MOCK_SCREENS = [
    <MockIssueForm key="0" />,
    <MockCodeDiff key="1" />,
    <MockPullRequest key="2" />,
    <MockCIChecks key="3" />,
  ];

  return (
    <div
      ref={ref}
      className="mt-8 rounded-2xl border border-[var(--g300)] bg-[var(--paper)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--g300)] px-5 py-4">
        <div>
          <h3 className="text-[14.5px] font-semibold text-[var(--slate)]">
            How it works · live walkthrough
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--g500)]">
            Demo: contributor mengusulkan channel lewat intake file
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAutoplay((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--g300)] bg-[var(--g100)] px-3 py-1.5 font-mono text-[11px] text-[var(--g700)] hover:border-[var(--g500)] transition-colors"
        >
          {autoplay ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 px-5 py-3 border-b border-[var(--g300)]">
        {STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setActiveStep(i); setAutoplay(false); }}
            className="relative flex-1 h-1 rounded-full overflow-hidden cursor-pointer"
            style={{ background: i <= activeStep ? "var(--clay)" : "var(--g300)" }}
          />
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
        {/* Left: step list */}
        <div className="flex flex-col gap-1 border-b lg:border-b-0 lg:border-r border-[var(--g300)] p-3">
          {STEPS.map((step, i) => {
            const isActive = activeStep === i;
            const isDone = i < activeStep;
            return (
              <button
                key={i}
                type="button"
                onClick={() => { setActiveStep(i); setAutoplay(false); }}
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive ? "rgba(217,119,87,0.08)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(217,119,87,0.25)" : "transparent"}`,
                }}
              >
                {/* Step circle */}
                <div
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold transition-all duration-300"
                  style={{
                    background: isActive ? "var(--clay)" : isDone ? "var(--olive)" : "var(--g200)",
                    border: `1px solid ${isActive ? "var(--clay)" : isDone ? "var(--olive)" : "var(--g300)"}`,
                    color: isActive || isDone ? "white" : "var(--g500)",
                  }}
                >
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[12.5px] font-semibold"
                    style={{ color: isActive || isDone ? "var(--slate)" : "var(--g500)" }}
                  >
                    {step.title}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-[1.4] text-[var(--g500)]">
                    {step.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: mock UI */}
        <div className="min-h-[280px] overflow-hidden">
          {MOCK_SCREENS[activeStep]}
        </div>
      </div>
    </div>
  );
}

// ===== Main tab ==================================================

export function OpenContributionTab({ sources }: { sources: Source[] }) {
  return (
    <section className="mx-auto max-w-[1180px] px-8 py-10 space-y-8">
      <ContributionForm sources={sources} />

      <details className="group rounded-xl border border-[var(--g300)] bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--g100)] md:px-5">
          <div className="min-w-0">
            <p className="eyebrow mb-1">Maintainer info</p>
            <h2 className="text-[15px] font-semibold text-[var(--slate)]">
              Jalur PR, CI review, dan promote registry
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--g500)]">
              Detail teknis untuk maintainer. Contributor cukup pakai form intake di atas.
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-[var(--g300)] bg-[var(--paper)] px-3 py-1.5 font-mono text-[11px] text-[var(--g700)]">
            <span className="group-open:hidden">Buka</span>
            <span className="hidden group-open:inline">Tutup</span>
          </span>
        </summary>

        <div className="border-t border-[var(--g300)] px-4 py-5 md:px-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              ["1", "Intake", "data/contributions/pending/*.json"],
              ["2", "CI Review", "validate:contributions"],
              ["3", "Promote", "data/sources.json"],
            ].map(([num, title, desc]) => (
              <div key={title} className="rounded-lg border border-[var(--g300)] bg-[var(--paper)] p-3">
                <div className="mb-2 font-mono text-[10px] text-[var(--clay)]">0{num}</div>
                <div className="font-semibold text-[13.5px] text-[var(--slate)]">{title}</div>
                <div className="mt-1 break-all font-mono text-[11px] text-[var(--g500)]">{desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">
            <ol className="list-decimal space-y-2 pl-5 text-[13.5px] text-[var(--g700)]">
              <li>Buat issue: <code>Source Add</code> atau <code>Source Update</code>.</li>
              <li>Fork repo, tambah file di <code>data/contributions/pending/</code>, lalu buka PR.</li>
              <li>Jalankan validasi lokal: <code>npm run validate:contributions</code>.</li>
              <li>CI menjalankan schema/duplicate check + link check warning-only.</li>
            </ol>

            <div className="rounded-lg border border-[var(--g300)] bg-[var(--paper)] p-4 text-[13px] text-[var(--g700)]">
              <p className="mb-2 font-medium text-[var(--slate)]">Referensi maintainer:</p>
              <div className="space-y-1">
                <p><code>CONTRIBUTING.md</code></p>
                <p><code>docs/CONTRIBUTING.md</code></p>
                <p><code>docs/in-app/07-contributing.md</code></p>
              </div>
            </div>
          </div>

          <ContributionWalkthrough />

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--slate)] px-4 py-2 text-[13px] font-semibold text-[var(--ivory)] no-underline transition-opacity hover:opacity-85"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View on GitHub
            </a>
            <a
              href={CONTRIBUTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--g300)] bg-[var(--paper)] px-4 py-2 text-[13px] font-medium text-[var(--g700)] no-underline transition-colors hover:border-[var(--clay)] hover:text-[var(--clay)]"
            >
              Contributing Guide
            </a>
          </div>
        </div>
      </details>
    </section>
  );
}
