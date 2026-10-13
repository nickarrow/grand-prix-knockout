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
import {
  getEliminationRound,
  getBracketPoints,
  isRegularSeasonComplete,
  getActiveRankingRound,
  rankInRound,
  isDriverAtRisk,
} from 'src/utils';

import { DriverRow } from './DriverRow';
import { DropZoneNotice } from './DropZoneNotice';

// The qualifying-style cutoff line, drawn across the table between the drivers
// who would advance and those in the drop zone while a round is in progress. It
// mirrors the elimination line in F1 qualifying's timing tower. The label carries
// the meaning so the state does not depend on colour (AGENTS.md).
function DropZoneDivider(): React.ReactElement {
  return (
    <TableRow aria-hidden="true">
      <TableCell colSpan={8} sx={{ p: 0, border: 'none' }}>
        {/* The cutoff line lives on an inner Box, not the cell, so it spans the
            table content width without the cell's own border extending past the
            table edge. The top rule plus the tinted strip read as the elimination
            line in F1 qualifying's timing tower. */}
        <Box
          sx={{
            borderTop: 2,
            borderColor: 'error.main',
            bgcolor: 'rgba(198, 40, 40, 0.12)',
          }}
        >
          <Typography
            sx={{
              color: 'error.main',
              fontWeight: 700,
              letterSpacing: 0.5,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              py: 0.4,
              px: 1.5,
            }}
          >
            Drop zone — knocked out if the round ends now
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}

interface StandingsTableProps {
  knockoutState: KnockoutState;
  allRaces: Race[];
}

// Sort qualified drivers by knockout progression and bracket points
function sortByKnockoutProgression(
  standings: DriverStanding[],
  knockoutState: KnockoutState
): DriverStanding[] {
  // The round that ranks the still-competing drivers: the one in progress, or the
  // most recent completed round between rounds. Its standings are already ordered
  // by the engine's full rule, so the drop zone sits at the bottom of the group
  // and ties resolve deterministically.
  const activeRound = getActiveRankingRound(knockoutState);

  return [...standings].sort((a, b) => {
    const aElimRound = getEliminationRound(a.driver.driverId, knockoutState);
    const bElimRound = getEliminationRound(b.driver.driverId, knockoutState);

    // Champion first
    if (knockoutState.champion === a.driver.driverId) return -1;
    if (knockoutState.champion === b.driver.driverId) return 1;

    // Sort by elimination round (0 = still competing first, then 3, 2, 1)
    if (aElimRound !== bElimRound) {
      if (aElimRound === 0) return -1;
      if (bElimRound === 0) return 1;
      return bElimRound - aElimRound;
    }

    // Still-competing drivers (elimRound 0): rank by the active round's order, so
    // the leaders are on top and the drop zone falls to the bottom. Before any
    // knockout race (no active round) this leaves them in regular-season order.
    if (aElimRound === 0) {
      if (activeRound) {
        return (
          rankInRound(activeRound, a.driver.driverId) - rankInRound(activeRound, b.driver.driverId)
        );
      }
      return 0; // No round run yet: keep the regular-season order passed in.
    }

    // Eliminated drivers: sort by cumulative points from their elimination round
    // onward, e.g. R1 eliminated by R1 + R2 + R3 + Final points.
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
      label: 'Did Not Advance to the Knockout',
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
        <Table size="small" aria-label="Knockout standings">
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
              const rows: React.ReactNode[] = [];
              let dividerShown = false;
              for (const standing of group.drivers) {
                // Draw the drop-zone cutoff line immediately before the first
                // at-risk driver. Because the active group is sorted with at-risk
                // drivers at the bottom, this falls between the safe drivers and
                // the drop zone, like the elimination line in qualifying.
                if (!dividerShown && isDriverAtRisk(standing.driver.driverId, knockoutState)) {
                  rows.push(<DropZoneDivider key="drop-zone-divider" />);
                  dividerShown = true;
                }
                runningPosition++;
                rows.push(
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
              }

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
