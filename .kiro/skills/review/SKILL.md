---
name: review
description: Use when asked to review work, when the user types /review, or before anything substantial ships. Fans out several reviewers in parallel, each anchored to a different source, then requires every finding to be confirmed against the file before it is acted on. Covers the review mandates, how to report findings by severity, why the reviewers must not share one source, and which sources each mandate checks against in this repository, including how to replay a season in the browser.
---

# Review protocol

Type `/review` in chat to run this.

Send several reviewers at the work in parallel. Give each one a different job and a different source to check against.
The different source is the part that makes this work. Several agents reviewing the same text against the same shared
opinion produces four versions of one opinion.

Models are bad at finding errors in their own reasoning and good at fixing errors once somebody points at the spot. That
asymmetry is the whole reason to do this.

## Running it

Invoke reviewers two at a time so they run in parallel, then the second pair. Give each one the file paths it needs. A
reviewer that has to go looking will review the wrong thing. Cap each one's reply so it stays readable.

These mandates earned their place by finding things. They are not a fixed set and they are not a ceremony.

Add one when you can name a source it checks against that none of the others does. Drop one when its source does not
exist in this work: there is nothing to check against a citation in a document with no citations, and a reviewer with
nothing to check will invent something to report.

Do not add one that reads the same material in a different mood. Adversarial, sceptical and thorough are moods. A
mandate needs a source, and the whole reason this works is that no two reviewers share one.

Against the source. Check every citation, figure and factual claim against the thing it cites. Does the source say what
the text claims? Is the number characterized correctly? Flag anything stated more strongly than its source supports.
Search for evidence published since that would change a conclusion.

Against the mechanism. Check whether the tools, commands and configuration actually behave the way the work assumes.
Read the current documentation. Where the documentation is ambiguous or contradicts itself, say so rather than picking
the reading that is convenient.

Cold, as the reader. Read it as the person it is for, with their knowledge and not yours. Where would they stop reading?
Which words are undefined? Where does it sound reasonable and leave them unable to act? Name the sticking points
concretely.

Red team. Attack the plan. Is the order defensible? What does it claim to deliver and not deliver? What is missing
entirely? Where is a research question wearing a delivery date?

Do it, do not read it. If the work contains instructions, one reviewer carries them out in a scratch directory instead
of reading them, using the literal commands a person would use, and does not apply judgment to fix an instruction that
is wrong. Report the broken result rather than the corrected one. This mandate was added because three rounds of careful
reading missed an instruction that silently dropped half the files it was copying and then reported success, and one
round of doing found it with the first command. Reading finds contradictions. Doing finds the thing that quietly does
nothing.

For code specifically, add: would a senior engineer be comfortable with this, looking at the whole repository rather
than the diff? No constants, no tests on a critical path, a 900-line file, a type stuffed with data. The thing this is
really guarding against is a future person having to debug something nobody understood when it was written.

## Sources in this repository

Each mandate above, and what it checks against here. Give each reviewer its own entry and nothing from the others.

Against the source:

- The FIA regulations for the season in question: the Formula 1 Sporting Regulations for 2020 to 2025, and for 2026 the
  FIA F1 Regulations Section A [General Regulatory Provisions] and Section B [Sporting]. The `f1-rules` skill gives the
  issue and article for each rule and links each PDF.
- Jolpica data and documentation: the live API at https://api.jolpi.ca/ergast/f1/ and the docs at
  https://github.com/jolpica/jolpica-f1/tree/main/docs
