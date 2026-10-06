---
name: f1-rules
description: Use for anything that touches points, standings, tiebreaks or countback, race or sprint classification, retirements and DNFs, sprint weekends, the race calendar or round numbers, or Jolpica data and its fields such as position, positionText, status and points. Covers the FIA points scales for 2020 to 2026 with the article for each season, shortened-race scoring, the FIA countback and what happens when it runs out, the 90% classification rule, how Jolpica encodes all of it, the Jolpica behaviour this project depends on, and the constructorIds in the bundled data. Every item says whether and how it was verified.
---

# Formula 1 rules and Jolpica data

F1's own rules and Jolpica's data, and nothing of this project's. The rules it adds on top, such as the seven-race
playoff, the rounds, the drop zone, its own tiebreak order and the calendar lock, are in `docs/design.md` and
`docs/decisions/`.

**Verified**: checked on 2026-10-05 against the named source, by the method given.

**Unverified**: taken on trust. Check it before encoding it.

## The FIA documents

Each PDF below was downloaded and its text extracted on 2026-10-05, and every article cited was read in that text.

Corrected on 2026-10-05: this table first cited earlier issues for 2020 to 2023 and Issue 08 of 2026 Section B. The
source review found the later issues below. The articles this skill cites for those seasons were read again in them
that day and say what the skill says. For 2024, 2025 and 2026 Section A a web search found no later issue; the FIA's
own index timed out, so that is unverified.

| Season | Document                                                                      | Issue                      |
| ------ | ----------------------------------------------------------------------------- | -------------------------- |
| 2020   | [2020 Formula 1 Sporting Regulations][fia2020]                                | Issue 14, 23 November 2020 |
| 2021   | [2021 Formula 1 Sporting Regulations][fia2021]                                | Issue 13, 8 December 2021  |
| 2022   | [2022 Formula 1 Sporting Regulations][fia2022]                                | Issue 9, 19 October 2022   |
| 2023   | [2023 Formula 1 Sporting Regulations][fia2023]                                | Issue 8, 6 December 2023   |
| 2024   | [2024 Formula 1 Sporting Regulations][fia2024]                                | Issue 7, 31 July 2024      |
| 2025   | [2025 Formula 1 Sporting Regulations][fia2025]                                | Issue 5, 30 April 2025     |
| 2026   | [2026 FIA F1 Regulations, Section A, General Regulatory Provisions][fia2026a] | Issue 03, 25 June 2026     |
| 2026   | [2026 FIA F1 Regulations, Section B, Sporting][fia2026b]                      | Issue 09, 1 October 2026   |

For 2026 the FIA split the rules into lettered sections. Points and the championship tiebreak moved to Section A, and
classification stayed in Section B.

## Points, season by season

| Season | Race, top ten                     | Fastest-lap point                                        | Sprint                           | Where                        |
| ------ | --------------------------------- | -------------------------------------------------------- | -------------------------------- | ---------------------------- |
| 2020   | 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 | 1, if the driver is in the top ten of the classification | none held                        | Art. 6.4                     |
| 2021   | same                              | same                                                     | sprint qualifying, 3, 2, 1       | Art. 6.4                     |
| 2022   | same                              | same, and none if the leader covered under 50%           | 8, 7, 6, 5, 4, 3, 2, 1           | Art. 6.4                     |
| 2023   | same                              | as 2022                                                  | as 2022                          | Art. 6.4                     |
| 2024   | same                              | as 2022                                                  | as 2022                          | Art. 6.4                     |
| 2025   | same                              | none                                                     | as 2022                          | Art. 6.4                     |
| 2026   | same, at 75% distance or more     | none                                                     | as 2022, at 50% distance or more | Section A, A2.2.1 and A2.2.2 |

Verified by reading each article. Checked again against the bundled data by counting results that score exactly one
point more than the race scale gives their position, which is the fastest-lap point: 17 in 2020, 18 in 2021, 20 in 2022,
20 in 2023, 19 in 2024, none in 2025, and none in the 14 races of 2026 in `data/2026.json`. Secondary sources: the
dropping of the fastest-lap point from 2025 ([formula1.com, 17 October 2024][fl2025]) and the move from a top-three to a
top-eight sprint scale for 2022 ([ESPN, 14 February 2022][sprint2022]).

Points for the same position are shared when cars tie for it (2020 to 2025 Art. 7.1; 2026 Section A, A2.2.3). Verified.

### Shortened races

The rule changed in 2022 and again in 2023. The 2026 text restates the 2023 version in the new Section A and adds that
the leader's two laps must be consecutive. All verified by reading the articles named.

