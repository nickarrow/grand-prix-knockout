# Changelog

Notable changes to Grand Prix Playoffs, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com/), and versions are dates rather than semantic versions, because the site
is not a library anybody depends on.

Changes before 2026.10.05 are in the git log.

## Unreleased

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
