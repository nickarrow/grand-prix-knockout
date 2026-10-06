// Playoff calculation engine

import { PLAYOFF_RACES, PLAYOFF_QUALIFIERS, PLAYOFF_ROUNDS } from 'src/constants';
import type {
  Race,
  RaceCalendar,
  Driver,
  PlayoffRound,
  PlayoffState,
  SeasonStatus,
} from 'src/types';

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

  // Calculate which race numbers belong to this playoff round
  let raceOffset = 0;
  for (let i = 0; i < playoffRound - 1; i++) {
    raceOffset += PLAYOFF_ROUNDS[i]?.races ?? 0;
  }

  const roundConfig = PLAYOFF_ROUNDS[playoffRound - 1];
  if (!roundConfig) return [];

  const startRace = playoffStartRace + raceOffset;
  const endRace = startRace + roundConfig.races - 1;

  return races.filter((race) => race.round >= startRace && race.round <= endRace);
}

// Calculate a single playoff round
// allQualifiedDrivers: all drivers who qualified for playoffs (for bracket point tracking)
// activeDrivers: drivers still competing in this round (for elimination decisions)
function calculatePlayoffRound(
  playoffRound: number,
  activeDrivers: Driver[],
  allQualifiedDrivers: Driver[],
  roundRaces: Race[],
  totalRaces: number,
  allSeasonRaces: Race[],
  isComplete: boolean,
  regularSeasonOrder?: Map<string, number>
): PlayoffRound {
  const roundConfig = PLAYOFF_ROUNDS[playoffRound - 1];
  if (!roundConfig) {
    throw new Error(`Invalid playoff round: ${playoffRound}`);
  }

  const playoffStartRace = totalRaces - PLAYOFF_RACES + 1;

  // Calculate race numbers for this round
  let raceOffset = 0;
  for (let i = 0; i < playoffRound - 1; i++) {
    raceOffset += PLAYOFF_ROUNDS[i]?.races ?? 0;
  }
  const raceNumbers = Array.from(
    { length: roundConfig.races },
    (_, i) => playoffStartRace + raceOffset + i
  );

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
  // in the drop zone, using the same ordering for both. endDrivers is the number
  // who survive the round (8, 6, 4, then 1 for the winner-take-all final).
  const advancingCount = roundConfig.endDrivers;

  const wouldAdvance = activeStandings.slice(0, advancingCount).map((s) => s.driver.driverId);
  const wouldDrop = activeStandings.slice(advancingCount).map((s) => s.driver.driverId);

  // Only a complete round eliminates. While a round is in progress, nobody is
  // eliminated and the drop zone is reported as at-risk (implements decision 0003).
  const eliminated = isComplete ? wouldDrop : [];
  const advancing = isComplete ? wouldAdvance : [];
  const atRisk = isComplete ? [] : wouldDrop;

  return {
    round: playoffRound,
    raceNumbers,
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

  // Calculate playoff rounds
  const rounds: PlayoffRound[] = [];
  let activeDrivers = [...allQualifiedDrivers]; // Drivers still competing for championship
  let champion: string | null = null;

  for (let roundNum = 1; roundNum <= PLAYOFF_ROUNDS.length; roundNum++) {
    const roundRaces = getPlayoffRoundRaces(races, totalRaces, roundNum);

    // Only calculate if we have races for this round
    if (roundRaces.length === 0) {
      break;
    }

    const roundConfig = PLAYOFF_ROUNDS[roundNum - 1];
    if (!roundConfig) break;

    // Check if round is complete
    const isRoundComplete = roundRaces.length >= roundConfig.races;

    const round = calculatePlayoffRound(
      roundNum,
      activeDrivers,
      allDrivers, // Pass ALL drivers for bracket point tracking (including non-qualifiers)
      roundRaces,
      totalRaces,
      races,
      isRoundComplete,
      regularSeasonOrder
    );
    rounds.push(round);

    // If round is complete, update active drivers for next round
    if (isRoundComplete) {
      activeDrivers = activeDrivers.filter((d) => round.advancing.includes(d.driverId));

      // Check for champion (final round complete)
      if (roundNum === PLAYOFF_ROUNDS.length && round.advancing.length > 0) {
        champion = round.advancing[0] ?? null;
      }
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
