---
name: codebase-conventions
description: Use whenever reading, writing, reviewing, refactoring or testing code under src/ in this repository, including components, pages, hooks, the playoff engine, services, constants, theme, types and tests, and whenever a change touches package.json, tsconfig, ESLint or Prettier settings. Covers the stack and its versions, TypeScript and ESLint settings, folders, naming, imports, the no-magic-numbers rule, file sizes, MUI styling, TanStack Query, state, error handling, tests, accessibility checks and the pull request checklist.
---

# How code is written here

These are the house rules for `src/`. They came from `.kiro/steering/dev-standards.md`, written on 2026-02-15, and were
checked against the code on 2026-10-05. Where the code breaks a rule today, the rule stands and the breach is listed, so
nobody copies it.

## The stack

From `package-lock.json` on 2026-10-05:

| Piece             | Version                                |
| ----------------- | -------------------------------------- |
| React             | 19.2                                   |
| MUI (Material UI) | 7.3, styled with Emotion               |
| TanStack Query    | 5.90                                   |
| React Router      | 7.13, imported from `react-router-dom` |
| Zustand           | 5                                      |
| Vite              | 7.3                                    |
| Vitest            | 4, with jsdom and Testing Library      |
| TypeScript        | 5.9                                    |
| ESLint            | 9, flat config in `eslint.config.js`   |
| Prettier          | 3.8                                    |
| Icons             | `lucide-react`                         |
| Git hooks         | Husky 9 and lint-staged 16             |

`@mui/icons-material` is a dependency and nothing imports it. Do not start using it; increment 3 removes it.

## TypeScript

- Strict mode is on in `tsconfig.app.json`, along with `noUncheckedIndexedAccess`, `noImplicitReturns`,
  `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` and `erasableSyntaxOnly`. Indexing an array gives
  `T | undefined`, so handle the undefined case rather than asserting it away.
- No `any`. ESLint fails on it. Use a proper type, or `unknown` with a type guard.
- Explicit return types on every function. ESLint warns, and the PR checklist treats a warning as a failure.
- Interfaces for object shapes, `type` for unions and primitives. Shared types live in `src/types/index.ts`.
- Use `import type` for type-only imports, which `verbatimModuleSyntax` requires.
- Prefer `const` over `let`, and never use `var`.

## Formatting and linting

Prettier settings in `.prettierrc`: single quotes, semicolons, width 100, two-space indent, trailing commas where ES5
allows them, and LF line endings. `npm run format:check` covers `src/**/*.{ts,tsx,css,json}`. lint-staged runs ESLint
with `--fix` and Prettier on staged `ts` and `tsx` files, and Prettier on staged `json`, `css` and `md` files.

`src/pages/AboutPage.tsx` fails the Prettier check today. On a Windows checkout with `core.autocrlf=true` every file
fails it, because the working tree has CRLF endings; add `--end-of-line auto` to see the real result.

`no-console` allows only `console.warn` and `console.error`.

## Folders

- `src/engine/` is the playoff logic: `points.ts`, `standings.ts`, `playoffs.ts`. Pure functions of race data, with no
  React, no fetching and no dates other than the ones passed in.
- `src/services/` loads data. `static-data.ts` reads the bundled `data/<year>.json`; `jolpica.ts` calls the API;
  `api.ts` holds the TanStack Query hooks and the query key factory.
- `src/components/` groups components by feature: `standings/`, `layout/`, `common/`, `bracket/`.
- `src/pages/` has one component per route. `src/router.tsx` defines the routes.
- `src/hooks/` holds custom hooks, `src/store/` the Zustand stores, `src/theme/` the MUI theme and palette, `src/utils/`
  helpers over the playoff state, `src/constants/` every number.
- Tests sit next to the code they test, named `*.test.ts`.

## Imports

Absolute imports from `src/`, which both `tsconfig.app.json` and `vite.config.ts` resolve:
`import { PLAYOFF_QUALIFIERS } from 'src/constants';`. Relative imports only within a folder, such as
`import { DriverRow } from './DriverRow';`.

Order the groups with a blank line between them: React, then external packages, then `src/` modules, then relative
imports. Each folder has an `index.ts` that re-exports its public pieces; import from the folder rather than reaching
into its files.

