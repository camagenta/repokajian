# Design: In-App Contribution Form (Source List Intake)

Status: Approved (v1)
Date: 2026-06-06
Scope: Single in-app form that lowers friction for contributing new sources to the
registry, auto-producing a canonical contribution-intake JSON.

## Problem

Today contributing a source requires hand-authoring a JSON file in
`data/contributions/pending/`, knowing the schema, and using git/PR
(`docs/CONTRIBUTING.md`). This blocks non-developer contributors (jamaah awam) and
is error-prone even for developers.

## Goal

A friendly in-app form that:
1. Validates input client-side using the same rules as
   `scripts/validate-contributions.mjs`.
2. Generates a **single canonical intake JSON** + slug.
3. Offers a **dual delivery path** so both GitHub and non-GitHub users can contribute.

Non-goals (v1):
- Discovery/spike lane (`data/spikes/*`). Those are machine-generated artifacts;
  human submissions are out of scope for v1. (Future: a lightweight
  `data/contributions/discovery/*.json` lead schema — option (b) from brainstorming.)
- Source **Update** flow (v1 is Source **Add** only; update can reuse the same form later).
- Serverless auto-PR with a GitHub token (rejected: secret + spam surface).

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| How form reaches the repo | **Opsi A** — zero-backend, GitHub prefill + maintainer-push hybrid |
| Target audience | **C** — mixed; prefer easy, GitHub account still OK |
| Non-GitHub delivery channel | **a + b + c** — Netlify Forms + Copy/Download JSON + `mailto:` |
| Intake vs discovery/spike | **(a)** intake-only for v1 |

### Review decisions (from /plan-eng-review + /plan-design-review)

- **E1** DRY: one shared validation module (`intake-rules.mjs`) imported by CI + form.
- **E2** Tests run the REAL CI validator against form output + unit-test every branch.
- **E3** Netlify button gated behind `NETLIFY_FORMS_ENABLED` (off until verified).
- **E4** Extract `DeliveryButtons.tsx`; hide email button until `MAINTAINER_EMAIL` set.
- **D1** Interaction-states table (success/error/duplicate for every action).
- **D2** Accessibility in scope (labels, `aria-*`, keyboard, ≥44px, contrast).
- **D3** Collapsible JSON preview + two clear delivery lanes for the mixed audience.
- **D4** Existing PR walkthrough becomes default-collapsed reference below the form.

## Architecture

```diagram
╭──────────────────────────────────────────────────────────────────────╮
│ ContributionForm.tsx  (Contribute tab 05, above walkthrough)          │
│                                                                        │
│  fields ──▶ client-side validate (mirror validate-contributions.mjs)  │
│         ──▶ build canonical JSON + slug                                │
│                                                                        │
│   ┌─────────────────────────────┐   ┌──────────────────────────────┐ │
│   │ Path 1: "Punya akun GitHub"  │   │ Path 2: "Kirim ke maintainer"│ │
│   │ open                          │   │  (a) Netlify Forms submit    │ │
│   │ /<owner>/<repo>/new/main?     │   │  (b) Copy / Download .json   │ │
│   │   filename=...&value=<json>   │   │  (c) mailto: prefilled       │ │
│   │ → user commits → PR           │   │ → maintainer commits + promote│ │
│   └─────────────────────────────┘   └──────────────────────────────┘ │
╰──────────────────────────────────────────────────────────────────────╯
```

Both paths emit byte-identical JSON; only the transport differs.

## Components & files

| File | Change |
|---|---|
| `scripts/lib/intake-rules.mjs` | NEW (E1) — **single source of truth** for intake validation: `ALLOWED_PLATFORMS`, `ALLOWED_TYPES`, `REQUIRED_FIELDS`, `isValidHttpUrl`, `canonicalSegment`, `canonicalHandle`, `stripPlatformPrefix`, `buildSlug`, `validateIntake(item, { sources })`. Plain ESM, no Node-only APIs (no `fs`), so it bundles in the browser too. |
| `scripts/lib/intake-rules.d.ts` | NEW (E1) — minimal type declarations so the `.ts` client imports `intake-rules.mjs` with types. |
| `scripts/validate-contributions.mjs` | EDIT (E1) — import rules/`validateIntake` from `intake-rules.mjs` instead of re-declaring them; keep the fs/dir-walking + cross-file duplicate logic here. |
| `src/app/lib/contribution-intake.ts` | NEW — thin client wrapper: re-export from `intake-rules.mjs`, plus browser-only helpers `buildIntakeJSON()`, `buildGithubNewFileUrl()`, `buildMailto()`, and the `REPO` constant. No duplicated validation rules. |
| `src/app/components/ContributionForm.tsx` | NEW — the form (client component): fields, live validation, collapsible JSON preview, delivery buttons. |
| `src/app/components/DeliveryButtons.tsx` | NEW (E4) — extracted delivery actions (GitHub / Netlify / copy+download / mailto) + their success/error UI, to keep `ContributionForm` under ~250 lines. |
| `src/app/components/OpenContributionTab.tsx` | EDIT — render `<ContributionForm sources={...} />` near the top, pass `sources`; make the existing walkthrough default-collapsed (D4). |
| `src/app/components/AppShell.tsx` | EDIT — pass `sources` into `OpenContributionTab`. |
| `public/__forms.html` | NEW — Netlify Forms detection stub for the `source-intake` form. |
| `docs/CONTRIBUTING.md` + `data/contributions/README.md` | EDIT — document the new form path + maintainer intake-from-Netlify step. |

