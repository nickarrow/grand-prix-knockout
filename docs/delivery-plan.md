# Delivery plan

- [x] Increment 0: adopt the practice and write it down
- [ ] Increment 1: ready for Singapore, merged before Monday 2026-10-12 06:00 UTC
- [ ] Increment 2: rules you can defend, shipped before Monday 2026-10-26 06:00 UTC
- [ ] Increment 3: cleanup
- [ ] Increment 4: rename and relaunch, timed for the Final on 2026-12-06

What is being built and why is in `docs/design.md`. Choices made along the way are in `docs/decisions/`.

## Before this plan

`PROJECT_FOUNDATION.md` planned five phases for 15 to 28 February 2026: foundation, data layer, core UI, polish and
integration, deployment. The phase commits landed on 15 and 16 February, and commit 58f5fe3 deployed the site to
Cloudflare Pages on 16 February. From 17 to 20 February the 2024 season and then 2020 to 2023 were added, along with the
ranking of eliminated drivers within their group and the official-points column. Phase 3 deferred a bracket diagram and
a season timeline, and phase 2 skipped the OpenF1 backup. Phase 4 ticked an accessibility review, and the keyboard
failures found on 2026-10-05 show that it missed keyboard operation.

Since then: commit 964c97f on 21 June 2026 switched to official points from the API
(`docs/decisions/0001-official-points-no-pole-point.md`), and the data workflow committed 2026 results from 8 March to
21 September.

## Prerequisites

Checked on 2026-10-05.

| Prerequisite              | State                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Node and npm              | Node 24.12.0 and npm 11.6.2 on the owner's machine. The data workflow runs Node 20                              |
| `npm ci`                  | Exit 0 in the `docs/adopt-bootstrap` worktree, 372 packages. npm reported 24 vulnerabilities, not yet looked at |
| `npm test`                | 4 files, 50 tests, all passing                                                                                  |
| `npm run lint`            | Clean                                                                                                           |
| `npm run format:check`    | Fails on `src/pages/AboutPage.tsx`. On Windows with `core.autocrlf=true` it reports 47 files, all line endings  |
| `npm run build`           | Passes. Main chunk 612.79 kB, 190.87 kB gzipped, over Vite's 500 kB warning                                     |
| Playwright                | Connected to Kiro and working; used for the season replays on 2026-10-05                                        |
| Jolpica                   | Reachable. Season endpoints for results, sprint and qualifying page correctly. 4 requests a second, 500 an hour |
| Data workflow             | Failing. Runs #40, #41 and #42 failed in "Fetch season data"; the last success was #39 on 21 September          |
| Production                | Live, showing 14 of the 16 races 2026 has run                                                                   |
| Cloudflare Pages settings | Not in the repository. The owner will supply them (`docs/design.md`, open question 3)                           |

Also waiting for an owner decision, and untouched: the local branch `feat/elimination-label`, one unpushed commit of 17
February, "add eliminated label under red points", touching `DriverRow.tsx` and `palette.ts`; and the stash
`phase3-standings-table-wip` from 16 February.

## Standing constraints

- The five rules under "What has to stay true" in `AGENTS.md` hold in every increment.
- Never push to `main`. One branch and one pull request per increment, or per feature inside one. The owner merges.
- Anything merged to `main` is live within minutes and nothing checks it first, until increment 3's deploy gate lands.
  Every merge is a release.
- The data workflow commits to `main` every Monday at 06:00 UTC, so a branch that touches `data/` should expect
  conflicts in `data/2026.json`. Those runs also set the deadlines: 12 October after Singapore, 26 October after the
  United States Grand Prix, 7 December after the Final.
- From increment 1, golden tests pin every completed season. A change to one needs a decision record.
- An increment that changes the design updates `docs/design.md` in the same pull request.
- Anything that touches the interface is mobile first and meets WCAG 2.2 AA.
- `/review` runs before anything substantial merges.

## Increment 0: adopt the practice and write it down

### Delivers

- `AGENTS.md`, adapted from the agentic engineering bootstrap, with this project's non-negotiables.
- Five skills in `.kiro/skills/`: `project-docs`, `review` and `writing-code` from the bootstrap; `codebase-conventions`
  from the old development standards, corrected to the real stack; and `f1-rules`, new, with sources for every rule.