## Naming

- PascalCase for components, interfaces, types and enums.
- camelCase for functions and variables. Hooks start with `use`.
- SCREAMING_SNAKE_CASE for constants.
- A component's file is named after the component (`DriverRow.tsx`). A hook's or store's file is named after the hook
  (`usePlayoffData.ts`, `useThemeStore.ts`). Other files are kebab-case (`static-data.ts`).
- Use the words F1 uses for F1 things: classified, sprint, countback. The `writing-code` skill says why, and increment 4
  settles the words for the playoff itself.
- "Round" means two things here. In F1 it is one Grand Prix (round 17 of 23), which is `race.round` in the code. In this
  project "Round 1" is a playoff stage of two races, which is `PlayoffRound.round`. Say which one you mean.

## Components

- Functional components with hooks only.
- One exported component per file. `StandingsTable.tsx` also declares `SectionBanner`, which is the pattern to stop
  repeating.
- Keep components to about 200 lines and split by responsibility when they grow past it. On 2026-10-05
  `StandingsTable.tsx` was 334 lines, `PhaseSection.tsx` 314, `DriverRow.tsx` 277, `Header.tsx` 251 and
  `AboutPage.tsx` 234. The `writing-code` skill applies when splitting: look for the seam, and do not cut one idea in
  two to get under a number.
- Extract reusable logic into custom hooks.

## Utility and engine files

Keep them to about 150 lines with one clear purpose each. `src/services/jolpica.ts` was 243 lines on 2026-10-05,
`src/engine/playoffs.ts` 231 and `src/services/static-data.ts` 167.

## No magic numbers

Every rule number lives in `src/constants/`: points scales, positions, round sizes, qualifiers, seasons, cache times.

```typescript
// Bad
if (position <= 10) { ... }
const points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

// Good
import { RACE_POINTS, RACE_POINTS_POSITIONS } from 'src/constants';
if (position <= RACE_POINTS_POSITIONS) { ... }
```

MUI spacing units in `sx`, such as `p: 3`, are theme tokens and are fine.

Breaches on 2026-10-05, due for the increment 3 cleanup:

- `src/engine/points.ts` redeclares the race and sprint points arrays inside `getRacePoints` and `getSprintPoints`.
- `countPodiums` in `src/engine/standings.ts` compares against a literal `3`.
- `getStatusText` in `src/pages/SeasonPage.tsx` compares against a literal `4` and defaults the year to `'2025'`.
- `RaceCard.tsx` tests for a win by comparing with `POLE_POSITION`.
- `F1_COLUMN_WIDTH` is declared separately in `StandingsTable.tsx` and `DriverRow.tsx`.

## DRY

- Extract repeated code into a utility or a hook. Copied twice means refactor.
- Share types through `src/types/`.
- Prefer composition to passing props down several levels.

## MUI and styling

- `sx` for one-off styles, `styled()` for reusable styled components.
- Colours, spacing and typography come from the theme in `src/theme/`. Mode-aware colours such as `ELIMINATION_COLOR`,
  `PODIUM_COLORS` and `POINTS_COLORS` live in `src/theme/palette.ts` with a `light` and a `dark` value each. Team
  colours live in `src/constants/teams.ts` and cover only the 2025 constructorIds today.
- Mobile first: write the phone style, then add `sm`, `md` and `lg` overrides.

```typescript
// Bad: hardcoded values, desktop first
<Box sx={{ width: 800, padding: '24px', color: '#ff0000' }}>

// Good: theme values, mobile first
<Box sx={{ width: { xs: '100%', md: 800 }, p: 3, color: 'error.main' }}>
```

The theme declares the Inter font and nothing loads it, so the browser falls back to Roboto or Helvetica. Increment 3
either loads it or stops declaring it.

## Data fetching with TanStack Query

- Query keys are arrays built by the factory `queryKeys` in `src/services/api.ts`, for example
  `queryKeys.seasons.results(year)`. Add new keys to the factory rather than writing arrays inline.
- Every component that fetches handles loading, error and empty states.
- The `QueryClient` in `src/App.tsx` sets `staleTime` and `gcTime` from `CACHE_STALE_TIME` and `CACHE_GC_TIME` in
  `src/constants/config.ts`, with two retries and no refetch on window focus.
