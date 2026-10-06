# 0008. Name the product Grand Prix Knockout

Date: 2026-10-06. Decided by the owner in increment 4, after the orchestrator's recommendation.

Status: Accepted. Supersedes nothing. It answers open question 1 in `docs/design.md`.

## Context

The project shipped as Grand Prix Playoffs, and the meta description in `index.html` called the format
"NASCAR-style playoffs". Two problems sat behind that. NASCAR closed its elimination era and its one-race championship
for 2026 and went back to a ten-race points Chase, so the comparison now points at a format that no longer exists. And
"Playoffs" is the vocabulary of a sport the project is not about.

The owner's direction on 2026-10-05 was to drop "Playoffs" and the NASCAR comparison and lean on Formula 1's own
language instead. Open question 1 in `docs/design.md` carried the candidates and the NASCAR-context citations behind
them. This record is the decision those citations support.

## Decision

The product name is Grand Prix Knockout.

The internal vocabulary and the user-facing copy move from playoff and playoffs to knockout. That is the engine types,
the functions, the hooks, the files and the constants, and the words a visitor reads. The decision-0003 wording stays:
a driver in the elimination places is in the "drop zone" and a driver who goes out is "knocked out".

## Reasoning

F1's qualifying format is widely known as knockout qualifying, so the name reimagines Formula 1's own format for the
championship rather than borrowing from another series. The owner's framing is that the site turns F1's knockout
qualifying into a championship series.

It distances the project from NASCAR's now-defunct elimination format, which was the comparison the old copy leaned on
and which stopped being current for 2026.

"Grand Prix" is generic. It sidesteps the "Formula 1" and "F1" trademarks that the AGENTS.md fan-project rule keeps out
of the product name and the logo.

The domain was available. grandprixknockout.com was free when the orchestrator checked it through Verisign RDAP on
2026-10-05, along with gpknockout.com, knockoutgp.com and grandprixko.com. The availability was not checked again for
this record.

## Alternatives considered

- Grand Prix Elimination. Available as grandprixelimination.com. Flatter, and it carries no tie to a real F1 format,
  so it loses the one idea that makes the name mean something.
- Title Decider, Title Shootout and Grand Prix Shootout. All available. "Shootout" reads as NASCAR, which is the
  association the rename is trying to leave. "Decider" is dull.
- Grand Prix Qualifying Championship, floated by the owner. Long, and a reader may take it for a table scored on
  Saturday qualifying rather than a championship format.

## Consequences

The deep code and content rename ships now, in increment 4. The product reads as Grand Prix Knockout everywhere a
visitor looks, the internal names use the knockout vocabulary, and the NASCAR reference is gone from the meta tags and
the copy. No computed outcome moved: `src/engine/golden.test.ts` stays 7 of 7 and the suite stays at 102 tests.

The external rename is a separate stage, run by the owner, and it is not part of this record's change. It covers the
domain grandprixknockout.com with a redirect from grandprixplayoffs.com, the GitHub repository rename, and the
Cloudflare project rename. Until that stage runs, these stay as they are: the `package.json` name, the
`github.com/nickarrow/grand-prix-playoffs` URLs, the grandprixplayoffs.com URLs, and the Cloudflare project name. The
grandprixplayoffs.com registration runs at Cloudflare until 2028-02-15 and can redirect to whatever replaces it.

The `gpp-theme` and `gpp-explainer-collapsed` localStorage keys were kept. Renaming them would reset the saved theme and
the collapsed-explainer state for every returning visitor, and the keys are never shown to a user, so there is nothing
to gain by moving them.
