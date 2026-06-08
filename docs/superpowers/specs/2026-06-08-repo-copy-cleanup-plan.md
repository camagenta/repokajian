# Plan: Copy repo ke GitHub repo lain + cleanup untuk publikasi

**Tanggal:** 2026-06-08
**Tujuan:** Menyalin repo `t-onluring/vibathon-2026` ke repo GitHub baru (owner/nama berbeda),
sekaligus merapikan referensi hardcoded, docs, dan `.gitignore` agar repo tujuan bersih & jalan.

---

## 0. Keputusan yang sudah dikunci (2026-06-08)

Topologi remote & repo:

```
GitLab lokal (origin, localhost:8929)  ── as-is, tidak diubah
        │ git push
        ▼
github.com/t-onluring/vibathon-2026    ── repo DEV (history + file agent ikut)
        │ (sekali, via template — TANPA history)
        ▼
github.com/jadwal-kajian/<repo>        ── repo PUBLIK BERSIH
                                          (tetap dikembangkan pakai agent)
```

Keputusan:
- **Metode copy: A (Use this template), TANPA history.**
- Repo tujuan **tetap dikembangkan dengan agent** → `AGENTS.md` & `CLAUDE.md`
  **dibiarkan tracked** (lewati Bagian 3.3).
- GitLab lokal tetap `origin` apa adanya.

Variabel yang masih perlu diisi sebelum eksekusi cleanup:

| Var | Nilai | Dipakai di |
|---|---|---|
| `NEW_OWNER` | `jadwal-kajian` | semua referensi `t-onluring` |
| `NEW_REPO` | _tentukan nama repo tujuan_ | URL repo, `basePath` Pages |
| `MAINTAINER_HANDLE` | _mis. `@jadwal-kajian`_ | `CODEOWNERS` |
| `NETLIFY_URL` | _isi URL final_ | README, Opsi B CTA |
| Bawa history? | **tidak** (sudah diputuskan) | metode = A |

---

## 1. Metode copy (pilih satu)

### A. "Use this template" (mulai bersih, tanpa history) — **rekomendasi untuk repo publik baru**
1. Push repo lama dulu (sudah).
2. Di GitHub `t-onluring/vibathon-2026` → Settings → centang **Template repository**.
3. **Use this template → Create a new repository** di `NEW_OWNER/NEW_REPO`.
4. Clone repo baru, lakukan cleanup (Bagian 3) di sana, commit, push.

➕ Repo baru bersih, history lama tidak ikut.
➖ History commit hilang.

### B. Mirror clone + push (bawa history penuh)
```bash
git clone --mirror https://github.com/t-onluring/vibathon-2026.git tmp-mirror
cd tmp-mirror
git push --mirror https://github.com/NEW_OWNER/NEW_REPO.git
```
Lalu clone normal repo baru dan lakukan cleanup (Bagian 3) sebagai commit baru.

➕ History penuh ikut.
➖ Referensi `t-onluring` lama tetap ada di history (hanya bisa dibersihkan dgn rewrite — biasanya tidak perlu).

### C. ❌ Copy folder manual — JANGAN
Akan membawa cruft agent untracked (`.serena/`, `.agents/`, `.claude/`, `.codex/`,
`.remember/`) dan artefak build. Hindari.

> Catatan: lewat git (A/B), file untracked **tidak ikut** karena hanya `git ls-files` yang ter-copy.

---

## 2. Audit referensi yang harus diganti

Sumber kebenaran: `git grep -n "t-onluring"`. Saat ini muncul di:

**Wajib (memengaruhi runtime/UX):**
- `src/shared/intake-rules.mjs:76` → `export const REPO = { owner, repo }` (dipakai generate URL PR)
- `src/app/components/CronPanel.tsx:5` → `const REPO = "t-onluring/vibathon-2026"`
- `src/app/components/OpenContributionTab.tsx:401,412` → link repo + CONTRIBUTING

**Wajib (metadata repo):**
- `CODEOWNERS` (5 baris `@t-onluring`)
- `.github/ISSUE_TEMPLATE/config.yml:7`
- `README.md:8` (URL repo) + baris Netlify URL placeholder

**Opsional (docs/arsip — boleh dibiarkan atau dibersihkan):**
- `docs/superpowers/specs/2026-06-06-contribution-form-*.md`
- `docs/archive/HANDOFF.md`, `docs/archive/TRACK-B-OBSERVATION-CHECKLIST-3D.md`
- `docs/roadmap/index.html`

---

## 3. Cleanup checklist (dijalankan di repo tujuan)

