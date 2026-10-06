// Hook to fetch and calculate playoff data for a season

import { useMemo } from 'react';

import { useSeasonData } from 'src/services';
import { calculatePlayoffState } from 'src/engine';
import type { PlayoffState, Race, RaceCalendar } from 'src/types';

interface UsePlayoffDataResult {
  playoffState: PlayoffState | null;
  races: Race[];
  calendar: RaceCalendar[];
  isLoading: boolean;
  error: Error | null;
}

export function usePlayoffData(year: number): UsePlayoffDataResult {
  const { calendar, races, isLoading, error } = useSeasonData(year);

  const playoffState = useMemo(() => {
    if (!calendar || !races) {
      return null;
    }
    return calculatePlayoffState(races, calendar);
  }, [calendar, races]);

  return {
    playoffState,
    races: races ?? [],
    calendar: calendar ?? [],
    isLoading,
    error,
  };
}
