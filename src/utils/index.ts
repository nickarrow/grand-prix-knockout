// Utility functions for knockout state operations

import type { KnockoutState, KnockoutRound } from 'src/types';

// Get elimination round for a driver
// Returns: 0 = champion/finalist, 1-3 = eliminated in that round, -1 = didn't qualify
export function getEliminationRound(driverId: string, knockoutState: KnockoutState): number {
  if (!knockoutState.qualifiedDrivers.includes(driverId)) return -1;

  for (const round of knockoutState.rounds) {
    if (round.eliminated.includes(driverId)) return round.round;
  }

  return 0; // Made it to final or still advancing
}

// Whether the regular season is over, so knockout banners (including the
// "Did Not Advance" banner for non-qualifiers) should show. Reads the engine's
// flag, which is true once every regular-season race has run, even before the
// first knockout race, rather than the presence of a round object (a round now
// exists mid-run with no eliminations yet).
export function isRegularSeasonComplete(knockoutState: KnockoutState): boolean {
  return knockoutState.regularSeasonComplete;
}

// The knockout round currently in progress: one that has races but is not yet
// complete. Returns undefined when no round is mid-run (regular season, between
// rounds, or season complete).
export function getInProgressRound(knockoutState: KnockoutState): KnockoutRound | undefined {
  return knockoutState.rounds.find((round) => !round.isComplete);
}

// Whether a driver sits in the drop zone of the round in progress. A driver is
// at risk only while a round is incomplete; once it completes they are either
// eliminated or advancing, never at risk.
export function isDriverAtRisk(driverId: string, knockoutState: KnockoutState): boolean {
  const round = getInProgressRound(knockoutState);
  return round?.atRisk.includes(driverId) ?? false;
}

// Get points for a driver in a specific knockout round
export function getKnockoutRoundPoints(
  round: KnockoutRound | undefined,
  driverId: string
): number | null {
  if (!round) return null;
  const standing = round.standings.find((s) => s.driver.driverId === driverId);
  return standing?.points ?? null;
}

// Check if a driver was eliminated in a specific round
export function wasEliminatedInRound(round: KnockoutRound | undefined, driverId: string): boolean {
  return round?.eliminated.includes(driverId) ?? false;
}

// Get cumulative points from a starting round through the end of knockout
// Used for ranking within elimination brackets
export function getBracketPoints(
  driverId: string,
  startRound: number,
  knockoutState: KnockoutState
): number {
  let total = 0;
  for (const round of knockoutState.rounds) {
    if (round.round >= startRound) {
      const points = getKnockoutRoundPoints(round, driverId);
      if (points !== null) {
        total += points;
      }
    }
  }
  return total;
}

// Check if a driver advanced via tiebreaker in a specific round
// Returns true if driver had same points as an eliminated driver but advanced
export function advancedViaTiebreaker(round: KnockoutRound | undefined, driverId: string): boolean {
  if (!round || round.eliminated.length === 0) return false;

  // Get this driver's points
  const driverStanding = round.standings.find((s) => s.driver.driverId === driverId);
  if (!driverStanding) return false;

  // Check if driver advanced (not eliminated)
  if (round.eliminated.includes(driverId)) return false;

  // Check if any eliminated driver had the same points
  const eliminatedPoints = round.eliminated.map((elimId) => {
    const standing = round.standings.find((s) => s.driver.driverId === elimId);
    return standing?.points ?? -1;
  });

  return eliminatedPoints.includes(driverStanding.points);
}
