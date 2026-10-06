// Playoff System Constants

// Number of races in the playoff portion of the season
export const PLAYOFF_RACES = 7;

// Number of drivers who qualify for playoffs
export const PLAYOFF_QUALIFIERS = 10;

// Number of drivers eliminated per round
export const ELIMINATIONS_PER_ROUND = 2;

// Number of drivers in the championship final
export const FINAL_DRIVERS = 4;

// Number of races per elimination round (rounds 1-3)
export const RACES_PER_ROUND = 2;

// Championship final round number
export const FINAL_ROUND_NUMBER = 4;

// Width (px) of the official-F1-points reference column, shared by the standings
// table header and each driver row so the two stay aligned.
export const F1_COLUMN_WIDTH = 40;

// The last elimination round before the final (Round 3). A cancelled final is
// ranked by this round's points (decision 0005).
export const LAST_ELIMINATION_ROUND_NUMBER = 3;

// Playoff round configuration
export const PLAYOFF_ROUNDS = [
  { round: 1, startDrivers: 10, endDrivers: 8, races: 2 },
  { round: 2, startDrivers: 8, endDrivers: 6, races: 2 },
  { round: 3, startDrivers: 6, endDrivers: 4, races: 2 },
  { round: FINAL_ROUND_NUMBER, startDrivers: 4, endDrivers: 1, races: 1 }, // Championship final
] as const;
