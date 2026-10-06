# 0005. Lock the qualifiers and the playoff races when the regular season ends

Date: 2026-10-05, decided by the owner.

Status: Accepted. Supersedes the rule in `PROJECT_FOUNDATION.md` that the playoffs are always the last seven completed
races. How a playoff race cancelled or added after the lock is handled is a proposal waiting for the owner.

## Context

The February notes handled cancellations "dynamically": the playoffs were always the last seven completed races. The
code goes further and works out the whole structure from the length of the calendar on every load
(`calculatePlayoffState` in `src/engine/playoffs.ts`), so any change to the calendar moves the end of the regular season
and with it the list of qualifiers.

2026 has shown how often the calendar moves. In this repository's data history the 2026 calendar had 24 rounds on 8
March, 22 by 30 March after two April races were dropped, and 23 by 31 August after the Bahrain Grand Prix in Malaysia
was added as round 16 on 4 October. Each change moved the first playoff race, from round 18 to round 16 and then to
round 17. Jolpica renumbers rounds when this happens. Both changes came before the regular season ended, so no
qualification was rewritten, but the next one could come after it.

Alternatives considered:

- Keep the dynamic rule. Rejected: a race cancelled in November would change who qualified in October, which breaks the
  rule in `AGENTS.md` that completed results do not change silently.
- Fix the structure to the calendar as published before the season. Rejected: in 2026 that would have put two races that
  never ran into the regular season.

## Decision

- When the last regular-season race has run, the ten qualifiers and the races that make up each playoff round are fixed.
- A later change to the calendar does not change who qualified.
- The locked list names races in a way that survives renumbering, such as circuit and date.
- Until the lock, the last seven races of the current calendar are the playoffs, as now.

Proposal for changes after the lock, for the owner to confirm:

- A cancelled race in Rounds 1 to 3: the round is decided on the race that remains. If a round loses both, its two
  eliminations move to the end of the next round, which then eliminates four, so the Final still has four drivers.
- A cancelled Final: the four finalists are ranked by their Round 3 points, using the tie order of
  `0004-tiebreak-countback-then-regular-season.md`.
- An added race between two playoff races: it joins the round whose dates it falls inside. The alternative leaves the
  locked list alone and counts the added race only in the official points column.

## Consequences

- For 2026 the lock fell at the end of round 16 on 4 October, so the ten qualifiers listed in `docs/design.md` are
  fixed. The engine does not enforce that until increment 2; a calendar change before then would still rewrite them.
- So increment 1 adds a guard to the data workflow's validation instead. Once the stored file shows the regular season
  complete, a fetched calendar whose structure differs from the stored one fails: a different number of rounds, or a
  different date or `circuitId` for any round. The job writes nothing and opens its failure issue, and the site keeps
  its last good data until the owner decides what the change means. A change of name alone passes, because the 21
  September data commit renamed the Qatar circuit from Losail to Lusail and kept `circuitId` `losail`. The orchestrator
  chose this on 2026-10-05, answering the review, over enforcing the lock in increment 1, and the owner can overrule it
  at review.
- The seasons 2020 to 2025 have final calendars, so locking changes none of their outcomes (inferred).
- Where the lock is stored, in the season's data file or elsewhere, is increment 2's call.
