// F1 Points System Constants

// Race points for positions 1-10 (used for display/reference)
export const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;

// Sprint race points for positions 1-8 (used for display/reference)
export const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

// Number of positions that score points
export const RACE_POINTS_POSITIONS = 10;
export const SPRINT_POINTS_POSITIONS = 8;

// Fastest lap eligibility (must finish in top N) — used for UI display in historical seasons
export const FASTEST_LAP_ELIGIBILITY_POSITION = 10;

// Last season where fastest lap bonus point was awarded (scrapped from 2025 onwards)
export const LAST_FASTEST_LAP_BONUS_SEASON = 2024;

// Whether a season awarded a fastest lap bonus point
export function seasonHasFastestLapBonus(season: number): boolean {
  return season <= LAST_FASTEST_LAP_BONUS_SEASON;
}

// Podium positions (top 3)
export const PODIUM_POSITIONS = 3;

// Pole position
export const POLE_POSITION = 1;

// Winning (first) finishing position
export const WINNING_POSITION = 1;

// UI Constants
export const TROPHY_ICON_SIZE = 17;
export const TROPHY_ICON_SIZE_LARGE = 18;
export const DROP_ZONE_ICON_SIZE = 16;
