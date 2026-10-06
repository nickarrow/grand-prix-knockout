// Golden regression suite: pins the full playoff outcome of every bundled season.
//
// These baselines were generated from the engine as it stood at the start of
// increment 1 and are committed BEFORE any engine edit, so that the engine
// changes in this increment (reporting a drop zone instead of eliminating
// mid-round, and the 2026-only regular-season tiebreak key) can be proven not
// to move any completed season's result.
//
// 2020-2025 are complete seasons; their blocks must never change from an engine
// edit. If one moves, that is a real regression unless a decision record in
// docs/decisions/ records it on purpose, as AGENTS.md requires.
//
// 2026 is a season in progress. Its block reflects the bundled data at the time
// of writing. It changes ONLY when the data is refreshed (increment 1 task 7
// takes it from 14 to 16 races), never from an engine edit. The comment on the
// 2026 block records which data it came from.

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
    champion: 'hamilton',
    status: 'completed',
    rounds: [
      {
        round: 1,
        eliminated: ['albon', 'stroll'],
        advancing: [
          'hamilton',
          'max_verstappen',
          'bottas',
          'leclerc',
          'perez',
          'gasly',
          'ricciardo',
          'norris',
        ],
      },
      {
        round: 2,
        eliminated: ['max_verstappen', 'gasly'],
        advancing: ['hamilton', 'perez', 'leclerc', 'bottas', 'ricciardo', 'norris'],
      },
      {
        round: 3,
        eliminated: ['bottas', 'leclerc'],
        advancing: ['hamilton', 'perez', 'ricciardo', 'norris'],
      },
      {
        round: 4,
        eliminated: ['norris', 'ricciardo', 'perez'],
        advancing: ['hamilton'],
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
        eliminated: ['leclerc', 'sainz'],
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
        eliminated: ['sainz', 'bottas'],
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
        eliminated: ['gasly', 'stroll'],
        advancing: [
          'max_verstappen',
          'norris',
          'russell',
          'leclerc',
          'hamilton',
          'alonso',
          'sainz',
          'perez',
        ],
      },
      {
        round: 2,
        eliminated: ['perez', 'alonso'],
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
    const state = calculatePlayoffState(data.races, data.calendar);
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
