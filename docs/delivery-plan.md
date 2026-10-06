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
| Data workflow             | Failing. Runs #35, #40, #41 and manual run #42 failed in "Fetch season data"; last success #39, 21 September    |
| Production                | Live, showing 14 of the 16 races 2026 has run                                                                   |
| Cloudflare Pages settings | Not in the repository. The owner will supply them (`docs/design.md`, open question 3)                           |

Also waiting for an owner decision, and untouched: the local branch `feat/elimination-label`, one unpushed commit of 17
February, "add eliminated label under red points", touching `DriverRow.tsx` and `palette.ts`; and the stash
`phase3-standings-table-wip` from 16 February.

## Standing constraints

- The five rules under "What has to stay true" in `AGENTS.md` hold in every increment.
- Never push to `main`. One feature branch per increment, in the main checkout, no worktree. The owner reviews the
  branch in the editor and merges it locally. No pull requests: this is a solo project.
- Anything merged to `main` is live within minutes. From increment 1 a check runs on every branch push and the data
  workflow runs the tests and the build before it commits, but nothing stops a merge until increment 3's deploy gate
  lands. Every merge is a release.
- The data workflow commits to `main` every Monday at 06:00 UTC, so a branch that touches `data/` should expect
  conflicts in `data/2026.json`. Those runs also set the deadlines: 12 October after Singapore, 26 October after the
  United States Grand Prix, 7 December after the Final.
- From increment 1, golden tests pin every completed season. A change to one needs a decision record.
- An increment that changes the design updates `docs/design.md` on the same branch.
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

- Review the `docs/adopt-bootstrap` branch in the editor and merge it locally.
- Answer the four tie sub-questions and the calendar proposal in `docs/design.md` before increment 2 starts.
- Decide what happens to `feat/elimination-label` and the stash before increment 1 starts. The branch's one commit
  changes `DriverRow.tsx` and `palette.ts`, which draw the red elimination points that increment 1 changes, and the
  stash changes `src/hooks/usePlayoffData.ts`, `src/pages/HomePage.tsx` and `src/components/standings/index.ts`.

### Done, 2026-10-05

Observed: the documents and skills above were written on the branch `docs/adopt-bootstrap`. The 50 tests still pass, as
nothing under `src/` changed. Facts in the documents were checked on the day: the FIA regulations for 2020 to 2026 by
reading the PDFs; Jolpica by its documentation and by read-only requests to the season endpoints; the engine by running
it over the bundled seasons; the status line and the mid-round bug by replaying 2025 at 16, 17, 18 and 19 races with
Playwright. After the review, `npm test`, `npm run lint`, `npm run build` and the Prettier check were run again and
printed what the prerequisites table says.

Deviated: a short always-on steering file stayed, because a workflow step session on 2026-10-05 received steering and no
skills. `NOTICE.md` came in, because the copyright holder in this repository's `LICENSE` differs from the bootstrap's.
The replay technique in the `review` skill fetches the season file without its `?import` query string, because a plain
`route.fetch()` returns Vite's JavaScript module rather than JSON.

Still unverified: whether skills register in workflow step sessions once they exist on `main`; the Cloudflare Pages
settings; whether a 429 from Jolpica carries `Retry-After`; whether 2024, 2025 or 2026 Section A has a later FIA issue,
since the FIA's index timed out; everything marked inferred in `docs/design.md`.

Review, on 2026-10-05. Five reviewers ran in parallel, each against its own source:

- Against the code: every claim about today's behaviour, checked in `src/`, `scripts/` and `.github/`. 2 findings.
- Against the source: the FIA regulations, Jolpica's documentation and the live API. 5 findings.
- Red team: this plan against `docs/design.md` and the 2026 calendar. 17 findings.
- Do it: increment 1's paging and the season replay, carried out rather than read. 1 finding.
- Cold read: the files read as an agent starting increment 1 would read them. 8 findings.

That is 33 findings. By the reviewers' own labels 6 were blocking, 9 should fix and 12 notes; the source and do-it
reviewers labelled none of their 6. Each was checked against the file it concerns before anything changed.

Accepted and applied, 19:

- `f1-rules`: the final FIA issue for each season, with the cited articles read again in them; `position` and `points`
  arrive from Jolpica as strings; the status enumeration has eight values, five of them in the bundled 2025 file; the
  2026 countback has no step after the qualifying count.
- `docs/design.md` and `0004`: counting only classified positions marked as our reading, and the 2026 text's missing last
  step; the design names the new fetch that Option A needs.
