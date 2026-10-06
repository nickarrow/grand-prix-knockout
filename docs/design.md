# Grand Prix Knockout: design

Revised 2026-10-05. Decision records: `docs/decisions/`. Order of work: `docs/delivery-plan.md`.

**Current**: what the code does, confirmed by reading it or running it on 2026-10-05.

**Target**: what the owner has decided it must do. Where the code differs, both are given.

**Inferred**: not confirmed by anyone.

## What it is, and why

Grand Prix Knockout takes the official results of every Formula 1 Grand Prix and sprint and runs them through an
elimination format. The regular season's top ten go into the last seven races of the calendar, the field is cut in three
rounds, and the four who are left settle the title in the final race.

It rests on three principles, carried over from the February project notes and the About page:

- Merit. A place in the playoffs takes a season of points.
- Pressure. Every round is an elimination, so every race in it counts.
- Finality. The champion is decided at the last race of the year.

The About page calls it "a parallel universe, not a replacement", and the site shows each driver's official F1 points
beside its own standings.

The reason it exists: F1 titles are often settled with races to spare. The About page gives 2020, sealed in Turkey with
three races left, 2022 in Japan with four, and 2023 in Qatar with five. In 2026 Antonelli leads the official standings
by 84 points with seven races left (320 to Russell's 236 after round 16, verified against Jolpica on 2026-10-05).

## Who it is for

Fans who already follow F1, reading on a phone. The February notes say the primary audience views on phones; nobody has
checked that against the site's analytics (inferred).

The reader to write for is a regular on r/formula1: knows the sporting regulations well enough to spot a wrong
countback, and dislikes gimmicks and NASCAR comparisons. Every rule has to survive that reader.

## The format

### Season structure

Current, confirmed in `src/engine/playoffs.ts` and `src/constants/playoffs.ts`:

| Stage          | Races                  | Drivers                       |
| -------------- | ---------------------- | ----------------------------- |
| Regular season | All but the last seven | Everyone; the top ten qualify |
| Round 1        | Two                    | 10 to 8                       |
| Round 2        | Two                    | 8 to 6                        |
| Round 3        | Two                    | 6 to 4                        |
| Final          | One, the last race     | 4; most points in it wins     |

Qualification is by regular-season points. Points reset at the start of each round, and a round counts only its own
races.

The 2026 season on its 23-round calendar, from the live Jolpica schedule:

| Stage          | Rounds  | Races                                                               |
| -------------- | ------- | ------------------------------------------------------------------- |
| Regular season | 1 to 16 | 8 March to 4 October                                                |
| Round 1        | 17, 18  | Singapore, 11 October (a sprint weekend); United States, 25 October |
| Round 2        | 19, 20  | Mexico City, 1 November; Brazil, 8 November                         |
| Round 3        | 21, 22  | Las Vegas, 22 November; Qatar, 29 November                          |
| Final          | 23      | Abu Dhabi, 6 December                                               |

The 2026 regular season ended on 4 October. On Jolpica's data the qualifiers are Antonelli 320, Russell 236, Hamilton
214, Leclerc 191, Norris 188, Verstappen 188, Piastri 128, Hadjar 96, Lawson 65 and Gasly 41, with Lindblad eleventh
on 38. Verified by adding up the season's race and sprint results and comparing with Jolpica's official standings after
round 16; they match, with Norris ahead of Verstappen on two wins to one.

### Points

Current, confirmed. Each season's points come straight from the official results in the API: race points and sprint
points as awarded. They include the fastest-lap point in the seasons that had one (2020 to 2024 among the bundled
seasons) and the reduced scales where a race was cut short, such as the half points of the 2021 Belgian Grand Prix. The
FIA regulations for 2020 to 2026 award nothing for pole position, and neither does this project. See
`docs/decisions/0001-official-points-no-pole-point.md`, and the `f1-rules` skill for each season's scales and articles.

### Eliminations and the drop zone

Target, decided by the owner on 2026-10-05 (`docs/decisions/0003-drop-zone-until-round-complete.md`):

- While a round is in progress, the active drivers currently in elimination positions are shown as at risk, the way F1
  qualifying shows its drop zone.
- Nobody is shown eliminated until every race in the round has run.
- The marking uses words as well as colour.

Current, confirmed: the engine fills its eliminated and advancing lists for a round that has only partly run, and the
table takes any filled list to mean the round is over. With 2025 cut to 18 of its 24 races, so that only one of Round
1's two races had run, the site showed "Eliminated Round 1" with Hadjar and Hulkenberg on 0.

The wording of the drop zone is still to be approved by the owner.

### Ties

Decided by the owner on 2026-10-05 and 2026-10-06, and built in increment 2
(`docs/decisions/0004-tiebreak-countback-then-regular-season.md`). Drivers level on points are separated by this chain,
and the same chain applies everywhere the site ranks drivers: qualification, eliminations, places within an elimination
group, finalist places 2 to 4, the non-qualifiers, and the regular-season standings themselves.

1. **Points.** The driver with more points in the races being compared ranks higher.
2. **Full-classification countback.** Over the round's races only, count every classified finishing position from
   Jolpica's `positionText`: most 1sts, then most 2nds, and so on down the whole field with no cut-off at tenth. A
   numeric `positionText` is a classified position, so a classified retiree keeps its place; a letter is not classified
   and does not count. Race finishes only. Sprint finishes never count here, following the FIA's "places in a race"
   (2021 to 2025 Sporting Regulations Art. 7.2; 2026 Section A, A2.1.4c), though sprint points still count toward a
   round's points.
3. **Regular-season finishing position.** The driver who finished the regular season higher ranks higher.
4. **The official F1 standings order.** Where regular-season position cannot be its own fallback, because two drivers
   are level in the regular-season standings themselves, the order of the official F1 driver standings after the last
   regular-season race decides it (decision 0004, Option A; question 4 resolved). It is read by the data script from
   Jolpica's driver standings for that round and stored per season under `regularSeasonStandingOrder`. It is a dense
   rank with no ties, so it is the terminal key: the comparator returns "equal" only when two drivers are genuinely
   equal under the whole chain, and no result depends on array order or sort stability.

How the engine threads this: the regular-season standings are sorted by the chain above with the stored official order
as the terminal key, so even a regular-season tie (2026 Norris and Verstappen on 188) resolves to a definite order. That
fully resolved order is then the regular-season-position key inside every playoff round, so keys 3 and 4 both flow from
it. The code is `compareTiebreaker` and `buildPositionHistory` in `src/engine/standings.ts`, routed through
`calculatePlayoffState` in `src/engine/playoffs.ts`.

Before increment 2 the engine counted only P1 to P10 and then left the order to sort stability, which is the order
drivers first appear in the data. That decided five real Round 1 eliminations arbitrarily, in 2020, 2022 and 2023. The
full rule decides them on track, which moved four completed seasons, including the 2020 champion (Hamilton to
Verstappen). Every change is listed season by season in
`docs/decisions/0006-full-classification-countback-golden-changes.md`.

Corrected on 2026-10-05: an earlier draft of this section's eliminations table gave one eliminated driver each for 2020
and 2022, where three drivers were level in each.

### Final standings

Current, confirmed in `src/components/standings/StandingsTable.tsx` and on the About page. Eliminated drivers keep
scoring, and what they score after elimination sets their place within their group:

| Places       | Ranked by                                                                        |
| ------------ | -------------------------------------------------------------------------------- |
| 1st to 4th   | The Final: the winner takes the title, the other three finalists by Final points |
| 5th and 6th  | Round 3 and Final points                                                         |
| 7th and 8th  | Round 2, Round 3 and Final points                                                |
| 9th and 10th | Round 1 through Final points                                                     |
| 11th onwards | Regular-season points plus all playoff points                                    |

Ties inside any of these groups follow the tie chain above, which every ordering in the engine now routes through
(increment 2).

### Calendar changes

Target, decided by the owner on 2026-10-05 (`docs/decisions/0005-lock-qualifiers-and-playoff-races.md`). Who qualified,
and which races make up each round, lock when the regular season ends. A later change to the calendar does not change
who qualified. This replaces the February rule that the playoffs are always the last seven completed races.

Current, confirmed: the engine works out the season's structure from the length of the calendar on every load, so a
calendar change rewrites the regular season and its qualifiers, even after the fact. 2026 has already shown the
mechanism. The bundled calendar went from 24 rounds to 22 by the end of March and from 22 to 23 by the end of August,
and each change moved the start of the playoffs, from round 18 to round 16 and then to round 17. Both changes came
before the regular season ended, so no qualification was rewritten.

Jolpica renumbers rounds when a race is cancelled or added (see the `f1-rules` skill). Whatever the lock stores has to
name races in a way that survives renumbering, such as circuit and date. Until the lock is stored, the data checks
under "Data" refuse a calendar whose structure changes after the regular season, so the site keeps its last good data.

Proposal for the owner to confirm, for changes after the lock:

- A cancelled race in Rounds 1 to 3: the round is decided on the race that remains. If a round loses both races, its two
  eliminations move to the end of the next round, which then eliminates four, so the Final still has four drivers.
- A cancelled Final: the four finalists are ranked by their Round 3 points, using the tie order above.
- An added race that falls between two playoff races: it joins the round whose dates it falls inside, because a playoff
  that ignored a Grand Prix would read as broken to a fan. The alternative leaves the locked list alone and counts the
  added race only in the official points column.

### Edge cases

Still true from the February notes, confirmed by reading the engine:

- Mid-season driver changes. Points belong to the driver who scored them, keyed by Jolpica's `driverId`. A new driver
  starts at zero and inherits nothing from the seat.
- Disqualifications and revised results. The site uses the official revised results from the API.

## What the site shows

Current, confirmed: a standings table with position, driver, regular-season points, Round 1, Round 2, Round 3, Final,
and the driver's official F1 points; each row expands into the driver's race-by-race results, grouped into the regular
season and the playoff rounds. The footer and the About page carry the disclaimer that the site is not affiliated with
Formula One Group, the FIA or Formula 1.

The status line under the title, target:

- During the regular season: the correct number of regular-season races left.
- After the last regular-season race: that the regular season is complete, and which race opens the playoffs.
- During Rounds 1 to 3: which round is running. This part works today.
- Between rounds: which round has just finished, and which comes next.
- During the Final: that it is the Final.

Current, confirmed with 2025 cut at 16, 17 and 19 of its 24 races: at 16 it says "Playoffs begin next race" with one
regular-season race still to run; at 17 it says "0 races until playoffs"; at 19, between Rounds 1 and 2, it falls back
to "Playoffs • Race 19 of 24". The code counts the races until the playoffs one short.

Banners and marks, target: the "Did Not Advance" banner from the end of the regular season; "Eliminated Round N"
banners, red points and elimination chips only for rounds that are complete. Current, confirmed: the "Did Not Advance"
banner appears only once a playoff race has been run, and the elimination marks appear mid-round.

## Data

Current, confirmed. Each season's results are bundled as `data/<year>.json`, 2020 to 2026, written by
`scripts/fetch-season-data.mjs`. A GitHub workflow runs the script for the current year every Monday at 06:00 UTC and
commits any change straight to `main`, which Cloudflare then deploys. A season with no bundled file falls back to the
live API in the browser, one race at a time, which is what happens at `/2019`.

The workflow has been failing. Runs #35 on 24 August, #40 on 28 September and #41 on 5 October failed in its "Fetch
season data" step, and runs #36 to #39 succeeded. In the owner's manual run #42 on 5 October, the 23rd request, about
ten seconds in, got 429 Too Many Requests and the job stopped. Roughly 2.3 requests a second is under Jolpica's burst
limit, so the likely cause is the hourly allowance shared with everyone else on GitHub's runner addresses (inferred, not
confirmed). The same script ran cleanly from the owner's machine that day. The site still shows 14 races; Jolpica
has 16.

