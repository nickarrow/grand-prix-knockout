# 0004. Break ties by countback, then by regular-season position

Date: 2026-10-05, decided by the owner. Sub-questions answered 2026-10-06.

Status: Accepted. The four sub-questions below were answered by the owner on 2026-10-06; the answers are recorded under
"Answers (2026-10-06)". The engine change that applies this rule to every season, and the list of every historical
outcome it moves, belong to increment 2's golden-update step and its own decision record.

## Context

The About page promises the standard F1 countback: most wins, then most second places, and so on. The February notes
said the same. The code does less, verified by reading `src/engine/standings.ts` on 2026-10-05:

- It counts race finishes in P1 to P10 only, within the races being compared.
- When those counts are equal, it returns 0 and leaves the order to sort stability, which is the order in which drivers
  first appear in the season's results.
- It has no position at all for a classified driver whose status is "Retired", because the data script and the API
  client keep positions only for "Finished" or statuses containing "Lap".
- Finalist places 2 to 4 and places inside elimination groups sort by points alone.

The FIA's own rule, from the `f1-rules` skill: count first places in a race, then second places, and on with no cut-off;
sprint places do not count from 2021; when the count fails, the FIA nominates the winner (2020 to 2025) or applies the
same count to qualifying results (2026, Section A, A2.1.4c), and the 2026 text has no step after that.

Sort stability has decided five real eliminations, found by running the engine on the bundled data on 2026-10-05:

| Season | Round                 | Advanced | Eliminated    | Points each | Their P1 to P10 counts |
| ------ | --------------------- | -------- | ------------- | ----------- | ---------------------- |
| 2020   | Round 1, races 11, 12 | Norris   | Albon, Stroll | 0           | none for any of them   |
| 2022   | Round 1, races 16, 17 | Bottas   | Ocon, Alonso  | 0           | none for any of them   |
| 2023   | Round 1, races 16, 17 | Perez    | Gasly         | 1           | one tenth place each   |

Corrected on 2026-10-05: the table first gave one eliminated driver for 2020 and one for 2022, where three drivers were
level in each.

`AGENTS.md` requires that no result depends on array order or sort stability.

Alternatives considered:

- Keep the P1 to P10 count and sort stability. Rejected: an outcome nobody can explain from a published rule.
- Copy the FIA rule exactly. Its last step is the FIA's discretion before 2026, which cannot be encoded, and from 2026
  it has no last step at all, so a rule of our own has to end the chain anyway.

## Decision

Drivers level on points are ordered by countback first, and by regular-season position as the final fallback. The order
applies everywhere the site ranks drivers: qualification, eliminations, the drop zone, places inside elimination groups,
finalist places 2 to 4, and the non-qualifiers.

## Answers (2026-10-06)

The owner answered the four sub-questions. The proposals that were put, with their reasoning, are kept below under
"Sub-questions as proposed" so the thinking is not lost.

1. The countback counts only the races of the round being decided, because a round's points come from those races
   alone.
2. It counts every classified finishing position, with no cut-off, so a classified retiree keeps its place. Whether a
   driver is classified is read from Jolpica's `positionText`: a numeric `positionText` means classified at that
   position, a letter means not classified. That only classified positions count is this project's reading of the FIA
   text, which sets no cut-off, rather than its words (inferred).
3. Sprint finishes do not count in the countback, following the FIA's wording of "places in a race" (2021 to 2025
   Sporting Regulations, Art. 7.2; 2026 Section A, A2.1.4c). Sprint points still count toward a round's points; only the
   countback ignores them.
4. The terminal fallback is regular-season finishing position, and where that cannot be its own fallback (two drivers
   level in the regular-season standings themselves), the official F1 standings order after the last regular-season
   race, read from Jolpica's driver standings for that round. This is Option A.

## Sub-questions as proposed

1. Which races the countback counts. Proposal: the races of the round being decided, because its points come from those
   races alone. The alternative is the whole season so far.
2. How deep it counts. Proposal: every classified position, as the FIA text sets no cut-off, with classification taken
   from Jolpica's `positionText` so classified retirees keep their places. That only classified positions count is our
   reading of the text rather than its words (inferred). The alternative stops at tenth, as now.
3. Whether sprint finishes count. Proposal: no, following the FIA's "places in a race" (2021 to 2025 Sporting
   Regulations, Art. 7.2; 2026 Section A, A2.1.4c). The alternative counts sprint places after race places, because a
   round's points include sprint points.
4. How ties in the regular-season standings are broken, where regular-season position cannot be its own fallback. Option
   A, the proposal: the order of the official F1 standings after the last regular-season race, from Jolpica's driver
   standings for that round. Option B: a published rule of our own, such as countback over the regular-season races,
   then countback over qualifying results as the 2026 regulations do, then a fixed last key such as the driver's
   permanent number.

## Consequences

- Some historical eliminations may change, starting with the five in the table, which would be decided by where the
  drivers finished in the round's races. A change can cascade: the driver who now advances races in the next round, so
  that round's outcome can move too (inferred). Increment 2 computes the new outcomes, updates the golden tests on
  purpose, and lists every change in its decision record. That record is
  [0006](0006-full-classification-countback-golden-changes.md): the full rule moved four completed seasons, 2020 (the
  champion flips from Hamilton to Verstappen), 2021, 2022 and 2023, with the before/after and the deciding rule for each
  case there.
- Increment 1 brings in regular-season position as the last key, after today's top-ten count, for 2026 only: the drop
  zone, and any 2026 round that completes before increment 2 lands. Completed seasons keep today's ordering until
  increment 2 changes them all at once under the full rule, so increment 1's golden tests stay unchanged and no past
  season changes twice. The orchestrator chose this on 2026-10-05, answering the review, and the owner can overrule it
  at review. Applied on its own to completed seasons, the key would flip 2022 Round 1: Bottas, Ocon and Alonso were all
  on 0 with no top-ten finish, and Ocon was eighth in the regular season, so Ocon would advance and Bottas and Alonso
  would go out. In 2020 and 2023 the same drivers would go through. The full countback may flip 2022 back. These
  readings re-order today's engine output for the tied drivers alone, with no knock-on into later rounds, and stay
  unverified until increment 2's golden diff.
- The regular-season standings of 2020 to 2025 have ties, none at the cut between tenth and eleventh: 2020 Leclerc and
  Stroll on 57 for seventh, 2022 Leclerc and Perez on 201 for second, 2024 Russell and Perez on 143 for seventh. All are
  separated by today's countback. In 2026 Norris and Verstappen are level on 188 for fifth.
- The About page has to describe the rule exactly once it is settled.