- `.kiro/steering/read-first.md`, a short always-on file, in place of `.kiro/steering/dev-standards.md`.
- `docs/design.md`, this plan, and decision records 0001 to 0005.
- `CHANGELOG.md` and `NOTICE.md`.
- `README.md` and `CONTRIBUTING.md` corrected where they contradicted the new documents.
- `PROJECT_FOUNDATION.md` deleted, with every claim in it accounted for in
  `docs/decisions/0002-adopt-bootstrap-practice.md`.

### Deliberately not

No change to `src/`, `scripts/`, `data/`, `.github/`, `package.json` or `package-lock.json`. None of the bugs the
documents describe is fixed. No rename. `docs/DEPLOYMENT.md` is left as it is for increment 3.

### Why this shape

The site already runs end to end, so there is no pipeline left to prove. What it lacks is a written rule set to build
against. Increments 1 and 2 each have a race-weekend deadline and change how eliminations and ties work, so the rules
and their sources come first.

### How you know it worked

- In a new Kiro session opened on the repository after the merge, asking what rules apply returns the five
  non-negotiables from `AGENTS.md`.
- Typing `/` in that session lists `review`, `project-docs`, `writing-code`, `codebase-conventions` and `f1-rules`.
- Asking what shape a delivery plan entry takes returns the six fields from the `project-docs` skill.
- `git diff --stat main` on this branch lists no file under `src/`, `scripts/`, `data/` or `.github/`, and neither
  `package.json` nor `package-lock.json`.
- Searching the repository for `PROJECT_FOUNDATION` and `dev-standards` finds only historical mentions, in
  `CHANGELOG.md`, this plan, the decision records and the line in the `codebase-conventions` skill that says where its
  rules came from.

### Needs from you

- Review and merge the pull request.
- Answer the four tie sub-questions and the calendar proposal in `docs/design.md` before increment 2 starts.
- Decide what happens to `feat/elimination-label` and the stash.

### Done, 2026-10-05

Observed: the documents and skills above were written on the branch `docs/adopt-bootstrap`. The 50 tests still pass, as
nothing under `src/` changed. Facts in the documents were checked on the day: the FIA regulations for 2020 to 2026 by
reading the PDFs; Jolpica by its documentation and by read-only requests to the season endpoints; the engine by running
it over the bundled seasons; the status line and the mid-round bug by replaying 2025 at 16, 17, 18 and 19 races with
Playwright.

Deviated: a short always-on steering file stayed, because a workflow step session on 2026-10-05 received steering and no
skills. `NOTICE.md` came in, because the copyright holder in this repository's `LICENSE` differs from the bootstrap's.
The replay technique in the `review` skill fetches the season file without its `?import` query string, because a plain
`route.fetch()` returns Vite's JavaScript module rather than JSON.

Still unverified: whether skills register in workflow step sessions once they exist on `main`; the Cloudflare Pages
settings; whether a 429 from Jolpica carries `Retry-After`; everything marked inferred in `docs/design.md`.

Review, completed by the apply-findings step:

- Reviewers and their mandates: to be filled in.
- Findings at each severity, blocking, should fix and note: to be filled in.
- Accepted: to be filled in.
- Rejected, with the reasons: to be filled in.

## Increment 1: ready for Singapore

Merged and deployed before the data run on Monday 2026-10-12 at 06:00 UTC. The Singapore Grand Prix on Sunday 11 October
is round 17 of 23, a sprint weekend, and the first race of Round 1.

### Delivers

The data pipeline:

- Fetching through Jolpica's season-level paged endpoints in place of three requests per race, with results merged by
  round, because a race can straddle two pages.
- Retries with backoff, honouring `Retry-After` when Jolpica sends it.
- Errors on the qualifying and sprint fetches reported instead of swallowed.
- Validation before anything is written: every completed sprint weekend has sprint results, the rounds run without gaps,
  the new file has no fewer completed races than the one it replaces, and each race has a plausible number of results.
- When validation fails, nothing is written, the job fails, and a GitHub issue is opened or updated with the reason.
- Least-privilege permissions for the workflow: `contents: write` and `issues: write`.
- `actions/checkout` and `actions/setup-node` moved from v4, which runs on the deprecated Node 20, to their Node 24
  majors, with the current versions checked at the time.
