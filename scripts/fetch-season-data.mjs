#!/usr/bin/env node
/**
 * Fetches F1 season data from the Jolpica API and saves it as static JSON.
 * Usage: node scripts/fetch-season-data.mjs [year]
 * Example: node scripts/fetch-season-data.mjs 2026
 *
 * It uses Jolpica's season-level paged endpoints (results, sprint, qualifying)
 * at limit=100 and pages through MRData.total, merging each endpoint's rows by
 * round because a single race can straddle a page boundary. That takes a full
 * season from roughly 70 requests (three per race) to about 15.
 *
 * Every request carries a descriptive User-Agent and retries with exponential
 * backoff on 429 and 5xx, honouring Retry-After when the server sends it. A
 * failed sprint or qualifying fetch is a real failure, not a silent null.
 *
 * Nothing is written until the fetched data passes validation (see
 * validate-season-data.mjs). On any validation failure the script writes nothing
 * and exits non-zero.
 */

import { validateSeasonData, isSprintWeekend } from './validate-season-data.mjs';

const JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';
const USER_AGENT = 'grand-prix-playoffs-data/1.0 (+https://github.com/nickarrow/grand-prix-playoffs)';

// Paging: Jolpica caps limit at 100 and pages with offset.
const PAGE_LIMIT = 100;

// Politeness delay between requests, well inside Jolpica's unauthenticated burst.
const RATE_LIMIT_DELAY_MS = 300;

// Retry policy for 429 and 5xx responses.
const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

