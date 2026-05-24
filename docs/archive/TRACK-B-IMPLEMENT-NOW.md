# Track B — Implement Now (Operator Guide)

## Start Today

### Step 1: Set secrets in GitHub
Required:
- `TG_API_ID`
- `TG_API_HASH`
- `TG_SESSION_STRING`

### Step 2: Trigger workflow manually
Run:
- `check-telegram-auth-spike.yml`

### Step 3: Verify quick pass
- Workflow status = success
- Artifacts uploaded:
  - `telegram-topic-freshness.json`
  - `telegram-topic-freshness-mapped.json`
  - `telegram-topic-freshness-evaluated.json`

### Step 4: Fill Day-1 checklist
Use:
- `TRACK-B-OBSERVATION-CHECKLIST-3D.md`

---

## Day 2 and Day 3
Repeat workflow run (manual/schedule), then update checklist.

---

## After Day 3
Create gate report from template:
- `TRACK-B-GATE-REPORT-TEMPLATE.md`

Decide:
- GO
- GO WITH GUARDRAILS
- NO-GO

---

## Fast Troubleshooting

### A) `needs_setup`
Cause: secret belum lengkap / salah.
Action:
1. Recheck all 3 secrets
2. Re-run workflow

### B) `error`
Cause: auth/session/runtime fail.
Action:
1. Check logs (redacted)
2. Re-bootstrap session jika perlu
3. Re-run

### C) mapped_topics = 0
Cause: rules mapping belum cocok dengan title real.
Action:
1. Update `data/spikes/topic-region-map.json`
2. Re-run mapping + evaluator

---

## Output minimum before promotion
- 3-day success rate >= 95%
- No secret leakage
- Stable auth session
- Mapping quality acceptable for next integration step
