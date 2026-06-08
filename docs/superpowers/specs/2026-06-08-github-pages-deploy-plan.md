# Plan: Dual deploy — Netlify + GitHub Pages

Status: Plan (awaiting approval)
Date: 2026-06-08
Goal: Keep Netlify as the primary deploy (root path, SSR-capable, Netlify Forms on) and
add **GitHub Pages** as a secondary static mirror of the same app.

## Feasibility (verified)

- No API route handlers, no `next/image`, no middleware / server actions / `cookies()` /
  `headers()`. The page is `export const dynamic = "force-static"`. → Next.js **static
  export** (`output: "export"`) works.
- GitHub remote already exists: `github.com/t-onluring/vibathon-2026`.
- The only root-absolute internal strings (`/v1/*.json` in `OverviewTab.tsx`) are
  **display labels**, not fetches → `basePath` won't break runtime.

## The two differences GitHub Pages forces

```diagram
                 Netlify (primary)            GitHub Pages (mirror)
 host model      SSR + functions              static files only
 URL base        / (root)                     /vibathon-2026/  (project page)
 Netlify Forms   works                        NOT available (no backend)
 build           next build (plugin)          next build with output:"export"
```

So the GH Pages build needs: `output:"export"`, `basePath`/`assetPrefix`, and the
Netlify-Forms button turned **off** (copy/download/mailto/GitHub still work).

## Steps

### 1. Env-conditional `next.config.ts`
Toggle on `DEPLOY_TARGET`:
- when `DEPLOY_TARGET === "github-pages"`:
  `output: "export"`, `basePath: "/vibathon-2026"`, `assetPrefix: "/vibathon-2026/"`,
  `trailingSlash: true`, `images: { unoptimized: true }`.
- otherwise (Netlify + local dev): current behavior (no export, no basePath).

### 2. Make the Netlify button build-time optional + redirect fallback (Option B)
In `src/app/lib/contribution-intake.ts`:
- `export const NETLIFY_FORMS_ENABLED = process.env.NEXT_PUBLIC_DISABLE_NETLIFY_FORMS !== "true";`
- `export const PRIMARY_SITE_URL = process.env.NEXT_PUBLIC_PRIMARY_SITE_URL ?? "";`
  (the canonical Netlify URL, e.g. `https://<site>.netlify.app`).
- Netlify build: `NETLIFY_FORMS_ENABLED` stays `true` → real submit button.
- Pages build: set `NEXT_PUBLIC_DISABLE_NETLIFY_FORMS=true` AND
  `NEXT_PUBLIC_PRIMARY_SITE_URL=<netlify-url>`.

**Option B behavior in `DeliveryButtons.tsx`:**
- if `NETLIFY_FORMS_ENABLED` → render the real "Kirim ke maintainer" submit button (as now).
- else if `PRIMARY_SITE_URL` → render a link button **"Isi form online di situs utama"**
  → opens `PRIMARY_SITE_URL` in a new tab (keeps the one-click online path for awam users
  on the static mirror).
- else → render nothing (graceful fallback to Salin/Download/Email only = Option A).

So on Pages, the maintainer lane keeps: redirect-to-online + Salin/Download JSON + Email;
GitHub prefill is unaffected.

### 3. `package.json` script
- `"build:pages": "DEPLOY_TARGET=github-pages NEXT_PUBLIC_DISABLE_NETLIFY_FORMS=true npm run build"`
  (`build` already runs `generate:api` first, so the static `/v1` API is emitted too).
- Pass the canonical Netlify URL for Option B, e.g. set
  `NEXT_PUBLIC_PRIMARY_SITE_URL` in the workflow env (preferred) or inline in the script.

### 4. Jekyll opt-out
- Add empty `public/.nojekyll` (so `_next/` is served), and `touch out/.nojekyll` in the
  workflow as a belt-and-suspenders.

### 5. GitHub Actions workflow `.github/workflows/deploy-pages.yml`
- Triggers: `push` to `main` + `workflow_dispatch`.
- `permissions: { contents: read, pages: write, id-token: write }`, `concurrency: pages`.
- Steps: checkout → setup-node@20 + `npm ci` → `npm run build:pages` →
  `touch out/.nojekyll` → `actions/upload-pages-artifact@v3` (path `out`) →
  `actions/deploy-pages@v4`.

### 6. Get the code onto GitHub (origin is GitLab)
Pick one (recommend A):
- **A. GitLab push-mirror** → GitHub (GitLab repo → Settings → Repository → Mirroring).
  Automatic; the Pages workflow then runs on the GitHub repo on each mirrored push.
- B. Manual `git push github main` when releasing.
- C. Move primary development to GitHub.

### 7. Enable Pages
GitHub repo → Settings → Pages → Source = **GitHub Actions**. Resulting URL:
`https://t-onluring.github.io/vibathon-2026/`.

### 8. Docs
- README: add the GitHub Pages URL; note it's a static mirror and that "Kirim ke
  maintainer (form online)" is disabled there (use GitHub/Salin/Download/Email instead).

## Verify
- `npm run build:pages` locally → `out/` exists; `out/index.html` references
  `/vibathon-2026/_next/...`; `out/.nojekyll` present after the touch.
- Local serve under the sub-path (e.g. `npx serve out -l 3000` then visit
  `http://localhost:3000/vibathon-2026/`) — assets + tabs load, form renders, Netlify
  button is hidden, GitHub/Copy/Download/Email work.
- `npm run lint && npm run build` (default Netlify mode) still green — config toggle must
  not regress the Netlify build.
- After deploy: open the Pages URL, confirm 200 + form works.

## NOT in scope / caveats
- Netlify Forms on GitHub Pages — impossible (static host); intentionally disabled there.
- Canonical URL stays Netlify; GH Pages is a mirror (optional `<link rel="canonical">`
  could be added later, not now).
- The `/v1/*.json` labels in OverviewTab point at the canonical (Netlify root) API; on
  Pages the actual files live under `/vibathon-2026/v1/`. Cosmetic only — revisit if we
  want the labels host-aware.
- No custom domain (would remove the need for `basePath`); revisit if a domain is added.

## Open items
- Confirm deploy delivery: set up GitLab→GitHub mirror (A) vs manual push (B)?
- Confirm the GitHub repo has Actions + Pages enabled (org/personal settings).
