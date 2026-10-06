// Validation for fetched season data. Pure functions so they can be unit tested
// without hitting the network. The fetcher calls validateSeasonData before it
// writes anything; a non-empty list of errors means write nothing and exit
// non-zero.
//
// Rules enforced (increment 1):
// - every completed sprint weekend (the schedule's Sprint field) has sprint results
// - rounds are contiguous from 1 with no gaps
// - the completed-race count is not fewer than the committed file already holds
// - per-race result counts are plausible (a roughly full grid, not zero)
// - the calendar guard of decision 0005: once the stored file shows the regular
//   season complete, a structurally different fetched calendar fails (a changed
//   round count, or any round's date or circuitId), while a name-only change passes.

// Number of races that make up the playoff portion of a season. Kept in step with
// PLAYOFF_RACES in src/constants/playoffs.ts; the script runs as plain Node and
// cannot import the TypeScript constant.
export const PLAYOFF_RACES = 7;

// A plausible full grid is around 20 cars. A completed race with far fewer
// results is a sign of a bad or partial fetch. This is a floor, not the grid size.
export const MIN_PLAUSIBLE_RESULTS = 10;

// Whether a schedule entry marks a sprint weekend. Jolpica puts a Sprint (or
// SprintQualifying) object on the schedule for sprint weekends.
export function isSprintWeekend(scheduleEntry) {
  return Boolean(scheduleEntry?.Sprint || scheduleEntry?.SprintQualifying);
}

// Count how many of a calendar's rounds have been completed in the fetched races.
function completedRaceCount(races) {
  return races.length;
}

// Validate the fetched season.
//
// fetched: { calendar, races } as the fetcher builds it, plus a per-round sprint
//   expectation derived from the schedule (sprintRounds: number[]).
// stored: the committed { calendar, races } for the same year, or null when there
//   is no committed file yet.
//
// Returns an array of human-readable error strings; empty means valid.
export function validateSeasonData(fetched, stored) {
  const errors = [];

  errors.push(...validateContiguousRounds(fetched.races));
  errors.push(...validateSprintWeekends(fetched));
  errors.push(...validateResultCounts(fetched.races));
  errors.push(...validateNotFewerRaces(fetched, stored));
  errors.push(...validateCalendarGuard(fetched, stored));

  return errors;
}

// Rounds present in the fetched races must run 1, 2, 3, ... with no gaps.
export function validateContiguousRounds(races) {
  const rounds = races.map((r) => r.round).sort((a, b) => a - b);
  const errors = [];
  for (let i = 0; i < rounds.length; i++) {
    if (rounds[i] !== i + 1) {
      errors.push(`Rounds are not contiguous from 1: expected round ${i + 1}, found ${rounds[i]}.`);
      break;
    }
  }
  return errors;
}

// Every completed sprint weekend must carry sprint results.
export function validateSprintWeekends(fetched) {
  const errors = [];
  const sprintRounds = new Set(fetched.sprintRounds ?? []);
  for (const race of fetched.races) {
    if (sprintRounds.has(race.round)) {
      if (!Array.isArray(race.sprint) || race.sprint.length === 0) {
        errors.push(
          `Round ${race.round} is a sprint weekend but has no sprint results in the fetched data.`
        );
      }
    }
  }
  return errors;
}

// Each completed race should have a roughly full grid of results.
export function validateResultCounts(races) {
  const errors = [];
  for (const race of races) {
    const count = Array.isArray(race.results) ? race.results.length : 0;
    if (count < MIN_PLAUSIBLE_RESULTS) {
      errors.push(
        `Round ${race.round} has only ${count} results, fewer than the plausible minimum ${MIN_PLAUSIBLE_RESULTS}.`
      );
    }
  }
  return errors;
}

// The fetch must not lose races the committed file already has.
export function validateNotFewerRaces(fetched, stored) {
  if (!stored) return [];
  const fetchedCount = completedRaceCount(fetched.races);
  const storedCount = completedRaceCount(stored.races ?? []);
  if (fetchedCount < storedCount) {
    return [
      `Fetched ${fetchedCount} completed races, fewer than the ${storedCount} already committed.`,
    ];
  }
  return [];
}

// Whether the stored file shows the regular season already complete: its
// completed-race count has reached at least the number of regular-season races
// (total rounds minus the playoff races).
export function storedRegularSeasonComplete(stored) {
  if (!stored) return false;
  const totalRounds = (stored.calendar ?? []).length;
  if (totalRounds === 0) return false;
  const regularSeasonRaces = totalRounds - PLAYOFF_RACES;
  const storedCompleted = completedRaceCount(stored.races ?? []);
  return storedCompleted >= regularSeasonRaces;
}

// Calendar guard (decision 0005). Once the stored file shows the regular season
// complete, the fetched calendar must match the stored one in structure: the same
// number of rounds, and for every round the same date and circuitId. A circuitName
// change on its own passes (Losail -> Lusail with circuitId losail unchanged).
export function validateCalendarGuard(fetched, stored) {
  if (!storedRegularSeasonComplete(stored)) return [];

  const errors = [];
  const storedCalendar = stored.calendar ?? [];
  const fetchedCalendar = fetched.calendar ?? [];

  if (fetchedCalendar.length !== storedCalendar.length) {
    errors.push(
      `Calendar guard: round count changed from ${storedCalendar.length} to ${fetchedCalendar.length} after the regular season was complete.`
    );
    return errors;
  }

  const fetchedByRound = new Map(fetchedCalendar.map((entry) => [entry.round, entry]));
  for (const storedEntry of storedCalendar) {
    const fetchedEntry = fetchedByRound.get(storedEntry.round);
    if (!fetchedEntry) {
      errors.push(`Calendar guard: round ${storedEntry.round} is missing from the fetched calendar.`);
      continue;
    }
    if (fetchedEntry.date !== storedEntry.date) {
      errors.push(
        `Calendar guard: round ${storedEntry.round} date changed from ${storedEntry.date} to ${fetchedEntry.date}.`
      );
    }
    if (fetchedEntry.circuitId !== storedEntry.circuitId) {
      errors.push(
        `Calendar guard: round ${storedEntry.round} circuitId changed from ${storedEntry.circuitId} to ${fetchedEntry.circuitId}.`
      );
    }
  }

  return errors;
}
