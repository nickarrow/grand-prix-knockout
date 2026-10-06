# Changelog

Notable changes to Grand Prix Playoffs, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com/), and versions are dates rather than semantic versions, because the site
is not a library anybody depends on.

Changes before 2026.10.05 are in the git log.

## Unreleased

Increment 3: cleanup. On the `increment-3-cleanup` branch, awaiting the owner's local review and merge. No playoff
outcome changed and `src/engine/golden.test.ts` is byte-for-byte unchanged (7 of 7). The suite stays at 102 tests across
7 files.

### Added

- Keyboard access to every interactive control, to WCAG 2.2 AA. The desktop Seasons trigger is a real `button` with
  `aria-haspopup`, `aria-expanded` and a valid menu association; each driver row and phase-section header is Tab
  reachable with `role="button"`, `tabIndex`, `aria-expanded` and Enter/Space toggling; and a `:focus-visible` outline
  shows in both light and dark modes.
- A not-found page and a catch-all route. Unknown paths and unsupported years render a friendly no-data page and send
  zero requests to Jolpica, in place of the old "Failed to load NaN data" error and the live one-race-at-a-time fetch
  for a year like `/2019`.
- `WINNING_POSITION` and `F1_COLUMN_WIDTH` in `src/constants`, so the won-race highlight and the column width stop being
  magic numbers.
- `.github/workflows/deploy.yml` and `wrangler.toml`: deploy from a GitHub Action that runs lint, the tests and the
  build before a Wrangler Pages direct upload, so a failing commit cannot reach production. The Cloudflare token and
  account id are referenced only by GitHub-secret name. The gate takes effect once the owner completes the single action
  in `docs/decisions/0007-deploy-gate.md` (turn off Cloudflare build-on-push, create a Pages-scoped token, store the
  secrets).
- `docs/decisions/0007-deploy-gate.md`, recording the deploy-gate choice (Option (a)) with Option (b) described.

### Changed

- The main entry chunk dropped from 619.73 kB (gzip 193.03 kB) to 195.53 kB (gzip 62.69 kB), a 68% reduction, by
  route-based code splitting (React.lazy and Suspense per page) and vendor `manualChunks` (MUI and Emotion, React Router,
  TanStack Query). Vite's 500 kB advisory is cleared without raising `chunkSizeWarningLimit`. The seven per-season data
  chunks stay split and unchanged.
- The driver-name column no longer wraps raggedly on desktop: it is widened to fit the longest real name on one line,
  with ellipsis and the full name carried as a title for safety.
- `getRacePoints` and `getSprintPoints` import `RACE_POINTS` and `SPRINT_POINTS` from `src/constants` rather than
  re-declaring them; `countPodiums` uses `PODIUM_POSITIONS`; the won-race highlight uses `WINNING_POSITION`.
- `docs/DEPLOYMENT.md` no longer claims per-pull-request preview URLs (there are no pull requests here), describes the
  real deploy, weekly-data and branch-check flows, and marks the Cloudflare dashboard settings unverified.

### Fixed

- `hasSprintRace` in `src/services/static-data.ts` read `sprint !== null`, which was true for a future round whose sprint
  is `undefined`. It now reads `Boolean(race && race.sprint)`, so absent, undefined and null all read false.
- The data workflow closes its open `data-update-failure` issue on a successful run, with a comment, instead of leaving
  it open. The existing `if: failure()` open/update logic is untouched. There is one such issue open from the 2026-10-06
  failed dispatch; the next successful run will close it.

### Removed

- The declared-but-unloaded Inter font: `typography.fontFamily` now starts with a family the browser has, so the
  declared font matches the one that renders. (If the owner wants the Inter look, self-host it via `@fontsource/inter`.)
- Dead code: `useRaceResults` and `getRaceResults`, `queryKeys.races`, `extractDriversFromRaces`,
  `extractDriversFromStaticData`, `DEFAULT_SEASON`, and the OpenF1 settings `OPENF1_API_BASE_URL` and the
  `VITE_OPENF1_API_URL` env read (and its line in `.env.example`).
