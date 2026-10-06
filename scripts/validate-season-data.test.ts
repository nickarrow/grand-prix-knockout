// Tests for the data-fetch validation. These are pure-function tests over the
// validation module the fetcher calls before it writes anything.

import { describe, it, expect } from 'vitest';

// @ts-expect-error - plain .mjs module shared with the Node fetch script
import {
  validateSeasonData,
  validateCalendarGuard,
  validateSprintWeekends,
  validatePositionText,
  validateRegularSeasonOrder,
  storedRegularSeasonComplete,
} from './validate-season-data.mjs';

// A minimal fetched/stored shape builder.
function race(round: number, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    season: 2026,
    round,
    raceName: `Race ${round}`,
    circuitId: `circuit${round}`,
    circuitName: `Circuit ${round}`,
    country: 'Test',
    date: `2026-03-${String(round).padStart(2, '0')}`,
    results: Array.from({ length: 20 }, (_, i) => ({
      driverId: `d${i}`,
      position: i + 1,
      positionText: String(i + 1),
    })),
    qualifying: [],
    sprint: null,
    ...overrides,
  };
}

function calendarEntry(
  round: number,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    season: 2026,
    round,
    raceName: `Race ${round}`,
    circuitId: `circuit${round}`,
    circuitName: `Circuit ${round}`,
    country: 'Test',
    date: `2026-03-${String(round).padStart(2, '0')}`,
    ...overrides,
  };
}

describe('validateSprintWeekends', () => {
  it('rejects a completed sprint weekend with no sprint results', () => {
    const fetched = {
      calendar: [calendarEntry(1)],
      races: [race(1, { sprint: null })],
      sprintRounds: [1],
    };
    const errors = validateSprintWeekends(fetched);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/sprint weekend but has no sprint results/i);
  });

  it('passes a completed sprint weekend that has sprint results', () => {
    const fetched = {
      calendar: [calendarEntry(1)],
      races: [race(1, { sprint: [{ driverId: 'd0', position: 1, points: 8 }] })],
      sprintRounds: [1],
    };
    expect(validateSprintWeekends(fetched)).toEqual([]);
  });
});

describe('validateCalendarGuard (decision 0005)', () => {
  // A stored season with the regular season complete: 23 rounds, 16 regular-season
  // races (23 - 7 playoff races) all completed.
  function storedComplete(): Record<string, unknown> {
    const calendar = Array.from({ length: 23 }, (_, i) => calendarEntry(i + 1));
    const races = Array.from({ length: 16 }, (_, i) => race(i + 1));
    return { calendar, races };
  }

  it('confirms the stored regular season is complete', () => {
    expect(storedRegularSeasonComplete(storedComplete())).toBe(true);
  });

  it('rejects a changed round date once the regular season is complete', () => {
    const stored = storedComplete();
    const fetchedCalendar = (stored.calendar as Array<Record<string, unknown>>).map((entry) =>
      entry.round === 17 ? { ...entry, date: '2026-09-30' } : entry
    );
    const fetched = {
      calendar: fetchedCalendar,
      races: stored.races,
      sprintRounds: [],
    };
    const errors = validateCalendarGuard(fetched, stored);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/date changed/i);
  });

  it('passes a circuit name-only change (Losail -> Lusail, circuitId losail)', () => {
    const stored = storedComplete();
    // Give round 17 the Losail name/id in the stored file.
    (stored.calendar as Array<Record<string, unknown>>)[16] = calendarEntry(17, {
      circuitId: 'losail',
      circuitName: 'Losail International Circuit',
    });
    const fetchedCalendar = (stored.calendar as Array<Record<string, unknown>>).map((entry) =>
      entry.round === 17 ? { ...entry, circuitName: 'Lusail International Circuit' } : entry
    );
    const fetched = {
      calendar: fetchedCalendar,
      races: stored.races,
      sprintRounds: [],
    };
    expect(validateCalendarGuard(fetched, stored)).toEqual([]);
  });

  it('does not apply the guard before the stored regular season is complete', () => {
    const calendar = Array.from({ length: 23 }, (_, i) => calendarEntry(i + 1));
    const stored = { calendar, races: Array.from({ length: 10 }, (_, i) => race(i + 1)) };
    const fetchedCalendar = calendar.map((entry) =>
      entry.round === 17 ? { ...entry, date: '2026-09-30' } : entry
    );
    const fetched = { calendar: fetchedCalendar, races: stored.races, sprintRounds: [] };
    expect(validateCalendarGuard(fetched, stored)).toEqual([]);
  });
});