- The runner image pinned through the playoffs, because `ubuntu-latest` moves to Ubuntu 26 from 19 October 2026.
- A concurrency group, and a second Monday run as a retry if it proves worth having.

The playoff display:

- The engine stops marking eliminations in an unfinished round and reports the drop zone instead
  (`docs/decisions/0003-drop-zone-until-round-complete.md`).
- "Eliminated Round N" banners, red points and elimination chips only for completed rounds.
- The status line fixed for every stage listed in `docs/design.md`.
- The "Did Not Advance" banner shown from the end of the regular season.

Tests and data:

- Golden regression tests pinning every completed season's outcome, meaning its qualifiers, each round's eliminations
  and its champion, written and passing before the engine changes.
- `data/2026.json` refreshed to 16 races in the same branch.

### Deliberately not

Tiebreak changes, the calendar lock, team colours and the rename.

### Why this shape

Two faults meet on 12 October. Without a working pipeline, Singapore never reaches the site. With the current engine,
the site would eliminate two drivers after one race of Round 1. Fixing either alone still ships a visible error. The
golden tests go first because the engine change must not move any completed season. The tie rule waits for increment 2:
the first real eliminations come only after 25 October, and the rule needs the owner's answers first.

### How you know it worked

- Named unit tests pass, among them one asserting that with one of a round's two races run, nobody is eliminated and the
  two drivers at the bottom are reported as at risk, and one asserting that validation rejects a season whose completed
  sprint weekend has no sprint results.
- A Playwright replay of 2026 at 14, 15 and 16 races shows two, then one, regular-season race left, and at 16 a
  completed regular season with Singapore named as the first playoff race and the "Did Not Advance" banner in place.
- A replay of 2025 cut at 16, 17, 18 and 19 races, where Round 1 is races 18 and 19: 16 shows one regular-season race
  left; 17 shows the regular season complete; 18 shows a drop zone and no eliminations; 19 shows Round 1's eliminations
  and names Round 2 as next.
- The golden tests pass unchanged.
- The new workflow runs successfully on GitHub's runners on the feature branch, dispatched by the owner.

### Needs from you

- Dispatching the workflow run on the feature branch.
- Approving the drop-zone wording.
- Merging before Monday 12 October at 06:00 UTC.
- A decision on adding a custom `User-Agent` to the script and the API client. Jolpica's documentation asks every client
  for one, and this was found on 2026-10-05, after the scope of this increment was agreed.

## Increment 2: rules you can defend

Shipped before the data run on Monday 2026-10-26 at 06:00 UTC. It follows the United States Grand Prix on 25 October,
which completes Round 1 and makes the first real eliminations of 2026.

### Delivers

- Countback over all classified positions per the FIA rule, then regular-season position, recorded in a new decision
  record that answers the sub-questions of `docs/decisions/0004-tiebreak-countback-then-regular-season.md`.
- Classified retirees keeping their positions, read from `positionText`. The bundled files do not hold `positionText`
  today, so 2020 to 2025 have to be fetched again, which the season endpoints from increment 1 make affordable. A
  re-fetch can also bring remapped status strings for the older seasons (`f1-rules` skill).
- Deterministic ordering everywhere: places inside elimination groups, finalist places 2 to 4, and the non-qualifiers.
- The calendar lock, recorded in a new decision record that settles the proposal in
  `docs/decisions/0005-lock-qualifiers-and-playoff-races.md`.
- Team colours for all 16 constructorIds in the 2020 to 2026 data, six of which fall back to grey today.
- The About page describing the tie rule exactly.

### Deliberately not

The rename, and the cleanup in increment 3.

### Why this shape

The data run of 26 October makes the first real eliminations, and a tie at the cut that day would be settled by sort
stability. The golden tests from increment 1 make every historical change this rule causes visible, so it can be listed
rather than slipped in.

### How you know it worked

- A test for each tie case passes: drivers level on points separated by a finish outside the top ten; drivers level on
  every count, separated by regular-season position; a classified retiree's position counting; finalist places 2 to 4;
  ties inside an elimination group.
- The golden file is updated on purpose, and every historical change is listed, season by season, in the decision
  record.
