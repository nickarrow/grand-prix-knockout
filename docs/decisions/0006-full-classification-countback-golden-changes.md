# 0006. The full-classification countback moves four completed seasons

Date: 2026-10-06, decided by the owner.

Status: Accepted. This records the historical outcomes that changed when increment 2 replaced the old P1-P10 countback
with the full tiebreak rule settled in [0004](0004-tiebreak-countback-then-regular-season.md). It supersedes nothing. It
is the season-by-season list `AGENTS.md` requires whenever an engine change alters a completed season, and 0004's
consequences section points here for the actual numbers.

## Context

Decision 0004 settled the tiebreak rule: points, then a countback over the round's races that counts every classified
finishing position from Jolpica's `positionText` with no cut-off (sprints excluded), then regular-season finishing
position, then the stored official F1 standings order as a terminal key that never ties. Increment 1 put `positionText`
and the stored order into the data. Increment 2 rewrote `compareTiebreaker` and `buildPositionHistory` in
`src/engine/standings.ts` to the full rule, routed every ordering in `src/engine/playoffs.ts` through that one
comparator, and removed the 2026-only `INTERIM_TIEBREAK_SEASON` scoping so the rule applies to every season at once.

The old engine counted only P1 to P10 and, when those were level, left the order to sort stability (the order drivers
first appear in the data). That decided five real Round 1 eliminations arbitrarily. The full rule decides them by what
happened on track, which moves four completed seasons. The golden suite in `src/engine/golden.test.ts` is updated to the
new values in the same commit as the engine change.

Verified: the before values are the increment-1 golden baselines; the after values are the engine output over the
bundled data on 2026-10-06, read from `calculatePlayoffState`. The deciding finishes below were read directly from
`data/<year>.json`. The changed-season set is exactly {2020, 2021, 2022, 2023}; 2024, 2025 and 2026 are unchanged.

## What changed, season by season

### 2020 — champion changes, Hamilton to Verstappen

The hinge is the Round 1 (races 11 and 12) three-way tie on zero points between Albon, Norris and Stroll. Under the full
countback their classified race finishes decide it: Albon was not classified in race 11 and finished 12th in race 12;
Norris was not classified in race 11 and finished 13th in race 12; Stroll did not appear in race 11 and was not
classified in race 12. So Albon's 12th beats Norris's 13th, and Stroll has no classified finish at all. Albon survives,
Norris and Stroll go out. The old engine, blind to finishes outside the top ten, left this to sort stability and
eliminated Albon and Stroll instead.

That one change cascades through the bracket, because the driver who now survives races on into the next round:

| Round     | Before (eliminated)      | After (eliminated)         |
| --------- | ------------------------ | -------------------------- |
| 1         | Albon, Stroll            | Norris, Stroll             |
| 2         | Verstappen, Gasly        | Albon, Gasly               |
| 3         | Bottas, Leclerc          | Bottas, Leclerc            |
| 4 (final) | Norris, Ricciardo, Perez | Hamilton, Ricciardo, Perez |
| Champion  | Hamilton                 | **Verstappen**             |

With Norris out in Round 1, Verstappen is no longer the driver eliminated in Round 2, so he reaches the one-race final
(the 2020 Abu Dhabi Grand Prix) and wins it: Verstappen P1 for 25 points, Hamilton P3 for 15. The winner-take-all final
goes to the higher score, so Verstappen takes the title. Round 3 advancing order also shifts to put Perez and Verstappen
in the four. Qualifiers are unchanged.

Deciding rule for the formerly-arbitrary case: the full-classification countback, at the Round 1 zero-point tie (Albon
12th beats Norris 13th over the round's races).

### 2023 — Round 1 and Round 2 eliminations change; same champion

Round 1 (races 16 and 17) turned on Perez and Gasly, level on one point each (a single P10). Perez was not classified in
race 16 and finished 10th in race 17; Gasly finished 10th in race 16 and 12th in race 17. Both have one P10, so the
countback is level there, but Gasly's extra classified 12th beats Perez's nothing further down. Gasly survives, Perez is
eliminated alongside Stroll.

| Round    | Before (eliminated) | After (eliminated) |
| -------- | ------------------- | ------------------ |
| 1        | Gasly, Stroll       | Perez, Stroll      |
| 2        | Perez, Alonso       | Gasly, Alonso      |
| Champion | Verstappen          | Verstappen         |

Gasly, now through to Round 2, is eliminated there in Perez's old place, so the Round 2 pair becomes Gasly and Alonso.
The four finalists, the later rounds and the champion (Verstappen) are unchanged.

Deciding rule: the full-classification countback, counting Gasly's classified 12th that the old P1-P10 count ignored.

### 2021 — Round 3 eliminated pair reorders; order only

Round 3 (races 20 and 21) eliminated Leclerc and Sainz either way; only the order they are listed in changes. Leclerc
finished 8th then 7th, Sainz 7th then 8th: both score ten round points and have an identical countback (one 7th and one
8th each). The tie falls through to the terminal official order, where Sainz (index 5) sits above Leclerc (index 6), so
Sainz is listed ahead of Leclerc.

| Round | Before (eliminated) | After (eliminated) |
| ----- | ------------------- | ------------------ |
| 3     | Leclerc, Sainz      | Sainz, Leclerc     |

Both are eliminated, the four finalists and the champion (Verstappen) are unchanged. This is a reordering inside the
eliminated pair, not a change in who advances.

Deciding rule: the terminal official-standings order, reached after an exhausted countback.

### 2022 — Round 2 eliminated pair reorders; order only

Round 2 (races 18 and 19) eliminated Sainz and Bottas either way; only the order changes. Sainz was not classified in
either race; Bottas finished 15th in race 18 and was not classified in race 19. Both score zero round points, but
Bottas's single classified 15th beats Sainz's nothing, so Bottas is listed ahead of Sainz.

| Round | Before (eliminated) | After (eliminated) |
| ----- | ------------------- | ------------------ |
| 2     | Sainz, Bottas       | Bottas, Sainz      |

Both are eliminated, the four finalists and the champion (Verstappen) are unchanged.

Deciding rule: the full-classification countback, counting Bottas's classified 15th.

## Consequences

- `src/engine/golden.test.ts` now asserts these values. 2020's block asserts Verstappen as champion with the Round 1,
  2 and 4 cascade above, so a future regression that reverts the rule is caught.
- 2024, 2025 and 2026 are untouched. 2026's regular-season standings use the terminal official order (Norris and
  Verstappen are level on 188), which 0004 answer 4 and increment 1's stored order already provided; no 2026 outcome
  moves.
- The About page describes the rule as built (see `docs/design.md`, Ties and Final standings).
- Every change above traces to the rule in 0004: the countback where a classified finish decides it, the terminal
  official order where the countback is exhausted. None depends on array order or sort stability.
