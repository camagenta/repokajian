"use client";

import { useState } from "react";
import type { Source, Snapshot } from "../lib/data";
import { SourceChecker } from "./SourceChecker";
import {
  NETLIFY_FORM_NAME,
  NETLIFY_FORMS_ENABLED,
  MAINTAINER_EMAIL,
  validateIntake,
  type IntakeItem,
} from "../lib/contribution-intake";

interface ContributionWizardProps {
  sources: Source[];
  snapshotById: Map<string, Snapshot>;
}

type WizardStep = "start" | "check" | "form" | "submitting" | "done" | "error";

const PLATFORM_OPTIONS = [
  { value: "tg", label: "Telegram" },
  { value: "yt", label: "YouTube" },
  { value: "ig", label: "Instagram" },
  { value: "web", label: "Website" },
  { value: "wa", label: "WhatsApp" },
];

const SOURCE_TYPE_OPTIONS = [
  { value: "channel", label: "Channel" },
  { value: "group", label: "Grup" },
  { value: "topic", label: "Topik" },
  { value: "site", label: "Website" },
  { value: "profile", label: "Profil" },
];

const EMPTY_FORM: Partial<IntakeItem> = {
  name: "",
  platform: "tg",
  source_type: "channel",
  url: "",
  handle: "",
  region: "id",
  evidence_url: "",
  submitted_by: "",
  notes: "",
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{ background: i <= current ? "var(--clay)" : "var(--g200)" }}
        />
      ))}
    </div>
  );
}

