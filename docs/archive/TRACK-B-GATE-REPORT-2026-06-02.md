# Track B Gate Report — 2026-06-02

## Summary
- Window: Day 1 attempt only
- Workflow: `check-telegram-auth-spike.yml`
- Expected branch: `phase-1.5-auth-spike`
- Run branch/SHA: `main` / `1ff1c261ad6ab3f4621d90ff0d4ba233fac93d5b`
- Verdict: `GO WITH GUARDRAILS` pending a valid 3-day observation window

## 1) Run Reliability
- Total GitHub workflow runs verified: 1
- Successful GitHub workflow runs verified: 1
- Success rate: 100%
- Timeout count: 0
- Retry-triggered runs: 0
- Notes: Run `26795370347` completed successfully. The freshness step succeeded on attempt 1/2.

## 2) Auth Stability
- `needs_setup` count: 0 in GitHub run
- `error` count: 0 in GitHub run
- Session re-bootstrap needed? no
- Notes: GitHub Secrets are present and the regenerated MTProto session connected successfully.

## 3) Artifact Integrity
- freshness artifact present for valid Day-1 run: yes
- mapped artifact present for valid Day-1 run: yes
- evaluated artifact present for valid Day-1 run: yes
- No message content leakage confirmed: yes
- Notes: Artifact `telegram-auth-topic-freshness` was downloaded from run `26795370347`. Downloaded artifact inspection found no raw `text` keys, no raw Telegram message payload keys, and no secret literal values.

## 4) Mapping Quality
- Day 1: total/mapped/ignored/unmapped = 79/77/2/0
- Day 2: total/mapped/unmapped = pending
- Day 3: total/mapped/unmapped = pending
- Ignored topic titles:
  1. Dapur Satu Data Kajian
  2. General
- Mapping update required? no for current Day-1 topic set

## 5) Status Semantics Sanity
- Day 1 status summary: freshness `run.status = ok`; `last_post_at` resolved for 79/79 topics. Evaluator summary: `total_topics = 79`, `active = 34`, `stale = 39`, `dead = 4`, `blocked = 0`, `ignored = 2`, `error = 0`
- Day 2 status summary: pending
- Day 3 status summary: pending
- Any abnormal spikes in `blocked`/`error`? no; intentional non-region topics are now counted as `ignored`.

## 6) Security & Compliance
- Secret exposed in logs: not observed locally
- Access anomaly detected: none observed locally
- Rate-limit/flood signals: none observed locally
- Actions taken: Inspected GitHub Actions run and downloaded artifacts for run `26795370347`; secret values were masked as `***`.

## 7) Decision

### Recommendation
`GO WITH GUARDRAILS`

### Rationale
- The script chain is operational for the no-secret/bootstrap path.
- GitHub Secrets are present, the regenerated MTProto session works, and the workflow produced all required artifacts.
- Topic metadata is reachable, and the updated freshness implementation resolves `last_post_at` from Telegram forum topic dates.
- Remaining non-actionable topics are explicit ignores: `Dapur Satu Data Kajian` and `General`.
- Promotion to main checker should wait for three consecutive fresh workflow artifacts with non-`needs_setup`, non-`error` status.

### Guardrails
- Keep the auth spike workflow isolated.
- Do not replace group-level fallback until a valid 3-day observation window passes.
- Treat this report as Day-1 preflight, not Day-1 evidence.

## 8) Follow-up Tasks
1. Continue Day-2/Day-3 observation and compare active/stale/dead distribution.
2. Watch for newly appearing unmapped topics and classify them as mapped region, `online`, or ignored.
3. Decide whether the current ignored-topic policy is sufficient before integration into the main checker.
