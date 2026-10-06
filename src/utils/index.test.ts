import { describe, it, expect } from 'vitest';

import type { KnockoutState, KnockoutRound, DriverStanding } from 'src/types';

import {
  getEliminationRound,
  getBracketPoints,
  getKnockoutRoundPoints,
  advancedViaTiebreaker,
} from './index';

// Helper to create a mock driver standing
const createStanding = (driverId: string, points: number): DriverStanding => ({
  driver: {
    driverId,
    code: driverId.toUpperCase(),
    firstName: 'Test',
    lastName: driverId,
    nationality: 'Test',
    constructorId: 'test',
    constructorName: 'Test Team',
  },
  points,
  wins: 0,
  podiums: 0,
  position: 1,
  positionHistory: [],
  officialPoints: 0,
});

// Helper to create a mock knockout round
const createRound = (
  roundNum: number,
  standings: Array<{ id: string; points: number }>,
  eliminated: string[] = []
): KnockoutRound => ({
  round: roundNum,
  raceNumbers: [roundNum],
  standings: standings.map((s) => createStanding(s.id, s.points)),
  isComplete: eliminated.length > 0,
  eliminated,
  advancing: standings.filter((s) => !eliminated.includes(s.id)).map((s) => s.id),
  atRisk: [],
});

describe('getEliminationRound', () => {
  it('should return -1 for non-qualifiers', () => {
    const state: KnockoutState = {
      season: 2025,
      totalRaces: 24,
      regularSeasonRaces: 17,
      knockoutStartRace: 18,
      regularSeasonComplete: true,
      regularSeasonStandings: [],
      qualifiedDrivers: ['d1', 'd2', 'd3'],
      rounds: [],
      champion: null,
      status: 'playoffs',
    };

    expect(getEliminationRound('d11', state)).toBe(-1);
  });

  it('should return 0 for finalists still competing', () => {
    const state: KnockoutState = {
      season: 2025,
      totalRaces: 24,
      regularSeasonRaces: 17,
      knockoutStartRace: 18,
      regularSeasonComplete: true,
      regularSeasonStandings: [],
      qualifiedDrivers: ['d1', 'd2', 'd3'],
      rounds: [createRound(1, [{ id: 'd1', points: 50 }], [])],
      champion: null,
      status: 'playoffs',
    };

    expect(getEliminationRound('d1', state)).toBe(0);
  });

  it('should return elimination round number', () => {
    const state: KnockoutState = {
      season: 2025,
      totalRaces: 24,
      regularSeasonRaces: 17,
      knockoutStartRace: 18,
      regularSeasonComplete: true,
      regularSeasonStandings: [],
      qualifiedDrivers: ['d1', 'd2', 'd3'],
      rounds: [
        createRound(
          1,
          [
            { id: 'd1', points: 50 },
            { id: 'd2', points: 40 },
            { id: 'd3', points: 30 },
          ],
          ['d3']
        ),
      ],
      champion: null,
      status: 'playoffs',
    };

    expect(getEliminationRound('d3', state)).toBe(1);
  });
});

describe('getKnockoutRoundPoints', () => {
  it('should return null for undefined round', () => {
    expect(getKnockoutRoundPoints(undefined, 'd1')).toBeNull();
  });

  it('should return null for driver not in standings', () => {
    const round = createRound(1, [{ id: 'd1', points: 50 }], []);
    expect(getKnockoutRoundPoints(round, 'd99')).toBeNull();
  });

  it('should return points for driver in standings', () => {
    const round = createRound(
      1,
      [
        { id: 'd1', points: 50 },
        { id: 'd2', points: 40 },
      ],
      []
    );
    expect(getKnockoutRoundPoints(round, 'd1')).toBe(50);
    expect(getKnockoutRoundPoints(round, 'd2')).toBe(40);
  });
});

