# Business Requirements Document (BRD)

Dokumen ini menjelaskan *mengapa* proyek ini ada dan *apa* yang harus dicapai dari perspektif bisnis. Untuk detail teknis lihat `13-prd.md`.

## Masalah yang Diselesaikan

Ekosistem kajian Sunnah Indonesia tersebar di berbagai platform digital (Telegram, WhatsApp, YouTube, Instagram, website) tanpa ada satu registry terpusat yang:
- Terstandar dan dapat diverifikasi kualitas datanya
- Dimonitor kesehatannya secara otomatis
- Dapat dikonsumsi oleh aplikasi hilir via API

Akibatnya, setiap aplikasi kajian membangun data sourcing sendiri dari nol, dengan kualitas bervariasi.

**Kesenjangan arsitektur yang diisi:**
```
L0: Sumber (Telegram, WhatsApp, dst.)
     ↕ [GAP — tidak ada layer standar]  ← proyek ini mengisi sini
L2: Aggregator Apps
L3: Aplikasi Konsumen
```

## Tujuan Bisnis

| Tujuan | Metrik Sukses |
|--------|---------------|
| Registry terpusat dan terstandar | ≥ 50 sumber, skema JSON terdokumentasi |
| Monitoring kesehatan otomatis | Cek harian berjalan, ≥ 90% sumber dimonitor |
| Static API publik | 3 endpoint aktif, latency < 200ms via CDN |
| Kontribusi komunitas | ≥ 5 kontribusi masuk dalam 3 bulan pertama |
| Ekspansi multi-platform | WhatsApp + website aktif dalam 6 bulan |

## Stakeholder

| Peran | Deskripsi | Kebutuhan Utama |
|-------|-----------|-----------------|
| Pengguna Umum | Pencari sumber kajian terpercaya | Filter status aktif, tampilan bersih |
| Developer / Aggregator | Builder aplikasi di atas data L1 | API stabil, skema konsisten, SLA jelas |
| Kontributor Komunitas | Pengusul sumber baru | Alur submit yang sederhana |
| Maintainer | Pengelola registry | Tools validasi, workflow promosi |

## Platform Expansion Roadmap

| Platform | Metode | Status | Target |
|----------|--------|--------|--------|
| Telegram channel & grup | HTML scraping (Cheerio) | ✅ Deployed | — |
| Telegram topik | HTML scraping + topic ID | ✅ Deployed | — |
| Website | HTTP health + content parse | 🔜 Planned | Q3 2026 |
| WhatsApp | TBD (API / partner) | 🔜 Planned | Q4 2026 |
| YouTube | YouTube Data API | 📋 Backlog | TBD |
| Instagram | Public scraping | 📋 Backlog | TBD |

**Prinsip extensibility:** setiap platform punya adapter sendiri di `scripts/lib/fetch-<platform>.ts`. Output distandarkan ke interface `Snapshot` — menambah platform baru tidak mengubah skema data atau UI.

## KPI

**Registry:**
- 3 bulan: ≥ 50 sumber, ≥ 80% aktif, ≥ 5 kontribusi masuk
- 12 bulan: ≥ 150 sumber, ≥ 70% kontribusi disetujui

**Monitoring:**
- Uptime daily health check ≥ 99%
- Lag monitoring (cek → snapshot tersedia) < 30 menit
- False positive status "dead" < 5%

**API & Integrasi:**
- ≥ 2 downstream apps consume API dalam 6 bulan
- API availability (CDN) ≥ 99.9%

## Risiko Utama

| Risiko | Kemungkinan | Mitigasi |
|--------|-------------|----------|
| Telegram ubah kebijakan HTML publik | Sedang | Rate limiting + fallback Bot API |
| WhatsApp tidak ada API viable | Tinggi | Community-reported health check |
| Maintainer tidak cukup untuk review | Sedang | Otomasi validasi + semi-auto promosi |
| Sumber berpindah URL | Tinggi | Link checker periodik + alur update |

## Out of Scope

- Aplikasi konsumen (jadwal, notifikasi) — tanggung jawab L3 apps
- Moderasi konten kajian secara syar'i
- Authentication / user accounts
- Real-time push notification
- Penyimpanan rekaman/transkrip kajian
