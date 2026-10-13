// A line shown above the standings table while a knockout round is in progress.
// It names the round, how many of its races have run, and that the drivers in
// the drop zone are knocked out if the round ends now. This carries the drop-zone state
// in words so it does not depend on colour, and names the at-risk drivers in the
// accessibility tree without any row having to be expanded.

import { Box, Typography } from '@mui/material';
import { Flag } from 'lucide-react';

import type { KnockoutState } from 'src/types';
import { getInProgressRound } from 'src/utils';
import { DROP_ZONE_ICON_SIZE } from 'src/constants';

interface DropZoneNoticeProps {
  knockoutState: KnockoutState;
  completedRaces: number;
}

export function DropZoneNotice({
  knockoutState,
  completedRaces,
}: DropZoneNoticeProps): React.ReactElement | null {
  const round = getInProgressRound(knockoutState);
  if (!round || round.atRisk.length === 0) {
    return null;
  }

  // Denominator is how many races the round is SCHEDULED to have, not how many
  // have run so far, so an in-progress Round 1 reads "1 of 2", not "1 of 1".
  const totalRoundRaces = round.scheduledRaceCount;
  const racesRun = round.raceNumbers.filter((raceNumber) => raceNumber <= completedRaces).length;

  const atRiskNames = round.atRisk
    .map((driverId) => driverCode(driverId, knockoutState))
    .join(', ');

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
        // A light, informational treatment rather than a heavy warning fill: a
        // tinted surface with a thin accent bar, so it reads as "heads up" not
        // "error". The text carries the meaning, so colour is not load-bearing.
        bgcolor: 'action.hover',
        borderLeft: 3,
        borderColor: 'primary.main',
      }}
    >
      <Flag size={DROP_ZONE_ICON_SIZE} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
        <strong>
          Round {round.round}: {racesRun} of {totalRoundRaces} races run.
        </strong>{' '}
        {atRiskNames} {round.atRisk.length === 1 ? 'is' : 'are'} in the drop zone, knocked out if
        the round ends now.
      </Typography>
    </Box>
  );
}

// Resolve a driver's three-letter code from the regular-season standings.
function driverCode(driverId: string, knockoutState: KnockoutState): string {
  const standing = knockoutState.regularSeasonStandings.find((s) => s.driver.driverId === driverId);
  return standing?.driver.code ?? driverId.toUpperCase();
}
