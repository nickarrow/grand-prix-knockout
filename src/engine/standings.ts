// Standings calculation and tiebreaker logic

import { PODIUM_POSITIONS } from 'src/constants';
import type { Race, Driver, DriverStanding, RaceResult } from 'src/types';

import { calculateTotalPoints } from './points';

// Read a classified finishing position from Jolpica's positionText. A numeric
// positionText means the car was classified at that position; a letter (R/W/D/E/
// F/N) means it was not classified and has no place in the countback. This is the
// classification test decision 0004 answer 2 settled, and it lets a classified
// retiree (numeric positionText, status Retired) keep its finishing place.
function classifiedPosition(result: RaceResult): number | null {
  const parsed = Number.parseInt(result.positionText, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

// Build the countback history for the tiebreaker: the count of 1sts, 2nds, 3rds
// and so on over the given races, counting EVERY classified finishing position
// with no top-ten cut-off (decision 0004, following the FIA countback which sets
// no limit). Race finishes only; sprint results never count. The array is indexed
// by position - 1, so history[0] is the number of wins. It grows to fit the
// deepest classified position seen, so two drivers can be compared position by
// position all the way down the field.
function buildPositionHistory(driverId: string, races: Race[]): number[] {
  const history: number[] = [];

  for (const race of races) {
    const result = race.results.find((r) => r.driverId === driverId);
    if (!result) {
      continue;
    }
    const position = classifiedPosition(result);
    if (position === null || position < 1) {
      continue;
    }
    const index = position - 1;
    while (history.length <= index) {
      history.push(0);
    }
    history[index] = (history[index] ?? 0) + 1;
  }

  return history;
}

// Count wins for a driver
function countWins(driverId: string, races: Race[]): number {
  return races.filter((race) => {
    const result = race.results.find((r) => r.driverId === driverId);
    return result?.position === 1;
  }).length;
}

// Count podiums (top 3) for a driver
function countPodiums(driverId: string, races: Race[]): number {
  return races.filter((race) => {
    const result = race.results.find((r) => r.driverId === driverId);
    return result?.position && result.position <= PODIUM_POSITIONS;
  }).length;
}

// Calculate official F1 points (sum of points from race results)
function calculateOfficialPoints(driverId: string, races: Race[]): number {
  let total = 0;
  for (const race of races) {
    const result = race.results.find((r) => r.driverId === driverId);
    if (result) {
      total += result.points;
    }
    // Add sprint points if applicable
    if (race.sprint) {
      const sprintResult = race.sprint.find((s) => s.driverId === driverId);
      if (sprintResult) {
        total += sprintResult.points;
      }
    }
  }
  return total;
}

// Compare two drivers for the tiebreaker (returns negative if a ranks higher,
// positive if b ranks higher). The order, settled in decision 0004 and applied to
// every season here, is:
//
//   1. points, more wins the comparison;
//   2. full-classification countback over the round's races: most 1sts, then most
//      2nds, and so on through every classified position with no cut-off, race
//      finishes only (sprints are excluded, built into positionHistory);
//   3. regular-season finishing position: the driver who finished the regular
//      season higher (lower position number) wins;
//   4. the stored official F1 standings order after the last regular-season race
//      (regularSeasonOrder maps a driverId to its index in that order): the lower
//      index wins. This is the terminal key and never ties, because the official
//      order is a dense rank with no repeats, so the comparator returns 0 only
//      when two drivers are genuinely equal under the full rule.
//
// regularSeasonOrder carries both the regular-season position and the terminal
// official-order key: for a playoff round it is the driverId -> official-order
// index map, which is itself the published regular-season finishing order, so one
// map answers both keys 3 and 4. It is passed for every season.
export function compareTiebreaker(
  a: DriverStanding,
  b: DriverStanding,
  regularSeasonOrder?: Map<string, number>
): number {
  // First compare by points
  if (a.points !== b.points) {
    return b.points - a.points;
  }

  // Then by the full-classification countback (most wins, then most 2nds, and so
  // on down the whole field). Compare across the longer history so a position one
  // driver reached and the other never did still counts.
  const historyLength = Math.max(a.positionHistory.length, b.positionHistory.length);
  for (let i = 0; i < historyLength; i++) {
    const aCount = a.positionHistory[i] ?? 0;
    const bCount = b.positionHistory[i] ?? 0;
    if (aCount !== bCount) {
      return bCount - aCount;
    }
  }

  // Terminal key: the official regular-season standings order (which is also the
  // regular-season finishing position). Lower index/position wins. Applied only
  // when both drivers are present in the supplied order.
  if (regularSeasonOrder) {
    const aPos = regularSeasonOrder.get(a.driver.driverId);
    const bPos = regularSeasonOrder.get(b.driver.driverId);
    if (aPos !== undefined && bPos !== undefined && aPos !== bPos) {
      return aPos - bPos;
    }
  }

  // If still tied, the two drivers are genuinely equal under the full rule.
  return 0;
}

// Extract unique drivers from race results
export function extractDrivers(races: Race[]): Driver[] {
  const driverMap = new Map<string, Driver>();

  for (const race of races) {
    for (const result of race.results) {
      // Always update with latest race data (driver may have changed teams)
      // The result object may have extended driver info from static data
      const existingDriver = driverMap.get(result.driverId);
      const resultWithDriverInfo = result as RaceResultWithDriverInfo;

      if (!existingDriver || resultWithDriverInfo.firstName) {
        driverMap.set(result.driverId, {
          driverId: result.driverId,
          code: resultWithDriverInfo.driverCode ?? result.driverId.substring(0, 3).toUpperCase(),
          firstName: resultWithDriverInfo.firstName ?? '',
          lastName: resultWithDriverInfo.lastName ?? result.driverId,
          nationality: '',
          constructorId: resultWithDriverInfo.constructorId ?? '',
          constructorName: resultWithDriverInfo.constructorName ?? '',
        });
      }
    }
  }

  return Array.from(driverMap.values());
}

// Extended result type that may include driver info from static data
interface RaceResultWithDriverInfo extends RaceResult {
  driverCode?: string;
  firstName?: string;
  lastName?: string;
  constructorId?: string;
  constructorName?: string;
}

// Calculate standings for a set of races
export function calculateStandings(
  drivers: Driver[],
  races: Race[],
  relevantRaces?: Race[], // Optional: only count points from these races
  allSeasonRaces?: Race[], // Optional: all races for official F1 points calculation
  regularSeasonOrder?: Map<string, number> // Optional: final tiebreak key for the season in progress
): DriverStanding[] {
  const racesForPoints = relevantRaces ?? races;
  const racesForHistory = relevantRaces ?? races;
  const racesForOfficialPoints = allSeasonRaces ?? races;

  const standings: DriverStanding[] = drivers.map((driver) => ({
    driver,
    points: calculateTotalPoints(driver.driverId, racesForPoints),
    wins: countWins(driver.driverId, racesForHistory),
    podiums: countPodiums(driver.driverId, racesForHistory),
    position: 0, // Will be set after sorting
    positionHistory: buildPositionHistory(driver.driverId, racesForHistory),
    officialPoints: calculateOfficialPoints(driver.driverId, racesForOfficialPoints),
  }));

  // Sort by points, then tiebreaker
  standings.sort((a, b) => compareTiebreaker(a, b, regularSeasonOrder));

  // Assign positions
  standings.forEach((standing, index) => {
    standing.position = index + 1;
  });

  return standings;
}
