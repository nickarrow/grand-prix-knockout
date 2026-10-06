// Individual race result card component
// Shows race name, position, and full points breakdown

import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import type { Race } from 'src/types';
import { PODIUM_POSITIONS, WINNING_POSITION } from 'src/constants';
import { seasonHasFastestLapBonus } from 'src/constants/points';
import { POINTS_COLORS } from 'src/theme/palette';

interface RaceCardProps {
  race: Race;
  driverId: string;
  isGhost?: boolean;
}

// Get short race name
function getShortRaceName(raceName: string): string {
  return raceName
    .replace(' Grand Prix', ' GP')
    .replace('Emilia Romagna', 'Imola')
    .replace('Saudi Arabian', 'Saudi')
    .replace('United States', 'USA')
    .replace('Mexico City', 'Mexico')
    .replace('São Paulo', 'Brazil')
    .replace('Las Vegas', 'Vegas');
}

// Format position display
function formatPosition(position: number | null, status: string): string {
  if (position === null) {
    if (status === 'Retired') return 'DNF';
    if (status === 'Disqualified') return 'DSQ';
    if (status === 'Did not start') return 'DNS';
    return 'DNF';
  }
  return `P${position}`;
}

export function RaceCard({ race, driverId, isGhost = false }: RaceCardProps): React.ReactElement {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const raceResult = race.results.find((r) => r.driverId === driverId);
  const sprintResult = race.sprint?.find((s) => s.driverId === driverId);

  // Points come directly from API data (official F1 points for that season)
  const racePoints = raceResult?.points ?? 0;
  const sprintPoints = sprintResult?.points ?? 0;

  // Fastest lap indicator — only relevant for seasons that awarded the bonus
  const hasFastestLapBonus =
    seasonHasFastestLapBonus(race.season) && raceResult?.fastestLap === true;

  const totalPoints = racePoints + sprintPoints;
  const hasBonus = sprintPoints > 0 || hasFastestLapBonus;

  const position = raceResult?.position ?? null;
  const status = raceResult?.status ?? 'Unknown';
  const isPodium = position !== null && position <= PODIUM_POSITIONS;
  const isWin = position === WINNING_POSITION;

  return (
    <Box
      sx={{
        p: 1,
        bgcolor: isGhost ? 'action.hover' : 'background.paper',
        borderRadius: 1,
        textAlign: 'center',
        border: 1,
        borderColor: isGhost ? 'divider' : isWin ? 'primary.main' : 'divider',
        borderStyle: isGhost ? 'dashed' : 'solid',
        minWidth: 75,
      }}
    >
      {/* Race name */}
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ fontSize: '0.7rem', lineHeight: 1.2, mb: 0.5 }}
      >
        {getShortRaceName(race.raceName)}
      </Typography>

      {/* Position */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: position === null ? 'text.disabled' : isPodium ? 'primary.main' : 'text.primary',
        }}
      >
        {formatPosition(position, status)}
      </Typography>

      {/* Total points */}
      <Typography variant="caption" color="text.secondary" display="block">
        {isGhost ? `(${totalPoints})` : totalPoints} pts
      </Typography>

      {/* Points breakdown - only show if there are bonus/extra point sources */}
      {hasBonus && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 0.5,
            mt: 0.5,
          }}
        >
          {sprintPoints > 0 && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: mode === 'dark' ? POINTS_COLORS.sprint.dark : POINTS_COLORS.sprint.light,
              }}
            >
              S:{sprintPoints}
            </Typography>
          )}
          {racePoints > 0 && sprintPoints > 0 && (
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              R:{racePoints}
            </Typography>
          )}
          {hasFastestLapBonus && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color:
                  mode === 'dark' ? POINTS_COLORS.fastestLap.dark : POINTS_COLORS.fastestLap.light,
              }}
            >
              FL:1
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
