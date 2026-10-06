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

// Playoff round configuration
export const PLAYOFF_ROUNDS = [
  { round: 1, startDrivers: 10, endDrivers: 8, races: 2 },
  { round: 2, startDrivers: 8, endDrivers: 6, races: 2 },
  { round: 3, startDrivers: 6, endDrivers: 4, races: 2 },
  { round: FINAL_ROUND_NUMBER, startDrivers: 4, endDrivers: 1, races: 1 }, // Championship final
] as const;