- This plan: the run history matches the design and the GitHub run list; increment 1's merge order; the refresh keeps
  today's classification on purpose; the replay technique named; an accessibility check for the at-risk marking; where
  a dispatched test run commits; a decision on the fallback if the 429s continue; increment 2's re-fetch counted at about
  73 requests; increment 2 waits on the owner's answers; the branch and stash decided before increment 1.
- `AGENTS.md`: a workflow working in a worktree names this file and the worktree in every step's prompt.
- `read-first.md`: the worktree rule first, and `review` named for replays. `codebase-conventions`: golden tests pin a
  baseline that sort stability decided in places, and a pointer to the replay technique.

Put to the owner, 4. The orchestrator answered on the owner's behalf on 2026-10-05, and the owner can overrule any of it:

- The drop zone ordered by sort stability until increment 2 (red team, blocking): regular-season position becomes its
  last key in increment 1, for 2026 only. `0003`, `0004` and increment 1 updated.
- The calendar lock not enforced during Round 1 (red team, blocking): no lock yet, but increment 1's validation refuses a
  changed calendar. `0005`, `docs/design.md` and increment 1 updated.
- Both deadline increments ship unchecked (red team, should fix): the data workflow runs the tests and the build before
  it commits, and a branch check runs the same, both in increment 1. The deploy gate stays in increment 3.
- Increment 1 overloaded (red team, should fix): declined. The permissions, the failure issue and the runner pin stay,
  with the issue step behind `if: failure()`.

Noted for the owner with no change, 1: the owner is the only person who merges, dispatches and decides (red team). A
delegate is the owner's to name.

Rejected, 9:

- The health lines were not re-run by the code reviewer. They are dated observations, not claims to fix, and run again
  after the review they still hold.
- The trigger is 17 races, not 16. "Why this shape" in increment 1 already puts the danger at the 12 October run, after
  one race of Round 1; by the reviewer's own account the 16-race framing came from its brief.
- Decide the `User-Agent` before the run. It is already in increment 1's Needs from you, which come before the merge,
  and Jolpica's limits are per IP address or token, so the header is not part of the 429 fix (inferred).
- Jolpica is the only source. The design already covers an outage: the last good file stays and the job fails. No
  second source has existed since February, so removing the OpenF1 settings removes no fallback.
- The rename is dated before the name is chosen. Increment 4 makes the name its first deliverable and its first Needs
  from you, and nothing before it depends on the name.
- Keep the replay fetch without its query string. The `review` skill already does, and "Deviated" above says why.
- Give `project-docs` a reading trigger. `AGENTS.md` already says `docs/design.md` holds the rules, and the skill is
  about writing the documents, so loading it would not supply a rule.
- Status-line wording that avoids a countdown. The design's target already says the regular season is complete where
  today's site says "0 races until playoffs".
- Say in `f1-rules` that the bundled 2026 file is stale. The design says the site shows 14 races and Jolpica 16, the plan
  holds the refresh, and the skill's first line keeps it to F1's rules and Jolpica's data.

Found while confirming, and not one of the 33: the sort-stability tables in `docs/design.md` and `0004` gave one
eliminated driver for 2020 and for 2022, where three drivers were level in each. Both corrected, with the date.

Correction, 2026-10-06: this increment-0 run used a git worktree and assumed pull requests, and the owner wanted
neither. The worktree was removed, the branch checked out in the main checkout, and the Git rules in `AGENTS.md` and
`.kiro/steering/read-first.md` rewritten to say the work goes on a feature branch in the main checkout with no worktree
and no pull request. The two entries above that credited a worktree note to `AGENTS.md` and `read-first.md` are
superseded by that rewrite. The "pull request" references through this plan and `docs/design.md` became branch pushes
and local merges in the same pass.

## Increment 1: ready for Singapore

Merged and deployed before the data run on Monday 2026-10-12 at 06:00 UTC. The Singapore Grand Prix on Sunday 11 October
is round 17 of 23, a sprint weekend, and the first race of Round 1.

On 2026-10-05, answering the review, the orchestrator added four things to this increment: regular-season position as
the drop zone's last key, the calendar guard, the tests and the build inside the data workflow, and the branch check.
It also kept the workflow hardening here rather than in a follow-up. The owner can overrule any of it at review.

### Delivers

The data pipeline:

- Fetching through Jolpica's season-level paged endpoints in place of three requests per race, with results merged by
  round, because a race can straddle two pages.
