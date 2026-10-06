// API and App Configuration

// API Base URLs
// In development, use proxy to avoid CORS issues
const isDev = import.meta.env.DEV;

export const JOLPICA_API_BASE_URL = isDev
  ? '/api/f1'
  : import.meta.env.VITE_JOLPICA_API_URL || 'https://api.jolpi.ca/ergast/f1';

// Cache durations (in milliseconds)
export const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const CACHE_GC_TIME = 30 * 60 * 1000; // 30 minutes

// Supported seasons
export const SUPPORTED_SEASONS = [2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;
export const HISTORICAL_SEASONS = [2020, 2021, 2022, 2023, 2024, 2025] as const;
export const CURRENT_SEASON = 2026;

// App metadata
export const APP_NAME = 'Grand Prix Playoffs';
export const APP_DESCRIPTION =
  'Reimagining the Formula 1 Drivers Championship as a true elimination battle.';
