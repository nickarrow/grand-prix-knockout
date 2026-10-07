# Deployment Guide

Grand Prix Knockout is deployed on Cloudflare Pages. The site is a static Vite build, uploaded by a GitHub Action that
gates on the checks.

## Architecture

```
GitHub (main branch)
    ↓ push
.github/workflows/deploy.yml (lint, tests, build, then Wrangler direct upload)
    ↓
Cloudflare Pages
    ↓
grandprixknockout.com
```

The deploy gate is recorded in `docs/decisions/0007-deploy-gate.md`. It was armed on 2026-10-07: Cloudflare's
build-on-push is off, and `deploy.yml` is the only path to production. See "Deploy flow" below.

## Current Setup

Confirmed against the Cloudflare dashboard on 2026-10-07.

- **Hosting**: Cloudflare Pages, project `grand-prix-playoffs` (the internal project name was kept through the rename;
  it is invisible to users)
- **Build command**: `npm run build` (set in the Pages project, now unused because the GitHub Action builds instead)
- **Output directory**: `dist`
- **Production branch**: `main`, with Cloudflare automatic deployments **disabled**
- **Pages URL**: https://grand-prix-playoffs.pages.dev
- **Custom domain**: grandprixknockout.com
- **Old domain**: grandprixplayoffs.com, a redirect-only zone that 301-redirects to grandprixknockout.com (see below)

## Deploy flow

There are no pull requests in this repository, so there are no per-PR preview URLs.

- **Production**: every push to `main` triggers `.github/workflows/deploy.yml`, which runs lint, the tests and the build
  and only then uploads `dist/` to Cloudflare Pages with Wrangler. A commit that fails any check never reaches
  production. The Cloudflare credentials are the GitHub secrets `CLOUDFLARE_API_TOKEN` (a Pages-scoped token) and
  `CLOUDFLARE_ACCOUNT_ID`.
- **Weekly data**: `.github/workflows/update-season-data.yml` commits refreshed `data/<year>.json` to `main` every
  Monday, which goes live through the same production deploy path.
- **Branch checks**: `.github/workflows/checks.yml` runs lint, the format check, the tests and the build on every push
  to a non-`main` branch, so the result is visible before the owner merges locally. It does not deploy.

## Custom domain and the old-domain redirect

grandprixknockout.com is a custom domain on the Pages project.

grandprixplayoffs.com is no longer a Pages custom domain. It is kept as a redirect-only zone so old links survive:

1. In the grandprixplayoffs.com DNS zone, a proxied (orange-cloud) `AAAA` record for the apex and for `www`, both
   pointing at the discard address `100::`. The record only has to route the request to Cloudflare's edge; the redirect
   rule intercepts it before the dead address is ever contacted.
2. A Redirect Rule matching `https://*grandprixplayoffs.com/*`, redirecting to `https://grandprixknockout.com/${2}` with
   a 301, preserving the path. The second wildcard `${2}` carries the path; `${1}` is the subdomain slot.

A redirect rule only fires on proxied traffic, which is why the DNS record must be proxied.

## Build Settings

The GitHub Action builds and uploads, so Cloudflare's own build-on-push is turned off. The build command stored in the
Pages project is unused. To change what gets built, edit `.github/workflows/deploy.yml` and `wrangler.toml`
(`pages_build_output_dir = "dist"`), not the dashboard.

## Environment Variables

Production environment variables can be set in:
Cloudflare Pages → Settings → Environment variables

Current variables (all optional - defaults provided):

- `VITE_JOLPICA_API_URL` - F1 data API (default: `https://api.jolpi.ca/ergast/f1`)

## Data Updates

Season data is automatically updated weekly via GitHub Actions:

- Runs every Monday at 6:00 AM UTC
- Can be manually triggered from GitHub Actions tab
- Updates `data/2026.json` with latest race results
- The commit to `main` goes live through the production deploy path above

## Troubleshooting

### Build Failures

1. Check Cloudflare Pages deployment logs
2. Common issues:
   - TypeScript errors: Run `npm run build` locally
   - Missing dependencies: Check `package.json`

### 404 on Routes

The `_redirects` file in `/public` handles SPA routing. Verify it exists in build output.

### Rollback

1. Go to Cloudflare Pages → Deployments
2. Find previous working deployment
3. Click menu → **Rollback to this deployment**