- Retries with backoff, honouring `Retry-After` when Jolpica sends it.
- Errors on the qualifying and sprint fetches reported instead of swallowed.
- Validation before anything is written: every completed sprint weekend has sprint results, the rounds run without gaps,
  the new file has no fewer completed races than the one it replaces, and each race has a plausible number of results.
- A calendar guard in that validation. Once the stored file shows the regular season complete, a fetched calendar whose
  structure differs from the stored one fails: a different number of rounds, or a different date or `circuitId` for
  any round. A change of name alone passes, because the 21 September data commit renamed the Qatar circuit from Losail
  to Lusail and kept `circuitId` `losail`. The site keeps its last good data until the owner decides what the change
  means (`docs/decisions/0005-lock-qualifiers-and-playoff-races.md`).
- `npm ci`, `npm test` and `npm run build` run against the fetched data before anything is committed. A push made with
  `GITHUB_TOKEN` starts no other workflow ([GitHub docs][gh-token]), so a separate check would never see the bot's
  commits.
- When validation or those checks fail, nothing is written, the job fails, and a GitHub issue is opened or updated with
  the reason. The issue step runs only after a failure (`if: failure()`), so it cannot affect the fetch.
- Least-privilege permissions for the workflow: `contents: write` and `issues: write`.
- `actions/checkout` and `actions/setup-node` moved from v4, which runs on the deprecated Node 20, to their Node 24
  majors, with the current versions checked at the time.
- The runner image pinned through the playoffs, because `ubuntu-latest` moves to Ubuntu 26 gradually between 19 October
  and 19 November 2026 ([GitHub changelog, 17 September 2026][ubuntu26]), starting in the middle of Round 1.
- A concurrency group, and a second Monday run as a retry if you want one (see Needs from you).

Branch checks (no pull requests, so these run on branch pushes):

- A workflow that runs `npm run lint`, `npm run format:check`, `npm test` and `npm run build` on every push to a branch
  other than `main`, so the result is visible before the owner merges locally.
- The Prettier failure in `src/pages/AboutPage.tsx` fixed, so the format check passes.

The playoff display:

- The engine stops marking eliminations in an unfinished round and reports the drop zone instead
  (`docs/decisions/0003-drop-zone-until-round-complete.md`).
- Regular-season position as the comparator's last key, after today's top-ten count, for 2026 only: the drop zone, and
  any 2026 round that completes before increment 2 lands. Completed seasons keep today's ordering until increment 2
  changes them all at once (`docs/decisions/0004-tiebreak-countback-then-regular-season.md`).
- "Eliminated Round N" banners, red points and elimination chips only for completed rounds.
- The status line fixed for every stage listed in `docs/design.md`.
- The "Did Not Advance" banner shown from the end of the regular season.

Tests and data:

- Golden regression tests pinning every completed season's outcome, meaning its qualifiers, each round's eliminations
  and its champion, written and passing before the engine changes.
- `data/2026.json` refreshed to 16 races in the same branch, keeping today's status-based positions on purpose. Reading
  classification from `positionText` belongs to increment 2, because it changes completed seasons.

### Deliberately not

The full tie rule, and any change to the order of a completed season. The calendar lock itself: this increment only
refuses a changed calendar. Classification from `positionText`. Branch protection and the deploy gate, which interact
with the data workflow's pushes to `main` and need settings only the owner can change. Team colours and the rename.

### Why this shape

Two faults meet on 12 October. Without a working pipeline, Singapore never reaches the site. With the current engine,
the site would eliminate two drivers after one race of Round 1. Fixing either alone still ships a visible error. So the
engine and display changes and the refreshed data deploy together, and the pipeline change merges with them or after
them, never before: a working pipeline on its own would put Singapore on a display that still eliminates after one race.

The golden tests go first because the engine change must not move any completed season. The full tie rule waits for
increment 2, because it needs the owner's answers and moves completed seasons. The drop zone cannot wait for it. From
the 12 October run it ranks drivers on the live site, after one race several of them can be level, and today's code
would leave their order to sort stability. Regular-season position as the last key, for 2026 alone, keeps that order
deterministic without touching a completed season, so the golden tests stay unchanged and no past season changes twice.

### How you know it worked

- Named unit tests pass, among them one asserting that with one of a round's two races run, nobody is eliminated and the
  two drivers at the bottom are reported as at risk; one asserting that two 2026 drivers level on points and on top-ten
  finishes are ordered by regular-season position; one asserting that validation rejects a season whose completed
  sprint weekend has no sprint results; and one asserting that, once the regular season is complete, a calendar with a
  changed date fails validation while a renamed circuit passes.