- 2020 and 2021, Art. 6.5. Only when a race is suspended and cannot be resumed: no points if the leader completed two
  laps or fewer, half points above two laps and under 75% of the distance, full points at 75% or more. 2021 applies the
  same to sprint qualifying.
- 2022, Art. 6.5 and 6.6. Still only when a race is suspended and not resumed, now on the sliding scale below. No points
  at all unless the leader completed two laps without a Safety Car or VSC. A suspended sprint that is not resumed scores
  nothing under 50%.
- 2023 to 2025, Art. 6.5 and 6.6. The scale applies whenever the distance from the start signal to the end-of-session
  signal is less than scheduled, with or without a suspension.
- 2026, Section A, A2.2.1 and A2.2.2. Race points always depend on how far the leader got, with column 4 as the full
  scale, and need two complete consecutive laps without a Safety Car or VSC. A sprint under 50% scores nothing.

| Position | Two laps to under 25% | 25% to under 50% | 50% to under 75% | 75% or more |
| -------- | --------------------- | ---------------- | ---------------- | ----------- |
| 1st      | 6                     | 13               | 19               | 25          |
| 2nd      | 4                     | 10               | 14               | 18          |
| 3rd      | 3                     | 8                | 12               | 15          |
| 4th      | 2                     | 6                | 10               | 12          |
| 5th      | 1                     | 5                | 8                | 10          |
| 6th      |                       | 4                | 6                | 8           |
| 7th      |                       | 3                | 4                | 6           |
| 8th      |                       | 2                | 3                | 4           |
| 9th      |                       | 1                | 2                | 2           |
| 10th     |                       |                  | 1                | 1           |

Where it bit in 2020 to 2026:

- The 2021 Belgian Grand Prix (round 12) was scored at half points. The winner has 12.5 in `data/2021.json`, the only
  winner in the seven bundled seasons without 25 or 26 points (verified by scanning the files). Secondary source: the
  [formula1.com race report, 29 August 2021][spa2021].
- The 2022 Japanese Grand Prix was resumed and ran to the end-of-session signal, so the 2022 wording gave full points
  ([planetf1.com, 9 October 2022][suzuka2022], quoting the FIA's explanation). The bundled winner has 25. The wording
  was rewritten for 2023 ([Sky Sports, 21 February 2023][rule2023]).

This project never computes points from positions. It adds up the `points` field Jolpica returns
(`docs/decisions/0001-official-points-no-pole-point.md`), so none of this scale is encoded. It matters for explaining a
number to a reader and for a reviewer checking one. `RACE_POINTS` and `SPRINT_POINTS` in `src/constants/points.ts` exist
for the About page.

## The FIA countback

What the regulations say for drivers level on points at the end of the championship. All verified by reading the
articles named.

- 2020, Art. 7.2. The higher place goes to the holder of the greatest number of first places, then second places, then
  third places, "and so on until a winner emerges". If that fails, the FIA nominates the winner by criteria it thinks
  fit.
- 2021 to 2025, Art. 7.2. The same, but counting first places "in a race", second places "in a race", and so on. If that
  fails, the FIA nominates the winner.
- 2026, Section A, A2.1.4c. The same race places in i to iii. Then iv: if that fails, the same criteria apply to the
  drivers' qualifying results during the season. The article stops there. Where 2020 to 2025 let the FIA nominate the
  winner, 2026 has no step for a tie that survives the qualifying count, so any key after it is this project's own
  rule (verified in Issue 03).

Three readings follow from the text.

- Sprint finishes do not count from 2021, because the regulations call a sprint a sprint qualifying session (2021) or a
  sprint session (2022 onwards), never a race. The words "in a race" arrived in 2021, the year sprints began; that they
  were added to exclude sprints is inferred.
- The text sets no cut-off, so the count runs past the points places to every classified position. The text has no limit
  (verified); that "places" means classified positions only is inferred, because an unclassified car has no place in the
  classification.
- The rule is written for the end of the season. Applying it inside a playoff round is this project's choice
  (`docs/decisions/0004-tiebreak-countback-then-regular-season.md`). The published mid-season standings appear to use it
  too: after 2026 round 16 Norris and Verstappen are both on 188, and Jolpica lists Norris, with two wins to one, fifth
  (the data is verified; that countback is the reason is inferred).

No secondary source was checked for the countback articles, including the 2026 qualifying fallback, beyond the PDFs
themselves.

What the code does today, verified by reading `src/engine/standings.ts`: it counts race finishes in P1 to P10 only,
leaves sprints out, and when those counts are equal it leaves the order to sort stability. The positions it counts are
already missing for some classified drivers (next section).

## Classification

Cars that covered less than 90% of the winner's laps, rounded down to a whole lap, are not classified. Verified in: 2020
Art. 45.2; 2021 Art. 55.2 for races and 54.2 for sprint qualifying; 2022 to 2025 Art. 62.2 for races and 61.2 for
sprints; 2026 Section B, B2.5.5b for races and B2.3.5b for sprints.

So a driver who stops near the end can be classified, and a driver who finishes several laps down can be unclassified.
The finishing status does not tell you which.

### How Jolpica encodes it

- `position` is always a whole number, sent as a string such as `"17"`: the order in the result list, classified or
  not. Verified: all 61 `R` and 7 `W` entries in 2026 rounds 1 to 16 carry one. `positionText`, `points`, `grid` and
  `laps` arrive as strings too (verified on 2026 round 16, 2026-10-05). `scripts/fetch-season-data.mjs` converts
  `position` with `parseInt`, or sets it to `null` (below), and `points` with `parseFloat`, so the bundled files hold
  numbers.
- `positionText` is the position again when the car is classified, and a letter when it is not. Seen in 2026: `R` for
  not classified and `W` for did not start (verified, live data). Jolpica no longer uses `N` and uses `R` in its place
  ([Ergast differences][jdiff], verified). Ergast also used `D` for disqualified, `E` for excluded and `F` for failed to
  qualify; whether Jolpica still emits each of those is unverified.
- From 2025 `status` takes only the values of an enumeration in Jolpica's code ([enumeration][jenum], linked from
  [Ergast differences][jdiff]): finished, lapped, accident, retired, disqualified, did not start, did not qualify and
  did not prequalify. Accident is not used yet, so every retirement and accident reads "Retired"
  ([status docs][jstatus]). Verified. The race results in `data/2025.json` use five of the eight, Finished, Lapped,
  Retired, Disqualified and Did not start, and `data/2026.json` uses four, without Disqualified (verified by scanning
  the files on 2026-10-05). Before 2025 the long Ergast strings appear ("+1 Lap", "Engine", "Collision"), and Jolpica
  says it may remap older seasons. In the bundled files, 2020 to 2022 have the long strings, 2023 mostly the short set,
  and 2024 and 2025 only the short set (verified by scanning `data/`).
