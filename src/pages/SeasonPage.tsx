import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Trophy } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { useKnockoutData } from 'src/hooks';
import { StandingsTable } from 'src/components/standings';
import { KnockoutExplainer } from 'src/components/common';
import { hasStaticData } from 'src/services';
import { TROPHY_ICON_SIZE_LARGE, FINAL_ROUND_NUMBER, getTeamColor } from 'src/constants';
import { PODIUM_COLORS } from 'src/theme/palette';

import { NotFoundPage } from './NotFoundPage';

export function SeasonPage(): React.ReactElement {
  const { year } = useParams<{ year: string }>();
  const parsedYear = Number.parseInt(year ?? '', 10);

  // Guard the :year param before any data request. An unparseable year
  // (Number.isNaN) or a season the site does not cover renders the not-found /
  // no-data page and never reaches useKnockoutData, so Jolpica is never called
  // for an unsupported year.
  if (Number.isNaN(parsedYear) || !hasStaticData(parsedYear)) {
    return <NotFoundPage />;
  }

  return <SeasonStandings seasonYear={parsedYear} />;
}

function SeasonStandings({ seasonYear }: { seasonYear: number }): React.ReactElement {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { knockoutState, races, calendar, isLoading, error } = useKnockoutData(seasonYear);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            Failed to load {seasonYear} data: {error.message}
          </Alert>
        </Box>
      </Container>
    );
  }

  // No data yet (e.g., 2026 season hasn't started)
  if (!knockoutState || races.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 2, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {seasonYear} Grand Prix Knockout
          </Typography>
          <KnockoutExplainer compact />
          <Alert severity="info" sx={{ mt: 2 }}>
            The {seasonYear} season hasn't started yet. Check back once races begin!
          </Alert>
        </Box>
      </Container>
    );
  }

  // Name of the race that opens the knockout (first knockout round number).
  const knockoutOpenerName = (): string => {
    const opener = calendar.find((entry) => entry.round === knockoutState.knockoutStartRace);
    return opener?.raceName ?? `Race ${knockoutState.knockoutStartRace}`;
  };

  // Build status text based on season state. Mirrors the status-line target in
  // docs/design.md.
  const getStatusText = (): string => {
    const { status, totalRaces, regularSeasonRaces, rounds } = knockoutState;
    const completedRaces = races.length;

    if (status === 'completed') {
      return `✓ Season Complete • ${totalRaces} races`;
    }

    if (status === 'pre-season') {
      return 'Season not started';
    }

    if (status === 'regular-season') {
      const racesLeft = regularSeasonRaces - completedRaces;
      // The last regular-season race has run, but no knockout race yet: say the
      // regular season is complete and name the race that opens the knockout.
      if (racesLeft <= 0) {
        return `Regular season complete • Knockout opens at ${knockoutOpenerName()}`;
      }
      if (racesLeft === 1) {
        return `Race ${completedRaces} of ${totalRaces} • 1 regular-season race left`;
      }
      return `Race ${completedRaces} of ${totalRaces} • ${racesLeft} regular-season races left`;
    }

    // Find the round in progress (has a race still to come at or after the next race).
    const inProgressRound = rounds.find((r) => !r.isComplete);
    if (inProgressRound) {
      if (inProgressRound.round === FINAL_ROUND_NUMBER) {
        return `Championship Final • Race ${completedRaces} of ${totalRaces}`;
      }
      return `Knockout Round ${inProgressRound.round} • Race ${completedRaces} of ${totalRaces}`;
    }

    // No round in progress but in the knockout: we are between completed rounds.
    const lastComplete = [...rounds].reverse().find((r) => r.isComplete);
    if (lastComplete && lastComplete.round < FINAL_ROUND_NUMBER) {
      const nextRound = lastComplete.round + 1;
      const nextLabel = nextRound === FINAL_ROUND_NUMBER ? 'the Final' : `Round ${nextRound}`;
      return `Round ${lastComplete.round} complete • ${nextLabel} next • Race ${completedRaces} of ${totalRaces}`;
    }

    return `Knockout • Race ${completedRaces} of ${totalRaces}`;
  };

  // Get champion info for completed seasons
  const getChampionInfo = (): { code: string; constructorId: string } | null => {
    if (knockoutState.status !== 'completed' || !knockoutState.champion) {
      return null;
    }
    const finalRound = knockoutState.rounds[knockoutState.rounds.length - 1];
    const championStanding = finalRound?.standings.find(
      (s) => s.driver.driverId === knockoutState.champion
    );
    return championStanding
      ? { code: championStanding.driver.code, constructorId: championStanding.driver.constructorId }
      : null;
  };

  const championInfo = getChampionInfo();
  const teamColor = championInfo ? getTeamColor(championInfo.constructorId).primary : null;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {knockoutState.season} Grand Prix Knockout
        </Typography>

        <KnockoutExplainer compact />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {getStatusText()}
          </Typography>
          {championInfo && (
            <>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  py: 0.25,
                  px: 1,
                  borderLeft: 3,
                  borderColor: teamColor,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {championInfo.code}
                </Typography>
              </Box>
              <Trophy
                size={TROPHY_ICON_SIZE_LARGE}
                color={mode === 'dark' ? PODIUM_COLORS.gold.dark : PODIUM_COLORS.gold.light}
              />
            </>
          )}
        </Box>

        <StandingsTable knockoutState={knockoutState} allRaces={races} />
      </Box>
    </Container>
  );
}
