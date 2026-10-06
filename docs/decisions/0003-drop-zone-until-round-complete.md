# 0003. A drop zone during a round, and eliminations only once it is complete

Date: 2026-10-05, decided by the owner.

Status: Accepted. The wording of the drop zone is still to be approved by the owner, in increment 1.

## Context

The February rule was that the bottom two drivers on a round's points are eliminated after each round. The code marks
them before the round is over. `calculatePlayoffRound` in `src/engine/playoffs.ts` fills its eliminated and advancing
lists even when only some of a round's races have run, and `isRoundComplete` in
`src/components/standings/StandingsTable.tsx` assumes the eliminated list is only ever filled for a finished round. With
2025 cut to 18 of its 24 races, the site showed "Eliminated Round 1" with Hadjar and Hulkenberg on 0 after one of the
round's two races (reproduced with Playwright on 2026-10-05).

It matters now. 2026's Round 1 opens at Singapore on 11 October and closes at the United States Grand Prix on 25
October. The data run on 12 October would have the site eliminate two drivers after one race.

Three options were plausible.

- Keep marking provisional eliminations mid-round, as the code does. Rejected: it states as fact an elimination that has
  not happened.
- Mark nothing until the round is over. The simplest, and nobody can misread it. Rejected because it hides the state of
  the round while it is being decided, which is the part of the format that carries the pressure.
- Show a drop zone, the way F1 qualifying shows the drivers who would be knocked out if the session ended now. Chosen.

## Decision

- While a round is in progress, the active drivers currently in elimination positions are shown as at risk.
- Nobody is shown eliminated until every race in the round has run. "Eliminated Round N" banners, red points and
  elimination chips appear only for completed rounds.
- The at-risk marking uses words as well as colour.
- The engine reports the drop zone for an unfinished round instead of filling its eliminated list.

## Consequences

- No completed season changes, because every round in them is complete.
- The interface needs drop-zone wording the owner approves.
- The drop zone uses the same tie order as eliminations. Until increment 2 replaces it, a tie at the edge of the drop
  zone is settled by today's top-ten countback and then by regular-season position, the last key increment 1 adds for
  2026 so that no at-risk marking rests on input order (`0004-tiebreak-countback-then-regular-season.md`). Corrected on
  2026-10-05: this bullet first said the marking could rest on input order between the Singapore and United States data
  runs, and labelled that inferred. The review confirmed the code path, and the orchestrator added the key in answer.
- A round counts as complete when every race in it has results in the data. A race cancelled after the regular season
  ends is covered by the proposal in `0005-lock-qualifiers-and-playoff-races.md`.
