# 0001. Official F1 points from the API, and no pole-position point

Date: decided 2026-06-21 in commit 964c97f; recorded 2026-10-05.

Status: Accepted. Supersedes the pole-position point in `PROJECT_FOUNDATION.md` (deleted on 2026-10-05, in git history)
and in `README.md`.

## Context

The February project notes, `PROJECT_FOUNDATION.md` of 15 February 2026, listed two bonus points: one for pole position
and one for the fastest lap if the driver finished in the top ten. The engine worked points out from finishing positions
and added those bonuses. The README said standard F1 points applied, "race, sprint, pole, fastest lap".

Neither bonus matched F1. The FIA regulations for 2020 to 2026 award no point for pole (Art. 6.4 of each season's
Sporting Regulations; 2026 Section A, A2.2), and the fastest-lap point ended after 2024 (2025 Sporting Regulations, Art.
6.4). Commit 964c97f records the effect: wrong standings for 2025 onwards, and a pole bonus "that never existed in
official F1".

## Decision

Use the points Jolpica returns for each race and sprint result, unchanged. Do not recalculate points from positions, and
add no bonus of our own.

The API's figures already carry each season's rules: the fastest-lap point from 2019 to 2024, the sprint scales, and the
reduced scales for shortened races, such as the half points of the 2021 Belgian Grand Prix.

## Consequences

- Standings agree with the official totals. The commit says every season from 2020 to 2026 was checked against them.
  This record did not repeat that check for each season; for 2026 after round 16 the totals match (verified against
  Jolpica's standings on 2026-10-05).
- A change to F1's scoring reaches the site with the data and needs no code.
- A wrong `points` value in Jolpica's data becomes a wrong standing here (inferred).
- `RACE_POINTS` and `SPRINT_POINTS` in `src/constants/points.ts` stay for display on the About page.
- Qualifying results are still fetched and bundled, and nothing reads them now that the pole point is gone (verified by
  searching `src/`). The 2026 regulations use qualifying results as the last step of the championship countback (Section
  A, A2.1.4c iv), which bears on `0004-tiebreak-countback-then-regular-season.md`.
- The README's pole-point claim was corrected on 2026-10-05.
