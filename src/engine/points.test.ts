import { describe, it, expect } from 'vitest';

import type { Race } from 'src/types';

import { getRacePoints, getSprintPoints, calculateRaceWeekendPoints } from './points';

describe('getRacePoints', () => {
  it('should return correct points for positions 1-10', () => {
    expect(getRacePoints(1)).toBe(25);
    expect(getRacePoints(2)).toBe(18);
    expect(getRacePoints(3)).toBe(15);
    expect(getRacePoints(10)).toBe(1);
  });

  it('should return 0 for positions outside top 10', () => {
    expect(getRacePoints(11)).toBe(0);
    expect(getRacePoints(20)).toBe(0);
  });

  it('should return 0 for null position (DNF)', () => {
    expect(getRacePoints(null)).toBe(0);
  });

  it('should return 0 for invalid positions', () => {
    expect(getRacePoints(0)).toBe(0);
    expect(getRacePoints(-1)).toBe(0);
  });
});

describe('getSprintPoints', () => {
  it('should return correct points for positions 1-8', () => {
    expect(getSprintPoints(1)).toBe(8);
    expect(getSprintPoints(8)).toBe(1);
  });

  it('should return 0 for positions outside top 8', () => {
    expect(getSprintPoints(9)).toBe(0);
    expect(getSprintPoints(10)).toBe(0);
  });
});

describe('calculateRaceWeekendPoints', () => {
  const createMockRace = (overrides: Partial<Race> = {}): Race => ({
    season: 2026,
    round: 1,
    raceName: 'Test GP',
    circuitId: 'test',
    circuitName: 'Test Circuit',
    country: 'Test',
    date: '2026-03-01',
    results: [],
    qualifying: [],
    sprint: null,
    ...overrides,
  });

  it('should use official points from API data', () => {
    const race = createMockRace({
      results: [
        {
          driverId: 'verstappen',
          position: 1,
          positionText: '1',
          points: 25,
          grid: 1,
          status: 'Finished',
          fastestLap: false,
          fastestLapRank: null,
        },
      ],
    });

    expect(calculateRaceWeekendPoints('verstappen', race)).toBe(25);
  });

  it('should use API points that include fastest lap bonus for pre-2025 seasons', () => {
    const race = createMockRace({
      season: 2024,
      results: [
        {
          driverId: 'verstappen',
          position: 1,
          positionText: '1',
          points: 26, // API includes the 1pt fastest lap bonus for 2024
          grid: 1,
          status: 'Finished',
          fastestLap: true,
          fastestLapRank: 1,
        },
      ],
    });

    expect(calculateRaceWeekendPoints('verstappen', race)).toBe(26);
  });

  it('should not add any bonus on top of API points for 2025+ seasons', () => {
    const race = createMockRace({
      season: 2026,
      results: [
        {
          driverId: 'verstappen',
          position: 1,
          positionText: '1',
          points: 25, // No fastest lap bonus in 2025+
          grid: 1,
          status: 'Finished',
          fastestLap: true, // Even if marked, no extra points
          fastestLapRank: 1,
        },
      ],
    });

    expect(calculateRaceWeekendPoints('verstappen', race)).toBe(25);
  });

  it('should add sprint points from API data', () => {
    const race = createMockRace({
      results: [
        {
          driverId: 'verstappen',
          position: 1,
          positionText: '1',
          points: 25,
          grid: 1,
          status: 'Finished',
          fastestLap: false,
          fastestLapRank: null,
        },
      ],
      sprint: [{ driverId: 'verstappen', position: 1, points: 8 }],
    });

    expect(calculateRaceWeekendPoints('verstappen', race)).toBe(33);
  });

  it('should return 0 for DNF', () => {
    const race = createMockRace({
      results: [
        {
          driverId: 'verstappen',
          position: null,
          positionText: 'R',
          points: 0,
          grid: 1,
          status: 'Retired',
          fastestLap: false,
          fastestLapRank: null,
        },
      ],
    });

    expect(calculateRaceWeekendPoints('verstappen', race)).toBe(0);
  });

  it('should return 0 for driver not in race', () => {
    const race = createMockRace({
      results: [
        {
          driverId: 'hamilton',
          position: 1,
          positionText: '1',
          points: 25,
          grid: 1,
          status: 'Finished',
          fastestLap: false,
          fastestLapRank: null,
        },
      ],
    });

    expect(calculateRaceWeekendPoints('verstappen', race)).toBe(0);
  });

  it('should not add pole position bonus (never an official F1 rule)', () => {
    const race = createMockRace({
      results: [
        {
          driverId: 'verstappen',
          position: 1,
          positionText: '1',
          points: 25,
          grid: 1,
          status: 'Finished',
          fastestLap: false,
          fastestLapRank: null,
        },
      ],
      qualifying: [{ driverId: 'verstappen', position: 1 }],
    });

    // Should be exactly 25, no pole bonus
    expect(calculateRaceWeekendPoints('verstappen', race)).toBe(25);
  });
});
