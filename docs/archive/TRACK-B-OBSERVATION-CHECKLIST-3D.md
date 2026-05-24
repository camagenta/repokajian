# Track B — 3-Day Observation Checklist (B7/B8)

## Tujuan
Memvalidasi kelayakan implementasi authenticated topic freshness sebelum integrasi ke checker utama.

## Periode
- Hari 1
- Hari 2
- Hari 3

## Prasyarat (sekali sebelum Hari 1)
- [ ] Secrets terpasang di GitHub repo:
  - [ ] `TG_API_ID`
  - [ ] `TG_API_HASH`
  - [ ] `TG_SESSION_STRING`
- [ ] Workflow tersedia: `check-telegram-auth-spike.yml`
- [ ] Branch uji: `phase-1.5-auth-spike`

---

## Checklist Harian

### A. Workflow execution
- [ ] Workflow ter-trigger (schedule/manual)
- [ ] Job selesai tanpa timeout
- [ ] Retry tidak melebihi batas

### B. Artifact checks
- [ ] `telegram-topic-freshness.json` ada
- [ ] `telegram-topic-freshness-mapped.json` ada
- [ ] `telegram-topic-freshness-evaluated.json` ada
- [ ] Tidak ada content message mentah di artifact

### C. Semantic checks
- [ ] `run.status` bukan `needs_setup`
- [ ] `run.status` bukan `error`
- [ ] Distribusi status masuk akal (`blocked/error` tidak melonjak abnormal)

### D. Mapping checks
- [ ] `mapped_topics` > 0 (target saat data real sudah masuk)
- [ ] `unmapped_topics` dicatat untuk update rule map

### E. Security checks
- [ ] Log tidak menampilkan secret mentah
- [ ] Tidak ada token/session leakage di output

---

## Gate Decision After Day 3

### GO jika semua terpenuhi:
- [ ] Success rate run >= 95%
- [ ] Secrets stabil (tidak perlu re-bootstrap berulang)
- [ ] Artifact valid 3 hari beruntun
- [ ] Mapping bisa ditingkatkan tanpa ubah arsitektur

### NO-GO jika salah satu terjadi:
- [ ] Auth sering invalid/revoked
- [ ] Run sering `needs_setup` / `error`
- [ ] Data tidak konsisten untuk pengambilan keputusan freshness
- [ ] Risiko operasional/security terlalu tinggi

---

## Output yang wajib disiapkan
- [ ] Gate report: `TRACK-B-GATE-REPORT-YYYY-MM-DD.md`
- [ ] Keputusan final: `GO` / `GO WITH GUARDRAILS` / `NO-GO`
- [ ] Next step yang jelas (integrasi checker utama atau perbaikan spike)
