# Deployment Guide

Grand Prix Playoffs is deployed on Cloudflare Pages. The site is a static Vite build.

## Architecture

```
GitHub (main branch)
    ↓ push
.github/workflows/deploy.yml (lint, tests, build, then Wrangler direct upload)
    ↓
Cloudflare Pages
    ↓
grandprixplayoffs.com
```

The deploy gate is recorded in `docs/decisions/0007-deploy-gate.md`. It takes effect only after the owner turns off
Cloudflare's build-on-push and stores the two Cloudflare secrets; until then Cloudflare still builds on push, as it has
historically. See "Deploy flow" below.

## Current Setup

- **Hosting**: Cloudflare Pages
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Production URL**: https://grand-prix-playoffs.pages.dev
- **Custom domain**: grandprixplayoffs.com (if configured)

> The build command, output directory, Node version and branch settings below are UNVERIFIED against the Cloudflare
> dashboard. They are what the repository and this document assume, not what has been confirmed in the dashboard
> (`docs/design.md`, open question 3). The owner holds the dashboard settings.

## Deploy flow

There are no pull requests in this repository, so there are no per-PR preview URLs.

- **Production**: once Option (a) in `docs/decisions/0007-deploy-gate.md` is live, every push to `main` triggers
  `.github/workflows/deploy.yml`, which runs lint, the tests and the build and only then uploads `dist/` to Cloudflare
  Pages. A commit that fails any check never reaches production. Until the owner completes that record's single action,
  Cloudflare still builds and deploys on push.
- **Weekly data**: `.github/workflows/update-season-data.yml` commits refreshed `data/<year>.json` to `main` every
  Monday, which goes live through the same production deploy path.
- **Branch checks**: `.github/workflows/checks.yml` runs lint, the format check, the tests and the build on every push
  to a non-`main` branch, so the result is visible before the owner merges locally. It does not deploy.

## Custom Domain Setup

1. In Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter `grandprixplayoffs.com`
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

## Web Analytics

1. Go to Cloudflare Dashboard → **Web Analytics**
2. Click **Add a site**
3. Enter `grandprixplayoffs.com`
4. Analytics are automatically enabled for Pages projects with custom domains

## Build Settings

If you need to modify build settings:

1. Go to Cloudflare Pages → your project → **Settings** → **Builds & deployments**
2. Update build command or output directory as needed

Assumed settings (UNVERIFIED against the dashboard, `docs/design.md` open question 3):

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node.js version**: 20 (recorded as "auto-detected"; not confirmed)

Under Option (a) the GitHub Action builds and uploads, so Cloudflare's own build command should be turned off rather
than relied on.

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
