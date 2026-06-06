# HANDOFF — In-App Contribution Form (v1)

Copy/paste this to start the next session.

---

You are implementing an **in-app contribution form** for the Kajian Sunnah source
list (Next.js 16, Netlify). Brainstorming is done and approved. Read these two docs
first, they are authoritative:

- `docs/superpowers/specs/2026-06-06-contribution-form-design.md` (design)
- `docs/superpowers/specs/2026-06-06-contribution-form-plan.md` (step-by-step plan)

## Approved decisions (do not re-litigate)

- **Opsi A**: zero-backend. NO GitHub token / serverless auto-PR.
- Audience **C** (mixed): GitHub users self-serve via prefilled `/new` URL;
  non-GitHub users use a **maintainer-push** path.
- Non-GitHub delivery = **a + b + c**: Netlify Forms + Copy/Download JSON + `mailto:`.
- **Intake-only** (`data/contributions/pending/*.json`). NO discovery/spike lane,
  NO source-update flow in v1.
- All delivery paths emit the **same canonical JSON**.

> NOTE: plan + design doc were updated after a `/plan-eng-review` and
> `/plan-design-review`. Follow the numbered steps in the plan doc exactly — they
> encode the review decisions (E1–E4, D1–D4). Summary below.

## What to build (see plan doc Steps 1–8)

1. **E1 — shared rules module** `scripts/lib/intake-rules.mjs` (+ `.d.ts`): the single
   source of truth for intake validation (constants, helpers, `buildSlug`,
   `validateIntake`). Refactor `scripts/validate-contributions.mjs` to IMPORT it (delete
   its duplicated declarations, keep the fs/dir-walk + cross-file dup logic). Verify
   `npm run validate:contributions` still passes — behavior-preserving.
2. `src/app/lib/contribution-intake.ts` — thin client wrapper: re-export shared rules +
   browser-only `buildIntakeJSON`, `buildGithubNewFileUrl`, `buildMailto`, and
   `REPO` / `NETLIFY_FORMS_ENABLED=false` / `MAINTAINER_EMAIL=""` constants. NO
   duplicated validation rules.
3. `src/app/components/ContributionForm.tsx` + **E4** `DeliveryButtons.tsx` — form with
   real labels, live validation, **D1** interaction states, **D2** a11y
   (`aria-invalid`/`aria-describedby`/`aria-live`, ≥44px), **D3** collapsible JSON
   preview + two delivery lanes.
4. Wire into **Contribute** tab: `AppShell.tsx` → `OpenContributionTab.tsx` (accept
   `sources`, render form at top, **D4** make the existing walkthrough default-collapsed).
5. **E3** Netlify Forms stub `public/__forms.html` (form `source-intake`), button gated
   behind `NETLIFY_FORMS_ENABLED=false` until verified live.
6. Docs: `docs/CONTRIBUTING.md` + `data/contributions/README.md`.
7. **E2** tests in `scripts/test-contribution-scripts.mjs`: (a) write `buildIntakeJSON`
   output to a temp `pending/` and run the REAL `validate-contributions.mjs` (channel +
   topic), assert exit 0; (b) unit-test every `validateIntake`/`buildSlug` branch.

## Critical constraints

- Repo AGENTS.md: "This is NOT the Next.js you know" — read
  `node_modules/next/dist/docs/` before App Router/build/forms code.
- JSON shape & key order must stay compatible with `promote-contribution.mjs`
  (`buildSource`) so maintainer promote works unchanged.
- **One** validation implementation shared by CI + form (E1). Duplicates are warnings
  in the form (CI stays the final gate).
- Reuse existing visual tokens (`--clay`, `--slate`, `--g300`, rounded cards) from
  `OpenContributionTab.tsx`.

## Needs a human answer (use placeholder/flag until then)

- Maintainer email for `mailto:` → `MAINTAINER_EMAIL` (email button hidden while empty).
- Is Netlify Forms enabled for this site? Ship with `NETLIFY_FORMS_ENABLED=false`
  (b + c cover the maintainer path); flip to `true` after confirming detection.

## Verify before done

- `npm run validate:contributions`, `npm run test:contribution-scripts`,
  `npm run lint`, `npm run build` — all green.
- Manual `npm run dev`: Contribute tab → GitHub prefill, Copy, Download, mailto, JSON
  toggle, keyboard nav + error announcements, validation errors (bad URL, missing field,
  topic w/o parent_id, duplicate url).
