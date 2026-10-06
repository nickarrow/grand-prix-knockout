// Main standings table component

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { KnockoutState, Race, DriverStanding } from 'src/types';
import { F1_COLUMN_WIDTH } from 'src/constants';
import { getEliminationRound, getBracketPoints, isRegularSeasonComplete } from 'src/utils';

import { DriverRow } from './DriverRow';
import { DropZoneNotice } from './DropZoneNotice';

interface StandingsTableProps {
  knockoutState: KnockoutState;
  allRaces: Race[];
}

// Sort qualified drivers by knockout progression and bracket points
function sortByKnockoutProgression(
  standings: DriverStanding[],
  knockoutState: KnockoutState
): DriverStanding[] {
  return [...standings].sort((a, b) => {
    const aElimRound = getEliminationRound(a.driver.driverId, knockoutState);
    const bElimRound = getEliminationRound(b.driver.driverId, knockoutState);

    // Champion first
    if (knockoutState.champion === a.driver.driverId) return -1;
    if (knockoutState.champion === b.driver.driverId) return 1;

    // Sort by elimination round (0 = finalists first, then 3, 2, 1)
    if (aElimRound !== bElimRound) {
      if (aElimRound === 0) return -1;
      if (bElimRound === 0) return 1;
      return bElimRound - aElimRound;
    }

    // Same elimination round - sort by cumulative bracket points
    // Finalists (elimRound 0): sort by final round points only (winner-take-all handled above)
    // Eliminated drivers: sort by cumulative points from elimination round onward
    if (aElimRound === 0) {
      // Finalists: sort by final round (round 4) points
      const aFinalPoints = getBracketPoints(a.driver.driverId, 4, knockoutState);
      const bFinalPoints = getBracketPoints(b.driver.driverId, 4, knockoutState);
      return bFinalPoints - aFinalPoints;
    }

    // Eliminated drivers: sort by cumulative points from their elimination round onward
    // e.g., R1 eliminated: R1 + R2 + R3 + Final points
    const aBracketPoints = getBracketPoints(a.driver.driverId, aElimRound, knockoutState);
    const bBracketPoints = getBracketPoints(b.driver.driverId, bElimRound, knockoutState);
    return bBracketPoints - aBracketPoints;
  });
}

// Group drivers by elimination round
type GroupType = 'finalists' | 'eliminated' | 'non-qualifiers';

interface DriverGroup {
  label: string;
  drivers: DriverStanding[];
  type: GroupType;
}

// Check if a knockout round is complete (every race the round covers has run).
// Reads the engine's signal rather than inferring from the eliminated list, so a
// round that is in progress (eliminated empty, drop zone reported separately) is
// correctly treated as incomplete.
function isRoundComplete(knockoutState: KnockoutState, roundNum: number): boolean {
  const round = knockoutState.rounds.find((r) => r.round === roundNum);
  return round?.isComplete ?? false;
}

function groupDriversByElimination(
  sortedQualifiers: DriverStanding[],
  nonQualifiers: DriverStanding[],
  knockoutState: KnockoutState
): DriverGroup[] {
  const groups: DriverGroup[] = [];
  const finalists: DriverStanding[] = [];
  const eliminatedR3: DriverStanding[] = [];
  const eliminatedR2: DriverStanding[] = [];
  const eliminatedR1: DriverStanding[] = [];

  // Check which rounds are complete
  const r1Complete = isRoundComplete(knockoutState, 1);
  const r2Complete = isRoundComplete(knockoutState, 2);
  const r3Complete = isRoundComplete(knockoutState, 3);
  const regularSeasonComplete = isRegularSeasonComplete(knockoutState);

  for (const standing of sortedQualifiers) {
    const elimRound = getEliminationRound(standing.driver.driverId, knockoutState);
    // Round 4 (final) eliminations and non-eliminated (0) are all finalists
    if (elimRound === 0 || elimRound === 4) finalists.push(standing);
    else if (elimRound === 3) eliminatedR3.push(standing);
    else if (elimRound === 2) eliminatedR2.push(standing);
    else if (elimRound === 1) eliminatedR1.push(standing);
  }

  // Finalists first, no banner
  if (finalists.length > 0) {
    groups.push({ label: '', drivers: finalists, type: 'finalists' });
  }

  // Only show elimination banners if that round is complete
  if (eliminatedR3.length > 0 && r3Complete) {
    groups.push({ label: 'Eliminated Round 3', drivers: eliminatedR3, type: 'eliminated' });
  } else if (eliminatedR3.length > 0) {
    // Round not complete, add to finalists group (still competing)
    groups[0]?.drivers.push(...eliminatedR3);
  }

  if (eliminatedR2.length > 0 && r2Complete) {
    groups.push({ label: 'Eliminated Round 2', drivers: eliminatedR2, type: 'eliminated' });
  } else if (eliminatedR2.length > 0) {
    groups[0]?.drivers.push(...eliminatedR2);
  }

  if (eliminatedR1.length > 0 && r1Complete) {
    groups.push({ label: 'Eliminated Round 1', drivers: eliminatedR1, type: 'eliminated' });
  } else if (eliminatedR1.length > 0) {
    groups[0]?.drivers.push(...eliminatedR1);
  }

  // Only show non-qualifiers banner after regular season is complete
  if (nonQualifiers.length > 0 && regularSeasonComplete) {
    groups.push({
      label: 'Did Not Advance to Playoffs',
      drivers: nonQualifiers,
      type: 'non-qualifiers',
    });
  } else if (nonQualifiers.length > 0) {
    // During regular season, just show all drivers without separation
    groups.push({ label: '', drivers: nonQualifiers, type: 'non-qualifiers' });
  }

  return groups;
}

