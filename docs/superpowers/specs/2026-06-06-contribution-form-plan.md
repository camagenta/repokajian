# Implementation Plan: In-App Contribution Form (v1)

Spec: `docs/superpowers/specs/2026-06-06-contribution-form-design.md`
Scope: intake-only, dual-path delivery (GitHub prefill + maintainer-push a/b/c).

## Prereqs / read first

- `scripts/validate-contributions.mjs` — source of truth for validation rules.
- `scripts/promote-contribution.mjs` — slug/id + JSON shape (`buildSource`, `canonicalSegment`, `generatedId`).
- `docs/CONTRIBUTING.md` + `data/contributions/README.md` — intake contract & examples.
- `src/app/components/AppShell.tsx`, `OpenContributionTab.tsx` — wiring + styling tokens (`--clay`, `--slate`, `--g300`, etc.).
- `src/shared/types.ts` / `src/app/lib/data.ts` — `Source` type.
- Per repo AGENTS.md: this is Next.js 16 with breaking changes — read
  `node_modules/next/dist/docs/` before writing App Router / build code.

## Step 1 — Shared rules module (E1, DRY single source of truth)

Create `scripts/lib/intake-rules.mjs` (plain ESM, NO `fs`/Node-only APIs so it bundles
in the browser):
- Constants: `ALLOWED_PLATFORMS`, `ALLOWED_TYPES`, `REQUIRED_FIELDS`.
- Helpers (move from `promote-contribution.mjs`/`validate-contributions.mjs`, keep
  identical behavior): `isNonEmptyString`, `isValidHttpUrl`, `canonicalSegment`,
  `canonicalHandle`, `stripPlatformPrefix`, `buildSlug(item)`.
- `validateIntake(item, { sources = [] }) => { errors: string[], warnings: string[] }`
  — all per-item rules (required/enum/url/array/topic) → errors; url + `platform::handle`
  duplicates against `sources` → warnings.

Create `scripts/lib/intake-rules.d.ts` — minimal types so the `.ts` client gets
type-checking.

Edit `scripts/validate-contributions.mjs` (E1):
- Import constants + `validateIntake` + helpers from `./lib/intake-rules.mjs`.
- Delete the now-duplicated declarations.
- Keep the fs parts here: walk `pending/`, load `sources.json`, run `validateIntake`
  per file, AND cross-file duplicate detection across multiple pending files. Preserve
  current CI exit behavior exactly (existing-registry dup still hard-fails CI).

**Verify after Step 1, before any UI:** `npm run validate:contributions` still passes
(refactor must be behavior-preserving).

## Step 2 — Client wrapper (no duplicated rules)

Create `src/app/lib/contribution-intake.ts`:
- Re-export `validateIntake`, `buildSlug`, constants from the shared module. Confirm
  tsconfig allows importing from `scripts/lib/`; if rootDir/path blocks it, put the
  shared module at `src/shared/intake-rules.mjs` and import it from the CI script too —
  keep exactly ONE copy either way.
- Browser-only helpers: `buildIntakeJSON(item)` (canonical key order matching the
  CONTRIBUTING example, omit empty optionals, 2-space indent + trailing newline),
  `buildGithubNewFileUrl({slug, json})`, `buildMailto({item, json})`.
- Constants: `REPO = { owner: "t-onluring", repo: "vibathon-2026" }`,
  `NETLIFY_FORMS_ENABLED = true` (E3, enabled by maintainer),
  `MAINTAINER_EMAIL = "onluring@gmail.com"`.

## Step 3 — Form + delivery components

Create `src/app/components/ContributionForm.tsx` (`"use client"`):
- Props: `{ sources: Source[] }`.
- Controlled fields with real `<label htmlFor>` (D2): name, platform (select),
  source_type (select), url, handle, region, evidence_url, submitted_by, category
  (comma→array), tags (comma→array), notes (textarea). Conditional: parent_id (select
  of `tg` sources) + topic_id (`inputmode="numeric"`) when source_type=topic.
