// Phase section component - groups race cards under a phase header

import { useState } from 'react';

import { Box, Chip, Collapse, Paper, Typography } from '@mui/material';
import { ChevronRight, Trophy } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

import type { Race, KnockoutRound } from 'src/types';
import { TROPHY_ICON_SIZE, FINAL_ROUND_NUMBER } from 'src/constants';
import { calculateTotalPoints } from 'src/engine';
import { ELIMINATION_COLOR, PODIUM_COLORS } from 'src/theme/palette';

import { RaceCard } from './RaceCard';

type PhaseType = 'regular' | 'knockout';

interface PhaseSectionProps {
  type: PhaseType;
  races: Race[];
  driverId: string;
  points: number;
  accentColor?: string;
  // Knockout-specific props
  didAdvance?: boolean;
  eliminatedInRound?: number | null;
  eliminationRaceNumber?: number | null;
  finalistPosition?: number | null;
  knockoutRounds?: KnockoutRound[];
}

const CHEVRON_ICON_SIZE = 16;
const ACCENT_BORDER_WIDTH = 3;

// Finalist positions that get trophies (1st, 2nd, 3rd)
const GOLD_POSITION = 1;
const SILVER_POSITION = 2;
const BRONZE_POSITION = 3;

function getPhaseLabel(type: PhaseType, didAdvance?: boolean): string {
  if (type === 'regular') return 'Regular Season';
  if (type === 'knockout') {
    if (didAdvance === false) return 'Knockout (Did not advance)';
    return 'Knockout';
  }
  return '';
}

// Get trophy color for finalist position
function getTrophyColor(position: number, mode: 'light' | 'dark'): string | null {
  switch (position) {
    case GOLD_POSITION:
      return mode === 'dark' ? PODIUM_COLORS.gold.dark : PODIUM_COLORS.gold.light;
    case SILVER_POSITION:
      return mode === 'dark' ? PODIUM_COLORS.silver.dark : PODIUM_COLORS.silver.light;
    case BRONZE_POSITION:
      return mode === 'dark' ? PODIUM_COLORS.bronze.dark : PODIUM_COLORS.bronze.light;
    default:
      return null;
  }
}

// Get round label
function getRoundLabel(roundNum: number): string {
  if (roundNum === FINAL_ROUND_NUMBER) return 'Final';
  return `R${roundNum}`;
}