- `points` is the race result's points as awarded, including the fastest-lap point where it applied: the [results
  docs][jresults] show Verstappen on 26 for the 2021 Austrian Grand Prix, and the counts above match. Half points arrive
  as a decimal string such as `"12.5"`. Verified.
- Sprint results use the same fields under `SprintResults`. Verified.

The 2026 race results for rounds 1 to 16, from the season endpoint on 2026-10-05:

| `positionText` | `status`      | Results |
| -------------- | ------------- | ------- |
| number         | Finished      | 177     |
| number         | Lapped        | 99      |
| number         | Retired       | 8       |
| `R`            | Lapped        | 2       |
| `R`            | Retired       | 59      |
| `W`            | Did not start | 7       |

The script and the API client keep a position only when the status is "Finished" or contains "Lap"
(`scripts/fetch-season-data.mjs`, `src/services/jolpica.ts`). On this data that throws away 8 classified retirees, in
positions 15 to 20 with no points, and keeps 2 lapped cars that were not classified. Use `positionText` instead: a
number means classified.

## Jolpica behaviour this project depends on

Rounds renumber when races are cancelled or added. Verified from this repository's own data history: `data/2026.json` on
17 February and 8 March 2026 had 24 rounds, with Bahrain as round 4, Saudi Arabia 5 and Miami 6. By the commit of 30
March it had 22, with Miami as round 4 and Singapore as 16. By the commit of 31 August it had 23, with the Bahrain Grand
Prix in Malaysia, at Sepang on 4 October, as round 16 and Singapore moved to 17. The live schedule on 2026-10-05 has 23
rounds numbered 1 to 23 without gaps. A round number names a different race after a calendar change, so nothing durable
should be keyed on it alone.

Season-level endpoints page. `limit` defaults to 30 and stops at 100, and `offset` pages through `MRData.total`
([docs][jdocs], verified). Live on 2026-10-05:

- `/2026/results.json?limit=100&offset=0` reported a total of 352 and held five races. A race can straddle two pages:
  round 5 was split across the first two, round 10 across the second and third, round 14 across the third and fourth.
  Merge `Results` by round after paging.
- `/2026/sprint.json` reported 110, which is 5 sprints of 22 cars, over two pages with round 12 split.
- `/2026/qualifying.json` reported 347 and held five rounds on the first page.

The schedule's `Sprint` field marks sprint weekends, alongside `SprintQualifying`. In the 2026 schedule it is on rounds
2, 4, 5, 9, 12 and 17, so Singapore on 11 October is a sprint weekend. Verified.

Race points already include the fastest-lap point where it applied (above). Verified.

