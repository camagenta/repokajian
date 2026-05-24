# Track B Runbook — Auth Model + Secret Bootstrap (MTProto)

## Tujuan
Menyiapkan jalur authenticated monitoring Telegram (MTProto) untuk freshness per-topic harian, tanpa menyimpan konten message.

## Scope
- In: auth model, session bootstrap, secret hygiene, recovery
- Out: parser konten/event extraction

---

## 1) Auth Model (B1)

### Rekomendasi
Gunakan **service account Telegram khusus monitoring** (bukan akun personal).

### Kenapa
- Mengurangi risiko lockout akun pribadi
- Ownership jelas di level tim
- Mudah audit dan rotation

### Policy minimum
1. Nomor service account dicatat di akses internal tim
2. Hanya 1 session aktif untuk CI
3. Session rotate jika:
   - akun logout paksa
   - indikasi credential leak
   - pergantian maintainer utama

---

## 2) Secret Bootstrap (B2)

### Secret yang dibutuhkan
- `TG_API_ID`
- `TG_API_HASH`
- `TG_SESSION_STRING`

### Prinsip keamanan
- Jangan pernah commit secret ke repo
- Jangan print full value di log
- Gunakan masking default GitHub Actions

### Prosedur bootstrap (sekali)
1. Siapkan script bootstrap lokal (interactive login sekali)
2. Login dengan service account
3. Generate `session string`
4. Simpan ke password manager/internal vault tim
5. Inject ke GitHub repo secrets
6. Jalankan workflow test non-interactive

### Verifikasi bootstrap berhasil
- Workflow bisa konek MTProto tanpa prompt OTP
- Workflow menghasilkan artifact JSON freshness
- Log tidak menampilkan nilai secret mentah

---

## 3) Recovery Playbook

### Gejala: session invalid / unauthorized
Tanda umum:
- auth failure di awal workflow
- error `SESSION_REVOKED` / unauthorized

### Langkah recovery
1. Revoke session lama
2. Re-bootstrap dari mesin maintainer
3. Update `TG_SESSION_STRING` di GitHub Secret
4. Re-run workflow manual
5. Catat incident singkat di handoff

### Gejala: account limited / flood risk
1. Turunkan frekuensi run sementara
2. Batasi jumlah API call per run
3. Hindari parallel request agresif
4. Cek kembali policy rate-limit internal

---

## 4) CI Guardrails (wajib)

- Timeout per run
- Retry terbatas (mis. 2x)
- Backoff antar request
- Fail-fast jika auth gagal
- Artifact only (no message content)

---

## 5) Definition of Done (B1/B2)

- [ ] Service account model disetujui
- [ ] Semua secret tersedia di GitHub
- [ ] Bootstrap test run sukses non-interactive
- [ ] Recovery langkah terdokumentasi
- [ ] Tidak ada secret leakage di log

---

## 6) Next Step
Lanjut B3:
- spike script read-only untuk ambil `topic_last_post_at` per topic
- output artifact JSON
- belum integrasi ke checker utama