## Canonical intake JSON (contract)

Required: `name`, `platform` (`tg|yt|ig|web|wa`), `source_type`
(`channel|group|topic|site|profile`), `url`, `handle`, `region`, `evidence_url`,
`submitted_by`. Optional: `category[]`, `tags[]`, `notes`.
If `source_type=topic`: also `parent_id` (must exist in `data/sources.json`) and
`topic_id` (numeric string).

Key ordering and shape must match the example in `docs/CONTRIBUTING.md` so maintainer
promote (`scripts/promote-contribution.mjs`) works unchanged.

## Slug rules (mirror promote-contribution.mjs)

- Non-topic: `canonicalSegment(handle)` → `<slug>.json`
- Topic: `<stripPlatformPrefix(parent_id)>-topic-<topic_id>.json`
- `canonicalSegment`: strip leading `@`, lowercase, non-alphanumeric → `-`, collapse/trim `-`.

## Client-side validation (E1: shared with CI, not mirrored)

`validateIntake()` lives in `scripts/lib/intake-rules.mjs` and is imported by BOTH the
CI validator and the form. One implementation, zero drift. Rules:

- Required fields are non-empty strings.
- `platform` ∈ allowed set; `source_type` ∈ allowed set.
- `url` and `evidence_url` are valid `http(s)` URLs.
- `category`/`tags` (if present) = arrays of non-empty strings.
- topic: `parent_id` exists in the provided `sources`; `topic_id` matches `/^\d+$/`.
- Duplicate pre-check against `sources`: lowercase `url`, and
  `platform::canonicalHandle(handle)` (skip handle check when `source_type=topic`).
  Duplicates are returned as **warnings**, not errors (final authority remains CI).

`validateIntake(item, { sources })` returns `{ errors: string[], warnings: string[] }`.
The CI validator (`validate-contributions.mjs`) keeps the parts that need the
filesystem: walking `pending/`, loading `sources.json`, and cross-file duplicate
detection across multiple pending files.

## Delivery details

- **GitHub prefill URL:** `https://github.com/<owner>/<repo>/new/main?filename=data/contributions/pending/<slug>.json&value=<encodeURIComponent(JSON)>`.
  Owner/repo from a constant (`t-onluring/vibathon-2026` per README). Opens GitHub's
  create-file editor prefilled; user clicks "Commit" → PR.
- **Netlify Forms (a):** form posts fields + a `payload` field containing the JSON
  string. Requires a static HTML form for Netlify build-time detection (App Router
  needs a stub, e.g. `public/__forms.html`, because forms aren't auto-detected from
  React-rendered markup). Include a honeypot field for spam.
  - **E3 — feature flag:** the Netlify button is gated behind a constant
    `NETLIFY_FORMS_ENABLED` (default `false` until verified live on the site). When
    `false`, the button is hidden and paths b + c still cover the maintainer route.
    Flip to `true` only after confirming the form is detected in a Netlify deploy.
- **Copy/Download (b):** "Salin JSON" (clipboard) + "Download .json" (Blob) buttons.
  Always available — the universal fallback.
- **mailto (c):** `mailto:<maintainer-email>?subject=...&body=<encoded JSON>`.
  Maintainer email is a constant `MAINTAINER_EMAIL` (placeholder until provided; if
  empty, hide the email button rather than render a broken `mailto:`).

## Interaction states (D1)

Every delivery action and the form itself must show the user what happened. Spec the
following states (what the user SEES, not backend behavior):