Rate limits are per IP address or token. Without a token: a burst of 4 requests a second and 500 an hour, and Jolpica
says both will come down ([rate limits][jrate], fetched 2026-10-05, verified). Throttled requests get HTTP 429. The
February notes said 200 an hour, which no longer matches. Whether a 429 carries `Retry-After` is unverified, because no
429 was seen in this check.

Jolpica asks every client to send a custom `User-Agent` naming the app and its version ([docs][jdocs], verified).
Neither `scripts/fetch-season-data.mjs` nor `src/services/jolpica.ts` sets one (verified by reading them).

Status values for older seasons may be remapped later ([status docs][jstatus], verified), so a re-fetch of 2020 to 2023
can change the strings in a bundled file.

## constructorIds in the bundled data

Sixteen across `data/2020.json` to `data/2026.json`, the last through round 14. Verified by scanning the files.

| Seasons      | constructorIds                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------- |
| 2020         | alfa, alphatauri, ferrari, haas, mclaren, mercedes, racing_point, red_bull, renault, williams  |
| 2021 to 2023 | alfa, alphatauri, alpine, aston_martin, ferrari, haas, mclaren, mercedes, red_bull, williams   |
| 2024, 2025   | alpine, aston_martin, ferrari, haas, mclaren, mercedes, rb, red_bull, sauber, williams         |
| 2026         | alpine, aston_martin, audi, cadillac, ferrari, haas, mclaren, mercedes, rb, red_bull, williams |

`src/constants/teams.ts` has colours for the ten in the 2024 and 2025 row. alfa, alphatauri, audi, cadillac,
racing_point and renault fall back to grey.

An id names an entry under one name, so a team that renames gets a new id: racing_point to aston_martin and renault to
alpine for 2021, alphatauri to rb and alfa to sauber for 2024, sauber to audi for 2026. The swaps are visible season to
season in the data; that each pair is the same team is general knowledge, not checked here.

[fia2020]: https://www.fia.com/sites/default/files/2020_formula_1_sporting_regulations_-_iss_14_-_2020-11-23.pdf
[fia2021]: https://api.fia.com/sites/default/files/2021_formula_1_sporting_regulations_-_iss_13_-_2021-12-08.pdf
[fia2022]: https://api.fia.com/sites/default/files/fia_2022_formula_1_sporting_regulations_-_issue_9_-_2022-10-19_0.pdf
[fia2023]: https://www.fia.com/sites/default/files/fia_2023_formula_1_sporting_regulations_-_issue_8_-_2023-12-06_0.pdf
[fia2024]: https://www.fia.com/sites/default/files/fia_2024_formula_1_sporting_regulations_-_issue_7_-_2024-07-31.pdf
[fia2025]: https://fia.com/system/files/documents/fia_2025_formula_1_sporting_regulations_-_issue_5_-_2025-04-30.pdf
[fia2026a]: https://api.fia.com/system/files/documents/fia_2026_f1_regulations_-_section_a_general_provisions_-_iss_03_-_2026-06-25.pdf
[fia2026b]: https://api.fia.com/system/files/documents/fia_2026_f1_regulations_-_section_b_sporting_-_iss_09_-_2026-10-01.pdf
[fl2025]: https://www.formula1.com/en/latest/article/fastest-lap-point-to-be-scrapped-in-2025-after-latest-fia-world-motor-sport.4pUjDzWnGRN7KVWENLc1BY
[sprint2022]: https://www.espn.com/f1/story/_/id/33289147/f1-host-three-sprint-races-2022-revised-point-format
[spa2021]: https://www.formula1.com/en/latest/article/verstappen-takes-victory-in-severely-shortened-rain-affected-belgian-gp-as.4AqGhiKQfFaqr7KZjyDjPZ
[suzuka2022]: https://www.planetf1.com/news/fia-explain-max-verstappen-world-champion-points
[rule2023]: https://www.skysports.com/f1/news/12433/12816819/formula-one-alters-shortened-race-rule-after-max-verstappens-title-confusion-at-2022-japanese-gp
[jdocs]: https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md
[jrate]: https://github.com/jolpica/jolpica-f1/blob/main/docs/rate_limits.md
[jdiff]: https://github.com/jolpica/jolpica-f1/blob/main/docs/ergast_differences.md
[jstatus]: https://github.com/jolpica/jolpica-f1/blob/main/docs/endpoints/status.md
[jenum]: https://github.com/jolpica/jolpica-f1/blob/71f12b1c9637aa838926abcb6f4840fbfac4d87c/jolpica/formula_one/models/session.py#L64-L71
[jresults]: https://github.com/jolpica/jolpica-f1/blob/main/docs/endpoints/results.md