- Bundled season files come first. The live API is the fallback for a season with no bundled data, and it fetches one
  race at a time, so it must never be reachable for a year the site does not support.

## State

| Data                | Tool               | Example here                             |
| ------------------- | ------------------ | ---------------------------------------- |
| Server and API data | TanStack Query     | Season calendar and results              |
| Global UI state     | Zustand            | Theme mode, `src/store/useThemeStore.ts` |
| Which season        | The URL            | The `:year` route parameter              |
| Local UI state      | `useState`         | A driver row's expanded flag             |
| Derived data        | Computed in render | The playoff state from `usePlayoffData`  |

Never put server data in Zustand.

## Environment variables

- Client-side variables start with `VITE_` and are read through `import.meta.env`.
- Real values go in `.env.local`, which git ignores. `.env.example` lists the names with placeholder values.
- `src/constants/config.ts` is the one place they are read:

```typescript
export const JOLPICA_API_BASE_URL = isDev
  ? '/api/f1'
  : import.meta.env.VITE_JOLPICA_API_URL || 'https://api.jolpi.ca/ergast/f1';
```

`VITE_OPENF1_API_URL` and `OPENF1_API_BASE_URL` are left over from an OpenF1 backup that was never built.

## Error handling

- Handle every API error. Use `try`/`catch` around async work.
- Show the reader a message they can act on, and log the detail with `console.error`.
- Today `/foo` shows "Failed to load NaN data: Jolpica API error: 400". Treat that as the example of what not to ship.

## Tests

- Vitest with `globals: true`, the jsdom environment and `src/test/setup.ts`. `npm test` runs them once.
- Test the playoff engine thoroughly, because a wrong answer there changes who is champion.
- Descriptive names that say what must happen: `it('should eliminate bottom 2 drivers after round')`.
- Cover the edge cases: ties, retirements, classified drivers who did not finish, mid-season driver changes, a round
  that is only partly run.
- Keep tests focused and independent of each other and of the clock.
- From increment 1, golden tests pin every completed season's outcome. A change that moves a golden result needs the
  decision record that `AGENTS.md` asks for. They pin the outcomes as today's engine produces them, including the five
  Round 1 eliminations of 2020, 2022 and 2023 that sort stability decided
  (`docs/decisions/0004-tiebreak-countback-then-regular-season.md`). If increment 2's rule moves them, it does so on
  purpose and lists each one.
- To see the interface at a given point in a season, replay it by truncating its bundled data. The technique is in the
  `review` skill, under "Replaying a season by truncating its bundled data".

## Accessibility

- Semantic HTML first. Anything clickable is a real button, or carries the button role, a `tabIndex` and `aria-expanded`
  where it opens something.
- Alt text for images, labels for controls, visible focus.
- Everything works from the keyboard. On 2026-10-05 Tab skipped the desktop Seasons menu trigger, every driver row and
  every phase section header.
- Contrast meets WCAG 2.2 AA in both themes, and nothing is carried by colour alone.
- Check with the accessibility tree through Playwright, and with a screen reader when you can.

## Commits

Conventional Commits with a scope where it helps:

```
feat(engine): add playoff elimination logic
fix(api): handle rate limit errors gracefully
docs(readme): update installation instructions
style(standings): improve mobile layout
refactor(hooks): extract useSeasonData hook
test(engine): add tiebreaker edge case tests
chore(deps): update @mui/material
```

## Pull request checklist

- TypeScript compiles: `npm run build` runs `tsc -b`.
- ESLint passes with no warnings: `npm run lint`.
- Prettier is applied: `npm run format:check`.
- Tests pass: `npm test`.
- Works on a phone-sized screen.
- No console errors or warnings in the browser.
- No repeated code and no new magic numbers.

## Mistakes agents make in this codebase

- Copying a block instead of extracting it.
- Letting a file grow past its limit by appending.
- Writing a number inline instead of adding a constant.
- An async call with no error handling.
- `any`, or a type left out.
- Desktop styles first.
- Colours or spacing written inline instead of taken from the theme.
- Sorting with a comparator that returns 0 for drivers who are not genuinely equal under a published rule, which leaves
  the order to sort stability.
