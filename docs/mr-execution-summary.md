# MR Execution Summary — Source Add Bulk (63 Telegram)

> **Pelaksana:** @camagenta
> **Tanggal:** 29 Juni 2026

---

## Ringkasan

Menambahkan **63 sumber Telegram baru** ke registry `data/sources.json` berdasarkan list dari [@sijadwalkajian](https://t.me/sijadwalkajian/192/7023). Seluruh proses dari kontribusi hingga promote dilakukan sesuai panduan `docs/CONTRIBUTING.md`.

---

## Alur Kontribusi (Contributor)

### 1. Issue
- **Issue upstream** dibuat di `jadwal-kajian/repokajian#4`
- Template: Source Add Request
- Evidence: https://t.me/sijadwalkajian/192/7023

### 2. Branch
```bash
git checkout -b contrib/add-source-list-telegram
```

### 3. File JSON Pending
63 file JSON baru dibuat di `data/contributions/pending/`, ditambah fix 1 file existing (`salamtsl.json` — nama diperbaiki dari "Dzulqarnain" ke "Tarbiyah Sunnah Learning").

**Format setiap file:**
```json
{
  "name": "...",
  "platform": "tg",
  "source_type": "channel",
  "url": "https://t.me/...",
  "handle": "@...",
  "region": "...",
  "category": ["..."],
  "tags": ["..."],
  "evidence_url": "https://t.me/sijadwalkajian/192/7023",
  "submitted_by": "camagenta",
  "notes": ""
}
```

### 4. Validasi Lokal
```bash
npm run validate:contributions   # ✅ 67 file valid
npm run validate:sources         # ✅ 35 sources (registry tidak berubah)
npm run lint                     # ✅ 0 errors
npm run build                    # ✅ Compiled successfully
```

### 5. Commit & Push
8 atomic commits ke branch `contrib/add-source-list-telegram`:
```
fix: correct salamtsl.json name to Tarbiyah Sunnah Learning
feat(sources): add Yogyakarta region sources
feat(sources): add Bogor, Bandung, Bekasi, Cibubur, Cilegon, Depok sources
feat(sources): add Jakarta, Jember, Karawang, Kudus, Lampung, Magelang sources
feat(sources): add Solo, Surabaya, Tangerang, Australia, UK, Wlingi sources
feat(sources): add nasional sources batch 1
feat(sources): add nasional sources batch 2
feat(sources): add nasional sources batch 3
```

### 6. Pull Request
- **PR ke upstream:** `jadwal-kajian/repokajian#5`
- Template terisi lengkap (Summary, Change Type, Checklist, Evidence, Risk Notes)

---

## Alur Maintainer (Promote Flow)

Setelah PR di-review, maintainer menjalankan promote:

### 1. Review Pending
```bash
npm run review:contributions
# ✅ 67 file, semuanya "ready"
```

### 2. Preview Promote (Dry-Run)
```bash
npm run promote:contribution data/contributions/pending/madrasahms.json
# Menampilkan proposed source tanpa mengubah file
```

### 3. Apply Promote
Seluruh 67 file dipromote dengan script batch:
```bash
npm run promote:contribution <file>.json -- --apply
```

**Yang dilakukan script:**
- Generate `id` (format: `tg-<handle>`)
- Append entry ke `data/sources.json`
- Set `language: "id"`, `priority: 2`, `verified: false`
- Update `updated_at` ke tanggal promote
- Pindahkan file ke `data/contributions/archive/promoted/`

### 4. Validasi Akhir
```bash
npm run validate:sources         # ✅ 102 sources
npm run validate:contributions   # ✅ Tidak ada pending
npm run lint                     # ✅ 0 errors
npm run build                    # ✅ Compiled successfully
```

### 5. Commit Promote
```
feat(sources): promote 67 sources from pending to registry
chore(sources): remove promoted pending files
```

---

## Statistik

| Metrik | Nilai |
|--------|-------|
| Total file pending dibuat | 63 (baru) + 4 (existing) |
| Total file dipromote | 67 |
| Sumber registry sebelum | 35 |
| Sumber registry sesudah | **102** |
| Region tercakup | 18 (nasional, yogyakarta, jakarta, bogor, dll.) |
| Total file diarsipkan | 67 di `data/contributions/archive/promoted/` |

---

## Yang Dilewati / Dicatat

| Item | Alasan |
|------|--------|
| Gresik Mengaji | ✅ Sudah di registry |
| Khalid Basalamah Official | ✅ Sudah di registry |
| Ustadz Afifi Abdul Wadud | ✅ Sudah di registry |
| Ust. Yulian Purnama (`fawaid_kangaswad`) | ✅ Duplikat registry |
| Radio Rodja Pontianak | ❌ Bukan Telegram (Linktree, platform=web) |
| Bestie Mengaji | 📝 Catatan: lebih update di WAG |
| `salamtsl.json` | ✅ Nama diperbaiki (Dzulqarnain → Tarbiyah Sunnah Learning) |

---

## Initial Health Check

Setelah promote, health check pertama dijalankan untuk semua 102 sumber:

```json
{
  "active": 65,
  "stale": 5,
  "dead": 8,
  "blocked": 9,
  "error": 0,
  "unmonitored": 15
}
```

- **Snapshot:** `data/health/2026-06-29.json`
- **Sumber aktif:** 65 dari 87 yang terdeteksi (75%)
- **Unmonitored (15):** Sumber non-Telegram yang belum ada checker-nya

### Status per Region (dari 63 baru)

| Region | Total | Active | Stale | Dead | Blocked |
|--------|-------|--------|-------|------|---------|
| Yogyakarta | 6 | 5 | 0 | 1 | 0 |
| Bogor | 3 | 2 | 0 | 0 | 1 |
| Jakarta | 4 | 4 | 0 | 0 | 0 |
| Nasional | 34 | 25 | 3 | 0 | 6 |
| Lainnya | 16 | 13 | 1 | 0 | 2 |

---

## Links

- **Issue upstream:** https://github.com/jadwal-kajian/repokajian/issues/4
- **PR ke upstream:** https://github.com/jadwal-kajian/repokajian/pull/5
- **Fork repo:** https://github.com/camagenta/repokajian
- **Evidence sumber:** https://t.me/sijadwalkajian/192/7023
