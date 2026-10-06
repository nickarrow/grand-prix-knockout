// Mapping knockout races to rounds, including the decision 0005 calendar-change
// rules (a cancelled race, a round that lost both its races, an added race). The
// engine composes these functions rather than special-casing a season: a normal
// 7-race calendar is grouped exactly as the original round arithmetic grouped it,
// so no 2020-2026 outcome moves.

import { KNOCKOUT_RACES, KNOCKOUT_ROUNDS } from 'src/constants';
import type { Race, RaceCalendar } from 'src/types';

// A knockout round's date window, half-open: start inclusive, end exclusive. A
// null bound is open on that side, so the final round (end null) owns every date
// from its start onward. The added-race rule places a race by this window.
export interface RoundDateRange {
  round: number;
  start: number | null; // ms since epoch, inclusive
  end: number | null; // ms since epoch, exclusive
}

// The round number of the first knockout race (the race after the regular season).
export function knockoutStartRaceNumber(totalRaces: number): number {
  return totalRaces - KNOCKOUT_RACES + 1;
}

// The first race round number of a knockout round, by the locked 2-2-2-1
// structure. knockoutStartRace is the round number of the first knockout race.
export function knockoutRoundStartRace(knockoutStartRace: number, knockoutRound: number): number {
  let raceOffset = 0;
  for (let i = 0; i < knockoutRound - 1; i++) {
    raceOffset += KNOCKOUT_ROUNDS[i]?.races ?? 0;
  }
  return knockoutStartRace + raceOffset;
}

// A round's scheduled slot count from the locked structure (2 for rounds 1-3,
// 1 for the final).
export function scheduledSlots(knockoutRound: number): number {
  return KNOCKOUT_ROUNDS[knockoutRound - 1]?.races ?? 0;
}

// Parse an ISO date string to ms since epoch; an unparseable date is null so the
// caller can tell "no usable date" from a real one.
function toTime(date: string): number | null {
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? null : time;
}

// Build each knockout round's date range from the locked calendar entries, so an
// added race can be assigned to the round whose range contains its date. The
// range of a round runs from the date of its first locked race (inclusive) to the
// date of the next round's first locked race (exclusive); the final round is
// open-ended. A round whose first locked date is unparseable gets a null bound,
// which the assignment treats as open on that side.
export function buildRoundDateRanges(
  calendar: RaceCalendar[],
  knockoutStartRace: number
): RoundDateRange[] {
  const calendarByRound = new Map(calendar.map((entry) => [entry.round, entry.date]));

  const starts = KNOCKOUT_ROUNDS.map((config) => {
    const startRace = knockoutRoundStartRace(knockoutStartRace, config.round);
    const date = calendarByRound.get(startRace);
    return { round: config.round, start: date !== undefined ? toTime(date) : null };
  });

  return starts.map((entry, index) => ({
    round: entry.round,
    start: entry.start,
    end: starts[index + 1]?.start ?? null,
  }));
}

// Which knockout round a completed race belongs to.
//
// The backbone is the locked 2-2-2-1 structure keyed on the race's round number,
// identical to the original mapping, so a normal calendar is grouped exactly as
// before and no 2020-2026 outcome moves.
//
// A race the backbone does not place in any round (its round number falls outside
// every round's range) is an added race (decision 0005). It joins the round whose
// DATE RANGE contains its date, because Jolpica renumbers rounds and the added
// Grand Prix cannot be placed on round number alone.
export function knockoutRoundForRace(
  race: Race,
  knockoutStartRace: number,
  roundDateRanges: RoundDateRange[]
): number | null {
  // Backbone: round number falls inside a locked round's range.
  for (let roundNum = 1; roundNum <= KNOCKOUT_ROUNDS.length; roundNum++) {
    const config = KNOCKOUT_ROUNDS[roundNum - 1];
    if (!config) continue;
    const startRace = knockoutRoundStartRace(knockoutStartRace, roundNum);
    const endRace = startRace + config.races - 1;
    if (race.round >= startRace && race.round <= endRace) {
      return roundNum;
    }
  }

  // Added race: place it by date. A race before the first knockout race is still
  // regular season and is not placed here.
  const time = toTime(race.date);
  if (time === null) {
    return null;
  }
  for (const range of roundDateRanges) {
    const afterStart = range.start === null || time >= range.start;
    const beforeEnd = range.end === null || time < range.end;
    if (afterStart && beforeEnd) {
      return range.round;
    }
  }
  return null;
}
