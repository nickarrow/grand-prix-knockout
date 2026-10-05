# 0002. Adopt the agentic engineering bootstrap practice

Date: 2026-10-05.

Status: Accepted.

## Context

Until October 2026 the project's written record was `PROJECT_FOUNDATION.md`, created on 15 February 2026, which held the
design, a five-phase plan and the development standards in one file, and `.kiro/steering/dev-standards.md`, an always-on
steering file. By October several claims in the first were out of date, listed below, and the June decision on points
had been recorded nowhere but a commit message.

The owner wrote the agentic engineering bootstrap, version 2026.09.24. It keeps three documents with separate jobs, a
design document, a delivery plan and decision records, and puts material that only matters sometimes into skills that
load when they apply.

Two alternatives were plausible.

- Kiro's spec workflow, with `requirements.md`, `design.md` and `tasks.md` for each feature and an approval gate between
  them. It is built into Kiro, and its task list gets a live execution view. Rejected because it splits requirements
  from the design, and for a project run by one person that split produces files that have to agree with each other and
  give nothing back (the reasoning in the `project-docs` skill). The work planned here also spans increments that are
  not one feature each (inferred).
- Bringing `PROJECT_FOUNDATION.md` up to date. Rejected because it mixes the design, the plan and the standards, the
  overlap that lets one of them go stale inside the others.

## Decision

- `docs/design.md`, `docs/delivery-plan.md` and `docs/decisions/` replace `PROJECT_FOUNDATION.md`, which is deleted.
- `AGENTS.md` holds what is true in every session, adapted from the bootstrap with this project's non-negotiables.
- Skills under `.kiro/skills/` hold the rest: `project-docs`, `review` and `writing-code` adapted from the bootstrap;
  `codebase-conventions`, made from `dev-standards.md` and corrected to the real stack; and `f1-rules`, a new domain
  skill in place of the bootstrap's `hhs-benefits`.
- The development standards move out of always-on steering into `codebase-conventions`, and `dev-standards.md` is
  deleted. The setup diagnostic on 2026-10-05 found that a workflow step session received always-on steering and no
  skills, so a short always-on file, `.kiro/steering/read-first.md`, stays and tells every session to read `AGENTS.md`
  and the skill files.
- `NOTICE.md` comes in, because this repository's `LICENSE` names "Grand Prix Playoffs" as copyright holder while the
  bootstrap's names Nick Aretakis, and MIT asks for the notice to travel with the adapted files.
- `CHANGELOG.md` starts with this change.
- Left out of the bootstrap: the `stack` skill, because the stack is chosen; the `hhs-benefits` skill, because the
  domain is F1; `DATA-GUARD.md`, the `sensitive/` folder and the starter `.gitignore`, because every piece of data here
  is public; `HOW-TO-WORK.md` and `missions/`, which teach the practice to a person and stay in the bootstrap's own
  repository.

## Consequences

Sessions that do not load skills still get the rules, from `AGENTS.md` and the steering file. The bootstrap found that
Kiro registers skills only from `.kiro/skills/` at the top of the opened folder, so sessions opened on the main checkout
see these skills only once this change is merged (inferred from the bootstrap's tested finding, not tested here).

Three documents have to be kept in step. The delivery plan's rule is that an increment which changes the design updates
`docs/design.md` in the same change.

Where each claim in `PROJECT_FOUNDATION.md` went:

| Claim in `PROJECT_FOUNDATION.md`                                      | Now                                                                                                 |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Merit, pressure, finality; an alternative rather than a replacement   | `docs/design.md`, unchanged                                                                         |
| Last seven races, top ten qualify, rounds of 10 to 8 to 6 to 4, Final | `docs/design.md`, unchanged                                                                         |
| Points reset each round, and a round counts only its own races        | `docs/design.md`, unchanged                                                                         |
| Race points 25 to 1; sprint points 8 to 1                             | True; sprints scored 3, 2, 1 in 2021. `f1-rules` skill                                              |
| One point for pole position                                           | Superseded by `0001-official-points-no-pole-point.md`                                               |
| One point for the fastest lap if in the top ten                       | True for 2019 to 2024 only, and taken from the API. `0001`                                          |
| Ties follow the official F1 countback                                 | Never fully built. Superseded by `0004-tiebreak-countback-then-regular-season.md`                   |
| A new driver mid-season starts at 0                                   | `docs/design.md`, unchanged                                                                         |
| Disqualifications use the official revised results                    | `docs/design.md`, unchanged                                                                         |
| Playoffs are always the last seven completed races                    | Superseded by `0005-lock-qualifiers-and-playoff-races.md`                                           |
| React 18, MUI v5, React Router v6                                     | Corrected to React 19.2, MUI 7.3 and React Router 7.13 in `codebase-conventions`                    |
| Jolpica limits of 4 a second and 200 an hour                          | Corrected to 4 a second and 500 an hour, from Jolpica's docs on 2026-10-05. `f1-rules`              |
| Jolpica endpoints, including `/current/driverStandings`               | The code reads the calendar and per-round results, qualifying and sprint; nothing reads standings   |
| OpenF1 as a backup API, then local JSON                               | Dropped. Skipped in February as not needed and never built; leftover OpenF1 config is dead code     |
| Data flow from the API with JSON as the last resort                   | Reversed in February: bundled JSON first, the API only for seasons without a file. `docs/design.md` |
| Project tree with `services/openf1.ts` and a `tests/` folder          | Neither exists; tests sit beside the code. `AGENTS.md`, "Where things live"                         |
| Routes `/`, `/2025`, `/2026`, `/about`; home shows 2025 until 2026    | Routes are `/:year` for 2020 to 2026; home shows 2026. `docs/design.md`                             |
| Season state detected from today's date                               | The code goes by completed races first and the date second                                          |
| Phases 1 to 5, 15 to 28 February                                      | `docs/delivery-plan.md`, "Before this plan"                                                         |
| 31 unit tests                                                         | 50 on 2026-10-05                                                                                    |
| Development standards, commit format, PR checklist, constants         | `codebase-conventions` skill and `AGENTS.md`                                                        |
| Future considerations                                                 | `docs/design.md`, "What it will not do"; seasons 2020 to 2024 shipped in February                   |
| Legal disclaimer                                                      | `AGENTS.md` and `docs/design.md`, unchanged                                                         |
| Preview deployments for pull requests; Cloudflare Web Analytics       | Not checked. `docs/design.md`, open question 3                                                      |
