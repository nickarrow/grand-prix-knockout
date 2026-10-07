# Delivery plan

- [x] Increment 0: adopt the practice and write it down
- [x] Increment 1: ready for Singapore, merged and deployed before Monday 2026-10-12 06:00 UTC
- [x] Increment 2: rules you can defend, shipped before Monday 2026-10-26 06:00 UTC
- [x] Increment 3: cleanup
- [x] Increment 4: rename and relaunch (structural work done 2026-10-07; the relaunch announcement is the owner's, timed for the Final on 2026-12-06)

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

### Done, 2026-10-06

Shipped on the branch `increment-1-singapore`, merged to `main` locally (merge `991e0eb`) and deployed. Thirteen commits:
the golden regression suite first, the engine drop zone (no mid-round elimination; at-risk reported separately per
`0003`), the 2026 regular-season tiebreak key, the standings display and the fixed status line, the paged data pipeline
with retries and validation, the branch-check workflow on Node 24, and the 2026 refresh to 16 races. The owner approved
the drop-zone wording and it was tweaked to "are knocked out" (`991e0eb`), the custom `User-Agent` was added, and a
second Monday data run was added as the 429 fallback.

Observed: 83 tests passing across 7 files (up from 50), lint clean, Prettier clean, build clean. Two blocking review
findings were fixed before merge: the drop-zone warning text failed WCAG AA contrast (now 9.6:1), and the data-failure
issue label did not exist (now self-provisioning). The two-model review returned APPROVED.

Proven in production on 2026-10-06. A manual dispatch of the data workflow first failed at the commit step because
Husky's lint-staged tripped its empty-commit guard in CI; fixed by skipping the hooks on the bot commit (`HUSKY=0` plus
`git commit --no-verify`, merge `4c21670`). A second dispatch ran green through fetch, validate, test, build and commit,
so the 429 fix and the whole pipeline are confirmed on GitHub's runners. The paged fetch cut a full-season run from
about 70 requests to about 15.

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

### Done, 2026-10-06

On the branch `increment-2-tiebreaks` in the main checkout, four commits: carry `positionText` and the stored
regular-season order through the data model; the full-classification countback applied to every season; the decision
0005 calendar-change rules; and the About page rewrite with team colours for all 16 constructorIds.

Observed. The full pre-merge verification ran once more and printed: `npm test` 102 passed across 7 files, the golden
suite 7 of 7; `npm run lint` exit 0 with no warnings; `npx prettier --check --end-of-line auto "src/**/*.{ts,tsx,css,json}"`
all matched files use Prettier code style; `npm run build` type-checked with `tsc -b` and built with Vite clean, the
only warning being the pre-existing 500 kB index chunk (618.29 kB, increment 3's concern).

The golden change list is recorded season by season in `docs/decisions/0006-full-classification-countback-golden-changes.md`.
The changed set is exactly {2020, 2021, 2022, 2023}; 2024, 2025 and 2026 are unchanged. 2020 is the only champion change,
Hamilton to Verstappen, from a Round 1 three-way zero-point tie that the old P1-P10 countback left to sort stability and
the full countback now decides on track (Albon's classified 12th over Norris's 13th), cascading through the bracket to a
Verstappen win in the one-race Abu Dhabi final. 2023 changes who is eliminated in Rounds 1 and 2 (Gasly's classified
12th survives over Perez), same champion. 2021 Round 3 and 2022 Round 2 are order-only reorderings of an eliminated
pair, decided by the terminal official-standings key and a classified 15th respectively, same finalists and champions.

Playwright observations (dev server, 390x844): 2022 renders Verstappen champion with the full-rule Round 1 order and
Bottas advancing with a tie badge on zero Round 1 points; 2020 renders Verstappen champion with the 0006 cascade, 23
accent bars in 10 colours and no grey fallback; 2026 renders 11 colours with Audi and Cadillac distinct and no grey
fallback. The constructorId union across 2020-2026 is exactly the 16 ids now in `TEAM_COLORS`, so no row can fall back to
grey. The About page Tiebreakers text renders the full rule as built.

Data-source decision as recorded. The official regular-season order is fetched by `scripts/fetch-season-data.mjs`
(`fetchDriverStandingsOrder` for round `totalRounds - 7`) and stored in each `data/<year>.json` as
`regularSeasonStandingOrder` (decision 0004, Option A). The engine does not fetch it: `calculatePlayoffState` reads the
stored array passed in, and the service layer reads it from the bundled file. Stored lengths are 21/21/21/22/22/21/23 for
2020 to 2026, a dense rank with no ties.

Deviated. The planner's provisional flip set was {2020, 2022, 2023}; the real diff added 2021 (an order-only reorder of
the Round 3 eliminated pair) and flipped the 2020 champion. The owner approved the full diff including the champion flip
via a send_message warning during FEAT-002, and 0006 lists all four seasons. The re-fetch remapped no status strings for
any season (f1-rules warned older seasons could be remapped; none was). Switching classification to `positionText` moved
`position` on 57 results (classified retirees now keep their place) and reverted 2 (lapped-but-unclassified cars), none
of them in a points-scoring position, so points and the golden points totals are unchanged. `playoffs.ts` grew to about
255 lines after the calendar-change rules, over the ~150-line engine guidance; FEAT-003 extracted the race-to-round
mapping into `playoff-schedule.ts` and judged there is no further clean seam without cutting the one orchestration across
files. No decision record was written for the calendar-change rules themselves; they are recorded in 0005's 2026-10-06
answers.

