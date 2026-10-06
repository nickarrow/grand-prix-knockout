// Points calculation utilities
// Uses official F1 points from the API data directly (no custom recalculation)

import {
  RACE_POINTS,
  SPRINT_POINTS,
  RACE_POINTS_POSITIONS,
  SPRINT_POINTS_POSITIONS,
} from 'src/constants';
import type { Race } from 'src/types';

// Get expected points for a race position (used for tiebreaker/reference only)
export function getRacePoints(position: number | null): number {
  if (position === null || position < 1 || position > RACE_POINTS_POSITIONS) {
    return 0;
  }
  return RACE_POINTS[position - 1] ?? 0;
}

// Get expected points for a sprint position (used for reference only)
export function getSprintPoints(position: number | null): number {
  if (position === null || position < 1 || position > SPRINT_POINTS_POSITIONS) {
    return 0;
  }
  return SPRINT_POINTS[position - 1] ?? 0;
}

// Calculate total points for a driver in a single race weekend
// Uses the official points from API data (includes any bonuses the FIA awarded that season)
export function calculateRaceWeekendPoints(driverId: string, race: Race): number {
  let points = 0;

  // Race points (official from API)
  const raceResult = race.results.find((r) => r.driverId === driverId);
  if (raceResult) {
    points += raceResult.points;
  }

  // Sprint points (official from API)
  if (race.sprint) {
    const sprintResult = race.sprint.find((r) => r.driverId === driverId);
    if (sprintResult) {
      points += sprintResult.points;
    }
  }

  return points;
}

// Calculate total points for a driver across multiple races
export function calculateTotalPoints(driverId: string, races: Race[]): number {
  return races.reduce((total, race) => total + calculateRaceWeekendPoints(driverId, race), 0);
}
