// Unified API Service with TanStack Query integration
// Uses static data for completed seasons, live API for current season

import { useQuery } from '@tanstack/react-query';

import type { Race, RaceCalendar } from 'src/types';

import { fetchSeasonCalendar, fetchSeasonResults } from './jolpica';
import { loadStaticSeasonData } from './static-data';

// Query key factories for consistent cache keys
export const queryKeys = {
  // Season-related keys
  seasons: {
    all: ['seasons'] as const,
    calendar: (year: number) => [...queryKeys.seasons.all, 'calendar', year] as const,
    results: (year: number) => [...queryKeys.seasons.all, 'results', year] as const,
    standingOrder: (year: number) => [...queryKeys.seasons.all, 'standingOrder', year] as const,
    full: (year: number) => [...queryKeys.seasons.all, 'full', year] as const,
  },
} as const;

// Fetch season calendar - prefer static data
async function getSeasonCalendar(year: number): Promise<RaceCalendar[]> {
  // Try static data first
  const staticData = await loadStaticSeasonData(year);
  if (staticData) {
    return staticData.calendar;
  }

  // Fall back to live API
  try {
    return await fetchSeasonCalendar(year);
  } catch (error) {
    console.error(`Failed to fetch ${year} calendar:`, error);
    throw error;
  }
}

// Fetch all season results - prefer static data
async function getSeasonResults(year: number): Promise<Race[]> {
  // Try static data first
  const staticData = await loadStaticSeasonData(year);
  if (staticData) {
    return staticData.races;
  }

  // Fall back to live API
  try {
    return await fetchSeasonResults(year);
  } catch (error) {
    console.error(`Failed to fetch ${year} results:`, error);
    throw error;
  }
}

// Fetch the stored official regular-season standings order (decision 0004 Option A
// terminal tiebreak key). Only bundled seasons carry it; the live API has no such
// order, so a season served from the API yields an empty order and the engine
// falls back to the countback alone.
async function getSeasonStandingOrder(year: number): Promise<string[]> {
  const staticData = await loadStaticSeasonData(year);
  return staticData?.regularSeasonStandingOrder ?? [];
}

// TanStack Query hooks

export function useSeasonCalendar(
  year: number
): ReturnType<typeof useQuery<RaceCalendar[], Error>> {
  return useQuery({
    queryKey: queryKeys.seasons.calendar(year),
    queryFn: () => getSeasonCalendar(year),
  });
}

export function useSeasonResults(year: number): ReturnType<typeof useQuery<Race[], Error>> {
  return useQuery({
    queryKey: queryKeys.seasons.results(year),
    queryFn: () => getSeasonResults(year),
  });
}

export function useSeasonStandingOrder(year: number): ReturnType<typeof useQuery<string[], Error>> {
  return useQuery({
    queryKey: queryKeys.seasons.standingOrder(year),
    queryFn: () => getSeasonStandingOrder(year),
  });
}

// Combined hook to fetch full season data (calendar + results + standing order)
export function useSeasonData(year: number): {
  calendar: RaceCalendar[] | undefined;
  races: Race[] | undefined;
  regularSeasonStandingOrder: string[] | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const calendarQuery = useSeasonCalendar(year);
  const resultsQuery = useSeasonResults(year);
  const standingOrderQuery = useSeasonStandingOrder(year);

  return {
    calendar: calendarQuery.data,
    races: resultsQuery.data,
    regularSeasonStandingOrder: standingOrderQuery.data,
    isLoading: calendarQuery.isLoading || resultsQuery.isLoading || standingOrderQuery.isLoading,
    error: calendarQuery.error ?? resultsQuery.error ?? standingOrderQuery.error,
  };
}