interface SectionBannerProps {
  label: string;
  type: GroupType;
}

function SectionBanner({ label, type }: SectionBannerProps): React.ReactElement {
  const getBannerStyles = (): { bgcolor: string; color: string } => {
    switch (type) {
      case 'finalists':
        return { bgcolor: 'primary.main', color: 'primary.contrastText' };
      case 'eliminated':
        return { bgcolor: 'action.selected', color: 'text.secondary' };
      case 'non-qualifiers':
        return { bgcolor: 'action.disabledBackground', color: 'text.disabled' };
    }
  };

  const styles = getBannerStyles();

  return (
    <TableRow>
      <TableCell
        colSpan={8}
        sx={{
          p: 0,
          bgcolor: styles.bgcolor,
          borderBottom: 'none',
        }}
      >
        <Typography
          sx={{
            color: styles.color,
            fontWeight: 600,
            letterSpacing: 0.5,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            py: 0.5,
            px: 1.5,
          }}
        >
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export function StandingsTable({
  knockoutState,
  allRaces,
}: StandingsTableProps): React.ReactElement {
  const { regularSeasonStandings, qualifiedDrivers } = knockoutState;

  const qualifiers = regularSeasonStandings.filter((s) =>
    qualifiedDrivers.includes(s.driver.driverId)
  );
  const nonQualifiers = regularSeasonStandings.filter(
    (s) => !qualifiedDrivers.includes(s.driver.driverId)
  );

  const sortedQualifiers = sortByKnockoutProgression(qualifiers, knockoutState);

  // Sort non-qualifiers by regular season + all knockout points
  const sortedNonQualifiers = [...nonQualifiers].sort((a, b) => {
    const aKnockoutPoints = getBracketPoints(a.driver.driverId, 1, knockoutState);
    const bKnockoutPoints = getBracketPoints(b.driver.driverId, 1, knockoutState);
    const aTotal = a.points + aKnockoutPoints;
    const bTotal = b.points + bKnockoutPoints;
    return bTotal - aTotal;
  });

  const groups = groupDriversByElimination(sortedQualifiers, sortedNonQualifiers, knockoutState);

  let runningPosition = 0;

  return (
    <Box sx={{ maxWidth: { md: 700, lg: 800 }, mx: 'auto' }}>
      <DropZoneNotice knockoutState={knockoutState} completedRaces={allRaces.length} />
      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
        }}
      >
        <Table size="small" aria-label="Playoff standings">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ width: 36, p: 1 }} align="right">
                <Typography variant="caption" fontWeight={600}>
                  Pos
                </Typography>
              </TableCell>
              <TableCell sx={{ p: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  Driver
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ p: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  Reg
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ p: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  R1
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ p: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  R2
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ p: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  R3
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ p: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  Final
                </Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  py: 1,
                  px: 0.25,
                  borderLeft: 3,
                  borderColor: 'divider',
                  width: F1_COLUMN_WIDTH,
                  minWidth: F1_COLUMN_WIDTH,
                  maxWidth: F1_COLUMN_WIDTH,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ lineHeight: 1.1, display: 'block' }}
                >
                  F1
                  <br />
                  Ofcl
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {groups.map((group) => {
              const rows = group.drivers.map((standing) => {
                runningPosition++;
                return (
                  <DriverRow
                    key={standing.driver.driverId}
                    driver={standing.driver}
                    position={runningPosition}
                    regularSeasonPoints={standing.points}
                    officialPoints={standing.officialPoints}
                    knockoutState={knockoutState}
                    allRaces={allRaces}
                  />
                );
              });

              // Skip banner for finalists (empty label)
              if (!group.label) {
                return rows;
              }

              return [
                <SectionBanner
                  key={`banner-${group.label}`}
                  label={group.label}
                  type={group.type}
                />,
                ...rows,
              ];
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