export function ContributionWizard({ sources, snapshotById }: ContributionWizardProps) {
  const [step, setStep] = useState<WizardStep>("start");
  const [hasGitHub, setHasGitHub] = useState<boolean | null>(null);
  const [prefillHandle, setPrefillHandle] = useState("");
  const [form, setForm] = useState<Partial<IntakeItem>>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const stepIndex: Record<WizardStep, number> = {
    start: 0, check: 1, form: 2, submitting: 3, done: 4, error: 3,
  };

  const updateField = (key: keyof IntakeItem, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const handleNotFound = (handle: string) => {
    setPrefillHandle(handle);
    setForm((prev) => ({ ...prev, handle }));
    setStep("form");
  };

  const validateForm = (): boolean => {
    // evidence_url defaults to url if not explicitly set (simplified wizard doesn't show it)
    const item = {
      ...form,
      evidence_url: form.evidence_url || form.url || "",
      region: form.region || "id",
    } as IntakeItem;
    const result = validateIntake(item);
    if (result.errors.length > 0) {
      const errs: Record<string, string> = {};
      result.errors.forEach((e) => {
        if (e.toLowerCase().includes("name")) errs.name = e;
        else if (e.toLowerCase().includes("url")) errs.url = e;
        else if (e.toLowerCase().includes("platform")) errs.platform = e;
        else errs._general = e;
      });
      setFieldErrors(errs);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setStep("submitting");

    const payload = JSON.stringify({
      ...form,
      evidence_url: form.evidence_url || form.url || "",
      region: form.region || "id",
      submitted_at: new Date().toISOString(),
    });

    if (NETLIFY_FORMS_ENABLED) {
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            "form-name": NETLIFY_FORM_NAME,
            payload,
          }).toString(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStep("done");
      } catch (err) {
        setSubmitError(String(err));
        setStep("error");
      }
    } else {
      // Fallback: open mailto
      const subject = encodeURIComponent(`[Source Intake] ${form.name || "(tanpa nama)"}`);
      const body = encodeURIComponent(
        `Usulan source baru:\n\n${payload}\n\nDikirim melalui form website.`
      );
      window.open(`mailto:${MAINTAINER_EMAIL}?subject=${subject}&body=${body}`, "_blank");
      setStep("done");
    }
  };

  // ===== STEP: start =====
  if (step === "start") {
    return (
      <div className="rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-6">
        <StepIndicator current={0} total={4} />
        <h3 className="text-[16px] font-semibold text-[var(--slate)]">
          Daftarkan channel Islam dalam 2 menit
        </h3>
        <p className="mt-1.5 text-[13px] text-[var(--g500)] leading-relaxed">
          Kontribusi channel kajian sunnah — tanpa perlu fork atau pull request.
          Usulanmu akan direview maintainer dalam 2–3 hari.
        </p>

        <div className="mt-5 space-y-2">
          <p className="text-[12px] font-medium text-[var(--g600)] mb-2">Apakah kamu punya akun GitHub?</p>
          <button
            type="button"
            onClick={() => { setHasGitHub(false); setStep("check"); }}
            className="w-full flex items-center gap-3 rounded-lg border border-[var(--g300)] bg-[var(--g100)] px-4 py-3 text-left transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]/5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--clay)]/10 text-[16px]">✉️</span>
            <div>
              <div className="text-[13px] font-medium text-[var(--slate)]">Tidak / Saya bukan developer</div>
              <div className="text-[11.5px] text-[var(--g500)]">Isi form sederhana, kami yang handle sisanya</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => { setHasGitHub(true); setStep("check"); }}
            className="w-full flex items-center gap-3 rounded-lg border border-[var(--g300)] bg-[var(--g100)] px-4 py-3 text-left transition-colors hover:border-[var(--clay)] hover:bg-[var(--clay)]/5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--g200)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--slate)">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </span>
            <div>
              <div className="text-[13px] font-medium text-[var(--slate)]">Ya, saya punya akun GitHub</div>
              <div className="text-[11.5px] text-[var(--g500)]">Bisa cek dulu, lalu lanjut dengan form atau PR</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ===== STEP: check =====
  if (step === "check") {
    return (
      <div className="rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-6">
        <StepIndicator current={1} total={4} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--slate)]">Cek apakah sudah terdaftar</h3>
            <p className="mt-0.5 text-[12.5px] text-[var(--g500)]">Hindari duplikasi sebelum mengusulkan channel baru</p>
          </div>
          <button
            type="button"
            onClick={() => setStep("start")}
            className="text-[11.5px] text-[var(--g500)] hover:text-[var(--slate)] transition-colors"
          >
            ← Kembali
          </button>
        </div>

        <SourceChecker
          sources={sources}
          snapshotById={snapshotById}
          onNotFound={handleNotFound}
        />

        {hasGitHub && (
          <div className="mt-4 rounded-lg border border-[var(--g300)] bg-[var(--g100)] px-4 py-3">
            <p className="text-[12px] text-[var(--g700)]">
              💡 Punya akun GitHub? Kamu juga bisa langsung buka PR via{" "}
              <strong>jalur PR manual</strong> di bawah untuk kontribusi teknis yang lebih lengkap.
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="rounded-lg border border-[var(--clay)] px-4 py-2 text-[12.5px] font-medium text-[var(--clay)] transition-colors hover:bg-[var(--clay)] hover:text-white"
          >
            Lanjut ke form →
          </button>
        </div>
      </div>
    );
  }

  // ===== STEP: form =====
  if (step === "form") {
    return (
      <div className="rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-6">
        <StepIndicator current={2} total={4} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--slate)]">Detail channel</h3>
            <p className="mt-0.5 text-[12.5px] text-[var(--g500)]">Isi informasi dasar — field wajib ditandai *</p>
          </div>
          <button
            type="button"
            onClick={() => setStep("check")}
            className="text-[11.5px] text-[var(--g500)] hover:text-[var(--slate)] transition-colors"
          >
            ← Kembali
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[var(--g700)]">Nama channel *</label>
            <input
              type="text"
              value={form.name ?? ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="contoh: Bekal Islam Sunnah"
              className={`w-full rounded-lg border px-3 py-2.5 text-[13px] text-[var(--slate)] placeholder:text-[var(--g400)] focus:outline-none focus:ring-2 ${
                fieldErrors.name
                  ? "border-red-400 focus:ring-red-300/20"
                  : "border-[var(--g300)] focus:border-[var(--clay)] focus:ring-[var(--clay)]/20"
              }`}
            />
            {fieldErrors.name && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--g700)]">Platform *</label>
              <select
                value={form.platform ?? "tg"}
                onChange={(e) => updateField("platform", e.target.value)}
                className="w-full rounded-lg border border-[var(--g300)] bg-[var(--paper)] px-3 py-2.5 text-[13px] text-[var(--slate)] focus:border-[var(--clay)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--g700)]">Tipe *</label>
              <select
                value={form.source_type ?? "channel"}
                onChange={(e) => updateField("source_type", e.target.value)}
                className="w-full rounded-lg border border-[var(--g300)] bg-[var(--paper)] px-3 py-2.5 text-[13px] text-[var(--slate)] focus:border-[var(--clay)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              >
                {SOURCE_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[var(--g700)]">URL *</label>
            <input
              type="url"
              value={form.url ?? ""}
              onChange={(e) => updateField("url", e.target.value)}
              placeholder="https://t.me/namachannel"
              className={`w-full rounded-lg border px-3 py-2.5 text-[13px] text-[var(--slate)] placeholder:text-[var(--g400)] focus:outline-none focus:ring-2 ${
                fieldErrors.url
                  ? "border-red-400 focus:ring-red-300/20"
                  : "border-[var(--g300)] focus:border-[var(--clay)] focus:ring-[var(--clay)]/20"
              }`}
            />
            {fieldErrors.url && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.url}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[var(--g700)]">Handle / username</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--g400)] text-[13px]">@</span>
              <input
                type="text"
                value={form.handle ?? prefillHandle}
                onChange={(e) => updateField("handle", e.target.value.replace(/^@/, ""))}
                placeholder="namachannel"
                className="w-full rounded-lg border border-[var(--g300)] bg-[var(--paper)] py-2.5 pl-7 pr-3 text-[13px] text-[var(--slate)] placeholder:text-[var(--g400)] focus:border-[var(--clay)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[var(--g700)]">Catatan (opsional)</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Contoh: Channel aktif harian, ustadz terverifikasi ahlus sunnah"
              rows={3}
              className="w-full resize-none rounded-lg border border-[var(--g300)] px-3 py-2.5 text-[13px] text-[var(--slate)] placeholder:text-[var(--g400)] focus:border-[var(--clay)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[var(--g700)]">Nama / kontak kamu (opsional)</label>
            <input
              type="text"
              value={form.submitted_by ?? ""}
              onChange={(e) => updateField("submitted_by", e.target.value)}
              placeholder="@username atau nama"
              className="w-full rounded-lg border border-[var(--g300)] px-3 py-2.5 text-[13px] text-[var(--slate)] placeholder:text-[var(--g400)] focus:border-[var(--clay)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20"
            />
          </div>

          {fieldErrors._general && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">{fieldErrors._general}</p>
          )}
        </div>

        <div className="mt-5 flex justify-between items-center">
          <p className="text-[11px] text-[var(--g400)]">
            Data ini akan direview oleh maintainer sebelum ditambahkan ke registry.
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-[var(--clay)] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
          >
            Kirim →
          </button>
        </div>
      </div>
    );
  }

  // ===== STEP: submitting =====
  if (step === "submitting") {
    return (
      <div className="rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-8 text-center">
        <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-2 border-[var(--g300)] border-t-[var(--clay)]" />
        <p className="text-[13px] text-[var(--g600)]">Mengirim usulan…</p>
      </div>
    );
  }

  // ===== STEP: error =====
  if (step === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-[13.5px] font-semibold text-red-700">Gagal mengirim usulan</p>
        <p className="mt-1 text-[12px] text-red-600">{submitError}</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="rounded-lg border border-red-300 px-4 py-2 text-[12.5px] font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            ← Kembali
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-red-600 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  // ===== STEP: done =====
  return (
    <div className="rounded-xl border border-[var(--olive)]/40 bg-[var(--olive)]/5 p-8 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--olive)]/15">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="8.5" stroke="var(--olive)" strokeWidth="1.5" />
          <path d="M7 11l3 3 5-5" stroke="var(--olive)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--slate)]">Terima kasih!</h3>
      <p className="mt-1.5 text-[12.5px] text-[var(--g500)] leading-relaxed">
        Usulan channel kamu telah diterima dan akan direview maintainer dalam <strong>2–3 hari</strong>.
        Jazakallahu khairan atas kontribusinya.
      </p>
      <button
        type="button"
        onClick={() => { setStep("start"); setForm(EMPTY_FORM); setPrefillHandle(""); }}
        className="mt-5 rounded-lg border border-[var(--g300)] px-4 py-2 text-[12.5px] font-medium text-[var(--g700)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors"
      >
        Usulkan channel lain
      </button>
    </div>
  );
}