describe('validatePositionText (decision 0004)', () => {
  it('rejects a completed race result with no positionText', () => {
    const bad = race(1, {
      results: [{ driverId: 'd0', position: 1 }],
    });
    const errors = validatePositionText([bad]);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/no positionText/i);
  });

  it('rejects a result whose positionText is an empty string', () => {
    const bad = race(1, {
      results: [{ driverId: 'd0', position: 1, positionText: '' }],
    });
    const errors = validatePositionText([bad]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('passes results that carry a positionText, including a classified retiree letter', () => {
    const good = race(1, {
      results: [
        { driverId: 'd0', position: 1, positionText: '1' },
        { driverId: 'd1', position: null, positionText: 'R' },
      ],
    });
    expect(validatePositionText([good])).toEqual([]);
  });
});

describe('validateRegularSeasonOrder (decision 0004, Option A)', () => {
  it('rejects a complete regular season with an empty stored order', () => {
    const calendar = Array.from({ length: 23 }, (_, i) => calendarEntry(i + 1));
    const races = Array.from({ length: 16 }, (_, i) => race(i + 1));
    const errors = validateRegularSeasonOrder({
      calendar,
      races,
      regularSeasonStandingOrder: [],
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/regular-season standings order is missing or empty/i);
  });

  it('passes a complete regular season with a non-empty stored order', () => {
    const calendar = Array.from({ length: 23 }, (_, i) => calendarEntry(i + 1));
    const races = Array.from({ length: 16 }, (_, i) => race(i + 1));
    const errors = validateRegularSeasonOrder({
      calendar,
      races,
      regularSeasonStandingOrder: ['d0', 'd1', 'd2'],
    });
    expect(errors).toEqual([]);
  });

  it('does not require the order before the regular season is complete', () => {
    const calendar = Array.from({ length: 23 }, (_, i) => calendarEntry(i + 1));
    const races = Array.from({ length: 10 }, (_, i) => race(i + 1));
    const errors = validateRegularSeasonOrder({
      calendar,
      races,
      regularSeasonStandingOrder: [],
    });
    expect(errors).toEqual([]);
  });
});

describe('validateSeasonData integration', () => {
  it('passes a clean full fetch with no stored file', () => {
    const calendar = Array.from({ length: 23 }, (_, i) => calendarEntry(i + 1));
    const races = Array.from({ length: 16 }, (_, i) => race(i + 1));
    const order = Array.from({ length: 20 }, (_, i) => `d${i}`);
    const errors = validateSeasonData(
      { calendar, races, sprintRounds: [], regularSeasonStandingOrder: order },
      null
    );
    expect(errors).toEqual([]);
  });

  it('rejects a fetch with fewer races than the committed file', () => {
    const calendar = Array.from({ length: 23 }, (_, i) => calendarEntry(i + 1));
    const order = Array.from({ length: 20 }, (_, i) => `d${i}`);
    const stored = {
      calendar,
      races: Array.from({ length: 16 }, (_, i) => race(i + 1)),
      regularSeasonStandingOrder: order,
    };
    const fetched = {
      calendar,
      races: Array.from({ length: 14 }, (_, i) => race(i + 1)),
      sprintRounds: [],
      regularSeasonStandingOrder: order,
    };
    const errors = validateSeasonData(fetched, stored);
    expect(errors.some((e: string) => /fewer than/i.test(e))).toBe(true);
  });
});
