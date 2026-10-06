// Hook to fetch and calculate knockout data for a season

import { useMemo } from 'react';

import { useSeasonData } from 'src/services';
import { calculateKnockoutState } from 'src/engine';
import type { KnockoutState, Race, RaceCalendar } from 'src/types';

interface UseKnockoutDataResult {
  knockoutState: KnockoutState | null;
  races: Race[];
  calendar: RaceCalendar[];
  isLoading: boolean;
  error: Error | null;
}

export function useKnockoutData(year: number): UseKnockoutDataResult {
  const { calendar, races, regularSeasonStandingOrder, isLoading, error } = useSeasonData(year);

  const knockoutState = useMemo(() => {
    if (!calendar || !races) {
      return null;
    }
    return calculateKnockoutState(races, calendar, regularSeasonStandingOrder ?? []);
  }, [calendar, races, regularSeasonStandingOrder]);

  return {
    knockoutState,
    races: races ?? [],
    calendar: calendar ?? [],
    isLoading,
    error,
  };
}
