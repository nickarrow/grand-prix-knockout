# Working agreement

Rules for any AI agent working in this repository. Kiro loads this file automatically, on every surface, and other tools
read `AGENTS.md` too, which is why the rules live here rather than somewhere tool-specific.

One exception. If somebody has selected a custom agent, Kiro does not include steering files unless that agent's
configuration asks for them, so this file and the skills both go silent. If somebody asks what rules apply here and gets
nothing back, a custom agent is the first thing to suspect.

Workflow step sessions run as custom agents. On 2026-10-05 one received the always-on steering file and no list of
skills, so `.kiro/steering/read-first.md` stays always on and points those sessions at this file and at the skill files.

This file holds what is true in every session. Anything that only matters sometimes is a skill under `.kiro/skills/`,
which loads when it is relevant.

## This repository

Grand Prix Playoffs is a fan-made static website that runs real Formula 1 results through an elimination playoff: the
regular season's top ten go into the last seven races of the calendar, and those seven decide the title. It is live at
grandprixplayoffs.com, and `docs/design.md` holds the rules and the reasons for them.

Commands, all run from the repository root:

- `npm ci` installs exactly what `package-lock.json` pins.
- `npm run dev` starts the Vite dev server, which proxies `/api/f1` to Jolpica.
- `npm test` runs the Vitest suite once. 50 tests passed on 2026-10-05.
- `npm run lint` runs ESLint over the repository.
- `npm run format:check` runs Prettier over `src/` only (`ts`, `tsx`, `css`, `json`), so it never checks Markdown. On a
  Windows checkout with `core.autocrlf=true` it reports every file, because the working tree has CRLF endings while git
  holds LF. `npx prettier --check --end-of-line auto "src/**/*.{ts,tsx,css,json}"` gives the real answer.
- `npm run build` type-checks with `tsc -b` and builds into `dist/`.
- `npm run update-data` runs `scripts/fetch-season-data.mjs` for the current year and overwrites `data/<year>.json`. It
  sends three requests to Jolpica for every completed race. Run it only when the task is about data.

Where things live:

- `src/engine/` holds the playoff logic as pure functions: points, standings, tiebreaks, rounds.
- `src/services/` loads data: the bundled season files first, the Jolpica API for anything else.
- `src/components/` and `src/pages/` hold the interface.
- `src/constants/` holds every number the code uses.
- `data/<year>.json` holds the bundled season data, 2020 to 2026.
- `scripts/fetch-season-data.mjs` writes those files.
- `.github/workflows/update-season-data.yml` runs that script every Monday.
- `docs/` holds the design document, the delivery plan and the decision records.

How it ships. Cloudflare Pages builds and deploys every push to `main`. The data workflow commits to `main` every Monday
at 06:00 UTC. Anything on `main` is live within minutes, and nothing runs the tests before it goes out.

Git rules. Never push to `main`. One branch and one pull request per feature. Commit subjects follow Conventional
Commits (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, with a scope where it helps, as in `fix(engine): ...`).
Show the commit message before committing. Husky runs lint-staged on every commit; let it.

## What is public here, and what never goes in

Everything this project works with is public: race results from Jolpica, the public names of drivers and teams, and the
code.

Secrets never go in the repository or in the chat. That means Cloudflare API tokens, GitHub tokens, and anything in
`.env.local`. If a task needs one, the person sets it in the environment and you refer to it by name.

Real personal data does not belong here. Nothing this site does needs any.

## What has to stay true

These five hold for every change, and they stay here rather than in a skill because a skill can be deleted.

Standings are deterministic and explainable. The same data gives the same standings every time, and every ordering
traces to a rule published on the About page and in `docs/design.md`. No result may depend on array order, sort
stability or map insertion order. Today's code breaks this: when its countback runs out, ties fall to the order in which
drivers first appear in the race results, and that order decided Round 1 eliminations in 2020, 2022 and 2023
(`docs/decisions/0004-tiebreak-countback-then-regular-season.md`).

Every encoded rule carries its source. For an F1 rule that is the article of the FIA regulations for that season, with
the issue, or the Jolpica field the code reads. For a rule of our own it is the decision record. A rule that cannot
carry a source is labelled as a guess rather than shipped quietly.