- Live `validateIntake(item, { sources })`: inline errors with `aria-invalid` +
  `aria-describedby`; duplicate warning banner `role="status"` (amber, non-blocking) (D1/D2).
- Collapsible JSON preview "Lihat JSON yang akan dibuat", collapsed by default (D3).
- `aria-live="polite"` region for action announcements (D2).
- Two delivery lanes (D3) rendered via `<DeliveryButtons>`.

Create `src/app/components/DeliveryButtons.tsx` (E4) — props `{ json, slug, item, errors }`:
- Lane 1 "Punya akun GitHub?": "Buka di GitHub" → `window.open(buildGithubNewFileUrl)`,
  disabled while `errors.length`; popup-blocked fallback shows a manual link.
- Lane 2 "Kirim ke maintainer":
  - Netlify "Kirim ke maintainer" — render only if `NETLIFY_FORMS_ENABLED`; POST
    `application/x-www-form-urlencoded` to `/` with `form-name=source-intake`; success
    toast, failure inline note (D1).
  - "Salin JSON" (clipboard, label→"Disalin ✓" 2s, fallback selects `<pre>`) +
    "Download JSON" (Blob → `<slug>.json`).
  - "Email ke maintainer" → `buildMailto`, render only if `MAINTAINER_EMAIL` set.
- Reuse tokens / rounded cards from `OpenContributionTab`; targets ≥44px (D2).

## Step 4 — Wire into the tab (D4)

- `OpenContributionTab.tsx`: accept `sources` prop; render
  `<ContributionForm sources={sources} />` at the top under heading "Usulkan source
  lewat form"; make the existing `ContributionWalkthrough` **default-collapsed**
  reference below the form (toggle to expand).
- `AppShell.tsx`: pass `sources` to `<OpenContributionTab sources={sources} />`.

## Step 5 — Netlify Forms detection stub (E3)

- Create `public/__forms.html`: plain
  `<form name="source-intake" data-netlify="true" netlify-honeypot="bot-field">` with
  hidden inputs matching the POSTed fields (at least `payload`, `name`, `submitted_by`,
  `bot-field`).
- Keep `NETLIFY_FORMS_ENABLED = false` until a Netlify deploy confirms detection (form
  appears in dashboard). Until then the Netlify button is hidden and b + c cover the
  maintainer path. Flip the flag in a follow-up once verified.

## Step 6 — Docs

- `docs/CONTRIBUTING.md`: add "Jalur Form (in-app)" — GitHub path vs maintainer path;
  JSON identical across paths.
- `data/contributions/README.md`: add maintainer step "Intake dari Netlify Forms / form
  submission → buat file di `pending/` → validate → promote".

## Step 7 — Tests (E2)

- Extend `scripts/test-contribution-scripts.mjs`:
  1. **E2E vs real validator:** write `buildIntakeJSON()` output (channel + topic) into
     a temp `pending/` dir, run `validate-contributions.mjs` against it via env override
     (mirror how the promote test overrides `SOURCES_PATH`), assert exit 0.
  2. **Unit `validateIntake` / `buildSlug`:** one assertion per branch (missing each
     required field, bad enum, bad url, bad array, topic rules, duplicate→warning, slug
     topic vs non-topic, `buildGithubNewFileUrl` round-trip).
- Run `npm run test:contribution-scripts`.

## Step 8 — Verify

- `npm run validate:contributions`
- `npm run test:contribution-scripts`
- `npm run lint`
- `npm run build`
- Manual `npm run dev`: bad URL, missing field, topic w/o parent_id, duplicate url;
  GitHub prefill opens; Copy/Download/mailto identical JSON; JSON-preview toggle;
  keyboard nav + focus rings + error announcements.

## Done criteria

- One validation implementation shared by CI + form (no duplication).
- Form output passes the REAL `validate:contributions` (proven by test).
- GitHub prefill opens with filename + content populated; Copy/Download/mailto identical.
- Netlify button cleanly flagged off until verified; b + c work.
- Interaction states + a11y implemented per design doc.
- All `validate` / `test` / `lint` / `build` green; docs updated.
