# Plan: Platform checker adapter pattern (multi-platform health checks)

**Tanggal:** 2026-06-11
**Tujuan:** Ubah pipeline health-check dari Telegram-coupled menjadi pola adapter,
supaya menambah checker baru (Website, WhatsApp, YouTube, Instagram) cukup dengan
**membuat 1 file adapter + mendaftarkannya** — tanpa menyentuh orchestrator, UI, atau API.

---

## 1. Kondisi sekarang

**Sudah platform-agnostic (tidak perlu diubah):**
- Data model: `data/sources.json` punya `platform`; tipe `Source`/`SnapshotItem`/`LatestSummary` generik (`scripts/lib/types.ts`).
- Scoring: `scripts/lib/score.ts` (`statusFromAge`, `freshnessScore`) bekerja dari umur post.
- API generator: `scripts/generate-api.mjs` filter by `status` saja.
- UI: `src/app/components/` sudah punya ikon & filter `tg/web/ig/yt/wa`.

**Masih Telegram-coupled (target refactor):**
- `scripts/check-telegram.ts` meng-hardcode: `canMonitorTelegram`, `checkTelegramSource`,
  `makeChecks`, `classifyTelegramStatus`, dan `main()` memisah `tgSources` vs `otherSources`
  (semua non-tg → `unmonitored`).
- Hanya ada `scripts/lib/fetch-telegram.ts`.

> README/BRD sudah menjanjikan pola adapter `fetch-<platform>.ts`; plan ini membuat janji itu nyata.

---

## 2. Target arsitektur

```
data/sources.json
      │
      ▼
scripts/check-sources.ts  (orchestrator generik)
      │  registry[source.platform] → adapter
      ▼
PlatformChecker interface { platform, canMonitor(), check() -> SnapshotItem }
  ├─ telegram-checker.ts   (wrap fetch-telegram.ts yang sudah ada)
  ├─ website-checker.ts    (baru, nanti)
  └─ whatsapp-checker.ts   (baru, nanti)
      │
      ▼
data/latest.json + data/health/<date>.json  (format tidak berubah)
```

### Interface (kontrak adapter)

Tambah ke `scripts/lib/types.ts`:

```ts
export interface PlatformChecker {
  /** platform key, mis. "tg" | "web" | "wa" */
  readonly platform: Platform;
  /** apakah source ini bisa dimonitor oleh adapter ini di fase sekarang */
  canMonitor(source: Source): boolean;
  /** lakukan cek 1 source → SnapshotItem standar (wajib menangani error sendiri) */
  check(source: Source): Promise<SnapshotItem>;
  /** jeda antar-cek (ms) untuk rate limiting; default dari orchestrator bila tak diisi */
  readonly staggerMs?: number;
}
```

### Registry

`scripts/lib/checkers/index.ts`:

```ts
import { telegramChecker } from "./telegram-checker.js";

export const CHECKERS: PlatformChecker[] = [
  telegramChecker,
  // websiteChecker,   // tambah di sini saat siap
  // whatsappChecker,
];
```

---

## 3. Langkah implementasi (fase 1 — refactor, perilaku tetap)

1. **Tipe**: tambah `PlatformChecker` ke `scripts/lib/types.ts`.
2. **Adapter Telegram**: buat `scripts/lib/checkers/telegram-checker.ts` yang memindahkan
   logika telegram dari `check-telegram.ts`:
   - `canMonitor`  ← `canMonitorTelegram`
   - `check`       ← `checkTelegramSource` (+ `makeChecks`, `classifyTelegramStatus`)
   - re-use `fetch-telegram.ts`, `score.ts` apa adanya.
3. **Registry**: buat `scripts/lib/checkers/index.ts`.
4. **Orchestrator generik**: buat `scripts/check-sources.ts`:
   - load sources,
   - untuk tiap source: cari checker pertama yang `canMonitor` → `check()`,
     kalau tak ada → `unmonitoredSnapshot` (pindahkan helper ini ke orchestrator),
   - stagger antar-cek (pakai `checker.staggerMs ?? DEFAULT_STAGGER_MS`),
   - tulis `data/latest.json` + `data/health/<date>.json` (logika `summarize` dipindah, tak diubah).
5. **Kompatibilitas perintah**:
   - tambah script `"check:sources": "tsx scripts/check-sources.ts"` di `package.json`,
   - `check:telegram` tetap ada (alias) atau di-deprecate; update
     `.github/workflows/health-check.yml` untuk memanggil `check:sources`.
6. **Bersih-bersih**: `check-telegram.ts` jadi thin wrapper yang memanggil orchestrator,
   atau dihapus setelah workflow dialihkan (putuskan saat eksekusi).

> Prinsip: fase 1 **tidak mengubah output**. `data/latest.json` untuk Telegram harus identik.

---

## 4. Cara menambah checker baru (sesudah fase 1)

Contoh **Website checker**:
1. Buat `scripts/lib/fetch-website.ts` (HTTP GET + parse `last-modified`/konten).
2. Buat `scripts/lib/checkers/website-checker.ts`:
   - `platform = "web"`,
   - `canMonitor = (s) => s.platform === "web"`,
   - `check` → bangun `SnapshotItem` (pakai `statusFromAge`/`confidenceScoreFromMetrics`
     bila relevan, atau cek HTTP-up sederhana).
3. Daftarkan di `scripts/lib/checkers/index.ts`.
4. Selesai — orchestrator, UI, dan API otomatis menanganinya.

> WhatsApp: kemungkinan tidak ada API publik → adapter bisa berbasis
> community-reported atau status manual (lihat risiko di BRD). Pola tetap sama.

---

## 5. Pertimbangan desain

- **Urutan registry = prioritas**: orchestrator pakai checker **pertama** yang `canMonitor`,
  jadi source yang match >1 adapter terprediksi.
- **`confidenceScoreFromMetrics`** saat ini berbentuk Telegram (subscribers/last_post).
  Untuk platform non-Telegram, adapter boleh menghitung confidence sendiri selama
  output tetap `SnapshotItem`. Pertimbangkan generalisasi `score.ts` di fase berikutnya
  bila pola check (http_fetch/content_parse/freshness) terbukti seragam.
- **Error handling** adalah tanggung jawab tiap adapter (`check()` tidak boleh throw;
  kembalikan `SnapshotItem` status `error`) — sama seperti `checkTelegramSource` sekarang.
- **Test**: tambah `scripts/test-checkers.ts` yang memverifikasi registry tidak punya
  platform duplikat dan tiap checker memenuhi kontrak (smoke). `test-telegram-parser.ts`
  tetap menguji parser-level.

---

## 6. Validasi (Definition of Done fase 1)

- [ ] `npm run check:sources` menghasilkan `data/latest.json` identik dengan output
      `check:telegram` lama (diff kosong untuk source Telegram).
- [ ] `npm run lint` ✅
- [ ] `npm run build` ✅
- [ ] `npm run test:telegram-parser` ✅
- [ ] `.github/workflows/health-check.yml` memanggil `check:sources` dan hijau.
- [ ] Menambah adapter dummy (mis. `web`) terbukti tidak menyentuh orchestrator/UI/API.

---

## 7. Estimasi & risiko

- **Fase 1 (refactor)**: terbatas, mekanis — memindahkan fungsi yang sudah ada ke modul
  baru + 1 orchestrator. Risiko utama: regresi output → dimitigasi dengan diff `latest.json`.
- **Checker baru**: effort tergantung kompleksitas platform (Website kecil; WhatsApp besar
  karena keterbatasan API).
- Tidak ada perubahan skema data, API contract, atau UI di fase 1.
