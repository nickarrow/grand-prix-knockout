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

  it('counts positions past tenth, so a better finish outside the points separates two level drivers', () => {
    // Both scored no points and have identical top-ten counts (none). They differ
    // only by a finish outside the top ten: a's best is 12th, b's is 13th. The old
    // P1-P10 countback could not see this and returned 0; the full-classification
    // countback ranks a ahead. This is the 2020 Round 1 hinge (Albon 12th beats
    // Norris 13th), decision 0004 answer 2.
    const a: DriverStanding = {
      driver: createDriver('a'),
      points: 0,
      officialPoints: 0,
      wins: 0,
      podiums: 0,
      position: 0,
      positionHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // one 12th
    };
    const b: DriverStanding = {
      driver: createDriver('b'),
      points: 0,
      officialPoints: 0,
      wins: 0,
      podiums: 0,
      position: 0,
      positionHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // one 13th
    };

    expect(compareTiebreaker(a, b)).toBeLessThan(0); // a's 12th beats b's 13th
    expect(compareTiebreaker(b, a)).toBeGreaterThan(0);
  });

  it('falls through an exhausted countback to regular-season position', () => {
    // Identical points and identical countback (one 12th each). Only the regular-
    // season order separates them: b finished the regular season higher.
    const a: DriverStanding = {
      driver: createDriver('a'),
      points: 0,
      officialPoints: 0,
      wins: 0,
      podiums: 0,
      position: 0,
      positionHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    };
    const b: DriverStanding = {
      driver: createDriver('b'),
      points: 0,
      officialPoints: 0,
      wins: 0,
      podiums: 0,
      position: 0,
      positionHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    };

    // Without the order: genuinely tied on the countback, returns 0.
    expect(compareTiebreaker(a, b)).toBe(0);

    // b at index 2, a at index 6: b finished the regular season higher and wins.
    const order = new Map<string, number>([
      ['a', 6],
      ['b', 2],
    ]);
    expect(compareTiebreaker(a, b, order)).toBeGreaterThan(0);
    expect(compareTiebreaker(b, a, order)).toBeLessThan(0);
  });

  it('breaks a regular-season tie by the terminal official-standings order', () => {
    // Two drivers level on points and on the full countback: the only thing left
    // is the stored official order (the terminal key). a sits at index 7, b at
    // index 4, so b wins. This is the case the official order exists for: 2026
    // Norris and Verstappen level on 188.
    const a: DriverStanding = {
      driver: createDriver('a'),
      points: 188,
      officialPoints: 188,
      wins: 1,
      podiums: 3,
      position: 0,
      positionHistory: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    };
    const b: DriverStanding = {
      driver: createDriver('b'),
      points: 188,
      officialPoints: 188,
      wins: 1,
      podiums: 3,
      position: 0,
      positionHistory: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    };

    expect(compareTiebreaker(a, b)).toBe(0);

    const officialOrder = new Map<string, number>([
      ['a', 7],
      ['b', 4],
    ]);
    expect(compareTiebreaker(a, b, officialOrder)).toBeGreaterThan(0);
    expect(compareTiebreaker(b, a, officialOrder)).toBeLessThan(0);
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

describe('full-classification countback over a round', () => {
  // A race builder that takes an explicit positionText and status per driver, so a
  // classified retiree (numeric positionText, status Retired) and an unclassified
  // car (letter positionText) can both be expressed. points come from the position
  // only when it is in the top ten, matching the official scale.
  type Row = { id: string; position: number | null; positionText: string; status: string };
  const raceWith = (round: number, rows: Row[]): Race => ({
    season: 2025,
    round,
    raceName: `Race ${round}`,
    circuitId: 'test',
    circuitName: 'Test',
    country: 'Test',
    date: '2025-01-01',
    results: rows.map((r) => ({
      driverId: r.id,
      position: r.position,
      positionText: r.positionText,
      points:
        r.position && r.position <= 10
          ? ([25, 18, 15, 12, 10, 8, 6, 4, 2, 1][r.position - 1] ?? 0)
          : 0,
      grid: 1,
      status: r.status,
      fastestLap: false,
      fastestLapRank: null,
    })),
    qualifying: [],
    sprint: null,
  });

  it('counts a classified retiree by its finishing place (numeric positionText, status Retired)', () => {
    // Two drivers, both scoreless over the round. "slow" retired but was classified
    // 15th (numeric positionText), "slower" retired and was classified 16th. The
    // countback must see both places and rank slow (15th) ahead of slower (16th).
    // First-appearance order puts slower first (it leads every result list and is
    // first in the drivers array), so a comparator that returned 0 would leave
    // slower on top; the assertion that slow wins can only pass on the countback.
    const drivers = [createDriver('slower'), createDriver('slow')];
    const races = [
      raceWith(1, [
        { id: 'slower', position: 16, positionText: '16', status: 'Retired' },
        { id: 'slow', position: 15, positionText: '15', status: 'Retired' },
      ]),
      raceWith(2, [
        { id: 'slower', position: 16, positionText: '16', status: 'Retired' },
        { id: 'slow', position: 15, positionText: '15', status: 'Retired' },
      ]),
    ];

    const standings = calculateStandings(drivers, races);

    expect(standings[0]?.driver.driverId).toBe('slow'); // 15th beats 16th
    expect(standings[1]?.driver.driverId).toBe('slower');
  });

  it('ignores an unclassified car (letter positionText) in the countback', () => {
    // "quit" was 12th once (classified) and once unclassified (positionText R).
    // "parked" was unclassified both times. Only quit's single 12th counts, so quit
    // ranks ahead. First-appearance order puts parked first, opposing the answer.
    const drivers = [createDriver('parked'), createDriver('quit')];
    const races = [
      raceWith(1, [
        { id: 'parked', position: 18, positionText: 'R', status: 'Retired' },
        { id: 'quit', position: 12, positionText: '12', status: 'Finished' },
      ]),
      raceWith(2, [
        { id: 'parked', position: 18, positionText: 'R', status: 'Retired' },
        { id: 'quit', position: 17, positionText: 'R', status: 'Retired' },
      ]),
    ];

    const standings = calculateStandings(drivers, races);

    expect(standings[0]?.driver.driverId).toBe('quit'); // one classified 12th
    expect(standings[1]?.driver.driverId).toBe('parked'); // nothing classified
  });

  it('does not let sprint finishes change the countback, though sprint points still count', () => {
    // Both drivers finish the two races identically (one 11th, one 12th each), so
    // the race countback is level and would fall through. "sprinter" also won both
    // sprints, which adds sprint points but must NOT add 1sts to the countback. So
    // on points sprinter leads; strip the points and the countback alone is tied.
    // First-appearance order puts the non-sprinter first.
    const racePair: Row[][] = [
      [
        { id: 'plodder', position: 11, positionText: '11', status: 'Finished' },
        { id: 'sprinter', position: 12, positionText: '12', status: 'Finished' },
      ],
      [
        { id: 'plodder', position: 12, positionText: '12', status: 'Finished' },
        { id: 'sprinter', position: 11, positionText: '11', status: 'Finished' },
      ],
    ];
    const drivers = [createDriver('plodder'), createDriver('sprinter')];
    const races = racePair.map((rows, i) => {
      const race = raceWith(i + 1, rows);
      // sprinter wins both sprints: 8 points each, and a P1 that must be ignored by
      // the race-only countback.
      race.sprint = [
        { driverId: 'sprinter', position: 1, points: 8 },
        { driverId: 'plodder', position: 2, points: 7 },
      ];
      return race;
    });

    const standings = calculateStandings(drivers, races);

    // Points include the sprint points, so sprinter (16 sprint) leads plodder (14).
    expect(standings[0]?.driver.driverId).toBe('sprinter');
    expect(standings[0]?.points).toBeGreaterThan(standings[1]?.points ?? 0);

    // The countback itself ignores sprints: both drivers have identical race
    // histories (one 11th, one 12th), so neither has a P1 from the sprint win.
    expect(standings[0]?.positionHistory[0]).toBe(0);
    expect(standings[1]?.positionHistory[0]).toBe(0);
    expect(standings[0]?.positionHistory).toEqual(standings[1]?.positionHistory);
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
