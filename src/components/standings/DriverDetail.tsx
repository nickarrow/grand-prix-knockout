// Expanded driver detail view - shows race-by-race breakdown by phase

import { Box } from '@mui/material';

import type { Race, KnockoutState } from 'src/types';
import { calculateTotalPoints } from 'src/engine';
import { getTeamColor, FINAL_ROUND_NUMBER } from 'src/constants';

import { PhaseSection } from './PhaseSection';

interface DriverDetailProps {
  driverId: string;
  constructorId: string;
  knockoutState: KnockoutState;
  allRaces: Race[];
}

export function DriverDetail({
  driverId,
  constructorId,
  knockoutState,
  allRaces,
}: DriverDetailProps): React.ReactElement {
  const { regularSeasonRaces: regSeasonCount, knockoutStartRace } = knockoutState;
  const teamColor = getTeamColor(constructorId).primary;

  // Regular season races and points
  const regularSeasonRaces = allRaces.filter((r) => r.round <= regSeasonCount);
  const regularSeasonPoints = calculateTotalPoints(driverId, regularSeasonRaces);

  // All knockout races
  const knockoutRaces = allRaces.filter((r) => r.round >= knockoutStartRace);
  const knockoutPoints = calculateTotalPoints(driverId, knockoutRaces);

  // Determine elimination status and finalist position
  const didAdvance = knockoutState.qualifiedDrivers.includes(driverId);
  let eliminatedInRound: number | null = null;
  let eliminationRaceNumber: number | null = null;
  let finalistPosition: number | null = null;

  if (didAdvance) {
    // Check which round (if any) this driver was eliminated in
    for (const round of knockoutState.rounds) {
      if (round.eliminated.includes(driverId)) {
        eliminatedInRound = round.round;
        eliminationRaceNumber = Math.max(...round.raceNumbers);
        break;
      }
    }

    // If eliminated in the final round, they're a finalist - determine their position
    // Finalists are those who made it to the final (eliminated in final or champion)
    if (
      eliminatedInRound === FINAL_ROUND_NUMBER ||
      (eliminatedInRound === null && knockoutState.champion)
    ) {
      const finalRound = knockoutState.rounds.find((r) => r.round === FINAL_ROUND_NUMBER);
      if (finalRound) {
        // Get only the 4 finalists (those who were active in round 4)
        const finalistIds = [...finalRound.advancing, ...finalRound.eliminated];
        const finalistStandings = finalRound.standings.filter((s) =>
          finalistIds.includes(s.driver.driverId)
        );
        // Sort by points to get correct 1-4 positions
        finalistStandings.sort((a, b) => b.points - a.points);

        const finalistIndex = finalistStandings.findIndex((s) => s.driver.driverId === driverId);
        if (finalistIndex !== -1) {
          finalistPosition = finalistIndex + 1; // 1-4
        }
      }
      // Clear elimination for finalists - they get trophies, not "Elim R4"
      eliminatedInRound = null;
      eliminationRaceNumber = null;
    }
  }

  return (
    <Box sx={{ py: 2, px: { xs: 2, sm: 4 }, bgcolor: 'action.hover' }}>
      {/* Regular Season */}
      <PhaseSection
        type="regular"
        races={regularSeasonRaces}
        driverId={driverId}
        points={regularSeasonPoints}
        accentColor={teamColor}
      />

      {/* Knockout - single consolidated section */}
      {knockoutRaces.length > 0 && (
        <PhaseSection
          type="knockout"
          races={knockoutRaces}
          driverId={driverId}
          points={knockoutPoints}
          accentColor={teamColor}
          didAdvance={didAdvance}
          eliminatedInRound={eliminatedInRound}
          eliminationRaceNumber={eliminationRaceNumber}
          finalistPosition={finalistPosition}
          knockoutRounds={knockoutState.rounds}
        />
      )}
    </Box>
  );
}