| Surface | Initial | Validating / invalid | Success | Failure |
|---|---|---|---|---|
| Form fields | empty, helper text per field | inline error under field, red border, submit disabled | — | — |
| Duplicate check | — | amber warning banner "Sepertinya sudah ada di registry: `<id>`. Tetap bisa lanjut." | — | — |
| GitHub button | enabled when no errors | disabled + tooltip "Lengkapi form dulu" | opens GitHub tab, toast "Membuka GitHub… commit di sana untuk membuat PR" | popup blocked → inline note with manual link |
| Netlify submit | enabled (if flag on) | disabled while errors | toast "Terkirim ke maintainer ✓ (review maks 48 jam)" + form reset offer | inline error "Gagal mengirim. Coba Salin JSON lalu kirim manual." |
| Copy JSON | enabled | — | button label flips to "Disalin ✓" for 2s | clipboard API fails → auto-select the `<pre>` text + note |
| Download JSON | enabled | — | file downloads `<slug>.json` | — |
| Email button | shown only if `MAINTAINER_EMAIL` set | — | opens mail client | — |

## Accessibility (D2)

The form is the primary new UI, so a11y is in scope, not deferred:

- Every input has a real `<label htmlFor>`; no placeholder-as-label.
- Errors use `aria-invalid` + `aria-describedby` pointing at the error text node;
  the duplicate warning banner uses `role="status"` (polite).
- Delivery action toasts/announcements live in an `aria-live="polite"` region.
- Full keyboard operability; visible focus rings (reuse existing token styles).
- Touch targets ≥ 44×44px; color contrast ≥ 4.5:1 (reuse `--slate`/`--g700` on paper).
- Selects for `platform`/`source_type`/`parent_id`; `topic_id` is `inputmode="numeric"`.

## UX for mixed audience (D3, D4)

- **Two clearly separated lanes** at the bottom of the form: a "Punya akun GitHub?"
  block (GitHub button) and a "Tidak punya / kirim ke maintainer" block (Netlify +
  copy/download + email). One-line explainer each.
- **Collapsible JSON preview** ("Lihat JSON yang akan dibuat") — collapsed by default
  so non-technical contributors aren't intimidated; technical users can expand to
  verify. Live-updates with form state.
- The existing PR walkthrough in `OpenContributionTab` becomes **default-collapsed**
  reference material below the form, so the form is the primary action (D4).

## Maintainer flow (non-GitHub submissions)

1. Submission lands in Netlify dashboard (or arrives via email / community channel).
2. Maintainer creates `data/contributions/pending/<slug>.json` with the JSON.
3. `npm run validate:contributions && npm run validate:sources`.
4. `npm run promote:contribution data/contributions/pending/<slug>.json` (dry-run),
   then `-- --apply`.

## Testing / verification (E2)

Goal: prove the form output is accepted by the REAL CI validator, and cover every
branch of the shared rules.

1. **End-to-end against the real validator (closes the drift gap):** a node test
   writes `buildIntakeJSON()` output to a temp `pending/` dir for a **channel** example
   and a **topic** example, points `validate-contributions.mjs` at that dir (via env
   override, like the existing `promote` test does with `SOURCES_PATH`), and asserts
   exit code 0. Reuse/extend `scripts/test-contribution-scripts.mjs`.
2. **Unit tests for `intake-rules.mjs` (`validateIntake`, `buildSlug`):** one assertion
   per branch —
   - missing each required field → error
   - bad `platform` / bad `source_type` → error
   - non-`http(s)` `url` and `evidence_url` → error
   - `category`/`tags` not array-of-strings → error
   - topic without `parent_id` → error; `parent_id` not in `sources` → error;
     `topic_id` non-numeric → error
   - duplicate `url` and duplicate `platform::handle` → **warning** (not error)
   - `buildSlug`: non-topic uses canonical handle; topic uses
     `<stripped-parent>-topic-<id>`
   - `buildGithubNewFileUrl`: filename + `encodeURIComponent` round-trips the JSON
3. **Manual:** `npm run dev` → Contribute tab → bad URL, missing field, topic w/o
   parent_id, duplicate url; verify GitHub opens prefilled, Copy/Download/mailto emit
   identical JSON, JSON-preview toggle works, keyboard nav + focus rings, error
   announcements.
4. `npm run validate:contributions && npm run lint && npm run build` must pass.

## Resolved by maintainer

- **Maintainer email** = `onluring@gmail.com` → `MAINTAINER_EMAIL` constant; email
  button is shown.
- **Netlify Forms** = enabled → `NETLIFY_FORMS_ENABLED = true`; the "Kirim ke
  maintainer" Netlify button is shown.

## Open items for implementer

- Indonesian microcopy for field labels/helper text and the two delivery lanes.
