# MR Checklist — Track B (MTProto Auth Spike)

Use this checklist for any MR into `phase-1.5-auth-spike` / `main` related to authenticated Telegram monitoring.

## A. Scope & Safety
- [ ] MR scope is limited to freshness-per-topic spike (no event extraction)
- [ ] No unrelated refactor mixed in
- [ ] `.serena/` not included

## B. Auth & Secrets Hygiene
- [ ] No secrets committed (`TG_API_ID`, `TG_API_HASH`, `TG_SESSION_STRING`)
- [ ] Logs redact sensitive values
- [ ] Session bootstrap documented (without exposing token)
- [ ] Recovery notes present for invalid/revoked session

## C. Runtime Behavior
- [ ] Non-interactive execution in CI (no manual prompt)
- [ ] Retry/timeout/rate-limit protections enabled
- [ ] Failure mode maps correctly (`blocked` vs `error`)

## D. Data Output
- [ ] Output artifact generated (JSON)
- [ ] Contains topic freshness metadata only
- [ ] No message body/content persisted
- [ ] Topic-to-region mapping result documented

## E. Contract Impact
- [ ] If `data/latest.json` schema changes: versioning policy followed
- [ ] If no contract change: explicitly stated in MR description
- [ ] Snapshot-source relations remain valid

## F. Validation Evidence (attach in MR description)
- [ ] `npm run build` result
- [ ] `npm run check:snapshot-relations` result (if snapshot touched)
- [ ] `npm run check:versioning` result (if latest touched)
- [ ] Workflow run link + artifact reference

## G. Rollback Readiness
- [ ] Clear rollback step documented (disable workflow / revert commit)
- [ ] Group-level fallback remains operational

## H. Decision Log / Handoff
- [ ] Update `docs/app/08-decisions.md` if semantic behavior changes
- [ ] Add/Update handoff file in `docs/archive/` with next step
