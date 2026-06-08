# Roadmap Execution Checklist

_Last updated: 2026-06-03_

## Current State

- [x] Phase 1.5 fallback closeout is technically complete on GitHub `main`.
- [x] Track B authenticated topic freshness spike is usable with guardrails.
- [x] GitLab local `main` contains the latest closeout commit.
- [ ] Phase 2 has started.

## Phase 1.5 — Parent-Child Sources

### Discovery and Decisions

- [x] Confirmed `@sijadwalkajian` public HTML is not topic-parseable.
- [x] Locked fallback decision: keep `@sijadwalkajian` group-level for public HTML.
- [x] Kept `blocked` for platform surface limitations and `error` for fetch/parser/runtime failures.
- [x] Excluded non-kajian operational topics from region mapping via ignored topic handling.
- [x] Mapped `Kajian Online` to pseudo-region `online`.

### Source Registry and Schema

- [x] Added static API v1 source fields: `source_type`, `parent_id`, `topic_id`.
- [x] Aligned platform type to short codes: `tg`, `yt`, `ig`, `web`, `wa`.
- [x] Aligned `priority` to numeric source priority.
- [x] Aligned latest snapshot schema to v1 fields: `version`, `monitored_sources`, `last_checked_at`, `confidence_score`, `checks[]`.
- [x] Updated script-side snapshot types to match runtime output.
- [x] Fixed missing `confidenceScoreFromMetrics` export used by `check-telegram`.

### Validation Gates

- [x] `rtk npx tsc --noEmit` passes.
- [x] `rtk npm run lint` passes with no warnings.
- [x] `rtk npm run validate:sources` passes.
- [x] `rtk npm run check:snapshot-relations` passes.
- [x] `rtk npm run check:versioning` passes.
- [x] `rtk npm run build` passes with network access for Next Google Fonts.
- [ ] Replace placeholder topic IDs or formally keep them as non-strict placeholders.

### Dashboard and Filtering

- [x] Region filter is available in the dashboard.
- [x] Region filter works with current `sources.json` regions.
- [x] Dashboard reads `monitored_sources` instead of legacy `monitored`.
- [x] Dashboard reads `confidence_score` instead of legacy reliability score.
- [ ] Parent/child visual grouping is implemented.

Note: parent/child visual grouping is deferred by the Phase 1.5 fallback plan because real topic children are not publishable yet.

### Track B Authenticated Spike

- [x] GitHub Actions secrets exist: `TG_API_ID`, `TG_API_HASH`, `TG_SESSION_STRING`.
- [x] Auth spike workflow can be triggered manually.
- [x] Workflow uploads spike artifacts on success and failure.
- [x] Freshness resolves `last_post_at` for 79/79 topics.
- [x] Mapping summary is stable: 77 mapped, 2 ignored, 0 unmapped.
- [x] Evaluator summary is stable across the valid 3-day window: active 30-34, stale 39-43, dead 4, blocked 0, ignored 2, error 0.
- [x] Gate report completed before public cleanup; internal archive file is intentionally not included in the public repo.
- [x] Complete valid Day-2 observation.
- [x] Complete valid Day-3 observation.
- [x] Promote final Track B decision from provisional `GO WITH GUARDRAILS` to final `GO WITH GUARDRAILS`.
- [x] Keep a 5-topic Track B sample visible in the live dashboard instead of bulk-promoting all 77 mapped topics.

## Repository Sync

- [x] GitHub `main` contains commit `91b1cff25a189ab8c820c6f601b02b9593eced70`.
- [x] GitLab branch `ci/upload-artifacts-always` contains commit `91b1cff25a189ab8c820c6f601b02b9593eced70`.
- [x] Merge GitLab branch `ci/upload-artifacts-always` into GitLab local `main`.
- [x] Verify GitLab local `origin/main` contains commit `91b1cff25a189ab8c820c6f601b02b9593eced70`.
- [x] Keep `.serena/` untracked and out of commits.

## Phase 2 — Text Event Extraction MVP

### Prerequisites

- [x] Phase 1.5 baseline is ready enough to start Phase 2 planning.
- [ ] Telegram Bot API token is available.
- [ ] Bot is created via BotFather.
- [ ] Bot is added to `@sijadwalkajian` with read access.
- [ ] Message ingestion approach is chosen: polling or webhook.
- [ ] Golden dataset plan is defined.

### Implementation Tasks

- [ ] Add `KajianEvent` shared type.
- [ ] Create `scripts/ingest/telegram-bot.ts`.
- [ ] Create `scripts/ingest/poll-messages.ts`.
- [ ] Store raw messages in `data/messages/`.
- [ ] Deduplicate messages by Telegram `message_id`.
- [ ] Create `scripts/extract/text-extractor.ts`.
- [ ] Add structured-output schema for plain text extraction.
- [ ] Add few-shot examples for regional message formats.
- [ ] Create `scripts/extract/geo-resolver.ts`.
- [ ] Cache resolved Google Maps short links.
- [ ] Create `scripts/extract/store-events.ts`.
- [ ] Store extracted events in `data/events/`.
- [ ] Deduplicate events by `source_id + date + masjid + ustadz`.
- [ ] Create `scripts/generate-api.ts`.
- [ ] Generate `public/api/v1/` outputs.
- [ ] Create `.github/workflows/ingest-events.yml`.
- [ ] Add dashboard event view in `src/app/components/EventsTab.tsx`.

### Phase 2 Quality Gates

- [ ] Golden dataset size is at least 200 messages.
- [ ] Core field F1 for `ustadz`, `masjid`, and `date` is at least 0.90.
- [ ] Secondary field F1 for `time` and `tema` is at least 0.80.
- [ ] High-confidence precision is at least 0.92.
- [ ] End-to-end batch latency p95 is under 15 minutes.
- [ ] Idempotent rerun mismatch is 0.
- [ ] Daily cost guardrails are implemented.

## Phase 3 — Vision Extraction

- [ ] OCR or vision extraction architecture is defined.
- [ ] Multi-event poster splitting is implemented.
- [ ] Caption-image fusion policy is implemented.
- [ ] Review queue flow is implemented.
- [ ] Image event precision reaches at least 0.85.
- [ ] Multi-event split accuracy reaches at least 0.80.

## Phase 4 — Full Pipeline Hardening

### Phase 4.1 — Dedup and Forward Intelligence

- [ ] Cross-source dedup strategy is implemented.
- [ ] Forward provenance is preserved.
- [ ] Dedup precision reaches at least 0.90.
- [ ] False merge rate stays under 2%.

### Phase 4.2 — Near Real-time Ingestion

- [ ] Message-to-API latency p95 is under 30 minutes.
- [ ] Ingestion success rate is at least 99%.
- [ ] Backlog age p95 is under 30 minutes.
- [ ] Failed cycle streak stays below 2.

### Phase 4.3 — API Hardening and Verification

- [ ] API availability reaches at least 99.5%.
- [ ] 5xx error rate stays under 1%.
- [ ] 429 rate under normal load stays under 3%.
- [ ] OpenAPI parity is 100% for published endpoints.
- [ ] Verification turnaround is under 24 hours.
- [ ] At least 2 consumer integrations pass onboarding.

## Operational Watchlist

- [ ] GitHub Actions Node.js 20 deprecation warning is addressed before runner enforcement.
- [ ] Secrets are rotated if any session/token exposure is suspected.
- [ ] Topic map is reviewed when new Telegram forum topics appear.
- [ ] `blocked` and `error` counts are watched for abnormal spikes.
- [ ] Cost guardrails are in place before LLM extraction runs on schedule.