### 3.1 Ganti referensi repo
- [ ] `src/shared/intake-rules.mjs`: ubah `REPO` ke `NEW_OWNER`/`NEW_REPO`.
      **Lebih baik:** baca dari env saat build, fallback ke nilai default:
      `owner: process.env.NEXT_PUBLIC_REPO_OWNER ?? "NEW_OWNER"`.
- [ ] `src/app/components/CronPanel.tsx`: ganti konstanta `REPO`.
- [ ] `src/app/components/OpenContributionTab.tsx`: ganti 2 URL.
- [ ] `CODEOWNERS`: ganti `@t-onluring` → `MAINTAINER_HANDLE`.
- [ ] `.github/ISSUE_TEMPLATE/config.yml`: ganti URL CONTRIBUTING.
- [ ] `README.md`: ganti URL repo + isi `NETLIFY_URL` final.

### 3.2 Rapikan `.gitignore` (cruft agent)
Tambahkan blok berikut ke `.gitignore`:
```gitignore
# agent / tooling scratch
.serena/
.agents/
.claude/
.codex/
.remember/
```
(`.gstack/` dan `.cache/` sudah ada.)

### 3.3 Keluarkan panduan agent dari repo publik (DIPUTUSKAN: Remove + migrate)
> Keputusan 2026-06-08: repo publik `jadwal-kajian` **tanpa instruksi agent**.
> Konten penting sudah **dimigrasikan ke `README.md`** (section "Catatan teknis untuk
> kontributor": peringatan Next.js + ringkasan aturan `DESIGN.md`).

Langkah di copy bersih:
```bash
git rm --cached AGENTS.md CLAUDE.md
```
lalu tambahkan `AGENTS.md` & `CLAUDE.md` ke `.gitignore`.

> **Konsekuensi:** tooling agent tidak lagi auto-load guardrail (`AGENTS.md`/`CLAUDE.md`
> diinjeksi otomatis; `README.md` tidak). Agent **tetap bisa kerja** dengan membaca
> kode + README, tetapi kehilangan konteks otomatis. Trade-off diterima demi repo publik
> yang bersih. `DESIGN.md` tetap dipertahankan sebagai sumber kebenaran desain.
>
> Catatan: migrasi konten ke `README.md` sudah dilakukan di repo dev (t-onluring) juga,
> jadi `git rm --cached` di atas hanya perlu dijalankan di copy publik.

### 3.4 Buang docs internal (DIPUTUSKAN: ya, di repo publik)
Di copy bersih `jadwal-kajian`, hapus docs internal:
- [ ] `docs/superpowers/` (plan & handoff internal — termasuk plan ini sendiri)
- [ ] `docs/archive/` (handoff lama, banyak referensi stale `t-onluring`)

> ⚠️ JANGAN hapus `docs/in-app/` — di-render oleh app (`src/app/lib/data.ts`
> `DOCS_DIR = docs/in-app`). Menghapusnya membuat drawer docs kosong & test gagal.
> `docs/app/`, `docs/roadmap/`, `docs/README.md`, `docs/CONTRIBUTING.md` = aman dipublik
> (boleh dipertahankan).

### 3.5 Sinkron dengan plan GitHub Pages
Kalau repo tujuan juga dideploy ke Pages (lihat
`docs/superpowers/specs/2026-06-08-github-pages-deploy-plan.md`):
- [ ] Sesuaikan `basePath`/`assetPrefix` ke `NEW_REPO` (atau jadikan berbasis env).
- [ ] Set `NEXT_PUBLIC_PRIMARY_SITE_URL` = `NETLIFY_URL` di workflow Pages (Opsi B).

---

## 4. Verifikasi sebelum dianggap selesai

Jalankan di repo tujuan:
```bash
npm install
npm run validate:contributions
npm run test:contribution-scripts
npm run lint
npm run build
```
- [ ] Tidak ada sisa `t-onluring` di file runtime: `git grep "t-onluring" -- src/ CODEOWNERS README.md .github/`
- [ ] Form intake menghasilkan URL PR yang menunjuk ke `NEW_OWNER/NEW_REPO`.
- [ ] (Jika Pages) `npm run build:pages` sukses dan `out/` ter-generate.

---

## 5. Rekomendasi ringkas

1. Pakai **metode A (template)** untuk repo publik baru yang bersih, atau **B (mirror)**
   kalau history penting.
2. Jadikan `owner/repo` **berbasis env** (`NEXT_PUBLIC_REPO_OWNER`, `NEXT_PUBLIC_REPO_NAME`)
   supaya copy berikutnya tidak perlu ganti kode lagi — cukup set env.
3. Tambah cruft agent ke `.gitignore` (3.2) — ini langkah paling aman & cepat.
4. Putuskan nasib `AGENTS.md`/`CLAUDE.md` & `docs/` internal sesuai apakah repo tujuan
   privat-dev atau publik-produk.