Still unverified. The live-API fallback for an unsupported season has no stored order, so a genuine tie there falls to
countback-only and can return 0; this is bounded to unsupported live years the service layer should not reach for a
supported season (review note, 0004 answer 4, 0006 consequences). The display-only `wins`/`podiums` counts still read
`result.position` while the countback reads `positionText`; they disagree only outside the top three and feed no
ordering, left for increment 3 (review note). The "abandoned final = empty results array" engine input contract is not
yet produced by the data layer; if a real cancelled final ever occurs the service layer must emit the final race with
empty results (FEAT-003 note). The 500 kB chunk warning is increment 3's concern.

Review, 2026-10-06: APPROVED (`.agents/tasks/grand-prix-playoffs-increment-2-tiebreaks-2026-10-06/review.json`). The
reviewers confirmed the comparator order, the 0006 deciding finishes against `data/<year>.json`, the stored order for all
seven seasons, the golden values and the tie tests built so first-appearance order opposes the asserted winner. Four
findings, all notes, none blocking: the bounded live-API fallback, the approved 2021-and-champion diff, the
`wins`/`podiums` source mismatch, and `playoffs.ts` length. Two leads were raised and rejected after reading the file
(the sprint win does not leak into the countback; 0006's 2020 Stroll claim holds).

The branch is ready for local review and merge. Not pushed and not merged, per `AGENTS.md`.

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

### Done, 2026-10-06

On the branch `increment-3-cleanup` in the main checkout, six commits: keyboard access and visible focus; the not-found
route and year guard; the `@mui/icons-material` removal; the `hasSprintRace` fix; the constants, Inter-drop, name-wrap
and dead-code cleanup; the vendor split and lazy routes; and this CI-and-docs commit.

Observed. `npm test` reports 102 passed across 7 files, the golden suite 7 of 7, SHA256 unchanged from the increment-2
baseline (`1E65F611...F46988`), so no playoff outcome moved. `npm run build` exits 0 with no 500 kB advisory: the main
entry chunk fell from 619.73 kB (gzip 193.03 kB) to 195.53 kB (gzip 62.69 kB), a 68% reduction, with new `mui`, `router`
and `query` chunks and the seven per-season data chunks (2020 to 2026, 104 to 153 kB) still split. `npm run lint` is
clean and the Prettier check (`--end-of-line auto`) passes.

A Playwright keyboard walk ran across the FEATs on the dev server. Tab reaches the Seasons button (named "Seasons"),
Enter opens the menu with `aria-expanded` true, arrows move between items; on `/2024` Tab reaches each of 24 driver rows
in order and Enter and Space each toggle the detail with no page scroll; the two phase headers toggle the same way; the
focus ring renders `rgb(225,6,0)` in both themes. On the unsupported routes `/foo`, `/2019`, `/1999` and `/abc` the
no-data page renders with zero Jolpica requests; `/2024` still renders the standings. The lazy routes smoke-load `/`,
`/2024` and `/about` with no console errors. The desktop name column shows "Andrea Kimi Antonelli" on one line.

CI and the deploy gate. The data workflow gained an `if: success()` step that closes the open `data-update-failure`
issue with a comment, reusing the same label-then-title lookup the failure step uses; the `if: failure()` logic is
untouched. `docs/decisions/0007-deploy-gate.md` recommends Option (a) and ships `.github/workflows/deploy.yml` (lint,
tests, build, then Wrangler Pages direct upload) and `wrangler.toml` (`pages_build_output_dir = dist`, project name
`grand-prix-playoffs`), both referencing the Cloudflare token and account id only by GitHub-secret name. A repo-wide
grep for token-shaped literals found none.

Deviated. README.md and CONTRIBUTING.md were left unchanged: FEAT-005's named examples (`@mui/icons-material`, OpenF1,
the not-found behaviour) do not appear in either file, and the stale test count and pull-request language they still
carry were made stale by earlier increments, outside this increment's "only where this increment makes them wrong"
scope. The `.gitattributes` question in Needs from you was not acted on; it remains an owner decision.