Target, decided by the owner:

- Fetch, validate, and commit only data that passes validation.
- Never degrade silently. A fetch that fails or does not validate leaves the last good file in place.
- Fail visibly. The job fails, and a GitHub issue says why.

Valid means at least: every completed sprint weekend has sprint results, the rounds run without gaps, the file has no
fewer completed races than the one it replaces, and each race has a plausible number of results.

Added on 2026-10-05 by the orchestrator, answering the review, for the owner to confirm:

- The tests and the build run against the fetched data before anything is committed.
- Until the calendar lock is stored, a calendar whose structure differs from the stored one fails validation once the
  stored file shows the regular season complete. Structure means the number of rounds, and each round's date and
  `circuitId`. A change of name alone passes: the 21 September data commit renamed the Qatar circuit from Losail to
  Lusail and kept `circuitId` `losail`. On a failure the site keeps its last good data until the owner decides what
  the change means.

## What counts as working

- The same data gives the same standings. Reordering the drivers or the results in a season file changes nothing a
  reader sees.
- Every completed season's outcome, meaning its qualifiers, each round's eliminations and its champion, is pinned by a
  test, and any change to one arrives with a decision record that lists it.
- Every ordering on the site can be explained from a rule on the About page and in this document.
- Mid-round, nobody is shown eliminated, and the drivers at risk are named in words.
- The status line is right at each stage above, checked by replaying seasons at fixed cut points.
- After a race weekend the site shows the race once the Monday run succeeds. When the run fails, there is a failed job
  and an open issue, and the site keeps its last good data.
