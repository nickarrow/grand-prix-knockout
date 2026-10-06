import { describe, it, expect } from 'vitest';

import type { Driver, DriverStanding, Race } from 'src/types';

import { calculateStandings, compareTiebreaker, extractDrivers } from './standings';

// Helper to create mock driver
const createDriver = (id: string): Driver => ({
  driverId: id,
  code: id.substring(0, 3).toUpperCase(),
  firstName: id,
  lastName: id,
  nationality: 'Test',
  constructorId: 'test',
  constructorName: 'Test Team',
});

// Helper to create mock race
const createRace = (
  round: number,
  results: Array<{ id: string; position: number | null }>
): Race => ({
  season: 2025,
  round,
  raceName: `Race ${round}`,
  circuitId: 'test',
  circuitName: 'Test',
  country: 'Test',
  date: '2025-01-01',
  results: results.map((r) => ({
    driverId: r.id,
    position: r.position,
    positionText: r.position ? String(r.position) : 'R',
    points:
      r.position && r.position <= 10
        ? ([25, 18, 15, 12, 10, 8, 6, 4, 2, 1][r.position - 1] ?? 0)
        : 0,
    grid: 1,
    status: r.position ? 'Finished' : 'Retired',
    fastestLap: false,
    fastestLapRank: null,
  })),
  qualifying: [],
  sprint: null,
});

describe('compareTiebreaker', () => {
  it('should rank by points first', () => {
    const a: DriverStanding = {
      driver: createDriver('a'),
      points: 100,
      officialPoints: 0,
      wins: 0,
      podiums: 0,
      position: 0,
      positionHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    const b: DriverStanding = {
      driver: createDriver('b'),
      points: 50,
      officialPoints: 0,
      wins: 0,
      podiums: 0,
      position: 0,
      positionHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    expect(compareTiebreaker(a, b)).toBeLessThan(0); // a should rank higher
  });

  it('should use wins as first tiebreaker', () => {
    const a: DriverStanding = {
      driver: createDriver('a'),
      points: 100,
      officialPoints: 0,
      wins: 2,
      podiums: 2,
      position: 0,
      positionHistory: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2 wins
    };
    const b: DriverStanding = {
      driver: createDriver('b'),
      points: 100,
      officialPoints: 0,
      wins: 3,
      podiums: 3,
      position: 0,
      positionHistory: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 3 wins
    };

    expect(compareTiebreaker(a, b)).toBeGreaterThan(0); // b should rank higher (more wins)
  });

  it('orders two drivers level on points and top-ten finishes by regular-season position', () => {
    // Two drivers identical on points and on every P1-P10 count. Without the
    // regular-season key the comparator returns 0 and the order falls to sort
    // stability. With the key, the driver who finished the regular season higher
    // (lower position number) wins.
    const a: DriverStanding = {
      driver: createDriver('a'),
      points: 40,
      officialPoints: 0,
      wins: 1,
      podiums: 1,
      position: 0,
      positionHistory: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    const b: DriverStanding = {
      driver: createDriver('b'),
      points: 40,
      officialPoints: 0,
      wins: 1,
      podiums: 1,
      position: 0,
      positionHistory: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    // No regular-season order supplied: tied, order preserved (returns 0).
    expect(compareTiebreaker(a, b)).toBe(0);

    // b finished the regular season 3rd, a finished 5th: b wins the tiebreak.
    const regularSeasonOrder = new Map<string, number>([
      ['a', 5],
      ['b', 3],
    ]);
    expect(compareTiebreaker(a, b, regularSeasonOrder)).toBeGreaterThan(0);
    expect(compareTiebreaker(b, a, regularSeasonOrder)).toBeLessThan(0);
  });

  it('should use second places when wins are equal', () => {
    const a: DriverStanding = {
      driver: createDriver('a'),
      points: 100,
      officialPoints: 0,
      wins: 2,
      podiums: 4,
      position: 0,
      positionHistory: [2, 2, 0, 0, 0, 0, 0, 0, 0, 0], // 2 wins, 2 seconds
    };
    const b: DriverStanding = {
      driver: createDriver('b'),
      points: 100,
      officialPoints: 0,
      wins: 2,
      podiums: 3,
      position: 0,
      positionHistory: [2, 1, 0, 0, 0, 0, 0, 0, 0, 0], // 2 wins, 1 second
    };

    expect(compareTiebreaker(a, b)).toBeLessThan(0); // a should rank higher (more 2nds)
  });
});

describe('calculateStandings', () => {
  it('should calculate standings correctly for multiple races', () => {
    const drivers = [createDriver('a'), createDriver('b'), createDriver('c')];
    const races = [
      createRace(1, [
        { id: 'a', position: 1 },
        { id: 'b', position: 2 },
        { id: 'c', position: 3 },
      ]),
      createRace(2, [
        { id: 'a', position: 2 },
        { id: 'b', position: 1 },
        { id: 'c', position: 3 },
      ]),
    ];

    const standings = calculateStandings(drivers, races);

    // a: 25 + 18 = 43, b: 18 + 25 = 43, c: 15 + 15 = 30
    // a and b tied on points, but a has more wins (1 vs 1) - actually equal
    // Both have 1 win, 1 second - truly tied, stable sort keeps original order
    expect(standings[0]?.driver.driverId).toBe('a');
    expect(standings[0]?.points).toBe(43);
    expect(standings[1]?.driver.driverId).toBe('b');
    expect(standings[1]?.points).toBe(43);
    expect(standings[2]?.driver.driverId).toBe('c');
    expect(standings[2]?.points).toBe(30);
  });

  it('should assign correct positions', () => {
    const drivers = [createDriver('a'), createDriver('b')];
    const races = [
      createRace(1, [
        { id: 'a', position: 1 },
        { id: 'b', position: 2 },
      ]),
    ];

    const standings = calculateStandings(drivers, races);

    expect(standings[0]?.position).toBe(1);
    expect(standings[1]?.position).toBe(2);
  });

  it('should handle DNFs correctly', () => {
    const drivers = [createDriver('a'), createDriver('b')];
    const races = [
      createRace(1, [
        { id: 'a', position: null }, // DNF
        { id: 'b', position: 1 },
      ]),
    ];

    const standings = calculateStandings(drivers, races);

    expect(standings[0]?.driver.driverId).toBe('b');
    expect(standings[0]?.points).toBe(25);
    expect(standings[1]?.driver.driverId).toBe('a');
    expect(standings[1]?.points).toBe(0);
  });
});

describe('extractDrivers', () => {
  it('should extract unique drivers from races', () => {
    const races = [
      createRace(1, [
        { id: 'a', position: 1 },
        { id: 'b', position: 2 },
      ]),
      createRace(2, [
        { id: 'a', position: 1 },
        { id: 'c', position: 2 },
      ]),
    ];

    const drivers = extractDrivers(races);

    expect(drivers).toHaveLength(3);
    expect(drivers.map((d) => d.driverId).sort()).toEqual(['a', 'b', 'c']);
  });
});
