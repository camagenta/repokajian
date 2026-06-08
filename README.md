# Source List Kajian Sunnah Indonesia

Layer-1 infrastructure untuk ekosistem kajian sunnah Indonesia: **open registry sumber kajian** + **automated health monitoring** (Phase 1: Telegram) agar aggregator/app lain bisa konsumsi data yang lebih reliable.

## Mengapa proyek ini ada

Sumber kajian Sunnah Indonesia tersebar di Telegram, WhatsApp, YouTube, Instagram, dan website — **tanpa registry terpusat** yang terstandar, terverifikasi, dan dimonitor. Akibatnya setiap aplikasi kajian membangun data sourcing sendiri dari nol dengan kualitas bervariasi.

Proyek ini mengisi kesenjangan **Layer-1** dalam arsitektur ekosistem:

```
L0: Sumber (Telegram, WhatsApp, YouTube, dst.)
     ↕ [GAP — tidak ada layer standar]  ← proyek ini mengisi sini (L1)
L2: Aggregator Apps
L3: Aplikasi Konsumen (jadwal, notifikasi, dll.)
```

## Tujuan bisnis

- Registry sumber kajian yang **terpusat & terstandar**
- Keandalan data via **monitoring kesehatan otomatis**
- **Static API publik** yang bisa dikonsumsi aplikasi hilir
- Mendorong **kontribusi komunitas** lewat alur terstruktur
- Ekspansi ke platform baru **tanpa rewrite arsitektur**

## Stakeholder

| Peran | Kebutuhan utama |
|-------|-----------------|
| Pengguna Umum | Filter sumber aktif, status jelas, tampilan bersih |
| Developer / Aggregator | API stabil, skema konsisten & terdokumentasi |
| Kontributor Komunitas | Alur submit sumber yang sederhana |
| Maintainer | Tools validasi, workflow promosi |

> Detail lengkap: [docs/in-app/12-brd.md](./docs/in-app/12-brd.md) · [docs/app/12-brd.md](./docs/app/12-brd.md)

## Demo

- App (local/dev): `npm run dev` lalu buka `http://localhost:3000`
- Repository: [https://github.com/t-onluring/vibathon-2026](https://github.com/t-onluring/vibathon-2026)
- Netlify URL: https://repokajian.netlify.app
- GitHub Pages mirror: https://t-onluring.github.io/vibathon-2026/

## Fitur yang sudah jalan

- Registry sumber di `data/sources.json`
- Telegram health checker `scripts/check-telegram.ts`
- Snapshot output:
  - `data/latest.json`
  - `data/health/YYYY-MM-DD.json`
- GitHub Actions cron harian (`00:01 WIB`): `.github/workflows/health-check.yml`
- Dashboard dual-tab:
  - **Plan & Roadmap** (render markdown curated dari `docs/in-app/`)
  - **Live Dashboard** (render snapshot + filter + status grouping)

## Menjalankan project

```bash
npm install
npm run dev
```

Build production:

```bash
npm run lint
npm run build
npm run start
```

Jalankan checker manual:

```bash
npm run check:telegram
```

## Struktur penting

- `data/sources.json` — source registry
- `data/latest.json` — latest summary untuk UI
- `data/health/` — arsip snapshot harian
- `scripts/check-telegram.ts` — checker utama
- `src/app/components/` — komponen UI dashboard
- `docs/in-app/` — dokumen curated untuk drawer docs aplikasi

## Kontribusi

- Konvensi dokumentasi: [docs/README.md](./docs/README.md)
- Panduan kontribusi: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)
- Gunakan issue templates untuk **Source Add** / **Source Update** lalu buka PR.
- Validator otomatis di PR: `.github/workflows/validate-sources.yml`

Validasi lokal sebelum PR:

```bash
npm run validate:sources
npm run lint
npm run build
```

## Platform Roadmap

| Platform | Metode | Status |
|----------|--------|--------|
| Telegram (channel, grup, topik) | HTML scraping (Cheerio) | ✅ Aktif |
| Website | HTTP health + content parse | 🔜 Q3 2026 |
| WhatsApp | TBD (API / partner) | 🔜 Q4 2026 |
| YouTube, Instagram | API / public scraping | 📋 Backlog |

Prinsip extensibility: tiap platform punya adapter sendiri (`scripts/lib/fetch-<platform>.ts`), output distandarkan ke interface `Snapshot` yang sama — menambah platform tidak mengubah skema data atau UI.

## KPI

- Sumber terdaftar: **≥ 50** (3 bulan), **≥ 150** (12 bulan)
- Sumber aktif: **≥ 80%**
- Uptime health check harian: **≥ 99%**
- Downstream apps yang consume API: **≥ 2** (6 bulan)

## Out of Scope

- Aplikasi konsumen (jadwal, notifikasi) — tanggung jawab L3
- Moderasi konten kajian secara syar'i
- Authentication / user accounts
- Real-time push notification
- Penyimpanan rekaman/transkrip kajian

## Catatan teknis untuk kontributor

Baca ini sebelum mengubah kode/UI (berlaku untuk kontributor manusia maupun AI agent):

- **Next.js versi ini berbeda dari yang umum.** API, konvensi, dan struktur file bisa
  berbeda dari pengetahuan umum/training data. Rujuk panduan di
  `node_modules/next/dist/docs/` sebelum menulis kode App Router, dan perhatikan
  deprecation notice. _("This is NOT the Next.js you know.")_
- **Desain mengikuti `DESIGN.md`.** Baca dulu sebelum keputusan visual apa pun; jangan
  menyimpang tanpa persetujuan eksplisit. Ringkasan aturan:
  - Heading display/hero → **Fraunces** · body/UI → **Plus Jakarta Sans**
  - ID/kode/data → **Geist Mono** (`tabular-nums`) · prose/docs → **Source Serif 4**
  - Status: active=jade `#4D7C5F`, stale=amber `#C4831A`, dead=rust `#B84040`
  - Dark mode bg `#1A1916` (warm) · Aksen tunggal: clay `#D97757` (tanpa gradient ungu)

## License

- Code: [MIT](./LICENSE)
- Data & docs: [CC-BY-SA 4.0](./data/LICENSE)

Originated during Vibathon 2026 - HSI IT Division.