- Every control works from the keyboard with visible focus, and both themes meet WCAG 2.2 AA contrast.
- Only supported seasons load. Any other address gets a not-found page rather than an API error.

## What it will not do

- Fantasy teams, user accounts or leagues.
- Push notifications or social sharing.
- A playoff for constructors.
- A caching layer on Cloudflare Workers, or any other backend.
- Predictions or simulations of races not yet run.
- Live timing.
- Seasons before 2020 (inferred from the supported seasons in `src/constants/config.ts`). The February notes listed
  earlier seasons as a future idea; 2020 to 2024 shipped later that month.
- Present any result as an official F1 result.

The first four came from the February list of future considerations and are carried over as out of scope.

## Constraints

- A static site on Cloudflare Pages, built by Vite. No backend, no accounts, no server-side state.
- All data is public. No secrets in the client and no personal data anywhere.
- Mobile first.
- WCAG 2.2 AA.
- "Formula 1" and "F1" stay out of the product name and the logo, and the disclaimer stays.
- Jolpica allows 4 requests a second and 500 an hour per IP address without a token, says both will come down, and asks
  for a custom User-Agent.
- Every push to `main` is a production deploy, and the data workflow pushes to `main` every week.
- Round numbers change when the calendar does.

## Open questions

### 1. Name and vocabulary