describe('getBracketPoints', () => {
  it('should return 0 when no rounds exist', () => {
    const state: KnockoutState = {
      season: 2025,
      totalRaces: 24,
      regularSeasonRaces: 17,
      knockoutStartRace: 18,
      regularSeasonComplete: false,
      regularSeasonStandings: [],
      qualifiedDrivers: ['d1'],
      rounds: [],
      champion: null,
      status: 'regular-season',
    };

    expect(getBracketPoints('d1', 1, state)).toBe(0);
  });

  it('should sum points from start round onward', () => {
    const state: KnockoutState = {
      season: 2025,
      totalRaces: 24,
      regularSeasonRaces: 17,
      knockoutStartRace: 18,
      regularSeasonComplete: true,
      regularSeasonStandings: [],
      qualifiedDrivers: ['d1'],
      rounds: [
        createRound(1, [{ id: 'd1', points: 50 }], []),
        createRound(2, [{ id: 'd1', points: 40 }], []),
        createRound(3, [{ id: 'd1', points: 30 }], []),
      ],
      champion: null,
      status: 'playoffs',
    };

    // From R1: 50 + 40 + 30 = 120
    expect(getBracketPoints('d1', 1, state)).toBe(120);
    // From R2: 40 + 30 = 70
    expect(getBracketPoints('d1', 2, state)).toBe(70);
    // From R3: 30
    expect(getBracketPoints('d1', 3, state)).toBe(30);
  });

  it('should handle driver not in some rounds', () => {
    const state: KnockoutState = {
      season: 2025,
      totalRaces: 24,
      regularSeasonRaces: 17,
      knockoutStartRace: 18,
      regularSeasonComplete: true,
      regularSeasonStandings: [],
      qualifiedDrivers: ['d1', 'd2'],
      rounds: [
        createRound(
          1,
          [
            { id: 'd1', points: 50 },
            { id: 'd2', points: 40 },
          ],
          []
        ),
        createRound(2, [{ id: 'd1', points: 30 }], []), // d2 not in R2
      ],
      champion: null,
      status: 'playoffs',
    };

    // d2 only has R1 points
    expect(getBracketPoints('d2', 1, state)).toBe(40);
  });
});

describe('advancedViaTiebreaker', () => {
  it('should return false for undefined round', () => {
    expect(advancedViaTiebreaker(undefined, 'd1')).toBe(false);
  });

  it('should return false for round with no eliminations', () => {
    const round = createRound(
      1,
      [
        { id: 'd1', points: 50 },
        { id: 'd2', points: 40 },
      ],
      []
    );
    expect(advancedViaTiebreaker(round, 'd1')).toBe(false);
  });

  it('should return false for driver not in standings', () => {
    const round = createRound(1, [{ id: 'd1', points: 50 }], ['d2']);
    expect(advancedViaTiebreaker(round, 'd99')).toBe(false);
  });

  it('should return false for eliminated driver', () => {
    const round = createRound(
      1,
      [
        { id: 'd1', points: 50 },
        { id: 'd2', points: 50 },
      ],
      ['d2']
    );
    expect(advancedViaTiebreaker(round, 'd2')).toBe(false);
  });

  it('should return false when advancing driver has more points than eliminated', () => {
    const round = createRound(
      1,
      [
        { id: 'd1', points: 50 },
        { id: 'd2', points: 40 },
        { id: 'd3', points: 30 },
      ],
      ['d3']
    );
    expect(advancedViaTiebreaker(round, 'd1')).toBe(false);
    expect(advancedViaTiebreaker(round, 'd2')).toBe(false);
  });

  it('should return true when advancing driver tied with eliminated driver', () => {
    const round = createRound(
      1,
      [
        { id: 'd1', points: 50 },
        { id: 'd2', points: 30 },
        { id: 'd3', points: 30 },
      ],
      ['d3']
    );
    // d2 advanced with same points as eliminated d3
    expect(advancedViaTiebreaker(round, 'd2')).toBe(true);
    // d1 had more points, not a tiebreaker
    expect(advancedViaTiebreaker(round, 'd1')).toBe(false);
  });

  it('should return true for multiple drivers advancing via tiebreaker', () => {
    const round = createRound(
      1,
      [
        { id: 'd1', points: 0 },
        { id: 'd2', points: 0 },
        { id: 'd3', points: 0 },
      ],
      ['d3']
    );
    // d1 and d2 both advanced with 0 points, same as eliminated d3
    expect(advancedViaTiebreaker(round, 'd1')).toBe(true);
    expect(advancedViaTiebreaker(round, 'd2')).toBe(true);
  });
});
