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

import { validateSeasonData, isSprintWeekend, PLAYOFF_RACES } from './validate-season-data.mjs';
import {
  JOLPICA_BASE_URL,
  PAGE_LIMIT,
  RATE_LIMIT_DELAY_MS,
  delay,
  fetchJson,
  fetchAllPages,
  mergeByRound,
  fetchDriverStandingsOrder,
} from './fetch-season-helpers.mjs';

// Points positions, for the fastest-lap eligibility check mirrored from the app.
const POINTS_POSITIONS = 10;

// A numeric positionText means the car is classified at that finishing position;
// a letter (R, W, D, E, F, N) means it is not classified. This is the rule of
// decision 0004 for reading Jolpica's positionText.
function isClassified(positionText) {
  return /^\d+$/.test(positionText);
}

async function fetchSeasonSchedule(year) {
  console.log(`Fetching ${year} schedule...`);
  const data = await fetchJson(`${JOLPICA_BASE_URL}/${year}.json?limit=${PAGE_LIMIT}`);
  return data.MRData.RaceTable.Races;
}

function mapRaceResult(r) {
  const classified = isClassified(r.positionText);
  return {
    driverId: r.Driver.driverId,
    driverCode: r.Driver.code || r.Driver.driverId.substring(0, 3).toUpperCase(),
    firstName: r.Driver.givenName,
    lastName: r.Driver.familyName,
    constructorId: r.Constructor.constructorId,
    constructorName: r.Constructor.name,
    position: classified ? parseInt(r.position, 10) : null,
    positionText: r.positionText,
    points: parseFloat(r.points),
    grid: parseInt(r.grid, 10),
    status: r.status,
    fastestLap: r.FastestLap?.rank === '1' && parseInt(r.position, 10) <= POINTS_POSITIONS,
    fastestLapRank: r.FastestLap ? parseInt(r.FastestLap.rank, 10) : null,
  };
}

function mapSprintResult(s) {
  const classified = isClassified(s.positionText);
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
  const qualifyingByRound = mergeByRound(
    await fetchAllPages(year, 'qualifying'),
    'QualifyingResults'
  );

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

  // The official regular-season standings order (decision 0004, Option A). The
  // last regular-season round is totalRounds - PLAYOFF_RACES. Only fetch it once
  // that round has a race result; before then the order is not yet fixed and is
  // left empty.
  const totalRounds = calendar.length;
  const lastRegularSeasonRound = totalRounds - PLAYOFF_RACES;
  let regularSeasonStandingOrder = [];
  if (lastRegularSeasonRound >= 1 && resultsByRound.has(lastRegularSeasonRound)) {
    await delay(RATE_LIMIT_DELAY_MS);
    console.log(`Fetching driver standings after round ${lastRegularSeasonRound}...`);
    regularSeasonStandingOrder = await fetchDriverStandingsOrder(year, lastRegularSeasonRound);
  }

  return { calendar, races, sprintRounds, regularSeasonStandingOrder };
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

  const toWrite = {
    calendar: fetched.calendar,
    races: fetched.races,
    regularSeasonStandingOrder: fetched.regularSeasonStandingOrder,
  };

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputFile, JSON.stringify(toWrite, null, 2));

  console.log(`\nSaved ${toWrite.races.length} races to ${outputFile}`);
  console.log(`   Calendar: ${toWrite.calendar.length} races scheduled`);
  console.log(`   Completed: ${toWrite.races.length} races`);
  console.log(
    `   Regular-season order: ${toWrite.regularSeasonStandingOrder.length} drivers stored\n`
  );
}

main();
