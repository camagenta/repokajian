# Track B Runbook — Status Bridge Evaluator (B5)

## Tujuan
Menerapkan rule bridge dari artifact mapped topic freshness ke status operasional final:
- `active`, `stale`, `dead`, `blocked`, `error`

## Input
- `data/spikes/telegram-topic-freshness-mapped.json`

## Output
- `data/spikes/telegram-topic-freshness-evaluated.json`

## Rule bridge
1. Jika `http_fetch` gagal -> `error`
2. Jika topic belum mapped -> `blocked`
3. Jika mapped tapi `last_post_at` kosong -> `blocked`
4. Jika `last_post_at` ada:
   - `< 7 hari` -> `active`
   - `7-30 hari` -> `stale`
   - `>= 30 hari` -> `dead`

## Script
- `scripts/spikes/topic-freshness-status-evaluator-spike.ts`

## NPM Script
- `npm run spike:topic-evaluate`

## Acceptance Criteria B5
- [ ] Artifact evaluated JSON terbentuk
- [ ] Summary status count tersedia
- [ ] Reason per-topic tersedia (`evaluation_reason`)
- [ ] Tidak menyentuh checker utama (read-only spike)
