// A line shown above the standings table while a playoff round is in progress.
// It names the round, how many of its races have run, and that the drivers in
// the drop zone go out if the round ends now. This carries the drop-zone state
// in words so it does not depend on colour, and names the at-risk drivers in the
// accessibility tree without any row having to be expanded.

import { Box, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

import type { PlayoffState } from 'src/types';
import { getInProgressRound } from 'src/utils';
import { DROP_ZONE_ICON_SIZE } from 'src/constants';

interface DropZoneNoticeProps {
  playoffState: PlayoffState;
  completedRaces: number;
}

export function DropZoneNotice({
  playoffState,
  completedRaces,
}: DropZoneNoticeProps): React.ReactElement | null {
  const round = getInProgressRound(playoffState);
  if (!round || round.atRisk.length === 0) {
    return null;
  }

  const totalRoundRaces = round.raceNumbers.length;
  const racesRun = round.raceNumbers.filter((raceNumber) => raceNumber <= completedRaces).length;

  const atRiskNames = round.atRisk.map((driverId) => driverCode(driverId, playoffState)).join(', ');

  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        mb: 2,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'warning.main',
        color: 'warning.contrastText',
      }}
    >
      <AlertTriangle size={DROP_ZONE_ICON_SIZE} aria-hidden="true" style={{ flexShrink: 0 }} />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {`Round ${round.round}: ${racesRun} of ${totalRoundRaces} races run. Drivers in the drop zone go out if the round ends now: ${atRiskNames}.`}
      </Typography>
    </Box>
  );
}

// Resolve a driver's three-letter code from the regular-season standings.
function driverCode(driverId: string, playoffState: PlayoffState): string {
  const standing = playoffState.regularSeasonStandings.find((s) => s.driver.driverId === driverId);
  return standing?.driver.code ?? driverId.toUpperCase();
}