Decided. The name is Grand Prix Knockout, and the vocabulary moves from playoff to knockout. See
`docs/decisions/0008-name-grand-prix-knockout.md`. The context below is kept as the evidence behind that decision.

The owner's direction on 2026-10-05: drop "Playoffs" and the NASCAR comparison, and lean on F1 qualifying instead.
NASCAR itself closed its elimination era and its one-race championship for 2026 and went back to a ten-race points Chase
([nascar.com, 12 January 2026][nascar-chase]; [nascar.com, 13 January 2026][nascar-drivers]; [motorsport.com, 13 January
2026][motorsport-chase]). The site's meta description in `index.html` still says "NASCAR-style playoffs".

Candidates, with `.com` availability checked by the orchestrator through Verisign RDAP on 2026-10-05 and not checked
again here:

- Grand Prix Knockout: grandprixknockout.com, gpknockout.com, knockoutgp.com and grandprixko.com available. The
  orchestrator recommends it, because F1's qualifying format is widely known as knockout qualifying. The FIA's own
  regulations do not use the word (checked in the 2026 Section B text).
- Grand Prix Elimination: grandprixelimination.com and gpelimination.com available.
- Title Decider, Title Shootout and Grand Prix Shootout: available.
- Taken: lastdriverstanding.com and knockoutchampionship.com.
- Grand Prix Qualifying Championship, floated by the owner. It is long, and readers may take it for a table scored on
  Saturday qualifying.

Vocabulary to settle at the same time: R1 to R3 or Q1 to Q3 as round labels (Q labels carry the theme and could be read
as qualifying session results), "eliminated" or "knocked out", and "drop zone". "Round" also means one Grand Prix in F1
(round 17 of 23), which collides with this project's Round 1; the new words should end that.

grandprixplayoffs.com is registered at Cloudflare until 2028-02-15 and can redirect to whatever replaces it.

Recommendation: Grand Prix Knockout, from the orchestrator. Decided in increment 4, with a decision record.

### 2. Deploy gating

Cloudflare deploys every push to `main`, including the data workflow's, and nothing runs the tests first. This is a
solo project with no pull requests, so the gate cannot sit on a merge request. Options:

- Stop Cloudflare building on push, and deploy from a GitHub Action that runs the checks first and only then uploads.
  Wrangler's direct upload needs a Cloudflare API token stored in GitHub.
- Keep Cloudflare on push, and accept that the branch check (increment 1) plus the data workflow's own tests are the
  safeguard, with no hard gate before a human merges to `main`.

Inferred: a real gate means moving the deploy behind a check, which is the first option. No recommendation yet. Decided
in increment 3.

One safeguard comes before that, in increment 1, chosen by the orchestrator on 2026-10-05: the data workflow runs the
tests and the build against the data it fetched before it commits, and a branch check runs the same on every push to a
non-`main` branch so the owner sees the result before merging. The data workflow has to run its own checks inline,
because a push made with the workflow's `GITHUB_TOKEN` starts no other workflow ([GitHub docs][gh-token]). Neither stops
the owner merging. That hard gate is still this question.

### 3. Cloudflare Pages settings

The build command, Node version and preview branches live in the Cloudflare dashboard, not in the repository. The owner
will supply them. `docs/DEPLOYMENT.md` records `npm run build`, output `dist`, Node 20 "auto-detected", and a preview
for every branch; none of that has been checked against the dashboard.

### 4. The tie sub-questions and the calendar proposal

The four tie sub-questions and the three calendar proposals in the format section are waiting for the owner. Increment 2
cannot encode either rule until they are settled.

[nascar-chase]: https://www.nascar.com/news-media/2026/01/12/nascar-returns-to-chase-championship-format-for-2026/
[nascar-drivers]: https://www.nascar.com/news-media/2026/01/13/nascar-community-lauds-return-of-the-chase-championship-format/
[motorsport-chase]: https://www.motorsport.com/nascar-cup/news/the-pros-and-cons-of-nascars-new-championship-format-for-2026/10789798/
[gh-token]: https://docs.github.com/en/actions/concepts/security/github_token