- The unused `@mui/icons-material` dependency, with `package-lock.json` resynced.

---

Increment 2: the tiebreak rule you can defend. On the `increment-2-tiebreaks` branch, awaiting the owner's local review
and merge.

### Added

- `positionText` on every race result and a stored official regular-season standings order
  (`regularSeasonStandingOrder`) in each `data/<year>.json`, fetched by `scripts/fetch-season-data.mjs` and read by the
  engine as the terminal tiebreak key (`docs/decisions/0004`, Option A).
- Team colours for all 16 constructorIds in the 2020 to 2026 data, so no driver row falls back to grey.
- The decision 0005 calendar-change rules in the engine: a cancelled playoff race decided on the race that still runs, a
  round losing both races rolling its eliminations into the next, a cancelled Final ranked on Round 3 points, and an
  added race joining the round whose date window contains it.
- `docs/decisions/0006`, the season-by-season record of the historical outcomes the new rule changes.
- Tie-case tests built so the data's first-appearance order opposes the asserted winner, so no test passes on sort
  stability.

### Changed

- The tiebreak rule is now a countback over every classified finishing position in the round's races (read from
  `positionText`, sprints excluded), then regular-season position, then the official standings order as a terminal key
  that never ties. It replaces the old P1-P10 countback and the 2026-only interim scoping, and applies to every season
  at once. Four completed seasons move: 2020's champion changes (Hamilton to Verstappen), 2023's Round 1 and 2
  eliminations change, and 2021 and 2022 reorder an eliminated pair. 2024, 2025 and 2026 are unchanged
  (`docs/decisions/0006`).
- The About page describes the tiebreak rule as built, extracted into `TiebreakerExplainer`.

The project's working practice and its rules are now written down. Nothing a visitor sees has changed: no file under
`src/`, `scripts/`, `data/` or `.github/` was touched, and neither were `package.json` or `package-lock.json`.

### Added

- `AGENTS.md`, the rules every AI agent follows here, adapted from the agentic engineering bootstrap 2026.09.24. It
  includes five non-negotiables: deterministic and explainable standings, a source for every encoded rule, accessibility
  to WCAG 2.2 AA, the fan-project disclaimer, and no silent changes to completed seasons.
- `docs/design.md`: what the site is for, the format and its rules, what the site shows, the data pipeline it needs,
  what counts as working, what it will not do, its constraints and the open questions.
- `docs/delivery-plan.md`: increments 0 to 4, from adopting the practice to the rename, with deadlines set by the 2026
  race calendar.
- Decision records `docs/decisions/0001` to `0005`: official points with no pole point, adopting the practice, the drop
  zone, the tie order, and locking the qualifiers when the regular season ends.
- Skills in `.kiro/skills/`: `project-docs`, `review` and `writing-code` from the bootstrap; `codebase-conventions` for
  code under `src/`; and `f1-rules`, which cites the FIA article and Jolpica field behind every rule it states.
- `.kiro/steering/read-first.md`, a short always-on file telling every session to read `AGENTS.md` and the skills.
- `NOTICE.md`, carrying the MIT notice for the files adapted from the bootstrap.

### Changed

- The development standards moved out of always-on steering into the `codebase-conventions` skill, corrected to the
  stack in use: React 19.2, MUI 7.3, TanStack Query 5.90, React Router 7.13, Zustand 5, Vite 7.3, Vitest 4 and
  TypeScript 5.9.
- `README.md` no longer claims a pole-position point, gives the current test count, and lists the bundled seasons as
  2020 to 2026.
- `CONTRIBUTING.md` points at `AGENTS.md` and the `codebase-conventions` skill instead of the deleted steering file, and
  gives the current test count.

### Removed

- `PROJECT_FOUNDATION.md`. What was still true moved into the new documents. What had gone stale, including React 18,
  MUI 5, the pole-position point, the rule that the playoffs are always the last seven completed races, and the OpenF1
  backup, is listed in `docs/decisions/0002-adopt-bootstrap-practice.md` with where each one went.
- `.kiro/steering/dev-standards.md`, replaced by the `codebase-conventions` skill.