Build accessibility in rather than auditing it at the end. Keyboard operation, visible focus, real contrast, labelled
controls, and nothing carried by colour alone, so an elimination is written out as well as shown in red. The target is
WCAG 2.2 AA.

This is a fan project. Never present a result as an official F1 result. Keep the disclaimer that says the site is not
affiliated with Formula One Group, the FIA or Formula 1, and keep "Formula 1" and "F1" out of the product name and the
logo.

Completed seasons do not change silently. An engine change that alters any historical outcome needs a decision record
that lists what changed, season by season.

A domain skill may sharpen these. Nothing may loosen them.

## How to work

Talk before you build. Have a conversation first, research it, look for prior art. Do not scaffold before the problem is
understood, and do not offer to.

Change only what you were asked to change. If you spot something else worth doing, say so and wait. Nobody working here
should have to watch you to find out what you touched.

Write it down before the session ends, because the session takes its context with it. Three documents do three jobs:

- A **design document** says what is being built, why, and what has to be true. One document, argued with and revised.
- A **delivery plan** says in what order, and carries the record of what is done. Separate from the design so a stale
  assumption cannot hide inside a task list.
- **Decision records** capture a choice made along the way, dated, one small file each, superseded rather than edited.

Do not invent other names for these. Do not split the design document to make it shorter.

Review before shipping anything substantial. Fan out several reviewers in parallel, each anchored to a different source.
Several agents checking one shared opinion is not review. Treat every finding as a lead: open the file, confirm it, and
say how many you threw out. When reviewing, report rather than fix. If a `review` skill is available, `/review` runs
this properly and you should use it.

Show a commit message before committing it, and put one feature in a pull request rather than six.

## How to write it down

Generated prose has tells, and a document somebody has to defend in a meeting should not read as machine output. So:

- No em-dashes. Use a comma, a full stop, or a new sentence.
- Do not write "it isn't X, it's Y". Say what it is.
- Do not start a paragraph with a bold label as a heading. Bold is fine as a term in a definition list, where the bold
  word is the thing being defined.
- Do not announce a count and then hold it back. "Two things, and one matters more than the other" is a drumroll. Give
  the count only when the number is information, then give the things.
- Do not rate your own writing. "Worth knowing", "worth noting" and "this is important" all say the same thing as
  putting it in the document, and one of those is shorter.
- Vary sentence length. Uniformly short sentences read as machine output the same way uniformly long ones do. A clipped
  line lands because the ones around it are not.
- Concrete numbers over adjectives. Say 900 lines, not unwieldy.
- State an admission plainly, with no clause afterwards that rescues it.
- Do not write about the document inside the document.

A plain idiom is allowed where it is the shortest true thing. Die on that hill. Not with a ten-foot pole. One per
document is plenty, and none is fine.

These are style rules, not safety rules. A team with its own house style should replace them.

## How to check yourself

Say what you did not verify. Which claims you checked against a source, which you took on trust, and which you are
guessing at.

Report counts you actually computed. If you did not count it, say "roughly" or leave the number out.

Do not report a task as done because a command exited zero. Say what you observed.

Record a correction with its date rather than editing history silently. The direction of an error matters as much as the
fact of it.

On anything touching GitHub or Cloudflare: read-only tokens by default, explicit approval before anything changes state,
a token scoped to this repository or this Pages project rather than to the whole account, and never a token that can
deploy production in a session. A push to `main` is itself a production deploy here.

## Skills, and loading them on purpose

Material that only matters sometimes lives in `.kiro/skills/` rather than here. Their names and descriptions are in
front of you from the start of the session. The bodies are not, and they do not arrive by themselves.

So at the start of a piece of work, read the available skill descriptions and load the ones that apply. Do not wait to
be asked for them and do not assume it has happened already. If the work turns toward something a skill covers, load it
then. Say which ones you loaded, so the person can tell whether the right material was in front of you.

This repository has five: `project-docs`, `review`, `writing-code`, `codebase-conventions` and `f1-rules`. If your
session shows no skills, read `.kiro/skills/<name>/SKILL.md` directly.

Deleting a skill is a supported thing to do, including the domain one. Everything in this file stands on its own, so a
missing skill costs detail and never a rule.

---

Adapted from agentic-engineering-bootstrap 2026.09.24, https://github.com/nickarrow/agentic-engineering-bootstrap.
`NOTICE.md` carries its licence.
