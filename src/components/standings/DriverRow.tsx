// Single driver row in the standings table

import { useState } from 'react';

import { Box, Chip, Collapse, TableCell, TableRow, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';

import { useTheme } from '@mui/material/styles';

import type { Driver, PlayoffState, Race } from 'src/types';
import { getTeamColor } from 'src/constants';
import { ELIMINATION_COLOR } from 'src/theme/palette';
import {
  getPlayoffRoundPoints,
  getEliminationRound,
  advancedViaTiebreaker,
  isDriverAtRisk,
} from 'src/utils';

import { DriverDetail } from './DriverDetail';

const CHEVRON_ICON_SIZE = 14;
const DRIVER_CODE_WIDTH = 28;
const DRIVER_NAME_WIDTH = 120;
const F1_COLUMN_WIDTH = 40;

interface DriverRowProps {
  driver: Driver;
  position: number;
  regularSeasonPoints: number;
  officialPoints: number;
  playoffState: PlayoffState;
  allRaces: Race[];
}

export function DriverRow({
  driver,
  position,
  regularSeasonPoints,
  officialPoints,
  playoffState,
  allRaces,
}: DriverRowProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { rounds, qualifiedDrivers, champion } = playoffState;
  const didQualify = qualifiedDrivers.includes(driver.driverId);
  const isChampion = champion === driver.driverId;
  const teamColors = getTeamColor(driver.constructorId);

  // Get elimination round for this driver (-1 = didn't qualify, 0 = finalist, 1-3 = eliminated in that round)
  const elimRound = getEliminationRound(driver.driverId, playoffState);

  // Whether this driver is in the drop zone of the round in progress. Shown as a
  // text chip so the state is readable without colour and without expanding the row.
  const atRisk = isDriverAtRisk(driver.driverId, playoffState);

  const round1 = rounds.find((r) => r.round === 1);
  const round2 = rounds.find((r) => r.round === 2);
  const round3 = rounds.find((r) => r.round === 3);
  const finalRound = rounds.find((r) => r.round === 4);

  // Get points for each round (includes all drivers for bracket tracking)
  const r1Points = getPlayoffRoundPoints(round1, driver.driverId);
  const r2Points = getPlayoffRoundPoints(round2, driver.driverId);
  const r3Points = getPlayoffRoundPoints(round3, driver.driverId);
  const finalPoints = getPlayoffRoundPoints(finalRound, driver.driverId);

  // Check if driver advanced via tiebreaker in each round
  const r1Tiebreaker = advancedViaTiebreaker(round1, driver.driverId);
  const r2Tiebreaker = advancedViaTiebreaker(round2, driver.driverId);
  const r3Tiebreaker = advancedViaTiebreaker(round3, driver.driverId);

  // Determine which round the driver was eliminated in (for styling)
  const eliminatedR1 = elimRound === 1;
  const eliminatedR2 = elimRound === 2;
  const eliminatedR3 = elimRound === 3;

  // Non-qualifiers show all playoff points as muted
  const isNonQualifier = !didQualify;

  // Check if driver was already eliminated before a given round (for muted styling)
  const wasEliminatedBeforeR1 = isNonQualifier; // Non-qualifiers are "eliminated" before R1
  const wasEliminatedBeforeR2 = isNonQualifier || elimRound === 1;
  const wasEliminatedBeforeR3 = isNonQualifier || elimRound === 1 || elimRound === 2;
  const wasEliminatedBeforeFinal =
    isNonQualifier || elimRound === 1 || elimRound === 2 || elimRound === 3;

  const renderPointsCell = (
    points: number | null,
    eliminated: boolean,
    isMuted: boolean,
    isFinal: boolean = false,
    showTiebreaker: boolean = false
  ): React.ReactNode => {
    const textAlign = isFinal ? 'center' : 'right';
    if (points === null) {
      return (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign }}>
          -
        </Typography>
      );
    }

    const tiebreakerBadge = showTiebreaker ? (
      <Box
        component="sup"
        sx={{
          position: 'absolute',
          top: -2,
          right: -14,
          fontSize: '0.6rem',
          fontWeight: 600,
          color: 'text.secondary',
          opacity: 0.7,
        }}
      >
        Tie
      </Box>
    ) : null;

    // Show muted points for rounds after elimination
    if (isMuted) {
      return (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign }}>
          {points}
        </Typography>
      );
    }
    // Show elimination color for the round they were eliminated
    if (eliminated) {
      const eliminationColor = mode === 'dark' ? ELIMINATION_COLOR.dark : ELIMINATION_COLOR.light;
      return (
        <Typography
          variant="body2"
          sx={{
            textAlign,
            color: eliminationColor,
            fontWeight: 700,
          }}
        >
          {points}
        </Typography>
      );
    }
    return (
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Typography
          variant="body2"
          fontWeight={isFinal && isChampion ? 700 : 400}
          sx={{ textAlign }}
        >
          {points}
        </Typography>
        {tiebreakerBadge}
      </Box>
    );
  };

  return (
    <>
      <TableRow
        onClick={() => setExpanded(!expanded)}
        sx={{
          cursor: 'pointer',
          // Only apply hover on devices that support it (not touch)
          '@media (hover: hover)': {
            '&:hover': { bgcolor: 'action.hover' },
          },
        }}
      >
        {/* Position */}
        <TableCell sx={{ width: 36, p: 1 }} align="right">
          <Typography variant="body2" fontWeight={600}>
            {position}
          </Typography>
        </TableCell>

        {/* Driver with team color */}
        <TableCell sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 3,
                height: 20,
                bgcolor: teamColors.primary,
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
            {/* 3-letter code on mobile, full name on desktop */}
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ display: { xs: 'block', md: 'none' }, width: DRIVER_CODE_WIDTH }}
            >
              {driver.code}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ display: { xs: 'none', md: 'block' }, width: DRIVER_NAME_WIDTH }}
            >
              {driver.firstName} {driver.lastName}
            </Typography>
            {atRisk && (
              <Chip
                label="Drop zone"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  bgcolor: 'warning.main',
                  color: 'secondary.contrastText',
                  flexShrink: 0,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
            <ChevronRight
              size={CHEVRON_ICON_SIZE}
              style={{
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                opacity: 0.5,
                flexShrink: 0,
              }}
            />
          </Box>
        </TableCell>

        {/* Regular season points */}
        <TableCell align="right" sx={{ p: 1 }}>
          <Typography variant="body2">{regularSeasonPoints}</Typography>
        </TableCell>

        {/* Round 1 */}
        <TableCell align="right" sx={{ p: 1 }}>
          {renderPointsCell(r1Points, eliminatedR1, wasEliminatedBeforeR1, false, r1Tiebreaker)}
        </TableCell>

        {/* Round 2 */}
        <TableCell align="right" sx={{ p: 1 }}>
          {renderPointsCell(r2Points, eliminatedR2, wasEliminatedBeforeR2, false, r2Tiebreaker)}
        </TableCell>

        {/* Round 3 */}
        <TableCell align="right" sx={{ p: 1 }}>
          {renderPointsCell(r3Points, eliminatedR3, wasEliminatedBeforeR3, false, r3Tiebreaker)}
        </TableCell>

        {/* Final */}
        <TableCell align="center" sx={{ p: 1 }}>
          {renderPointsCell(finalPoints, false, wasEliminatedBeforeFinal, true)}
        </TableCell>

        {/* Official F1 Points (reference column) */}
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
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}
          >
            {officialPoints}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Expanded detail */}
      <TableRow>
        <TableCell
          colSpan={8}
          sx={{ p: 0, borderBottom: expanded ? 1 : 0, borderColor: 'divider' }}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <DriverDetail
              driverId={driver.driverId}
              constructorId={driver.constructorId}
              playoffState={playoffState}
              allRaces={allRaces}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
