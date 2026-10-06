// Core F1 Data Types

// Driver information
export interface Driver {
  driverId: string;
  code: string; // 3-letter code (e.g., "VER", "HAM")
  firstName: string;
  lastName: string;
  nationality: string;
  constructorId: string;
  constructorName: string;
}

// Race result for a single driver
export interface RaceResult {
  driverId: string;
  position: number | null; // null if not classified (DNF/DNS/not classified)
  positionText: string; // Jolpica positionText: a number if classified, a letter (R/W/D/E/F/N) if not
  points: number;
  grid: number;
  status: string; // "Finished", "Retired", "+1 Lap", etc.
  fastestLap: boolean;
  fastestLapRank: number | null;
}

// Qualifying result for pole position
export interface QualifyingResult {
  driverId: string;
  position: number;
}

// Sprint race result
export interface SprintResult {
  driverId: string;
  position: number | null;
  points: number;
}

// Complete race weekend data
export interface Race {
  season: number;
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  date: string; // ISO date string
  results: RaceResult[];
  qualifying: QualifyingResult[];
  sprint: SprintResult[] | null; // null if no sprint that weekend
}

// Season calendar entry
export interface RaceCalendar {
  season: number;
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  date: string;
  hasSprintRace: boolean;
}

// Full season data
export interface Season {
  year: number;
  races: Race[];
  calendar: RaceCalendar[];
  drivers: Driver[];
  // driverIds in the official F1 standings order after the last regular-season
  // race, read from Jolpica's driver standings for that round. The terminal
  // tiebreak key of decision 0004. Empty until the regular season is complete.
  regularSeasonStandingOrder: string[];
}

// Playoff-specific types

export type PlayoffStatus = 'qualified' | 'advancing' | 'eliminated' | 'champion' | 'not-qualified';

// Driver standing at any point in the season
export interface DriverStanding {
  driver: Driver;
  points: number;
  wins: number;
  podiums: number;
  position: number;
  positionHistory: number[]; // For tiebreaker: count of 1sts, 2nds, 3rds, etc.
  officialPoints: number; // Official F1 season points for reference
}

// Playoff round result
export interface PlayoffRound {
  round: number; // 1, 2, 3, or 4 (final)
  raceNumbers: number[]; // Which race rounds are in this playoff round
  standings: DriverStanding[];
  isComplete: boolean; // true once every race the round covers has a result
  eliminated: string[]; // driverIds eliminated this round; empty until the round is complete
  advancing: string[]; // driverIds advancing to next round; empty until the round is complete
  atRisk: string[]; // active driverIds in the drop zone while the round is incomplete; empty once complete
}

// Complete playoff state for a season
export interface PlayoffState {
  season: number;
  totalRaces: number;
  regularSeasonRaces: number;
  playoffStartRace: number;
  regularSeasonComplete: boolean; // every regular-season race has run (qualifiers are then fixed)
  regularSeasonStandings: DriverStanding[];
  qualifiedDrivers: string[]; // Top 10 driverIds
  rounds: PlayoffRound[];
  champion: string | null; // driverId of champion
  status: SeasonStatus;
}

// Season phase detection
export type SeasonStatus = 'pre-season' | 'regular-season' | 'playoffs' | 'completed';

// API response types (for internal use)
export interface ApiError {
  message: string;
  status?: number;
  source: 'jolpica' | 'openf1' | 'local';
}