export function PhaseSection({
  type,
  races,
  driverId,
  points,
  accentColor,
  didAdvance = true,
  eliminatedInRound = null,
  eliminationRaceNumber = null,
  finalistPosition = null,
  knockoutRounds = [],
}: PhaseSectionProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const mode = theme.palette.mode;
  const eliminationColor = mode === 'dark' ? ELIMINATION_COLOR.dark : ELIMINATION_COLOR.light;

  // Toggle the section from the keyboard. Space is prevented so the page does
  // not scroll, matching native button behaviour.
  const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setExpanded((prev) => !prev);
    }
  };

  const phaseLabel = getPhaseLabel(type, didAdvance);
  const isNonAdvancer = type === 'knockout' && didAdvance === false;
  const wasEliminated = eliminatedInRound !== null;
  const isFinalist = finalistPosition !== null;
  const trophyColor = isFinalist ? getTrophyColor(finalistPosition, mode) : null;

  // Determine if a race should be shown as "ghost" (post-elimination or non-advancer)
  const isRaceGhost = (race: Race): boolean => {
    if (isNonAdvancer) return true;
    if (eliminationRaceNumber !== null && race.round > eliminationRaceNumber) return true;
    return false;
  };

  // Check if an entire round is ghost (all races in it are post-elimination)
  const isRoundGhost = (roundRaces: Race[]): boolean => {
    return roundRaces.length > 0 && roundRaces.every((r) => isRaceGhost(r));
  };

  // Group races by knockout round for knockout section
  const getRacesByRound = (): { roundNum: number; races: Race[]; points: number }[] => {
    if (type !== 'knockout' || knockoutRounds.length === 0) return [];

    return knockoutRounds
      .map((round) => {
        const roundRaces = races.filter((race) => round.raceNumbers.includes(race.round));
        const roundPoints = calculateTotalPoints(driverId, roundRaces);
        return { roundNum: round.round, races: roundRaces, points: roundPoints };
      })
      .filter((group) => group.races.length > 0);
  };

  const racesByRound = getRacesByRound();
  const showRoundByRound = type === 'knockout' && racesByRound.length > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 1,
        overflow: 'hidden',
        borderLeft: accentColor ? `${ACCENT_BORDER_WIDTH}px solid ${accentColor}` : undefined,
        opacity: isNonAdvancer ? 0.7 : 1,
        borderStyle: isNonAdvancer ? 'dashed' : 'solid',
      }}
    >
      {/* Phase header - clickable to expand/collapse */}
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${phaseLabel}, show races`}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={handleToggleKeyDown}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          p: 1.5,
          bgcolor: 'background.paper',
          '@media (hover: hover)': {
            '&:hover': { bgcolor: 'action.hover' },
          },
        }}
      >
        <ChevronRight
          size={CHEVRON_ICON_SIZE}
          style={{
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: isNonAdvancer ? 0.5 : 0.7,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontStyle: isNonAdvancer ? 'italic' : 'normal',
            color: isNonAdvancer ? 'text.secondary' : 'text.primary',
            flex: 1,
          }}
        >
          {phaseLabel}
        </Typography>

        {/* Elimination chip for knockout section */}
        {wasEliminated && (
          <Chip
            label={`Elim R${eliminatedInRound}`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: eliminationColor,
              color: 'white',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        )}

        {/* Trophy for finalists (1st-3rd only, 4th gets nothing) */}
        {trophyColor && <Trophy size={TROPHY_ICON_SIZE} color={trophyColor} />}

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: wasEliminated ? eliminationColor : 'text.secondary',
            opacity: isNonAdvancer ? 0.7 : 1,
            fontStyle: isNonAdvancer ? 'italic' : 'normal',
          }}
        >
          {points} pts
        </Typography>
      </Box>

      {/* Collapsible content */}
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ p: 1.5, bgcolor: 'background.paper' }}>
          {showRoundByRound ? (
            // Knockout: Show races grouped by round
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {racesByRound.map(({ roundNum, races: roundRaces, points: roundPoints }) => {
                const roundIsGhost = isRoundGhost(roundRaces);
                const wasEliminatedThisRound = eliminatedInRound === roundNum;
                const isFinalRound = roundNum === FINAL_ROUND_NUMBER;
                return (
                  <Box key={roundNum}>
                    {/* Round header row */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.75,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: roundIsGhost ? 'text.disabled' : 'text.secondary',
                          minWidth: 36,
                          fontStyle: roundIsGhost ? 'italic' : 'normal',
                        }}
                      >
                        {getRoundLabel(roundNum)}
                      </Typography>
                      <Box sx={{ flex: 1, borderBottom: 1, borderColor: 'divider' }} />
                      {/* Elimination chip on the round where it happened */}
                      {wasEliminatedThisRound && (
                        <Chip
                          label="Eliminated"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: eliminationColor,
                            color: 'white',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      )}
                      {/* Trophy for finalists on the Final round */}
                      {isFinalRound && trophyColor && (
                        <Trophy size={TROPHY_ICON_SIZE} color={trophyColor} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          color: wasEliminatedThisRound
                            ? eliminationColor
                            : roundIsGhost
                              ? 'text.disabled'
                              : 'text.secondary',
                          fontStyle: roundIsGhost ? 'italic' : 'normal',
                        }}
                      >
                        {roundIsGhost ? `(${roundPoints})` : roundPoints} pts
                      </Typography>
                    </Box>
                    {/* Race cards for this round */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      {roundRaces.map((race) => (
                        <RaceCard
                          key={race.round}
                          race={race}
                          driverId={driverId}
                          isGhost={isRaceGhost(race)}
                        />
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            // Regular season: Simple grid layout
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(3, 1fr)',
                  sm: 'repeat(4, 1fr)',
                  md: 'repeat(5, 1fr)',
                },
                gap: 1,
              }}
            >
              {races.map((race) => (
                <RaceCard
                  key={race.round}
                  race={race}
                  driverId={driverId}
                  isGhost={isRaceGhost(race)}
                />
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