- No driver row in any season from 2020 to 2026 falls back to the grey team colour.

### Needs from you

- Answers to the four tie sub-questions and to the calendar proposal.
- The colours to use for the six missing constructorIds, or approval of the ones proposed.
- Merging before Monday 26 October at 06:00 UTC.

## Increment 3: cleanup

No race deadline. Lands before increment 4.

### Delivers

- Keyboard access. On 2026-10-05 Tab skipped the desktop Seasons trigger, a `div` with `tabIndex` -1, every driver row,
  a `TableRow` with an `onClick` and no `tabIndex`, role or `aria-expanded`, and the phase section headers. The menu
  also uses the deprecated `MenuListProps`, with an `aria-labelledby` pointing at an id that does not exist.
- A not-found route, and a guard so only supported years load. Today `/foo` shows "Failed to load NaN data: Jolpica API
  error: 400", and `/2019` makes the browser fetch the season from Jolpica one race at a time.
- The Inter font loaded, or no longer declared.
- Dead code removed: `@mui/icons-material`, `useRaceResults`, `extractDriversFromRaces`, `extractDriversFromStaticData`
  and `hasStaticData`, plus two more found on 2026-10-05, `DEFAULT_SEASON` and the OpenF1 settings
  (`OPENF1_API_BASE_URL` and `VITE_OPENF1_API_URL`).
- The DRY and magic-number fixes listed in the `codebase-conventions` skill.
- The Prettier failure in `src/pages/AboutPage.tsx`.
- Bundle size: the main chunk is 612.79 kB.
- A documentation refresh, including `docs/DEPLOYMENT.md`, which overlaps the design document and holds Cloudflare
  settings nobody has checked.
- The deploy gate from open question 2 in `docs/design.md`, with a decision record.
- The `hasSprintRace` bug: `static-data.ts` sets it true for rounds not yet run, because `undefined !== null`. Nothing
  reads it today.
- The driver-name column wrapping on desktop.

### Deliberately not

New features, rule changes, and the rename.

### Why this shape

None of it has a race deadline, and every item is a defect or a gap that already exists. It lands before the rename so
that the new vocabulary goes into tidy code, and so the deploy gate is in place before the relaunch (inferred ordering,
not agreed separately).

### How you know it worked

- A keyboard walk with Playwright reaches every control on the home, season and About pages in order, each with a
  visible focus ring, and Enter opens and closes a driver row.
- `/foo` and `/2019` show a not-found page and send no request to Jolpica.
- `npm run format:check` passes, the build prints no chunk-size warning, and ESLint is clean.
- A pull request with a failing test cannot reach production, however the gate is built.
- A search of `src/` for each removed name returns nothing.

### Needs from you

- The deploy-gate decision.
- The Cloudflare Pages settings.
- If the gate deploys from GitHub Actions, a Cloudflare API token scoped to this Pages project, stored as a GitHub
  secret.
- A decision on adding a `.gitattributes` that forces LF, so Windows checkouts stop failing `npm run format:check`.
  Spotted on 2026-10-05 and not part of the agreed list.

## Increment 4: rename and relaunch

Timed for the Final, the Abu Dhabi Grand Prix on Sunday 2026-12-06.

### Delivers

- The name and vocabulary decision, with a decision record (`docs/design.md`, open question 1).
- The new domain, the repository renamed, the Cloudflare project to match, and a redirect from grandprixplayoffs.com.
- Meta tags without the NASCAR comparison.
- Code vocabulary brought into line with the naming rule in the `writing-code` skill.
- A relaunch timed for the Final.

### Deliberately not

Rule changes and new features.

### Why this shape

Antonelli leads the official standings by 84 points with seven races left, so the real title may be settled before Abu
Dhabi. That would make this project's Final the only live title fight of the weekend, which is the moment a new name has
the most to show.

### How you know it worked

- The new domain serves the site over HTTPS, and grandprixplayoffs.com redirects to it.
- The title, meta description and About page use the new name and words, and a search of `index.html` and `src/` finds
  no "NASCAR".
- The old repository address on GitHub leads to the renamed one.

### Needs from you

- The name.
- Registering the domain, and access to the registrar and to Cloudflare.
- Renaming the repository and the Cloudflare project.
- Whatever announcement goes with the relaunch.
