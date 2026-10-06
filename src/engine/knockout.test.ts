import { describe, it, expect } from 'vitest';

import { KNOCKOUT_QUALIFIERS, ELIMINATIONS_PER_ROUND } from 'src/constants';
import type { Race, RaceCalendar } from 'src/types';

import {
  determineSeasonStatus,
  getRegularSeasonRaces,
  getKnockoutRoundRaces,
  calculateKnockoutState,
} from './knockout';

// Helper to create mock calendar
const createCalendar = (totalRaces: number): RaceCalendar[] =>
  Array.from({ length: totalRaces }, (_, i) => ({
    season: 2025,
    round: i + 1,
    raceName: `Race ${i + 1}`,
    circuitId: `circuit${i + 1}`,
    circuitName: `Circuit ${i + 1}`,
    country: 'Test',
    date: `2025-${String(Math.floor(i / 2) + 3).padStart(2, '0')}-${String((i % 2) * 15 + 1).padStart(2, '0')}`,
    hasSprintRace: false,
  }));

// Helper to create mock race
const createRace = (
  round: number,
  driverResults: Array<{ id: string; position: number | null }>
): Race => ({
  season: 2025,
  round,
  raceName: `Race ${round}`,
  circuitId: `circuit${round}`,
  circuitName: `Circuit ${round}`,
  country: 'Test',
  date: '2025-01-01',
  results: driverResults.map((r) => ({
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

describe('determineSeasonStatus', () => {
  it('should return pre-season when no races completed', () => {
    const calendar = createCalendar(24);
    const status = determineSeasonStatus(calendar, 0, new Date('2025-01-01'));
    expect(status).toBe('pre-season');
  });

  it('should return regular-season during regular season', () => {
    const calendar = createCalendar(24);
    // Regular season = races 1-17 for 24-race season
    const status = determineSeasonStatus(calendar, 10, new Date('2025-06-01'));
    expect(status).toBe('regular-season');
  });

  it('should return playoffs when in knockout races', () => {
    const calendar = createCalendar(24);
    // The knockout starts at race 18 (24 - 7 + 1)
    const status = determineSeasonStatus(calendar, 18, new Date('2025-10-01'));
    expect(status).toBe('playoffs');
  });

  it('should return completed when all races done', () => {
    const calendar = createCalendar(24);
    const status = determineSeasonStatus(calendar, 24, new Date('2025-12-15'));
    expect(status).toBe('completed');
  });
});

describe('getRegularSeasonRaces', () => {
  it('should return correct regular season races', () => {
    const races = Array.from({ length: 20 }, (_, i) =>
      createRace(i + 1, [{ id: 'a', position: 1 }])
    );

    const regularSeason = getRegularSeasonRaces(races, 24);

    // For 24-race season, regular season = races 1-17
    expect(regularSeason).toHaveLength(17);
    expect(regularSeason[0]?.round).toBe(1);
    expect(regularSeason[16]?.round).toBe(17);
  });
});

describe('getKnockoutRoundRaces', () => {
  it('should return correct races for knockout round 1', () => {
    const races = Array.from({ length: 24 }, (_, i) =>
      createRace(i + 1, [{ id: 'a', position: 1 }])
    );

    const round1Races = getKnockoutRoundRaces(races, 24, 1);

    // Round 1 = races 18-19 for 24-race season
    expect(round1Races).toHaveLength(2);
    expect(round1Races[0]?.round).toBe(18);
    expect(round1Races[1]?.round).toBe(19);
  });

  it('should return correct races for knockout round 2', () => {
    const races = Array.from({ length: 24 }, (_, i) =>
      createRace(i + 1, [{ id: 'a', position: 1 }])
    );

    const round2Races = getKnockoutRoundRaces(races, 24, 2);

    // Round 2 = races 20-21
    expect(round2Races).toHaveLength(2);
    expect(round2Races[0]?.round).toBe(20);
    expect(round2Races[1]?.round).toBe(21);
  });

  it('should return correct races for championship final', () => {
    const races = Array.from({ length: 24 }, (_, i) =>
      createRace(i + 1, [{ id: 'a', position: 1 }])
    );

    const finalRaces = getKnockoutRoundRaces(races, 24, 4);

    // Final = race 24 only
    expect(finalRaces).toHaveLength(1);
    expect(finalRaces[0]?.round).toBe(24);
  });
});

describe('calculateKnockoutState', () => {
  // Create 12 drivers for testing
  const driverIds = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12'];

  // Create a full season of races where d1 always wins, d2 always 2nd, etc.
  const createFullSeason = (totalRaces: number): Race[] =>
    Array.from({ length: totalRaces }, (_, i) =>
      createRace(
        i + 1,
        driverIds.map((id, pos) => ({ id, position: pos + 1 }))
      )
    );

  it('should qualify top 10 drivers from regular season', () => {
    const calendar = createCalendar(24);
    const races = createFullSeason(17); // Just regular season

    const state = calculateKnockoutState(races, calendar);

    expect(state.qualifiedDrivers).toHaveLength(KNOCKOUT_QUALIFIERS);
    // d1-d10 should qualify (top 10 by points)
    expect(state.qualifiedDrivers).toContain('d1');
    expect(state.qualifiedDrivers).toContain('d10');
    expect(state.qualifiedDrivers).not.toContain('d11');
    expect(state.qualifiedDrivers).not.toContain('d12');
  });

  it('should eliminate bottom 2 drivers after round 1', () => {
    const calendar = createCalendar(24);
    const races = createFullSeason(19); // Through round 1

    const state = calculateKnockoutState(races, calendar);

    expect(state.rounds).toHaveLength(1);
    expect(state.rounds[0]?.eliminated).toHaveLength(ELIMINATIONS_PER_ROUND);
    expect(state.rounds[0]?.advancing).toHaveLength(8);
  });

  it('should crown champion after final race', () => {
    const calendar = createCalendar(24);
    const races = createFullSeason(24); // Complete season

    const state = calculateKnockoutState(races, calendar);

    expect(state.champion).toBe('d1'); // d1 wins every race
    expect(state.status).toBe('completed');
    expect(state.rounds).toHaveLength(4);
  });

  it('should reset points each knockout round', () => {
    const calendar = createCalendar(24);
    const races = createFullSeason(21); // Through round 2

    const state = calculateKnockoutState(races, calendar);

    // Round 2 standings should only reflect races 20-21, not cumulative
    const round2 = state.rounds[1];
    expect(round2).toBeDefined();

    // Each driver should have points from only 2 races
    // d1 wins both = 50 points (25 + 25)
    const d1Standing = round2?.standings.find((s) => s.driver.driverId === 'd1');
    expect(d1Standing?.points).toBe(50);
  });

  it('should include all qualified drivers in round standings for bracket tracking', () => {
    const calendar = createCalendar(24);
    const races = createFullSeason(21); // Through round 2

    const state = calculateKnockoutState(races, calendar);

    // Round 2 should include all 12 drivers (all who raced), not just the 8 still competing
    const round2 = state.rounds[1];
    expect(round2?.standings.length).toBeGreaterThanOrEqual(10);

    // Drivers eliminated in R1 (d9, d10) should still have standings in R2
    const d9Standing = round2?.standings.find((s) => s.driver.driverId === 'd9');
    const d10Standing = round2?.standings.find((s) => s.driver.driverId === 'd10');
    expect(d9Standing).toBeDefined();
    expect(d10Standing).toBeDefined();
  });

  it('should include non-qualifiers in round standings for bracket tracking', () => {
    const calendar = createCalendar(24);
    const races = createFullSeason(19); // Through round 1

    const state = calculateKnockoutState(races, calendar);

    // Round 1 should include all 12 drivers (10 qualified + 2 non-qualifiers)
    const round1 = state.rounds[0];
    expect(round1?.standings).toHaveLength(12);

    // Non-qualifiers (d11, d12) should have standings
    const d11Standing = round1?.standings.find((s) => s.driver.driverId === 'd11');
    const d12Standing = round1?.standings.find((s) => s.driver.driverId === 'd12');
    expect(d11Standing).toBeDefined();
    expect(d12Standing).toBeDefined();
  });

  it('eliminates nobody and reports the drop zone when only one of a round’s two races has run', () => {
    const calendar = createCalendar(24);
    const races = createFullSeason(18); // Regular season (1-17) plus race 18, first of Round 1

    const state = calculateKnockoutState(races, calendar);

    const round1 = state.rounds[0];
    expect(round1).toBeDefined();
    // Round 1 covers races 18-19; only 18 has run, so it is not complete.
    expect(round1?.isComplete).toBe(false);
    expect(round1?.eliminated).toEqual([]);
    expect(round1?.advancing).toEqual([]);
    // The two lowest active drivers (d9, d10 finish 9th and 10th every race) are at risk.
    expect(round1?.atRisk).toHaveLength(ELIMINATIONS_PER_ROUND);
    expect(round1?.atRisk).toContain('d9');
    expect(round1?.atRisk).toContain('d10');
  });

  it('fills eliminated and clears atRisk once every race in the round has run', () => {
    const calendar = createCalendar(24);
    const races = createFullSeason(19); // Through round 1 (races 18-19)

    const state = calculateKnockoutState(races, calendar);

    const round1 = state.rounds[0];
    expect(round1?.isComplete).toBe(true);
    expect(round1?.atRisk).toEqual([]);
    expect(round1?.eliminated).toHaveLength(ELIMINATIONS_PER_ROUND);
    expect(round1?.advancing).toHaveLength(8);
    expect(round1?.eliminated).toContain('d9');
    expect(round1?.eliminated).toContain('d10');
  });

  it('breaks a round tie at the elimination boundary by the stored official order', () => {
    // Two qualified drivers finish Round 1 level on points AND on the full
    // countback, sitting exactly on the advance/eliminate boundary. The only thing
    // left is the stored official regular-season order. It says d9 finished ahead
    // of d8, so d9 advances and d8 is eliminated.
    //
    // Everything in the DATA opposes that answer. The round's races, the drivers
    // array and every result list put d8 before d9 (d8 takes P8 in the first race
    // and the drivers appear d8-then-d9), so first-appearance order and the
    // engine's own regular-season standings would both favour d8. Only the stored
    // order, passed as the third argument, can make d9 win.
    const seasonRace = (round: number, order: string[]): Race =>
      createRace(
        round,
        order.map((id, pos) => ({ id, position: pos + 1 }))
      );

    // A 23-race calendar makes the regular season 16 races (even), so d8 and d9
    // can alternate P8/P9 and end genuinely level there too. The terminal key
    // then has to decide their regular-season rank, which flows into the round.
    const calendar = createCalendar(23);

    // Regular season (rounds 1-16): d8 and d9 alternate 8th and 9th, level on
    // points and countback. d8 leads the first race, so first-appearance order and
    // sort stability both favour d8. Only the stored order can lift d9.
    const regularSeasonRaces = Array.from({ length: 16 }, (_, i) => {
      const pair = i % 2 === 0 ? ['d8', 'd9'] : ['d9', 'd8'];
      return seasonRace(i + 1, ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', ...pair, 'd10']);
    });

    // Round 1 (races 17-18): d8 and d9 swap 8th and 9th, so each ends one P8 and
    // one P9 — identical points, identical countback. d8 leads the first race.
    const round1Order17 = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10'];
    const round1Order18 = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd9', 'd8', 'd10'];
    const round1Races = [seasonRace(17, round1Order17), seasonRace(18, round1Order18)];

    const races = [...regularSeasonRaces, ...round1Races];

    // Stored official order: d9 ahead of d8. Opposes the data.
    const officialOrder = [
      'd1',
      'd2',
      'd3',
      'd4',
      'd5',
      'd6',
      'd7',
      'd9',
      'd8',
      'd10',
      'd11',
      'd12',
    ];

    const state = calculateKnockoutState(races, calendar, officialOrder);

    const round1 = state.rounds[0];
    expect(round1?.isComplete).toBe(true);
    // The stored order puts d9 ahead of d8, so d9 advances and d8 is out, against
    // everything the data would have said.
    expect(round1?.advancing).toContain('d9');
    expect(round1?.eliminated).toContain('d8');
    // d10 is the clear bottom and is eliminated regardless of the key.
    expect(round1?.eliminated).toContain('d10');
  });

  it('orders the full regular-season standings by the stored official order when drivers are level', () => {
    // d1 and d2 finish the regular season level on points and on the countback.
    // The data puts d2 before d1 is impossible to express through finishing order
    // alone when both are always level, so the only separator is the stored order,
    // which ranks d1 first. The drivers array lists d2 first, opposing the answer.
    const seasonRace = (round: number, order: string[]): Race =>
      createRace(
        round,
        order.map((id, pos) => ({ id, position: pos + 1 }))
      );

    // A 23-race calendar makes the regular season 16 races (23 - 7), an even
    // count, so alternating P1/P2 leaves d1 and d2 level on both points and the
    // countback (8 wins and 8 seconds each).
    const calendar = createCalendar(23);
    const regularSeasonRaces = Array.from({ length: 16 }, (_, i) => {
      // d2 leads the first race, so first-appearance order and sort stability both
      // favour d2. Only the stored official order can lift d1 above it.
      const top = i % 2 === 0 ? ['d2', 'd1'] : ['d1', 'd2'];
      return seasonRace(i + 1, [...top, 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10']);
    });

    // Drivers appear d2 before d1, opposing the answer. Stored official order
    // ranks d1 first.
    const officialOrder = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10'];

    const state = calculateKnockoutState(regularSeasonRaces, calendar, officialOrder);

    const [first, second] = state.regularSeasonStandings;
    expect(first?.points).toBe(second?.points); // genuinely level
    expect(first?.driver.driverId).toBe('d1'); // the official order decides
    expect(second?.driver.driverId).toBe('d2');
  });
});

// The decision 0005 calendar-change rules. These fire only on calendars that no
// 2020-2026 season has, so they are proved on synthetic calendars. In each test
// the locked calendar is the full 24-race schedule (so the regular season still
// ends at round 17 and the knockout rounds are 18-19, 20-21, 22-23 and the final
// at 24); what varies is which races actually ran. A race that did not run is
// either absent from the completed races (cancelled before it happened) or
// present with no results (abandoned on the day), which is how a cancelled final
// is told apart from a final still to come.
describe('calculateKnockoutState calendar-change rules (decision 0005)', () => {
  const orderedResults = (order: string[]): Array<{ id: string; position: number | null }> =>
    order.map((id, index) => ({ id, position: index + 1 }));

  // Twelve drivers finishing in the order given. d1..d10 qualify from the regular
  // season; d1 wins everything unless a race says otherwise.
  const fieldInOrder = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12'];

  // A race on a specific date, so the added-race rule can place it by date.
  const datedRace = (round: number, date: string, order: string[]): Race => ({
    ...createRace(round, orderedResults(order)),
    date,
  });

  // The regular season: rounds 1-17, the whole field in order, so d1..d10 qualify
  // and d1..d8, then d1..d6, then d1..d4 come through the rounds.
  const regularSeason = (): Race[] =>
    Array.from({ length: 17 }, (_, i) => createRace(i + 1, orderedResults(fieldInOrder)));

  it('decides a round whose second race was cancelled on the race that still ran', () => {
    // Round 2 is races 20 and 21; race 21 is cancelled, so only race 20 runs. A
    // later round (race 22, Round 3) has run, which tells the engine race 21 is
    // gone rather than still to come, so Round 2 is complete on race 20 alone.
    const calendar = createCalendar(24);
    const races: Race[] = [
      ...regularSeason(),
      // Round 1 (18, 19): d9 and d10 are the bottom two active drivers and go out.
      createRace(18, orderedResults(fieldInOrder)),
      createRace(19, orderedResults(fieldInOrder)),
      // Round 2 race 20 only (21 cancelled). Eight active drivers d1..d8; the
      // bottom two, d7 and d8, are eliminated on this single race.
      createRace(20, orderedResults(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'])),
      // Round 3 race 22: its presence marks the season as past Round 2.
      createRace(22, orderedResults(['d1', 'd2', 'd3', 'd4', 'd5', 'd6'])),
    ];

    const state = calculateKnockoutState(races, calendar);

    const round2 = state.rounds.find((r) => r.round === 2);
    expect(round2).toBeDefined();
    expect(round2?.isComplete).toBe(true);
    expect(round2?.eliminated).toHaveLength(2);
    expect(round2?.eliminated).toContain('d7');
    expect(round2?.eliminated).toContain('d8');
    expect(round2?.advancing).toHaveLength(6);
  });

  it('rolls a round that lost both races into the next, which eliminates four so the final keeps four', () => {
    // Round 2 (races 20 and 21) is lost entirely. Its two eliminations roll into
    // Round 3, which then takes eight drivers down to four, so the final still has
    // four. Round 3 (22, 23) and the final (24) run normally.
    const calendar = createCalendar(24);
    const races: Race[] = [
      ...regularSeason(),
      createRace(18, orderedResults(fieldInOrder)), // Round 1
      createRace(19, orderedResults(fieldInOrder)),
      // Round 2: no races at all.
      createRace(22, orderedResults(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'])), // Round 3
      createRace(23, orderedResults(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'])),
      createRace(24, orderedResults(['d1', 'd2', 'd3', 'd4'])), // final
    ];

    const state = calculateKnockoutState(races, calendar);

    // Round 2 ran nothing, so it is not among the computed rounds.
    expect(state.rounds.find((r) => r.round === 2)).toBeUndefined();

    const round3 = state.rounds.find((r) => r.round === 3);
    expect(round3).toBeDefined();
    expect(round3?.isComplete).toBe(true);
    // Eight drivers were still active (Round 2 eliminated nobody), and Round 3
    // keeps four, so four go out here and four advance to the final.
    expect(round3?.advancing).toHaveLength(4);
    expect(round3?.eliminated).toHaveLength(4);
    expect(round3?.eliminated).toContain('d5');
    expect(round3?.eliminated).toContain('d6');
    expect(round3?.eliminated).toContain('d7');
    expect(round3?.eliminated).toContain('d8');
    expect(state.champion).toBe('d1');
  });

  it('ranks a cancelled final by Round 3 points under the 0004 tie order', () => {
    // The final (race 24) is reached but abandoned: it is in the input with no
    // results. The four finalists are ranked by their Round 3 points, and the
    // leader is champion. d1 and d2 finish Round 3 level on points and on the
    // countback (each takes one win and one second over races 22 and 23), so the
    // championship falls to the next key of the 0004 order, the regular-season
    // finishing position (which carries the terminal official order with it). d1
    // finished the regular season ahead of d2, so d1 is champion - and the Round 3
    // data opposes that, because d2 leads the first Round 3 race and the drivers
    // appear d2-before-d1 there, so first-appearance order and sort stability both
    // favour d2. Only the 0004 key can lift d1.
    const calendar = createCalendar(24);
    const races: Race[] = [
      ...regularSeason(),
      createRace(18, orderedResults(fieldInOrder)), // Round 1 -> d1..d8
      createRace(19, orderedResults(fieldInOrder)),
      createRace(20, orderedResults(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'])), // Round 2 -> d1..d6
      createRace(21, orderedResults(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'])),
      // Round 3 (22, 23): d2 leads the first race and d1 the second, so each ends
      // one P1 and one P2, identical on points and countback. d3..d6 fill the
      // rest, leaving d1..d4 as the finalists.
      createRace(22, orderedResults(['d2', 'd1', 'd3', 'd4', 'd5', 'd6'])),
      createRace(23, orderedResults(['d1', 'd2', 'd3', 'd4', 'd5', 'd6'])),
      // The final is abandoned: present but with no results.
      createRace(24, []),
    ];

    const state = calculateKnockoutState(races, calendar);

    const round3 = state.rounds.find((r) => r.round === 3);
    expect(round3?.advancing).toHaveLength(4); // d1..d4 are the finalists

    const final = state.rounds.find((r) => r.round === 4);
    expect(final).toBeDefined();
    expect(final?.isComplete).toBe(true);
    // d1 and d2 are level on Round 3 points and countback; regular-season position
    // decides, so d1 is champion and d2 is ranked behind, against everything the
    // Round 3 data would say.
    expect(state.champion).toBe('d1');
    expect(final?.advancing).toEqual(['d1']);
    expect(final?.eliminated).toContain('d2');
    expect(final?.eliminated).toContain('d3');
    expect(final?.eliminated).toContain('d4');
  });

  it('assigns an added race to the round whose date range contains its date', () => {
    // A Grand Prix is added inside Round 2's date window. It has no locked round
    // number inside the knockout ranges (round 25, outside 20-21), so it is placed
    // by date, and its date falls between Round 2's start and Round 3's start. The
    // added race lifts d7 above d6, so Round 2 eliminates d6 rather than d7 -
    // proof the race counted in Round 2 and not somewhere else.
    const knockoutDates: Record<number, string> = {
      18: '2025-10-05',
      19: '2025-10-12',
      20: '2025-10-26',
      21: '2025-11-02',
      22: '2025-11-16',
      23: '2025-11-23',
      24: '2025-12-06',
    };
    const calendar: RaceCalendar[] = createCalendar(24).map((entry) => {
      const date = knockoutDates[entry.round];
      return date ? { ...entry, date } : entry;
    });

    const races: Race[] = [
      ...regularSeason(),
      createRace(18, orderedResults(fieldInOrder)), // Round 1 -> d1..d8
      createRace(19, orderedResults(fieldInOrder)),
      // Round 2 races 20 and 21: d1..d8 in order. On these alone d7 and d8 would
      // be eliminated.
      datedRace(20, '2025-10-26', ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8']),
      datedRace(21, '2025-11-02', ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8']),
      // Added race on 30 October, inside Round 2's window [26 Oct, 16 Nov). d7
      // wins it; d6 finishes last. This lifts d7 clear of d6.
      datedRace(25, '2025-10-30', ['d7', 'd1', 'd2', 'd3', 'd4', 'd5', 'd8', 'd6']),
      // Round 3 race 22: marks the season as past Round 2 so it is complete.
      datedRace(22, '2025-11-16', ['d1', 'd2', 'd3', 'd4', 'd5', 'd7']),
    ];

    const state = calculateKnockoutState(races, calendar);

    const round2 = state.rounds.find((r) => r.round === 2);
    expect(round2).toBeDefined();
    expect(round2?.isComplete).toBe(true);
    // The added race counted in Round 2: d7 survived and d6 dropped. Without it,
    // d7 would have been eliminated instead.
    expect(round2?.eliminated).toContain('d6');
    expect(round2?.eliminated).toContain('d8');
    expect(round2?.eliminated).not.toContain('d7');
    expect(round2?.advancing).toContain('d7');
  });
});