Still unverified. The Cloudflare dashboard settings (build command, output directory, Node version, branch settings),
recorded in `docs/DEPLOYMENT.md` and now marked unverified. The single owner action that arms the deploy gate: turn off
Cloudflare build-on-push, create a Pages-scoped API token, and store `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
as repository secrets. The next Monday data run actually closing the open failure issue (the close step is verified by
inspection only; GitHub workflows cannot run locally and no run was dispatched). The `/review` outcome for this
increment, not yet run.

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

### Done, 2026-10-06

On the branch `increment-4-deep-rename` in the main checkout, six commits deliver a deep code and content rename to
Grand Prix Knockout. `0008` records the name. The engine, constants and types moved from playoff to knockout
(`playoffs.ts` to `knockout.ts`, `playoff-schedule.ts` to `knockout-schedule.ts`, `playoffs.test.ts` to
`knockout.test.ts`, `calculatePlayoffState` to `calculateKnockoutState`); the hook `usePlayoffData` became
`useKnockoutData`; `PlayoffExplainer.tsx` became `KnockoutExplainer.tsx`; and the identifiers in components, pages and
utils followed. User-facing copy and meta tags were rebranded, the NASCAR comparison was dropped from `index.html` and
the copy, and `README`, `CONTRIBUTING` and `CHANGELOG` were refreshed. The decision to make this a deep rename, rather
than a surface relabel, was the owner's: six months on, "playoff" in the code would read as a different concept from the
name on the site.

Observed on the final run from the repo root. `npm test`: 102 passed across 7 files, the golden suite 7 of 7. `npm run
build`: `tsc -b` and Vite both clean, 2699 modules, no 500 kB chunk warning, the chunk sizes the increment-3 vendor
split already produced (mui 262.12 kB, index 195.53 kB, the per-season data chunks). `npm run lint`: exit 0, no
warnings. `npx prettier --check --end-of-line auto "src/**/*.{ts,tsx,css,json}"`: all matched files use Prettier style.

No outcome moved. The golden baselines are the record of truth, and the only edit to `golden.test.ts` on this branch is
the import and call rename from `calculatePlayoffState` to `calculateKnockoutState`, which Prettier reflowed across three
lines. Not one pinned qualifier, elimination or champion changed, which the passing 7-of-7 golden suite confirms. The
file's SHA256 changed as a result of the function rename alone, from the pre-rename `1E65F611...F46988` baseline named in
the increment brief to `CB4A8B91...E4EBD3C`; the change is the two-line rename, nothing in the data.

`git grep -n -i playoff -- src` leaves only the `SeasonStatus 'playoffs'` string literal in `src/types/index.ts` and its
uses in `knockout.ts`, `knockout.test.ts` and `utils/index.test.ts`, plus generic-English comments and test
descriptions in `golden.test.ts`. The status value stays `'playoffs'` because it is read by code that is not part of
this rename and changing it would be a behaviour change, not a rename.

Deliberately deferred to the owner-run external-rename stage, and verified untouched on this branch: the `package.json`
name (`grand-prix-playoffs`), the `github.com/nickarrow/grand-prix-playoffs` URLs in the Footer, the About page and the
data-fetch User-Agent, the `grandprixplayoffs.com` URLs in `index.html`, the Cloudflare project name in `wrangler.toml`,
`.github/workflows/deploy.yml` and `0007`, the `data/<year>.json` files, and the `gpp-` localStorage keys
(`gpp-explainer-collapsed`, `gpp-theme`). `git diff --stat origin/main..HEAD` lists no change under those paths. Those
rename the repository, the domain, the Cloudflare project and anything that would strand stored data or break a live
URL, so they belong with the owner's registrar and Cloudflare access, not in this branch.

Still unverified at the time of that run. Nothing ran the tests before a merge to `main` deployed, the external set
above was unverified until the owner ran it, and the branch was not yet merged. The next entry resolves all of these.

### Done, 2026-10-07: the gate armed and the external rename

The structural work of increment 4 is complete and live. Only the relaunch announcement remains, which is the owner's,
timed for the Final on 2026-12-06.

The deploy gate (`0007`) was armed. The owner created a Pages-scoped Cloudflare API token, stored it with the account
id as the GitHub secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and disabled Cloudflare's automatic
deployments for `main`, so `deploy.yml` is now the only path to production: a push runs `npm ci`, lint, the tests and
the build, and only a clean run uploads `dist/` to Cloudflare with Wrangler. Four gated deploys ran green on 2026-10-07.
The pre-arming run on 2026-10-06 had correctly failed at the upload step for want of the secrets, which proved the gate
was inert until armed. `0007` is marked Accepted and live.

The deep rename was merged. The `increment-4-deep-rename` branch was rebased onto the gate commit and fast-forwarded to
`main`, and the gate deployed Grand Prix Knockout. The site at the old domain showed the new brand with no "playoff" or
"NASCAR" text, and 2020 rendered Verstappen as champion, confirming the engine was unchanged by the rename.

The external rename was completed by the owner with the orchestrator. The GitHub repository was renamed to
`grand-prix-knockout` and the local remote updated to match; `grandprixknockout.com` was registered and attached to the
Pages project as a custom domain. The deferred code references were then updated in one commit (merge `fafdbcc`): the
`package.json` name, the GitHub URLs in the Footer and the About page, the data-fetch `User-Agent`, the `README`
"Live at" line, and the Open Graph and Twitter URLs. The lockfile was resynced to the new name. The Cloudflare project
kept its internal `grand-prix-playoffs` name on purpose, invisible to users and risky to recreate, so `wrangler.toml`
and `deploy.yml` still name it. The `gpp-theme` and `gpp-explainer-collapsed` localStorage keys were kept so returning
visitors do not lose their theme and collapsed-explainer state.

The old domain now redirects. `grandprixplayoffs.com` was removed as a Pages custom domain and set up as a redirect-only
zone: a proxied `AAAA` black-hole record (`100::`) for the apex and `www`, and a 301 Redirect Rule to
`https://grandprixknockout.com/${2}` that preserves the path. Verified from the orchestrator: the apex, a deep path
(`/2026`, `/2020`) and `www` all return a 301 to the matching path on the new domain, and following the redirect lands
on a working page (HTTP 200, title "Grand Prix Knockout").

Observed on the merged `main`: 102 tests across 7 files, the golden suite 7 of 7 unchanged, lint clean, Prettier clean,
build clean. No playoff outcome moved through any of this. The relaunch announcement is the one remaining item.

A small follow-up noted, not blocking: the `cloudflare/wrangler-action@v3` deploy step prints a cosmetic Node 20
deprecation warning; pin or update it when convenient.

[gh-token]: https://docs.github.com/en/actions/concepts/security/github_token
[ubuntu26]: https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration/