- A Playwright replay of 2026 at 14, 15 and 16 races shows two, then one, regular-season race left, and at 16 a
  completed regular season with Singapore named as the first playoff race and the "Did Not Advance" banner in place.
  The replay technique is in the `review` skill.
- A replay of 2025 cut at 16, 17, 18 and 19 races, where Round 1 is races 18 and 19: 16 shows one regular-season race
  left; 17 shows the regular season complete; 18 shows a drop zone and no eliminations; 19 shows Round 1's eliminations
  and names Round 2 as next.
- At each replay cut the accessibility tree names the at-risk drivers in words with no driver row expanded, because Tab
  cannot reach a row until increment 3.
- The golden tests pass unchanged.
- The new workflow runs successfully on GitHub's runners on the feature branch, dispatched by the owner, with its test
  and build steps passing before the commit step. Run that way it pushes to the feature branch, as today's plain
  `git push` would, never to `main`, and it commits nothing when the data has not changed.
- The branch check for this increment passes on its last push before the owner merges.

### Needs from you

- Dispatching the workflow run on the feature branch.
- Approving the drop-zone wording.
- Merging before Monday 12 October at 06:00 UTC.
- A decision on adding a custom `User-Agent` to the script and the API client. Jolpica's documentation asks every client
  for one, and this was found on 2026-10-05, after the scope of this increment was agreed.
- A decision, before 12 October, on the fallback if the fixed run still gets a 429: the second Monday run above, a run
  of the script from your machine as on 5 October, or both. That the 429s come from the hourly allowance shared on
  GitHub's runner addresses is inferred (`docs/design.md`, "Data").

## Increment 2: rules you can defend

Shipped before the data run on Monday 2026-10-26 at 06:00 UTC. It follows the United States Grand Prix on 25 October,
which completes Round 1 and makes the first real eliminations of 2026.

### Delivers

- Countback over every classified position, as sub-question 2 proposes, then regular-season position, recorded in a new
  decision record that answers the sub-questions of `docs/decisions/0004-tiebreak-countback-then-regular-season.md`.
  It applies to every season at once and replaces increment 1's interim key for 2026.
- Classified retirees keeping their positions, read from `positionText`. The bundled files do not hold `positionText`
  today, so 2020 to 2025 have to be fetched again. Through increment 1's season endpoints, at 100 results a page for
  results, sprints and qualifying plus one schedule request a season, that is about 73 requests, where today's three
  requests a race would take about 400 (counted from the bundled files on 2026-10-05). A re-fetch can also bring
  remapped status strings for the older seasons (`f1-rules` skill).
- Deterministic ordering everywhere: places inside elimination groups, finalist places 2 to 4, and the non-qualifiers.
- The calendar lock, recorded in a new decision record that settles the proposal in
  `docs/decisions/0005-lock-qualifiers-and-playoff-races.md`.
- Team colours for all 16 constructorIds in the 2020 to 2026 data, six of which fall back to grey today.
- The About page describing the tie rule exactly.

### Deliberately not

The rename, and the cleanup in increment 3.

### Why this shape

The data run of 26 October makes the first real eliminations. Without this increment a tie at the cut that day is
settled by increment 1's interim key, the top-ten count and then regular-season position. That is deterministic, and it
is not the rule the About page promises. The golden tests from increment 1 make every historical change the full rule
causes visible, so it can be listed rather than slipped in.

### How you know it worked

- A test for each tie case passes: drivers level on points separated by a finish outside the top ten; drivers level on
  every count, separated by regular-season position; a classified retiree's position counting; finalist places 2 to 4;
  ties inside an elimination group.
- The golden file is updated on purpose, and every historical change is listed, season by season, in the decision
  record.
- No driver row in any season from 2020 to 2026 falls back to the grey team colour.

### Needs from you

- Answers to the four tie sub-questions and to the calendar proposal. This increment cannot start without them, so the
  day they arrive decides whether it can merge before 26 October.
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
- Bundle size: the main chunk is 612.79 kB.
- A documentation refresh, including `docs/DEPLOYMENT.md`, which overlaps the design document and holds Cloudflare
  settings nobody has checked.
- The deploy gate from open question 2 in `docs/design.md`, with a decision record. Increment 1's branch check is what
  it would enforce. With no pull requests, gating means a deploy path that runs the checks before `main` goes live,
  rather than branch protection on a pull request.
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
- A commit with a failing test cannot reach production, however the gate is built.
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

[gh-token]: https://docs.github.com/en/actions/concepts/security/github_token
[ubuntu26]: https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration/
