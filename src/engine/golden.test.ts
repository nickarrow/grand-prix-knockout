// Golden regression suite: pins the full playoff outcome of every bundled season.
//
// These baselines are the record of truth for the playoff engine. 2020-2025 are
// complete seasons; their blocks must never move from an engine edit. If one
// moves, that is a real regression unless a decision record in docs/decisions/
// records it on purpose, as AGENTS.md requires.
//
// Updated in increment 2 (decision 0006) for the full-classification tiebreaker.
// That rule, which counts every classified finishing position with no cut-off and
// applies to every season, moved four completed seasons from their increment-1
// values:
//   - 2020: champion Hamilton -> Verstappen, with the Round 1/2/4 cascade below.
//     The hinge is the Round 1 0-point tie, where Albon's best finish (12th) beats
//     Norris's (13th), so Albon survives, Norris goes out, and the bracket
//     cascades to Verstappen winning the one-race final.
//   - 2023: Round 1 and Round 2 eliminations change; same four finalists, same
//     champion (Verstappen).
//   - 2021: Round 3 eliminated pair reorders (Sainz then Leclerc); order only,
//     same finalists and champion.
//   - 2022: Round 2 eliminated pair reorders (Bottas then Sainz); order only,
//     same finalists and champion.
// 2024 and 2025 are unchanged. See docs/decisions/0006 for the full before/after.
//
// 2026 is a season in progress. Its block reflects the bundled data (16-race
// regular season complete, no playoff round run). It changes ONLY when the data is
// refreshed, never from an engine edit.

import { describe, it, expect } from 'vitest';

import { loadStaticSeasonData } from 'src/services/static-data';
import type { SeasonStatus } from 'src/types';

import { calculatePlayoffState } from './playoffs';

interface GoldenRound {
  round: number;
  eliminated: string[];
  advancing: string[];
}

interface GoldenOutcome {
  qualifiedDrivers: string[];
  champion: string | null;
  status: SeasonStatus;
  rounds: GoldenRound[];
}

