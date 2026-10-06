// Fetch controls for the season-data script, kept in their own module so they
// are importable by a test. The executable fetch-season-data.mjs has a shebang,
// which Vitest's module loader will not parse, so the testable seams live here.
//
// These are the request-level helpers: HTTP with retry/backoff, Retry-After
// parsing, offset paging that follows the server's echoed limit, and merge-by-
// round for races that straddle a page boundary. They take injectable fetch and
// delay functions so the retry and paging logic can be tested without a network
// or real timers.

export const JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';
export const USER_AGENT =
  'grand-prix-playoffs-data/1.0 (+https://github.com/nickarrow/grand-prix-playoffs)';

// Paging: Jolpica caps limit at 100 and pages with offset.
export const PAGE_LIMIT = 100;

// Politeness delay between requests, well inside Jolpica's unauthenticated burst.
export const RATE_LIMIT_DELAY_MS = 300;

// Retry policy for 429 and 5xx responses.
const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch JSON with retry/backoff. Retries on 429 and 5xx, honouring Retry-After
// (seconds or an HTTP date) when present and falling back to exponential backoff
// when it is absent. Throws on a 4xx other than 429 and after exhausting retries.
// fetchFn and delayFn are injectable so the retry logic can be tested without a
// network or real timers.
export async function fetchJson(url, fetchFn = fetch, delayFn = delay) {
  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      response = await fetchFn(url, { headers: { 'User-Agent': USER_AGENT } });
    } catch (networkError) {
      if (attempt >= MAX_RETRIES) {
        throw new Error(
          `Network error after ${attempt} retries for ${url}: ${networkError.message}`
        );
      }
      await delayFn(backoffDelay(attempt));
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
    console.warn(
      `Retrying ${url} after ${waitMs}ms (status ${response.status}, attempt ${attempt + 1}).`
    );
    await delayFn(waitMs);
  }
}

// Exponential backoff with a ceiling.
export function backoffDelay(attempt) {
  return Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS);
}

// Parse a Retry-After header: either a number of seconds or an HTTP date.
// Returns milliseconds to wait, or null when the header is absent or unparseable.
export function retryAfterMs(response) {
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
//
// Jolpica documents that MRData.limit "may be different from the query parameter
// set in some cases", so the next offset advances by the echoed response limit
// rather than the requested PAGE_LIMIT. Advancing by the request size would skip
// rows whenever the server returned a smaller page. A zero or missing response
// limit would stall the loop, so fall back to the number of rows actually
// returned, and stop if neither makes progress.
export async function fetchAllPages(year, pathSegment, fetchJsonFn = fetchJson, delayFn = delay) {
  const collected = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const url = `${JOLPICA_BASE_URL}/${year}/${pathSegment}.json?limit=${PAGE_LIMIT}&offset=${offset}`;
    const data = await fetchJsonFn(url);
    total = Number(data.MRData.total);
    const races = data.MRData.RaceTable.Races ?? [];
    collected.push(...races);

    const step = pageStep(data.MRData.limit, races.length);
    if (step <= 0) {
      throw new Error(
        `Pagination made no progress for ${url} (limit ${data.MRData.limit}, returned ${races.length} rows).`
      );
    }
    offset += step;

    if (offset < total) {
      await delayFn(RATE_LIMIT_DELAY_MS);
    }
  }

  return collected;
}

// Decide how far to advance the offset after a page. Prefer the server's echoed
// limit; fall back to the row count the page actually returned. Returns 0 when
// neither is a positive number so the caller can refuse to loop forever.
export function pageStep(responseLimit, rowsReturned) {
  const echoed = Number(responseLimit);
  if (Number.isFinite(echoed) && echoed > 0) {
    return echoed;
  }
  return rowsReturned > 0 ? rowsReturned : 0;
}

// Fetch the official driver-standings order for a round and return the driverIds
// in finishing order. Reads MRData.StandingsTable.StandingsLists[0].DriverStandings,
// which Jolpica returns sorted by position (a dense rank that does not tie), and
// maps each entry to its Driver.driverId. Returns [] when the round has no
// standings list yet. This is the terminal tiebreak key of decision 0004.
export async function fetchDriverStandingsOrder(year, round, fetchJsonFn = fetchJson) {
  const url = `${JOLPICA_BASE_URL}/${year}/${round}/driverstandings.json?limit=${PAGE_LIMIT}`;
  const data = await fetchJsonFn(url);
  const lists = data.MRData.StandingsTable.StandingsLists ?? [];
  const standings = lists[0]?.DriverStandings ?? [];
  return standings
    .slice()
    .sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10))
    .map((entry) => entry.Driver.driverId);
}

// Merge paged race entries by round, concatenating the given result array on each.
// resultKey is 'Results', 'SprintResults' or 'QualifyingResults'.
export function mergeByRound(pagedRaces, resultKey) {
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
