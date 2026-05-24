# Track B Runbook — Topic Title Mapping (B4)

## Tujuan
Memetakan hasil topic freshness dari authenticated spike ke `region` dan `source_id` yang konsisten.

## Input
- `data/spikes/telegram-topic-freshness.json`
- `data/spikes/topic-region-map.json`

## Output
- `data/spikes/telegram-topic-freshness-mapped.json`

## Cara kerja
1. Normalisasi `topic_title` ke lowercase/trim/alnum-space.
2. Cocokkan dengan rules `topic-region-map.json` (normalized exact match).
3. Tandai setiap topic:
   - `mapped=true` + `mapped_region` jika ketemu
   - `mapped=false` jika belum ketemu

## Script
- `scripts/spikes/topic-region-mapping-spike.ts`

## NPM Script
- `npm run spike:topic-mapping`

## Acceptance Criteria B4
- [ ] Script menghasilkan artifact mapped JSON
- [ ] Summary total/mapped/unmapped tersedia
- [ ] Unmapped topics terlihat jelas untuk follow-up rule update

## Catatan
- B4 masih read-only spike layer.
- Belum mengubah checker utama.
