# 0007. Deploy from GitHub Actions behind the checks

Date: 2026-10-06. Recommended by the orchestrator in increment 3, accepted and armed by the owner on 2026-10-07.

Status: Accepted and live. On 2026-10-07 the owner created a Pages-scoped Cloudflare API token, stored it with the
account id as the GitHub secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and disabled Cloudflare's automatic
deployments for the production branch, so `deploy.yml` is now the only path to production. Supersedes nothing. It answers
open question 2 in `docs/design.md`.

## Context

Cloudflare Pages builds and deploys every push to `main`, including the data workflow's weekly commit, and nothing runs
the tests or the build before the site goes live. This is a solo project with no pull requests, so a gate cannot sit on
a merge request.

Increment 1 added two inline safeguards. The data workflow runs `npm ci`, `npm test` and `npm run build` against the
data it fetched before it commits, and `checks.yml` runs lint, the format check, the tests and the build on every push
to a non-`main` branch. Neither is a hard gate: both report to the owner, and the owner can still merge or push to
`main` with the checks red. A push made with the workflow's `GITHUB_TOKEN` starts no other workflow
([GitHub docs][gh-token]), so a check cannot sit between the data workflow's push and the Cloudflare build either.

So nothing today can stop a failing commit reaching production. open question 2 in `docs/design.md` set out two options.

## Decision

Take Option (a): stop Cloudflare building on push, and deploy from a GitHub Action that runs lint, the tests and the
build first and only then uploads the built `dist/` to Cloudflare Pages with Wrangler direct upload.

This is the only option that is a real gate. The deploy step runs only after the checks pass in the same job, so a
commit that fails them produces no upload and production keeps the last good deploy.

What this record ships, needing no token:

- `.github/workflows/deploy.yml`, triggered on push to `main`, running `npm ci`, `npm run lint`, `npm test`,
  `npm run build` and then `cloudflare/wrangler-action` to `pages deploy dist`. The Cloudflare API token and account id
  are referenced only by the GitHub-secret names `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. No value is in the
  repository. The runner image and the actions are pinned to match `update-season-data.yml`, and `permissions` is
  `contents: read`.
- `wrangler.toml`, with `pages_build_output_dir = "dist"` and the project name `grand-prix-playoffs`, documented as
  owner-set.

### The single owner action

The gate does not take effect until the owner does three things, which only the owner can do because they touch the
Cloudflare dashboard and account secrets:

1. Turn off Cloudflare Pages build-on-push for this project (otherwise both Cloudflare and this workflow deploy, and the
   gate is not a gate).
2. Create a Cloudflare API token scoped to this Pages project, with the least privilege a Pages direct upload needs, and
   never a token that can deploy more than this project.
3. Store that token as the GitHub secret `CLOUDFLARE_API_TOKEN` and the Cloudflare account id as `CLOUDFLARE_ACCOUNT_ID`,
   both scoped to this repository.

Until then `deploy.yml` runs its checks and fails at the upload step for want of the secrets, and Cloudflare keeps
deploying on push as it does today. Nothing regresses while the owner is deciding.

If the owner would rather confirm the project name or the token scope before the first live deploy, do that at merge.

## Option (b), the alternative

Keep Cloudflare building on push, and treat increment 1's branch check plus the data workflow's own inline tests as the
safeguard, with no hard gate before a human merges to `main`. This needs no token and no dashboard change. It is
rejected as the primary choice because it is not a gate: the owner can still merge or push with the checks red, and the
data workflow's own push would deploy a bad build if its inline checks were ever bypassed. The owner decides between (a)
and (b) at merge; if (b) is chosen, delete `deploy.yml` and `wrangler.toml` and keep this record as the rejected
alternative.

## Consequences

- With Option (a) live, a commit that fails lint, the tests or the build cannot reach production, which is the
  "How you know it worked" line for increment 3 in `docs/delivery-plan.md`.
- The data workflow's weekly commit to `main` is deployed by this workflow rather than by Cloudflare, so its inline
  checks and this gate both run before that data reaches the site.
- A second place now holds the deploy settings: the project name lives in `wrangler.toml` and in `deploy.yml`, and the
  output directory in `wrangler.toml`. `docs/DEPLOYMENT.md` records the rest, marked unverified against the dashboard
  (open question 3).
- No token or account id is in the repository. The deploy cannot run until the owner stores the two secrets, which is
  deliberate: a token that can deploy production must not live in a session or a commit.
- The owner's action is listed in increment 3's Needs from you in `docs/delivery-plan.md`.

[gh-token]: https://docs.github.com/en/actions/concepts/security/github_token