// Points positions, for the fastest-lap eligibility check mirrored from the app.
const POINTS_POSITIONS = 10;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch JSON with retry/backoff. Retries on 429 and 5xx, honouring Retry-After
// (seconds or an HTTP date) when present and falling back to exponential backoff
// when it is absent. Throws on a 4xx other than 429 and after exhausting retries.
async function fetchJson(url) {
  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    } catch (networkError) {
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Network error after ${attempt} retries for ${url}: ${networkError.message}`);
      }
      await delay(backoffDelay(attempt));
      continue;
    }

    if (response.ok) {
      return response.json();
    }

    const retryable = response.status === 429 || (response.status >= 500 && response.status < 600);
    if (!retryable || attempt >= MAX_RETRIES) {
      throw new Error(`API error for ${url}: ${response.status} ${response.statusText}`);
    }

    const waitMs = retryAfterMs(response) ?? backoffDelay(attempt);
    console.warn(`Retrying ${url} after ${waitMs}ms (status ${response.status}, attempt ${attempt + 1}).`);
    await delay(waitMs);
  }
}

// Exponential backoff with a ceiling.
function backoffDelay(attempt) {
  return Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS);
}

// Parse a Retry-After header: either a number of seconds or an HTTP date.
// Returns milliseconds to wait, or null when the header is absent or unparseable.
function retryAfterMs(response) {
  const header = response.headers.get('retry-after');
  if (!header) return null;
  const asSeconds = Number(header);
  if (!Number.isNaN(asSeconds)) {
    return Math.max(0, asSeconds * 1000);
  }
  const asDate = Date.parse(header);
  if (!Number.isNaN(asDate)) {
    return Math.max(0, asDate - Date.now());
  }
  return null;
}

// Page through a season-level endpoint, collecting every race entry across pages.
// pathSegment is 'results', 'sprint' or 'qualifying'. Returns the flat list of
// RaceTable.Races objects from every page (one race may appear on two pages).
async function fetchAllPages(year, pathSegment) {
  const collected = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const url = `${JOLPICA_BASE_URL}/${year}/${pathSegment}.json?limit=${PAGE_LIMIT}&offset=${offset}`;
    const data = await fetchJson(url);
    total = Number(data.MRData.total);
    const races = data.MRData.RaceTable.Races ?? [];
    collected.push(...races);
    offset += PAGE_LIMIT;
    if (offset < total) {
      await delay(RATE_LIMIT_DELAY_MS);
    }
  }

  return collected;
}

// Merge paged race entries by round, concatenating the given result array on each.
// resultKey is 'Results', 'SprintResults' or 'QualifyingResults'.
function mergeByRound(pagedRaces, resultKey) {
  const byRound = new Map();
  for (const race of pagedRaces) {
    const round = parseInt(race.round, 10);
    const existing = byRound.get(round);
    const rows = race[resultKey] ?? [];
    if (existing) {
      existing[resultKey] = (existing[resultKey] ?? []).concat(rows);
    } else {
      byRound.set(round, { ...race, [resultKey]: [...rows] });
    }
  }
  return byRound;
}

async function fetchSeasonSchedule(year) {
  console.log(`Fetching ${year} schedule...`);
  const data = await fetchJson(`${JOLPICA_BASE_URL}/${year}.json?limit=${PAGE_LIMIT}`);
  return data.MRData.RaceTable.Races;
}

function mapRaceResult(r) {
  const classified = r.status === 'Finished' || r.status.includes('Lap');
  return {
    driverId: r.Driver.driverId,
    driverCode: r.Driver.code || r.Driver.driverId.substring(0, 3).toUpperCase(),
    firstName: r.Driver.givenName,
    lastName: r.Driver.familyName,
    constructorId: r.Constructor.constructorId,
    constructorName: r.Constructor.name,
    position: classified ? parseInt(r.position, 10) : null,
    points: parseFloat(r.points),
    grid: parseInt(r.grid, 10),
    status: r.status,
    fastestLap: r.FastestLap?.rank === '1' && parseInt(r.position, 10) <= POINTS_POSITIONS,
    fastestLapRank: r.FastestLap ? parseInt(r.FastestLap.rank, 10) : null,
  };
}

function mapSprintResult(s) {
  const classified = s.status === 'Finished' || s.status.includes('Lap');
  return {
    driverId: s.Driver.driverId,
    position: classified ? parseInt(s.position, 10) : null,
    points: parseFloat(s.points),
  };
}

async function fetchSeasonData(year) {
  const schedule = await fetchSeasonSchedule(year);

  // Rounds that are sprint weekends, from the schedule itself.
  const sprintRounds = schedule
    .filter((entry) => isSprintWeekend(entry))
    .map((entry) => parseInt(entry.round, 10));

  await delay(RATE_LIMIT_DELAY_MS);
  console.log('Fetching race results (paged)...');
  const resultsByRound = mergeByRound(await fetchAllPages(year, 'results'), 'Results');

  await delay(RATE_LIMIT_DELAY_MS);
  console.log('Fetching qualifying (paged)...');
  const qualifyingByRound = mergeByRound(await fetchAllPages(year, 'qualifying'), 'QualifyingResults');

  await delay(RATE_LIMIT_DELAY_MS);
  console.log('Fetching sprints (paged)...');
  const sprintByRound = mergeByRound(await fetchAllPages(year, 'sprint'), 'SprintResults');

  // Build the calendar from the schedule (every scheduled round).
  const calendar = schedule.map((entry) => ({
    season: parseInt(entry.season, 10),
    round: parseInt(entry.round, 10),
    raceName: entry.raceName,
    circuitId: entry.Circuit.circuitId,
    circuitName: entry.Circuit.circuitName,
    country: entry.Circuit.Location.country,
    date: entry.date,
  }));

  // Build a race only for rounds that have race results (completed races).
  const races = [];
  const completedRounds = [...resultsByRound.keys()].sort((a, b) => a - b);
  for (const round of completedRounds) {
    const raceInfo = resultsByRound.get(round);
    const sprintInfo = sprintByRound.get(round);
    const qualifyingInfo = qualifyingByRound.get(round);

    races.push({
      season: parseInt(raceInfo.season, 10),
      round,
      raceName: raceInfo.raceName,
      circuitId: raceInfo.Circuit.circuitId,
      circuitName: raceInfo.Circuit.circuitName,
      country: raceInfo.Circuit.Location.country,
      date: raceInfo.date,
      results: (raceInfo.Results ?? []).map(mapRaceResult),
      qualifying: (qualifyingInfo?.QualifyingResults ?? []).map((q) => ({
        driverId: q.Driver.driverId,
        position: parseInt(q.position, 10),
      })),
      sprint: sprintInfo ? (sprintInfo.SprintResults ?? []).map(mapSprintResult) : null,
    });
  }

  return { calendar, races, sprintRounds };
}

// Read the committed data file for a year, or null when it is absent.
async function readStored(outputFile) {
  const fs = await import('fs');
  if (!fs.existsSync(outputFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  } catch (error) {
    console.warn(`Could not parse existing ${outputFile}: ${error.message}`);
    return null;
  }
}

async function main() {
  const year = parseInt(process.argv[2], 10) || new Date().getFullYear();

  console.log(`\nFetching ${year} F1 season data...\n`);

  const fs = await import('fs');
  const path = await import('path');
  const outputDir = path.join(process.cwd(), 'data');
  const outputFile = path.join(outputDir, `${year}.json`);

  let fetched;
  try {
    fetched = await fetchSeasonData(year);
  } catch (error) {
    console.error(`\nError fetching data: ${error.message}`);
    process.exit(1);
  }

  const stored = await readStored(outputFile);

  // Validate before writing. The sprintRounds hint rides along for validation
  // only and is not written to the file.
  const errors = validateSeasonData(fetched, stored);
  if (errors.length > 0) {
    console.error(`\nValidation failed for ${year}; writing nothing:`);
    for (const message of errors) {
      console.error(`  - ${message}`);
    }
    process.exit(1);
  }

  const toWrite = { calendar: fetched.calendar, races: fetched.races };

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputFile, JSON.stringify(toWrite, null, 2));

  console.log(`\nSaved ${toWrite.races.length} races to ${outputFile}`);
  console.log(`   Calendar: ${toWrite.calendar.length} races scheduled`);
  console.log(`   Completed: ${toWrite.races.length} races\n`);
}

main();
