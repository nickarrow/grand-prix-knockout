// Jolpica F1 API Client
// Docs: https://api.jolpi.ca/ergast/f1/

import { JOLPICA_API_BASE_URL, FASTEST_LAP_ELIGIBILITY_POSITION } from 'src/constants';
import type {
  Driver,
  Race,
  RaceResult,
  QualifyingResult,
  SprintResult,
  RaceCalendar,
} from 'src/types';

// Jolpica API response types (nested structure)
interface JolpicaResponse<T> {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
  } & T;
}

interface JolpicaDriver {
  driverId: string;
  code?: string;
  givenName: string;
  familyName: string;
  nationality: string;
}

interface JolpicaConstructor {
  constructorId: string;
  name: string;
  nationality: string;
}

interface JolpicaRaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
  grid: string;
  status: string;
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
  };
}

interface JolpicaQualifyingResult {
  number: string;
  position: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
}

interface JolpicaRace {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      country: string;
    };
  };
  date: string;
  Results?: JolpicaRaceResult[];
  QualifyingResults?: JolpicaQualifyingResult[];
  SprintResults?: JolpicaRaceResult[];
}

// Helper to fetch from Jolpica API
async function fetchJolpica<T>(endpoint: string): Promise<T> {
  const url = `${JOLPICA_API_BASE_URL}${endpoint}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Jolpica API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// A numeric positionText means the car is classified at that finishing position;
// a letter (R, W, D, E, F, N) means it is not classified. This matches the fetch
// script so the live fallback produces the same shape as the bundled files
// (decision 0004).
function isClassified(positionText: string): boolean {
  return /^\d+$/.test(positionText);
}

// Normalize race result
function normalizeRaceResult(result: JolpicaRaceResult): RaceResult {
  const position = isClassified(result.positionText) ? parseInt(result.position, 10) : null;

  // Check if this driver had the fastest lap AND finished in eligible position
  const hasFastestLap = result.FastestLap?.rank === '1';
  const finishedEligible = position !== null && position <= FASTEST_LAP_ELIGIBILITY_POSITION;

  return {
    driverId: result.Driver.driverId,
    position,
    positionText: result.positionText,
    points: parseFloat(result.points),
    grid: parseInt(result.grid, 10),
    status: result.status,
    fastestLap: hasFastestLap && finishedEligible,
    fastestLapRank: result.FastestLap ? parseInt(result.FastestLap.rank, 10) : null,
  };
}

// Normalize qualifying result
function normalizeQualifyingResult(result: JolpicaQualifyingResult): QualifyingResult {
  return {
    driverId: result.Driver.driverId,
    position: parseInt(result.position, 10),
  };
}

// Normalize sprint result
function normalizeSprintResult(result: JolpicaRaceResult): SprintResult {
  const position = isClassified(result.positionText) ? parseInt(result.position, 10) : null;

  return {
    driverId: result.Driver.driverId,
    position,
    points: parseFloat(result.points),
  };
}

// Rate limiting delay (ms) - Jolpica allows 4 req/sec
const RATE_LIMIT_DELAY_MS = 300;

// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch season calendar
export async function fetchSeasonCalendar(year: number): Promise<RaceCalendar[]> {
  type CalendarResponse = JolpicaResponse<{ RaceTable: { Races: JolpicaRace[] } }>;
  const data = await fetchJolpica<CalendarResponse>(`/${year}`);

  return data.MRData.RaceTable.Races.map((race) => ({
    season: parseInt(race.season, 10),
    round: parseInt(race.round, 10),
    raceName: race.raceName,
    circuitId: race.Circuit.circuitId,
    circuitName: race.Circuit.circuitName,
    country: race.Circuit.Location.country,
    date: race.date,
    hasSprintRace: false, // Will be updated when we fetch sprint data
  }));
}

// Fetch race results for a specific round
export async function fetchRaceResults(year: number, round: number): Promise<Race | null> {
  type ResultsResponse = JolpicaResponse<{ RaceTable: { Races: JolpicaRace[] } }>;

  // Fetch race results first
  const raceData = await fetchJolpica<ResultsResponse>(`/${year}/${round}/results`);

  const raceInfo = raceData.MRData.RaceTable.Races[0];
  if (!raceInfo?.Results) {
    return null; // Race hasn't happened yet
  }

  // Fetch qualifying and sprint with delays to respect rate limits
  await delay(RATE_LIMIT_DELAY_MS);
  const qualifyingData = await fetchJolpica<ResultsResponse>(`/${year}/${round}/qualifying`).catch(
    () => null
  );

  await delay(RATE_LIMIT_DELAY_MS);
  const sprintData = await fetchJolpica<ResultsResponse>(`/${year}/${round}/sprint`).catch(
    () => null
  );

  const qualifyingInfo = qualifyingData?.MRData.RaceTable.Races[0];
  const sprintInfo = sprintData?.MRData.RaceTable.Races[0];

  return {
    season: parseInt(raceInfo.season, 10),
    round: parseInt(raceInfo.round, 10),
    raceName: raceInfo.raceName,
    circuitId: raceInfo.Circuit.circuitId,
    circuitName: raceInfo.Circuit.circuitName,
    country: raceInfo.Circuit.Location.country,
    date: raceInfo.date,
    results: raceInfo.Results.map((r) => normalizeRaceResult(r)),
    qualifying: qualifyingInfo?.QualifyingResults?.map(normalizeQualifyingResult) ?? [],
    sprint: sprintInfo?.SprintResults?.map(normalizeSprintResult) ?? null,
  };
}

// Fetch all completed races for a season
export async function fetchSeasonResults(year: number): Promise<Race[]> {
  const calendar = await fetchSeasonCalendar(year);
  const races: Race[] = [];

  // Fetch results for each race with rate limiting
  for (const entry of calendar) {
    await delay(RATE_LIMIT_DELAY_MS);
    const race = await fetchRaceResults(year, entry.round);
    if (race) {
      races.push(race);
    } else {
      // No more completed races
      break;
    }
  }

  return races;
}

// Extract unique drivers from race results
export function extractDriversFromRaces(races: Race[]): Driver[] {
  const driverMap = new Map<string, Driver>();

  for (const race of races) {
    for (const result of race.results) {
      if (!driverMap.has(result.driverId)) {
        // Find the driver info from the raw result data
        // For now, create a basic driver entry - will be enhanced with full API data
        driverMap.set(result.driverId, {
          driverId: result.driverId,
          code: result.driverId.substring(0, 3).toUpperCase(),
          firstName: '',
          lastName: result.driverId,
          nationality: '',
          constructorId: '',
          constructorName: '',
        });
      }
    }
  }

  return Array.from(driverMap.values());
}
