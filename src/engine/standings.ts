// Standings calculation and tiebreaker logic

import { RACE_POINTS_POSITIONS } from 'src/constants';
import type { Race, Driver, DriverStanding, RaceResult } from 'src/types';

import { calculateTotalPoints } from './points';

// Build position history for tiebreaker (count of 1sts, 2nds, 3rds, etc.)
function buildPositionHistory(driverId: string, races: Race[]): number[] {
  const history = new Array<number>(RACE_POINTS_POSITIONS).fill(0);

  for (const race of races) {
    const result = race.results.find((r) => r.driverId === driverId);
    if (result?.position && result.position <= RACE_POINTS_POSITIONS) {
      const index = result.position - 1;
      history[index] = (history[index] ?? 0) + 1;
    }
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
    return result?.position && result.position <= 3;
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

// Compare two drivers for tiebreaker (returns negative if a wins, positive if b wins).
// regularSeasonOrder, when supplied, maps a driverId to its regular-season finishing
// position and is used as the final key after the P1-P10 countback: the driver who
// finished the regular season higher wins. It is passed only for the season in
// progress (see INTERIM_TIEBREAK_SEASON); for every other season it is absent and
// the comparator returns 0, leaving the order exactly as it was before.
export function compareTiebreaker(
  a: DriverStanding,
  b: DriverStanding,
  regularSeasonOrder?: Map<string, number>
): number {
  // First compare by points
  if (a.points !== b.points) {
    return b.points - a.points;
  }

  // Then by position history (most wins, then most 2nds, etc.)
  for (let i = 0; i < a.positionHistory.length; i++) {
    const aCount = a.positionHistory[i] ?? 0;
    const bCount = b.positionHistory[i] ?? 0;
    if (aCount !== bCount) {
      return bCount - aCount;
    }
  }

  // Final key for the season in progress: regular-season finishing position.
  // Lower position (finished higher) wins. Only applied when both drivers are
  // present in the supplied order.
  if (regularSeasonOrder) {
    const aPos = regularSeasonOrder.get(a.driver.driverId);
    const bPos = regularSeasonOrder.get(b.driver.driverId);
    if (aPos !== undefined && bPos !== undefined && aPos !== bPos) {
      return aPos - bPos;
    }
  }

  // If still tied, maintain original order (stable sort)
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