- The rules as published to readers: the About page (`src/pages/AboutPage.tsx`, live at
  https://grandprixplayoffs.com/about), `docs/design.md`, and the records in `docs/decisions/`.

Against the mechanism, using the current documentation for each piece, after checking the installed version in
`package-lock.json`:

- React 19: https://react.dev
- MUI 7: https://mui.com/material-ui/
- TanStack Query 5: https://tanstack.com/query/v5/docs
- React Router 7: https://reactrouter.com
- Vite 7: https://vite.dev
- Vitest 4: https://vitest.dev
- GitHub Actions: https://docs.github.com/en/actions
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- The Jolpica API, especially rate limits, paging and status values:
  https://github.com/jolpica/jolpica-f1/tree/main/docs

Cold, as the reader: a regular on r/formula1, reading on a phone. Knows the sporting regulations well enough to spot a
wrong countback, has seen every gimmick format anyone has proposed, and dislikes gimmicks and NASCAR comparisons. Read
the live site or a local run at a phone-sized viewport such as 390 by 844.

Red team: `docs/delivery-plan.md` against `docs/design.md` and the 2026 calendar in `data/2026.json`. The question that
matters most here is whether each increment lands before the race weekend it is for.

Do it, do not read it:

- Run the dev server and drive it with Playwright, replaying a season by truncating its bundled data. The technique is
  below.
- Run the data script somewhere it cannot overwrite the real files. It writes to `data/<year>.json` under the current
  directory, so `node "<repo>/scripts/fetch-season-data.mjs" 2026` run from a scratch directory writes the scratch copy.
  It sends three requests per completed race, and Jolpica's limits are shared by everybody on the same IP address.
- Run `npm test`, `npm run lint` and `npm run build`, and report what they print rather than the exit code.

The senior-engineer code check: the whole repository with the `codebase-conventions` skill as the house rules, looking
hardest at `src/engine/`, where a wrong answer changes who is champion.

### Replaying a season by truncating its bundled data

Checked on 2026-10-05. The app imports each season file with a dynamic `import()`, so in development Vite serves it as a
JavaScript module at `/data/<year>.json?import`. A Playwright route can swap that module for one that holds only the
first N races, and the app then behaves as it would have on the day after race N.

1. Start the dev server: `npm run dev -- --port 5173 --strictPort`.
2. Before navigating, intercept requests matching `/\/data\/2025\.json\?import/` with `page.route`.
3. In the handler, fetch the original with `route.fetch`. A plain `route.fetch()` returns Vite's module text
   (`export const calendar = ...`) rather than JSON, so ask for the same path without the query string, which Vite
   serves as raw JSON.
4. Parse it and keep the first N races: `data.races = data.races.slice(0, N)`.
5. Fulfil with content type `text/javascript` and the body `export default ` followed by the JSON. The loader in
   `src/services/static-data.ts` reads only the default export.
6. Load http://localhost:5173/2025.

```js
async (page) => {
  const N = 18;
  await page.route(/\/data\/2025\.json\?import/, async (route) => {
    const original = await route.fetch({ url: route.request().url().split('?')[0] });
    const data = await original.json();
    data.races = data.races.slice(0, N);
    await route.fulfill({
      status: 200,
      contentType: 'text/javascript',
      body: 'export default ' + JSON.stringify(data),
    });
  });
  await page.goto('http://localhost:5173/2025');
};
```

To replay several cut points in one session, call `page.unrouteAll()` before setting the next route.

The orchestrator used this on 2026-10-05 to reproduce the mid-round bug: with 2025 cut to 18 of 24 races, one of Round
1's two races, the table already showed "ELIMINATED ROUND 1" with Hadjar and Hulkenberg on 0. Run again later that day,
the same cut showed the status line "Playoff Round 1 • Race 18 of 24" above the same banner, a cut at 16 said "Playoffs
begin next race" with one regular-season race still to run, and a cut at 17 said "0 races until playoffs".

## Then do the hard part

Every finding is a lead, not a fact. Open the file. Confirm it yourself. Reviewers hallucinate line numbers and
occasionally invent the problem.

Report by severity: blocking, should fix, note. Each with the file, the quoted text, and the source or rule it violates.

Say what you could not verify, explicitly.

Report counts you actually computed. If you did not compute it, write "roughly" or leave it out.

Say which findings you rejected and why, and how many you dropped. This step gets skipped and it is the one that keeps
the practice honest.

Report. Do not fix. Ask what to change.

## Why it is a command and not automatic

A hook could run this on a trigger, but a hook cannot make the fan-out happen. It can only put a request in front of the
agent, which then decides. Running it deliberately is the honest version, and one command is cheaper to understand than
automation that sometimes does nothing.

The cost is real. This uses a lot of tokens and a lot of context. It is still the highest-value thing in these files.