// Completed seasons. These blocks must stay byte-for-byte identical across every
// engine edit in this increment.
const COMPLETED_SEASONS: Record<number, GoldenOutcome> = {
  2020: {
    qualifiedDrivers: [
      'hamilton',
      'bottas',
      'max_verstappen',
      'norris',
      'albon',
      'ricciardo',
      'leclerc',
      'stroll',
      'perez',
      'gasly',
    ],
    champion: 'max_verstappen',
    status: 'completed',
    rounds: [
      {
        round: 1,
        eliminated: ['norris', 'stroll'],
        advancing: [
          'hamilton',
          'max_verstappen',
          'bottas',
          'leclerc',
          'perez',
          'gasly',
          'ricciardo',
          'albon',
        ],
      },
      {
        round: 2,
        eliminated: ['albon', 'gasly'],
        advancing: ['hamilton', 'perez', 'leclerc', 'bottas', 'ricciardo', 'max_verstappen'],
      },
      {
        round: 3,
        eliminated: ['bottas', 'leclerc'],
        advancing: ['perez', 'hamilton', 'max_verstappen', 'ricciardo'],
      },
      {
        round: 4,
        eliminated: ['hamilton', 'ricciardo', 'perez'],
        advancing: ['max_verstappen'],
      },
    ],
  },
  2021: {
    qualifiedDrivers: [
      'hamilton',
      'max_verstappen',
      'bottas',
      'norris',
      'perez',
      'sainz',
      'leclerc',
      'ricciardo',
      'gasly',
      'alonso',
    ],
    champion: 'max_verstappen',
    status: 'completed',
    rounds: [
      {
        round: 1,
        eliminated: ['gasly', 'alonso'],
        advancing: [
          'max_verstappen',
          'bottas',
          'perez',
          'hamilton',
          'leclerc',
          'ricciardo',
          'norris',
          'sainz',
        ],
      },
      {
        round: 2,
        eliminated: ['norris', 'ricciardo'],
        advancing: ['max_verstappen', 'hamilton', 'perez', 'leclerc', 'bottas', 'sainz'],
      },
      {
        round: 3,
        eliminated: ['sainz', 'leclerc'],
        advancing: ['hamilton', 'max_verstappen', 'bottas', 'perez'],
      },
      {
        round: 4,
        eliminated: ['hamilton', 'bottas', 'perez'],
        advancing: ['max_verstappen'],
      },
    ],
  },
  2022: {
    qualifiedDrivers: [
      'max_verstappen',
      'leclerc',
      'perez',
      'russell',
      'sainz',
      'hamilton',
      'norris',
      'ocon',
      'alonso',
      'bottas',
    ],
    champion: 'max_verstappen',
    status: 'completed',
    rounds: [
      {
        round: 1,
        eliminated: ['ocon', 'alonso'],
        advancing: [
          'leclerc',
          'perez',
          'max_verstappen',
          'sainz',
          'norris',
          'russell',
          'hamilton',
          'bottas',
        ],
      },
      {
        round: 2,
        eliminated: ['bottas', 'sainz'],
        advancing: ['max_verstappen', 'perez', 'leclerc', 'hamilton', 'russell', 'norris'],
      },
      {
        round: 3,
        eliminated: ['leclerc', 'norris'],
        advancing: ['russell', 'hamilton', 'max_verstappen', 'perez'],
      },
      {
        round: 4,
        eliminated: ['perez', 'russell', 'hamilton'],
        advancing: ['max_verstappen'],
      },
    ],
  },
  2023: {
    qualifiedDrivers: [
      'max_verstappen',
      'perez',
      'hamilton',
      'alonso',
      'sainz',
      'leclerc',
      'russell',
      'norris',
      'stroll',
      'gasly',
    ],
    champion: 'max_verstappen',
    status: 'completed',
    rounds: [
      {
        round: 1,
        eliminated: ['perez', 'stroll'],
        advancing: [
          'max_verstappen',
          'norris',
          'russell',
          'leclerc',
          'hamilton',
          'alonso',
          'sainz',
          'gasly',
        ],
      },
      {
        round: 2,
        eliminated: ['gasly', 'alonso'],
        advancing: ['max_verstappen', 'norris', 'sainz', 'hamilton', 'leclerc', 'russell'],
      },
      {
        round: 3,
        eliminated: ['hamilton', 'russell'],
        advancing: ['max_verstappen', 'norris', 'leclerc', 'sainz'],
      },
      {
        round: 4,
        eliminated: ['leclerc', 'norris', 'sainz'],
        advancing: ['max_verstappen'],
      },
    ],
  },
  2024: {
    qualifiedDrivers: [
      'max_verstappen',
      'norris',
      'leclerc',
      'piastri',
      'sainz',
      'hamilton',
      'russell',
      'perez',
      'alonso',
      'stroll',
    ],
    champion: 'leclerc',
    status: 'completed',
    rounds: [
      {
        round: 1,
        eliminated: ['alonso', 'stroll'],
        advancing: [
          'norris',
          'max_verstappen',
          'leclerc',
          'sainz',
          'piastri',
          'russell',
          'hamilton',
          'perez',
        ],
      },
      {
        round: 2,
        eliminated: ['hamilton', 'perez'],
        advancing: ['max_verstappen', 'norris', 'leclerc', 'sainz', 'russell', 'piastri'],
      },
      {
        round: 3,
        eliminated: ['sainz', 'norris'],
        advancing: ['russell', 'max_verstappen', 'leclerc', 'piastri'],
      },
      {
        round: 4,
        eliminated: ['russell', 'max_verstappen', 'piastri'],
        advancing: ['leclerc'],
      },
    ],
  },
  2025: {
    qualifiedDrivers: [
      'piastri',
      'norris',
      'max_verstappen',
      'russell',
      'leclerc',
      'hamilton',
      'antonelli',
      'albon',
      'hadjar',
      'hulkenberg',
    ],
    champion: 'max_verstappen',
    status: 'completed',
    rounds: [
      {
        round: 1,
        eliminated: ['albon', 'hadjar'],
        advancing: [
          'max_verstappen',
          'russell',
          'norris',
          'leclerc',
          'piastri',
          'hamilton',
          'antonelli',
          'hulkenberg',
        ],
      },
      {
        round: 2,
        eliminated: ['hamilton', 'hulkenberg'],
        advancing: ['norris', 'max_verstappen', 'antonelli', 'russell', 'leclerc', 'piastri'],
      },
      {
        round: 3,
        eliminated: ['norris', 'leclerc'],
        advancing: ['max_verstappen', 'russell', 'antonelli', 'piastri'],
      },
      {
        round: 4,
        eliminated: ['piastri', 'russell', 'antonelli'],
        advancing: ['max_verstappen'],
      },
    ],
  },
};

// Season in progress. This block came from data/2026.json after the increment 1
// task 7 refresh to 16 completed races: the regular season is now complete (16
// of 16 regular-season races) but no playoff round has run, so the qualifiers
// are fixed and rounds is still empty. The two extra races (15 and 16) moved
// Leclerc ahead of Norris in the regular-season order; that is a data change,
// not an engine change. This block changes only when the data changes.
const SEASON_2026: GoldenOutcome = {
  qualifiedDrivers: [
    'antonelli',
    'russell',
    'hamilton',
    'leclerc',
    'norris',
    'max_verstappen',
    'piastri',
    'hadjar',
    'lawson',
    'gasly',
  ],
  champion: null,
  status: 'regular-season',
  rounds: [],
};

function outcomeFor(year: number): Promise<GoldenOutcome> {
  return loadStaticSeasonData(year).then((data) => {
    if (!data) throw new Error(`No bundled data for ${year}`);
    const state = calculatePlayoffState(data.races, data.calendar, data.regularSeasonStandingOrder);
    return {
      qualifiedDrivers: state.qualifiedDrivers,
      champion: state.champion,
      status: state.status,
      rounds: state.rounds.map((r) => ({
        round: r.round,
        eliminated: r.eliminated,
        advancing: r.advancing,
      })),
    };
  });
}

describe('golden regression: completed seasons never move', () => {
  for (const [year, expected] of Object.entries(COMPLETED_SEASONS)) {
    it(`reproduces the full ${year} playoff outcome`, async () => {
      const actual = await outcomeFor(Number(year));
      expect(actual).toEqual(expected);
    });
  }
});

describe('golden regression: 2026 season in progress', () => {
  it('reproduces the bundled 2026 outcome (14-race regular season, updated to 16 in task 7)', async () => {
    const actual = await outcomeFor(2026);
    expect(actual).toEqual(SEASON_2026);
  });
});
