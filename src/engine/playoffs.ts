// Playoff calculation engine

import {
  PLAYOFF_RACES,
  PLAYOFF_QUALIFIERS,
  PLAYOFF_ROUNDS,
  FINAL_ROUND_NUMBER,
  LAST_ELIMINATION_ROUND_NUMBER,
} from 'src/constants';
import type {
  Race,
  RaceCalendar,
  Driver,
  PlayoffRound,
  PlayoffState,
  SeasonStatus,
} from 'src/types';

import {
  playoffRoundStartRace,
  scheduledSlots,
  buildRoundDateRanges,
  playoffRoundForRace,
} from './playoff-schedule';
import { extractDrivers, calculateStandings } from './standings';

// Determine season status based on completed races and calendar
export function determineSeasonStatus(
  calendar: RaceCalendar[],
  completedRaces: number,
  currentDate: Date = new Date()
): SeasonStatus {
  if (calendar.length === 0) {
    return 'pre-season';
  }

  const totalRaces = calendar.length;
  const firstRaceDate = new Date(calendar[0]?.date ?? '');
  const playoffStartRace = totalRaces - PLAYOFF_RACES + 1;

  // If we have completed races, we're not in pre-season
  // (This handles stub data for testing future seasons)
  if (completedRaces > 0) {
    // After last race and all races completed
    if (completedRaces >= totalRaces) {
      return 'completed';
    }

    // In playoffs (completed races >= playoff start race)
    if (completedRaces >= playoffStartRace) {
      return 'playoffs';
    }

    return 'regular-season';
  }

  // No completed races - check if season has started by date
  if (currentDate < firstRaceDate) {
    return 'pre-season';
  }

  return 'regular-season';
}

// Get races for regular season
export function getRegularSeasonRaces(races: Race[], totalRaces: number): Race[] {
  const regularSeasonEnd = totalRaces - PLAYOFF_RACES;
  return races.filter((race) => race.round <= regularSeasonEnd);
}

// Get races for a specific playoff round
export function getPlayoffRoundRaces(
  races: Race[],
  totalRaces: number,
  playoffRound: number
): Race[] {
  const playoffStartRace = totalRaces - PLAYOFF_RACES + 1;
  const roundConfig = PLAYOFF_ROUNDS[playoffRound - 1];
  if (!roundConfig) return [];

  const startRace = playoffRoundStartRace(playoffStartRace, playoffRound);
  const endRace = startRace + roundConfig.races - 1;

  return races.filter((race) => race.round >= startRace && race.round <= endRace);
}

// Calculate a single playoff round
// allQualifiedDrivers: all drivers who qualified for playoffs (for bracket point tracking)
// activeDrivers: drivers still competing in this round (for elimination decisions)
// advancingCount: how many active drivers survive the round, the round config's
//   endDrivers. When an earlier round lost both its races it eliminated nobody, so
//   more drivers are active here and advancing only endDrivers sends the surplus
//   out, which keeps the final at four (decision 0005).
function calculatePlayoffRound(
  playoffRound: number,
  activeDrivers: Driver[],
  allQualifiedDrivers: Driver[],
  roundRaces: Race[],
  allSeasonRaces: Race[],
  isComplete: boolean,
  advancingCount: number,
  regularSeasonOrder?: Map<string, number>
): PlayoffRound {
  // Calculate standings for ALL qualified drivers (for bracket point tracking)
  // This allows eliminated drivers to continue accumulating points for bracket ranking
  const allStandings = calculateStandings(
    allQualifiedDrivers,
    roundRaces,
    roundRaces,
    allSeasonRaces,
    regularSeasonOrder
  );

  // Get standings for only active drivers (for elimination decisions)
  const activeDriverIds = new Set(activeDrivers.map((d) => d.driverId));
  const activeStandings = allStandings.filter((s) => activeDriverIds.has(s.driver.driverId));

  // Split the active standings into the drivers who would advance and the drivers
  // in the drop zone, using the same ordering for both. advancingCount is how many
  // survive the round.
  const wouldAdvance = activeStandings.slice(0, advancingCount).map((s) => s.driver.driverId);
  const wouldDrop = activeStandings.slice(advancingCount).map((s) => s.driver.driverId);

  // Only a complete round eliminates. While a round is in progress, nobody is
  // eliminated and the drop zone is reported as at-risk (implements decision 0003).
  const eliminated = isComplete ? wouldDrop : [];
  const advancing = isComplete ? wouldAdvance : [];
  const atRisk = isComplete ? [] : wouldDrop;

  return {
    round: playoffRound,
    raceNumbers: roundRaces.map((race) => race.round),
    standings: allStandings, // Include all qualified drivers for bracket tracking
    isComplete,
    eliminated,
    advancing,
    atRisk,
  };
}

