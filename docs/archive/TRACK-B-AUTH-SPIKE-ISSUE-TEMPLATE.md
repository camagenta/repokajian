# Internal Issue Template — Track B (MTProto Auth Spike)

## Title format
`[track-b-auth-spike] <short objective>`

Contoh:
- `[track-b-auth-spike] bootstrap MTProto session secret`
- `[track-b-auth-spike] collect topic freshness for @sijadwalkajian`

---

## 1) Objective
Jelaskan outcome kecil yang ingin dicapai (1 task saja, measurable).

## 2) Scope (in)
- [ ] Freshness metadata only (`last_post_at`, `last_checked_at`, status)
- [ ] `@sijadwalkajian` only

## 3) Scope (out)
- [ ] No message content extraction
- [ ] No OCR/vision
- [ ] No public API contract expansion

## 4) Inputs / Secrets needed
- [ ] `TG_API_ID`
- [ ] `TG_API_HASH`
- [ ] `TG_SESSION_STRING`
- [ ] Access to GitHub Actions secrets (repo admin/maintainer)

## 5) Acceptance Criteria
- [ ] Script/workflow runs without interactive login
- [ ] At least 1 topic freshness timestamp captured
- [ ] Output JSON artifact generated
- [ ] No secret exposed in logs

## 6) Validation commands / checks
- [ ] `npm run build` still passes
- [ ] Workflow dry run or manual dispatch passes
- [ ] JSON artifact schema check (internal)

## 7) Risk notes
- [ ] Session invalid/revoked
- [ ] Topic mapping mismatch
- [ ] Rate-limit/flood risk

## 8) Rollback / fallback
- [ ] Disable auth spike workflow
- [ ] Keep Phase 1.5 fallback (group-level public checker)

## 9) Evidence to attach
- [ ] workflow run URL
- [ ] artifact path/name
- [ ] sample output snippet (redacted)

## 10) Completion checklist
- [ ] PR/MR opened
- [ ] Checklist above complete
- [ ] Decision updated in `docs/app/08-decisions.md` if behavior changes