// Build a driverId -> rank map from the stored official regular-season standings
// order (decision 0004, Option A terminal key). The order is a dense rank with no
// ties, so the map never produces a tie and ends the tiebreak chain. An empty or
// missing order yields an empty map, which the comparator ignores.
function buildOfficialOrderMap(order: string[]): Map<string, number> {
  return new Map(order.map((driverId, index) => [driverId, index]));
}

// Calculate complete playoff state for a season.
//
// regularSeasonStandingOrder is the official F1 driver-standings order after the
// last regular-season race, stored per season in data/<year>.json (decision 0004,
// Option A). It is the terminal tiebreak key, applied to EVERY season: it orders
// the regular-season standings themselves (so a tie like 2026 Norris and
// Verstappen on 188 resolves), and through them every playoff ordering. When it is
// absent (e.g. a live-API season with no stored order) the engine falls back to
// the countback alone, leaving genuinely tied drivers in input order.
export function calculatePlayoffState(
  races: Race[],
  calendar: RaceCalendar[],
  regularSeasonStandingOrder: string[] = []
): PlayoffState {
  const totalRaces = calendar.length;
  const regularSeasonEnd = totalRaces - PLAYOFF_RACES;
  const playoffStartRace = regularSeasonEnd + 1;
  const completedRaces = races.length;

  // Extract all drivers from the season
  const allDrivers = extractDrivers(races);

  // The stored official standings order is the terminal tiebreak key. It orders
  // the regular-season standings, so even a regular-season tie resolves to a
  // definite order.
  const officialOrder = buildOfficialOrderMap(regularSeasonStandingOrder);

  // Calculate regular season standings (pass all races for official F1 points)
  const regularSeasonRaces = getRegularSeasonRaces(races, totalRaces);
  const regularSeasonStandings = calculateStandings(
    allDrivers,
    regularSeasonRaces,
    regularSeasonRaces,
    races,
    officialOrder
  );

  // Season being computed.
  const season = races[0]?.season ?? calendar[0]?.season ?? 0;

  // The terminal key inside a playoff round is the regular-season finishing
  // position, falling through to the official order (decision 0004 answer 4).
  // The regular-season standings above are already fully ordered by that chain
  // (countback over the regular-season races, then the official order), so their
  // positions are a dense rank that carries both keys at once. Pass that rank into
  // every playoff round so bracket placings, finalist places 2-4, the drop zone
  // and the non-qualifiers all resolve deterministically.
  const regularSeasonOrder = new Map(
    regularSeasonStandings.map((s) => [s.driver.driverId, s.position])
  );

  // Determine qualified drivers (top 10 from regular season)
  const qualifiedDriverIds = regularSeasonStandings
    .slice(0, PLAYOFF_QUALIFIERS)
    .map((s) => s.driver.driverId);

  // All qualified drivers (for elimination decisions)
  const allQualifiedDrivers = allDrivers.filter((d) => qualifiedDriverIds.includes(d.driverId));

  // Determine season status
  const status = determineSeasonStatus(calendar, completedRaces);

  // Group playoff races that actually RAN into rounds. The backbone is the locked
  // 2-2-2-1 structure by round number (so a normal calendar is unchanged), with
  // any added race placed by the date range of the round it falls inside
  // (decision 0005). A race present in the input but with no classified results is
  // a race that did not run (an abandoned or cancelled Grand Prix); it is excluded
  // here but still tells the engine the season reached that slot.
  const roundDateRanges = buildRoundDateRanges(calendar, playoffStartRace);
  const racesByRound = new Map<number, Race[]>();
  // Whether the final's scheduled slot is present in the input but did not run,
  // which is how a cancelled final is told apart from a final still to come.
  let finalCancelled = false;
  for (const race of races) {
    if (race.round < playoffStartRace) {
      continue; // regular-season race
    }
    const roundNum = playoffRoundForRace(race, playoffStartRace, roundDateRanges);
    if (roundNum === null) {
      continue;
    }
    if (race.results.length === 0) {
      // A scheduled race that produced no result did not run.
      if (roundNum === FINAL_ROUND_NUMBER) {
        finalCancelled = true;
      }
      continue;
    }
    const list = racesByRound.get(roundNum) ?? [];
    list.push(race);
    racesByRound.set(roundNum, list);
  }

  // Calculate playoff rounds
  const rounds: PlayoffRound[] = [];
  let activeDrivers = [...allQualifiedDrivers]; // Drivers still competing for championship
  let champion: string | null = null;

  // Whether any completed playoff race belongs to a round later than the given one.
  // The season having moved past a round is how the engine tells a cancelled race
  // (never run, never coming) from a race that simply has not happened yet
  // (decision 0005): a round whose successor has run is finished with whatever
  // races it got.
  const laterRoundHasRun = (afterRound: number): boolean =>
    races.some(
      (race) =>
        race.round >= playoffStartRace &&
        race.results.length > 0 &&
        (playoffRoundForRace(race, playoffStartRace, roundDateRanges) ?? 0) > afterRound
    );

  for (let roundNum = 1; roundNum <= PLAYOFF_ROUNDS.length; roundNum++) {
    const roundConfig = PLAYOFF_ROUNDS[roundNum - 1];
    if (!roundConfig) break;

    const roundRaces = racesByRound.get(roundNum) ?? [];

    // A non-final round that ran NONE of its races, with the season already past
    // it, lost both races (decision 0005). It eliminates nobody, so its drivers
    // carry into the next round still active. Because that next round advances
    // only its own endDrivers, the surplus (this round's two eliminations plus the
    // next round's own two) all go out there, which keeps the final at four. The
    // rollover is therefore automatic: skip the round without reducing the active
    // field.
    if (roundNum !== FINAL_ROUND_NUMBER && roundRaces.length === 0) {
      if (laterRoundHasRun(roundNum)) {
        continue;
      }
      // Reached a round with no completed races and nothing after it: stop.
      break;
    }

    // The championship final.
    if (roundNum === FINAL_ROUND_NUMBER) {
      // A cancelled final: the final's scheduled race was reached but did not run
      // (decision 0005). Rank the four finalists by their Round 3 points under the
      // 0004 tie order and make the leader champion. A final that is simply still
      // to come (its race not yet in the input) is left unresolved, so no champion
      // is crowned early.
      if (roundRaces.length === 0) {
        if (!finalCancelled) {
          break; // final not reached yet
        }
        const round3Races = racesByRound.get(LAST_ELIMINATION_ROUND_NUMBER) ?? [];
        if (round3Races.length === 0) {
          break; // no Round 3 to rank by
        }
        const finalStandings = calculateStandings(
          allDrivers,
          round3Races,
          round3Races,
          races,
          regularSeasonOrder
        );
        // Rank only the active finalists through the shared comparator, so the
        // champion is the leader on Round 3 points under the full tie order.
        const activeIds = new Set(activeDrivers.map((d) => d.driverId));
        const finalistRanking = finalStandings
          .filter((s) => activeIds.has(s.driver.driverId))
          .map((s) => s.driver.driverId);
        rounds.push({
          round: roundNum,
          raceNumbers: round3Races.map((race) => race.round),
          standings: finalStandings,
          isComplete: true,
          eliminated: finalistRanking.slice(1),
          advancing: finalistRanking.slice(0, 1),
          atRisk: [],
        });
        champion = finalistRanking[0] ?? null;
        break;
      }

      // A final that ran decides the champion as before.
      const round = calculatePlayoffRound(
        roundNum,
        activeDrivers,
        allDrivers,
        roundRaces,
        races,
        true,
        roundConfig.endDrivers,
        regularSeasonOrder
      );
      rounds.push(round);
      if (round.advancing.length > 0) {
        champion = round.advancing[0] ?? null;
      }
      break;
    }

    // An elimination round (1-3) is complete when it has run every race it is
    // going to. That is true once it has all its scheduled slots, OR once the
    // season has moved on to a later round, which means any missing race was
    // cancelled and the round is decided on the race that ran (decision 0005). A
    // two-race round with one race run and nothing after it stays incomplete and
    // reports its drop zone (decision 0003).
    const isRoundComplete =
      roundRaces.length > 0 &&
      (roundRaces.length >= scheduledSlots(roundNum) || laterRoundHasRun(roundNum));

    // Drivers who survive the round: the round's own endDrivers. When an earlier
    // round lost both its races and was skipped, the extra drivers it did not
    // eliminate are still active here, so advancing only endDrivers sends the
    // surplus out this round and keeps the final at four (decision 0005).
    const advancingCount = roundConfig.endDrivers;

    const round = calculatePlayoffRound(
      roundNum,
      activeDrivers,
      allDrivers,
      roundRaces,
      races,
      isRoundComplete,
      advancingCount,
      regularSeasonOrder
    );
    rounds.push(round);

    if (isRoundComplete) {
      activeDrivers = activeDrivers.filter((d) => round.advancing.includes(d.driverId));
    } else {
      // An incomplete round decides nothing yet, so stop here.
      break;
    }
  }

  return {
    season,
    totalRaces,
    regularSeasonRaces: regularSeasonEnd,
    playoffStartRace,
    // The regular season is complete once every regular-season race has run, even
    // before the first playoff race. The qualifiers are then fixed (decision 0005).
    regularSeasonComplete: completedRaces >= regularSeasonEnd,
    regularSeasonStandings,
    qualifiedDrivers: qualifiedDriverIds,
    rounds,
    champion,
    status,
  };
}
